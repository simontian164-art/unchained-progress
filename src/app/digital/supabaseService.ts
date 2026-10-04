/**
 * Account implementation: rows in Postgres (RLS: owner only) + photos in the private `digital-you`
 * bucket under "<user id>/...". The publishable key is all the browser has; RLS does the
 * authorization. Files are always deleted through the Storage API (deleting storage.objects rows in
 * SQL would orphan the files).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { inRange, type MeasureKey } from "./units";
import type { DigitalProfileService, MeasurementsInput, ProfileInput, SaveLookInput } from "./service";
import { newId } from "./service";
import type { AppearancePreferences, BodyMeasurements, DigitalModel, DigitalProfile, DigitalProfileBundle, ImageKind, PendingModel, PreparedImage, ProfileImage, SavedLook } from "./types";

export const BUCKET = "digital-you";
const SIGNED_URL_SECONDS = 60 * 10;

/* eslint-disable @typescript-eslint/no-explicit-any */
const toProfile = (r: any): DigitalProfile => ({ id: r.id, status: r.status, ageRange: r.age_range ?? undefined, goal: r.goal ?? undefined, unitSystem: r.unit_system, lastScanAt: r.last_scan_at ?? undefined, createdAt: r.created_at, updatedAt: r.updated_at });
const toImage = (r: any): ProfileImage => ({ id: r.id, kind: r.kind, storagePath: r.storage_path, mimeType: r.mime_type, width: r.width, height: r.height, byteSize: r.byte_size, checks: r.checks, createdAt: r.created_at });
const num = (v: any) => (v === null || v === undefined ? undefined : Number(v));
const toMeasure = (r: any): BodyMeasurements => ({ id: r.id, measuredAt: r.measured_at, heightCm: num(r.height_cm), weightKg: num(r.weight_kg), waistCm: num(r.waist_cm), chestCm: num(r.chest_cm), shoulderCm: num(r.shoulder_cm) });
const toPrefs = (r: any): AppearancePreferences => ({ styleGoals: r.style_goals, fitPreference: r.fit_preference ?? undefined, avoid: r.avoid, hairGoal: r.hair_goal ?? undefined, facialHairGoal: r.facial_hair_goal ?? undefined, updatedAt: r.updated_at });
const toLook = (r: any): SavedLook => ({ id: r.id, kind: r.kind, sourceImageId: r.source_image_id ?? undefined, resultPath: r.result_path ?? undefined, status: r.status, provider: r.provider ?? undefined, params: r.params ?? {}, createdAt: r.created_at });
/* eslint-enable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-explicit-any */
export function modelsFrom(rows: any[], primaryId: string | null): { model?: DigitalModel; pendingModel?: PendingModel } {
  const primary = rows.find((r) => r.id === primaryId && r.approved_by_user && r.result_path);
  const model: DigitalModel | undefined = primary
    ? { id: primary.id, storagePath: primary.result_path, generatedAt: primary.generated_at, approvedAt: primary.approved_at ?? undefined, sourceImageId: primary.source_image_id ?? undefined }
    : undefined;
  const last = rows[0];
  let pendingModel: PendingModel | undefined;
  if (last && ["queued", "processing", "finalizing"].includes(last.generation_status)) pendingModel = { id: last.id, status: "working" };
  else if (last && last.generation_status === "ready" && !last.approved_by_user) pendingModel = { id: last.id, status: "review" };
  return { model, pendingModel };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

function must<T>(res: { data: T; error: { message: string } | null }, what: string): T {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}

export class SupabaseDigitalProfileService implements DigitalProfileService {
  readonly mode = "account" as const;
  constructor(private sb: SupabaseClient, private userId: string) {}

  private async profileRow() {
    return must(await this.sb.from("digital_profiles").select("*").eq("user_id", this.userId).maybeSingle(), "Couldn't load your profile");
  }
  private async profileId() {
    const p = await this.profileRow();
    if (!p) throw new Error("No Digital You profile yet.");
    return p.id as string;
  }

  async getProfile(): Promise<DigitalProfileBundle | null> {
    const p = await this.profileRow();
    if (!p) return null;
    const [imgs, ms, prefs, gens] = await Promise.all([
      this.sb.from("profile_images").select("*").eq("profile_id", p.id).eq("is_current", true),
      this.sb.from("body_measurements").select("*").eq("profile_id", p.id).order("measured_at", { ascending: false }).limit(1),
      this.sb.from("appearance_preferences").select("*").eq("profile_id", p.id).maybeSingle(),
      // read-only for the browser; written by the digital-model Edge Function
      this.sb.from("avatar_generations").select("id, generation_status, approved_by_user, result_path, generated_at, approved_at, source_image_id").eq("user_id", this.userId).neq("generation_status", "discarded").order("created_at", { ascending: false }).limit(5),
    ]);
    const images = Object.fromEntries(must(imgs, "Couldn't load your photos").map((r) => [r.kind, toImage(r)]));
    const latest = must(ms, "Couldn't load your measurements")[0];
    const pr = must(prefs, "Couldn't load your preferences");
    // Models are an add-on: if they can't be read (e.g. the model migration isn't applied yet), the
    // profile still loads.
    const { model, pendingModel } = gens.error ? {} : modelsFrom(gens.data ?? [], p.primary_avatar_id ?? null);
    return { profile: toProfile(p), images, latest: latest ? toMeasure(latest) : undefined, preferences: pr ? toPrefs(pr) : undefined, model, pendingModel };
  }

  async createProfile(input: ProfileInput) {
    const existing = await this.profileRow();
    if (existing) return this.updateProfile(input);
    const row = must(
      await this.sb.from("digital_profiles").insert({ user_id: this.userId, status: input.status ?? "draft", age_range: input.ageRange ?? null, goal: input.goal ?? null, unit_system: input.unitSystem ?? "metric", last_scan_at: input.lastScanAt ?? null }).select("*").single(),
      "Couldn't create your profile",
    );
    return toProfile(row);
  }

  async updateProfile(patch: ProfileInput) {
    const row: Record<string, unknown> = {};
    if (patch.status !== undefined) row.status = patch.status;
    if (patch.ageRange !== undefined) row.age_range = patch.ageRange;
    if (patch.goal !== undefined) row.goal = patch.goal;
    if (patch.unitSystem !== undefined) row.unit_system = patch.unitSystem;
    if (patch.lastScanAt !== undefined) row.last_scan_at = patch.lastScanAt;
    const out = must(await this.sb.from("digital_profiles").update(row).eq("user_id", this.userId).select("*").single(), "Couldn't save your profile");
    return toProfile(out);
  }

  async uploadProfileImage(kind: ImageKind, image: PreparedImage) {
    const profileId = await this.profileId();
    const id = newId();
    const path = `${this.userId}/profile/${kind}-${id}.jpg`;
    must(await this.sb.storage.from(BUCKET).upload(path, image.blob, { contentType: image.mimeType, upsert: false, cacheControl: "3600" }), "Upload failed");

    const prev = must(await this.sb.from("profile_images").select("*").eq("profile_id", profileId).eq("kind", kind).eq("is_current", true).maybeSingle(), "Couldn't check existing photo");
    let row;
    try {
      if (prev) must(await this.sb.from("profile_images").update({ is_current: false }).eq("id", prev.id), "Couldn't replace photo");
      row = must(
        await this.sb.from("profile_images").insert({ id, user_id: this.userId, profile_id: profileId, kind, storage_path: path, mime_type: image.mimeType, width: image.width, height: image.height, byte_size: image.blob.size, checks: image.checks, is_current: true }).select("*").single(),
        "Couldn't save photo",
      );
    } catch (e) {
      // Roll back: put the previous photo back and remove the new upload.
      if (prev) await this.sb.from("profile_images").update({ is_current: true }).eq("id", prev.id);
      await this.sb.storage.from(BUCKET).remove([path]);
      throw e;
    }
    // The new photo is saved. Removing the replaced one is retried on the next replace/delete-all if
    // it fails here (its row stays, marked not current, so the file is never orphaned).
    if (prev) await this.removeImageRow(prev.id, prev.storage_path).catch(() => undefined);
    return toImage(row);
  }

  private async removeImageRow(id: string, path: string) {
    // File first: if that fails the row stays, so the file is never orphaned without a reference.
    must(await this.sb.storage.from(BUCKET).remove([path]), "Couldn't delete the photo file");
    must(await this.sb.from("profile_images").delete().eq("id", id), "Couldn't delete the photo record");
  }

  async deleteProfileImage(kind: ImageKind) {
    const profileId = await this.profileId();
    const row = must(await this.sb.from("profile_images").select("id, storage_path").eq("profile_id", profileId).eq("kind", kind).eq("is_current", true).maybeSingle(), "Couldn't find that photo");
    if (row) await this.removeImageRow(row.id, row.storage_path);
  }

  async getImageUrl(image: Pick<ProfileImage, "storagePath">) {
    const res = must(await this.sb.storage.from(BUCKET).createSignedUrl(image.storagePath, SIGNED_URL_SECONDS), "Couldn't load photo");
    return res.signedUrl;
  }

  async recordMeasurements(m: MeasurementsInput) {
    for (const k of ["heightCm", "weightKg", "waistCm", "chestCm", "shoulderCm"] as MeasureKey[]) {
      if (!inRange(k, m[k])) throw new Error(`${k} is outside the accepted range.`);
    }
    const profileId = await this.profileId();
    const row = must(
      await this.sb.from("body_measurements").insert({ user_id: this.userId, profile_id: profileId, height_cm: m.heightCm ?? null, weight_kg: m.weightKg ?? null, waist_cm: m.waistCm ?? null, chest_cm: m.chestCm ?? null, shoulder_cm: m.shoulderCm ?? null }).select("*").single(),
      "Couldn't save measurements",
    );
    return toMeasure(row);
  }

  async savePreferences(p: Omit<AppearancePreferences, "updatedAt">) {
    const profileId = await this.profileId();
    const row = must(
      await this.sb.from("appearance_preferences").upsert({ profile_id: profileId, user_id: this.userId, style_goals: p.styleGoals, fit_preference: p.fitPreference ?? null, avoid: p.avoid, hair_goal: p.hairGoal ?? null, facial_hair_goal: p.facialHairGoal ?? null }).select("*").single(),
      "Couldn't save preferences",
    );
    return toPrefs(row);
  }

  async saveGeneratedLook(input: SaveLookInput) {
    if (input.resultPath && !input.resultPath.startsWith(`${this.userId}/`)) throw new Error("A look must be stored in your own folder.");
    const profileId = await this.profileId();
    const row = must(
      await this.sb.from("saved_looks").insert({ user_id: this.userId, profile_id: profileId, kind: input.kind, source_image_id: input.sourceImageId ?? null, result_path: input.resultPath ?? null, status: input.status ?? "pending", provider: input.provider ?? null, params: input.params ?? {} }).select("*").single(),
      "Couldn't save look",
    );
    return toLook(row);
  }

  async getSavedLooks() {
    const rows = must(await this.sb.from("saved_looks").select("*").eq("user_id", this.userId).order("created_at", { ascending: false }), "Couldn't load looks");
    return rows.map(toLook);
  }

  /** Every file under "<user id>/" in the bucket, paging through folders. */
  private async listAll(prefix: string): Promise<string[]> {
    const out: string[] = [];
    for (let offset = 0; ; offset += 100) {
      const page = must(await this.sb.storage.from(BUCKET).list(prefix, { limit: 100, offset }), "Couldn't list your files");
      for (const e of page) {
        const p = `${prefix}/${e.name}`;
        // Folders come back without an id.
        if (e.id === null || e.id === undefined) out.push(...(await this.listAll(p)));
        else out.push(p);
      }
      if (page.length < 100) break;
    }
    return out;
  }

  async deleteProfile() {
    // 1. every file the user owns in the bucket: generated looks and source photos
    const paths = await this.listAll(this.userId);
    for (let i = 0; i < paths.length; i += 1000) must(await this.sb.storage.from(BUCKET).remove(paths.slice(i, i + 1000)), "Couldn't delete your files");
    // 2. the profile row; images, measurements, preferences and looks cascade with it
    must(await this.sb.from("digital_profiles").delete().eq("user_id", this.userId), "Couldn't delete your profile");
  }
}
