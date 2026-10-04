// In-memory AvatarRepo with the same rules as the database (one active generation per user,
// conditional updates, updated_at). Used by the unit tests and the Deno smoke test; never deployed.
import type { ImageBytes } from "../provider.ts";
import type { AvatarRepo, GenerationPatch, NewGeneration } from "../service.ts";
import { ActiveGenerationExists } from "../service.ts";
import type { GenerationRow, GenerationStatus } from "../types.ts";

let n = 0;
const uuid = () => `00000000-0000-4000-8000-${String(++n).padStart(12, "0")}`;

export class MemoryAvatarRepo implements AvatarRepo {
  rows: GenerationRow[] = [];
  files = new Map<string, ImageBytes>();
  profiles = new Map<string, { id: string; primaryAvatarId: string | null }>();
  photos = new Map<string, { id: string; storagePath: string; mimeType: string; bytes: Uint8Array }>();
  calls: string[] = [];

  constructor(public now: () => Date = () => new Date()) {}

  seedUser(userId: string, opts: { photo?: boolean } = {}) {
    this.profiles.set(userId, { id: uuid(), primaryAvatarId: null });
    if (opts.photo !== false) this.photos.set(userId, { id: uuid(), storagePath: `${userId}/profile/head_front-x.jpg`, mimeType: "image/jpeg", bytes: new Uint8Array([0xff, 0xd8, 0xff, 1, 2, 3]) });
  }

  findProfile(userId: string) {
    return Promise.resolve(this.profiles.get(userId) ?? null);
  }
  findCurrentFacePhoto(userId: string) {
    const p = this.photos.get(userId);
    return Promise.resolve(p ? { id: p.id, storagePath: p.storagePath, mimeType: p.mimeType } : null);
  }
  downloadPhoto(path: string) {
    const p = [...this.photos.values()].find((x) => x.storagePath === path);
    if (!p) return Promise.reject(new Error("not found"));
    return Promise.resolve(p.bytes);
  }
  countGenerationsSince(userId: string, sinceIso: string) {
    return Promise.resolve(this.rows.filter((r) => r.user_id === userId && r.created_at >= sinceIso).length);
  }
  findActive(userId: string) {
    return Promise.resolve(this.copy(this.rows.find((r) => r.user_id === userId && ["queued", "processing", "finalizing"].includes(r.generation_status))));
  }
  findLatest(userId: string) {
    const list = this.rows.filter((r) => r.user_id === userId && r.generation_status !== "discarded").sort((a, b) => b.created_at.localeCompare(a.created_at));
    return Promise.resolve(this.copy(list[0]));
  }
  find(userId: string, id: string) {
    return Promise.resolve(this.copy(this.rows.find((r) => r.user_id === userId && r.id === id)));
  }
  list(userId: string) {
    return Promise.resolve(this.rows.filter((r) => r.user_id === userId).map((r) => ({ ...r })));
  }
  insert(row: NewGeneration) {
    if (this.rows.some((r) => r.user_id === row.user_id && ["queued", "processing", "finalizing"].includes(r.generation_status))) return Promise.reject(new ActiveGenerationExists("active"));
    const t = this.now().toISOString();
    const full: GenerationRow = {
      id: uuid(), ...row, provider_job_id: null, provider_status: null, provider_checked_at: null, attempts: 1, generation_status: "queued",
      failure_code: null, result_path: null, result_mime: null, approved_by_user: false, approved_at: null, generated_at: null, created_at: t, updated_at: t,
    };
    this.rows.push(full);
    return Promise.resolve({ ...full });
  }
  update(userId: string, id: string, patch: GenerationPatch, cond?: { from?: GenerationStatus[]; finalizingStaleBefore?: string }) {
    const r = this.rows.find((x) => x.user_id === userId && x.id === id);
    if (!r) return Promise.resolve(null);
    if (cond?.from) {
      const ok = cond.from.includes(r.generation_status) || (!!cond.finalizingStaleBefore && r.generation_status === "finalizing" && r.updated_at < cond.finalizingStaleBefore);
      if (!ok) return Promise.resolve(null);
    }
    Object.assign(r, patch, { updated_at: this.now().toISOString() });
    if (r.approved_by_user && this.rows.some((x) => x !== r && x.user_id === userId && x.approved_by_user)) throw new Error("one approved per user");
    return Promise.resolve({ ...r });
  }
  saveResult(path: string, image: ImageBytes) {
    this.calls.push(`save:${path}`);
    this.files.set(path, image);
    return Promise.resolve();
  }
  removeResults(paths: string[]) {
    for (const p of paths) {
      this.calls.push(`remove:${p}`);
      this.files.delete(p);
    }
    return Promise.resolve();
  }
  setPrimary(userId: string, _profileId: string, id: string | null) {
    const p = this.profiles.get(userId);
    if (p) p.primaryAvatarId = id;
    return Promise.resolve();
  }
  signedUrl(path: string, seconds: number) {
    return Promise.resolve(`https://signed.example/${path}?ttl=${seconds}`);
  }
  private copy(r?: GenerationRow) {
    return r ? { ...r } : null;
  }
}
