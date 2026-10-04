// AvatarRepo on Supabase.
//   user client  (RLS, the caller's JWT): every read, and reading the source photo, so the database
//                re-checks that the photo and rows belong to the caller
//   admin client (service role): only the writes the browser is not allowed to make: generation
//                rows, the primary-avatar pointer, and result files under "<user id>/avatars/"
import type { ImageBytes } from "./provider.ts";
import type { AvatarRepo, GenerationPatch, NewGeneration } from "./service.ts";
import { ActiveGenerationExists } from "./service.ts";
import type { GenerationRow, GenerationStatus } from "./types.ts";

export const BUCKET = "digital-you";
const TABLE = "avatar_generations";

// Structural type for the bits of supabase-js used here (keeps this file free of npm: imports).
// deno-lint-ignore no-explicit-any
type Client = { from: (table: string) => any; storage: { from: (bucket: string) => any } };

// deno-lint-ignore no-explicit-any
function must(res: { data: any; error: { message: string; code?: string } | null }, what: string): any {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data;
}

export class SupabaseAvatarRepo implements AvatarRepo {
  constructor(private user: Client, private admin: Client) {}

  async findProfile(userId: string) {
    const r = must(await this.user.from("digital_profiles").select("id, primary_avatar_id").eq("user_id", userId).maybeSingle(), "profile");
    return r ? { id: r.id as string, primaryAvatarId: (r.primary_avatar_id as string | null) ?? null } : null;
  }

  async findCurrentFacePhoto(userId: string, profileId: string) {
    const r = must(
      await this.user.from("profile_images").select("id, storage_path, mime_type").eq("user_id", userId).eq("profile_id", profileId).eq("kind", "head_front").eq("is_current", true).maybeSingle(),
      "face photo",
    );
    return r ? { id: r.id as string, storagePath: r.storage_path as string, mimeType: r.mime_type as string } : null;
  }

  async downloadPhoto(path: string) {
    const blob = must(await this.user.storage.from(BUCKET).download(path), "download photo") as Blob;
    return new Uint8Array(await blob.arrayBuffer());
  }

  async countGenerationsSince(userId: string, sinceIso: string) {
    const r = await this.user.from(TABLE).select("id", { count: "exact", head: true }).eq("user_id", userId).gte("created_at", sinceIso);
    if (r.error) throw new Error(`count: ${r.error.message}`);
    return (r.count as number | null) ?? 0;
  }

  async findActive(userId: string) {
    return must(await this.user.from(TABLE).select("*").eq("user_id", userId).in("generation_status", ["queued", "processing", "finalizing"]).maybeSingle(), "active") as GenerationRow | null;
  }

  async findLatest(userId: string) {
    return must(await this.user.from(TABLE).select("*").eq("user_id", userId).neq("generation_status", "discarded").order("created_at", { ascending: false }).limit(1).maybeSingle(), "latest") as GenerationRow | null;
  }

  async find(userId: string, id: string) {
    return must(await this.user.from(TABLE).select("*").eq("user_id", userId).eq("id", id).maybeSingle(), "find") as GenerationRow | null;
  }

  async list(userId: string) {
    return must(await this.user.from(TABLE).select("*").eq("user_id", userId).order("created_at", { ascending: false }), "list") as GenerationRow[];
  }

  async insert(row: NewGeneration) {
    const r = await this.admin.from(TABLE).insert({ ...row, generation_status: "queued" }).select("*").single();
    if (r.error?.code === "23505") throw new ActiveGenerationExists("a generation is already running");
    return must(r, "insert") as GenerationRow;
  }

  async update(userId: string, id: string, patch: GenerationPatch, cond?: { from?: GenerationStatus[]; finalizingStaleBefore?: string }) {
    let q = this.admin.from(TABLE).update(patch).eq("id", id).eq("user_id", userId);
    if (cond?.from && cond.finalizingStaleBefore) {
      q = q.or(`generation_status.in.(${cond.from.join(",")}),and(generation_status.eq.finalizing,updated_at.lt."${cond.finalizingStaleBefore}")`);
    } else if (cond?.from) {
      q = q.in("generation_status", cond.from);
    }
    return must(await q.select("*").maybeSingle(), "update") as GenerationRow | null;
  }

  async saveResult(path: string, image: ImageBytes) {
    must(await this.admin.storage.from(BUCKET).upload(path, image.bytes, { contentType: image.mime, upsert: true, cacheControl: "3600" }), "save result");
  }

  async removeResults(paths: string[]) {
    if (paths.length) must(await this.admin.storage.from(BUCKET).remove(paths), "remove results");
  }

  async setPrimary(userId: string, profileId: string, generationId: string | null) {
    must(await this.admin.from("digital_profiles").update({ primary_avatar_id: generationId }).eq("id", profileId).eq("user_id", userId), "set primary");
  }

  async signedUrl(path: string, seconds: number) {
    return (must(await this.user.storage.from(BUCKET).createSignedUrl(path, seconds), "sign") as { signedUrl: string }).signedUrl;
  }
}
