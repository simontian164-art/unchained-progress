/**
 * On-device implementation. JSON records + photo blobs in IndexedDB (localStorage is too small for
 * full-resolution photos). Storage paths use the same "<owner>/profile/<kind>-<id>.jpg" layout as the
 * Supabase bucket so a later migration to an account is a straight copy.
 */
import { inRange, type MeasureKey } from "./units";
import type { DigitalProfileService, MeasurementsInput, ProfileInput, SaveLookInput } from "./service";
import { newId } from "./service";
import type { AppearancePreferences, BodyMeasurements, DigitalProfile, DigitalProfileBundle, ImageKind, PreparedImage, ProfileImage, SavedLook } from "./types";

/** Minimal async key/value store. IndexedDB in the browser, in-memory in tests. */
export interface KV {
  get<T>(store: "records" | "blobs", key: string): Promise<T | undefined>;
  set(store: "records" | "blobs", key: string, value: unknown): Promise<void>;
  del(store: "records" | "blobs", key: string): Promise<void>;
  keys(store: "records" | "blobs"): Promise<string[]>;
}

export class MemoryKV implements KV {
  private m = { records: new Map<string, unknown>(), blobs: new Map<string, unknown>() };
  async get<T>(s: "records" | "blobs", k: string) { return this.m[s].get(k) as T | undefined; }
  async set(s: "records" | "blobs", k: string, v: unknown) { this.m[s].set(k, v); }
  async del(s: "records" | "blobs", k: string) { this.m[s].delete(k); }
  async keys(s: "records" | "blobs") { return [...this.m[s].keys()]; }
}

export class IndexedDbKV implements KV {
  private db: Promise<IDBDatabase>;
  constructor(name = "glowmax_digital_you_v1") {
    this.db = new Promise((res, rej) => {
      const r = indexedDB.open(name, 1);
      r.onupgradeneeded = () => {
        r.result.createObjectStore("records");
        r.result.createObjectStore("blobs");
      };
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error ?? new Error("Couldn't open on-device storage."));
    });
  }
  private async tx<T>(store: string, mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.db;
    return new Promise((res, rej) => {
      const t = db.transaction(store, mode);
      const req = fn(t.objectStore(store));
      t.oncomplete = () => res(req.result);
      t.onerror = () => rej(t.error ?? new Error("Storage error"));
      t.onabort = () => rej(t.error ?? new Error("Storage is full or unavailable."));
    });
  }
  get<T>(s: "records" | "blobs", k: string) { return this.tx<T>(s, "readonly", (o) => o.get(k) as IDBRequest<T>); }
  async set(s: "records" | "blobs", k: string, v: unknown) { await this.tx(s, "readwrite", (o) => o.put(v, k)); }
  async del(s: "records" | "blobs", k: string) { await this.tx(s, "readwrite", (o) => o.delete(k)); }
  async keys(s: "records" | "blobs") { return (await this.tx(s, "readonly", (o) => o.getAllKeys())).map(String); }
  static async destroy(name = "glowmax_digital_you_v1") {
    await new Promise<void>((res) => {
      const r = indexedDB.deleteDatabase(name);
      r.onsuccess = r.onerror = r.onblocked = () => res();
    });
  }
}

/** Device-mode mirror of an avatar_generations row (newest first). */
export interface LocalModelRecord {
  id: string;
  status: "working" | "ready" | "failed" | "discarded";
  failure?: string;
  approved: boolean;
  storagePath?: string;
  sourceImageId?: string;
  createdAt: string;
  generatedAt?: string;
  approvedAt?: string;
}

const OWNER = "device";
const now = () => new Date().toISOString();

export class LocalDigitalProfileService implements DigitalProfileService {
  readonly mode = "device" as const;
  private urls = new Map<string, string>();
  constructor(private kv: KV) {}

  private async profileOrThrow() {
    const p = await this.kv.get<DigitalProfile>("records", "profile");
    if (!p) throw new Error("No Digital You profile yet.");
    return p;
  }
  private async images() { return (await this.kv.get<ProfileImage[]>("records", "images")) ?? []; }

  async getProfile(): Promise<DigitalProfileBundle | null> {
    const profile = await this.kv.get<DigitalProfile>("records", "profile");
    if (!profile) return null;
    const images = Object.fromEntries((await this.images()).map((i) => [i.kind, i]));
    const ms = (await this.kv.get<BodyMeasurements[]>("records", "measurements")) ?? [];
    const models = (await this.listModelRecords()).filter((m) => m.status !== "discarded");
    const approved = models.find((m) => m.approved && m.storagePath);
    const last = models[0];
    return {
      profile,
      images,
      latest: ms[0],
      preferences: await this.kv.get<AppearancePreferences>("records", "preferences"),
      model: approved ? { id: approved.id, storagePath: approved.storagePath!, generatedAt: approved.generatedAt!, approvedAt: approved.approvedAt, sourceImageId: approved.sourceImageId } : undefined,
      pendingModel: last?.status === "working" ? { id: last.id, status: "working" } : last?.status === "ready" && !last.approved ? { id: last.id, status: "review" } : undefined,
    };
  }

  // ─── digital model records (device mode is only used by the preview demo generator) ───
  async listModelRecords() {
    return (await this.kv.get<LocalModelRecord[]>("records", "models")) ?? [];
  }
  async saveModelRecords(list: LocalModelRecord[]) {
    await this.kv.set("records", "models", list);
  }
  async putModelBlob(path: string, blob: Blob) {
    await this.kv.set("blobs", path, blob);
  }
  async removeModelBlob(path: string) {
    await this.dropBlob(path);
  }

  async createProfile(input: ProfileInput) {
    const existing = await this.kv.get<DigitalProfile>("records", "profile");
    if (existing) return this.updateProfile(input);
    const p: DigitalProfile = { id: newId(), status: input.status ?? "draft", ageRange: input.ageRange, goal: input.goal, unitSystem: input.unitSystem ?? "metric", lastScanAt: input.lastScanAt, createdAt: now(), updatedAt: now() };
    await this.kv.set("records", "profile", p);
    return p;
  }

  async updateProfile(patch: ProfileInput) {
    const p = { ...(await this.profileOrThrow()), ...Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined)), updatedAt: now() } as DigitalProfile;
    await this.kv.set("records", "profile", p);
    return p;
  }

  async uploadProfileImage(kind: ImageKind, image: PreparedImage) {
    await this.profileOrThrow();
    const id = newId();
    const storagePath = `${OWNER}/profile/${kind}-${id}.jpg`;
    await this.kv.set("blobs", storagePath, image.blob);
    const img: ProfileImage = { id, kind, storagePath, mimeType: image.mimeType, width: image.width, height: image.height, byteSize: image.blob.size, checks: image.checks, createdAt: now() };
    const list = await this.images();
    const old = list.find((i) => i.kind === kind);
    await this.kv.set("records", "images", [...list.filter((i) => i.kind !== kind), img]);
    if (old) await this.dropBlob(old.storagePath);
    return img;
  }

  async deleteProfileImage(kind: ImageKind) {
    const list = await this.images();
    const old = list.find((i) => i.kind === kind);
    if (!old) return;
    await this.kv.set("records", "images", list.filter((i) => i.kind !== kind));
    await this.dropBlob(old.storagePath);
  }

  private async dropBlob(path: string) {
    await this.kv.del("blobs", path);
    const u = this.urls.get(path);
    if (u) {
      URL.revokeObjectURL(u);
      this.urls.delete(path);
    }
  }

  async getImageUrl(image: Pick<ProfileImage, "storagePath">) {
    const cached = this.urls.get(image.storagePath);
    if (cached) return cached;
    const blob = await this.kv.get<Blob>("blobs", image.storagePath);
    if (!blob) throw new Error("That photo is missing from this device.");
    const u = URL.createObjectURL(blob);
    this.urls.set(image.storagePath, u);
    return u;
  }

  async recordMeasurements(m: MeasurementsInput) {
    await this.profileOrThrow();
    for (const k of ["heightCm", "weightKg", "waistCm", "chestCm", "shoulderCm"] as MeasureKey[]) {
      if (!inRange(k, m[k])) throw new Error(`${k} is outside the accepted range.`);
    }
    const row: BodyMeasurements = { id: newId(), measuredAt: now(), ...m };
    const ms = (await this.kv.get<BodyMeasurements[]>("records", "measurements")) ?? [];
    await this.kv.set("records", "measurements", [row, ...ms]);
    return row;
  }

  async savePreferences(p: Omit<AppearancePreferences, "updatedAt">) {
    await this.profileOrThrow();
    const row = { ...p, updatedAt: now() };
    await this.kv.set("records", "preferences", row);
    return row;
  }

  async saveGeneratedLook(input: SaveLookInput) {
    await this.profileOrThrow();
    const look: SavedLook = { id: newId(), kind: input.kind, sourceImageId: input.sourceImageId, resultPath: input.resultPath, status: input.status ?? "pending", provider: input.provider, params: input.params ?? {}, createdAt: now() };
    const looks = await this.getSavedLooks();
    await this.kv.set("records", "looks", [look, ...looks]);
    return look;
  }

  async getSavedLooks() { return (await this.kv.get<SavedLook[]>("records", "looks")) ?? []; }

  async deleteProfile() {
    // Derivatives first, then source photos, then records: nothing is left pointing at a missing file.
    for (const k of await this.kv.keys("blobs")) await this.dropBlob(k);
    for (const k of await this.kv.keys("records")) await this.kv.del("records", k);
  }
}
