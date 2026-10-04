/**
 * digitalProfileService: the only way UI code touches Digital You data.
 *
 * Two implementations behind one interface:
 *   - LocalDigitalProfileService   photos + data in this browser's IndexedDB (today's default; matches
 *                                  GlowMax's current "everything stays on your device" model)
 *   - SupabaseDigitalProfileService rows protected by RLS + photos in the private `digital-you`
 *                                  bucket, used automatically once Supabase is configured and the
 *                                  user is signed in
 *
 * Future generated looks (try-on, hair, physique, future-self) are produced by server-side jobs
 * (Supabase Edge Functions holding the provider keys). The browser never calls an image provider
 * and never holds an API key: it only saves/reads the results through this interface.
 */
import type { AgeRange, Goal } from "../types";
import type { AppearancePreferences, BodyMeasurements, DigitalProfile, DigitalProfileBundle, ImageKind, LookKind, PreparedImage, ProfileImage, SavedLook, StorageMode, UnitSystem } from "./types";

export interface ProfileInput {
  ageRange?: AgeRange;
  goal?: Goal;
  unitSystem?: UnitSystem;
  status?: DigitalProfile["status"];
  lastScanAt?: string;
}

export type MeasurementsInput = Omit<BodyMeasurements, "id" | "measuredAt">;

export interface SaveLookInput {
  kind: LookKind;
  sourceImageId?: string;
  /** Path of a result already written to storage by a server-side job. */
  resultPath?: string;
  status?: SavedLook["status"];
  provider?: string;
  params?: Record<string, unknown>;
}

export interface DigitalProfileService {
  readonly mode: StorageMode;
  getProfile(): Promise<DigitalProfileBundle | null>;
  createProfile(input: ProfileInput): Promise<DigitalProfile>;
  updateProfile(patch: ProfileInput): Promise<DigitalProfile>;
  /** Adds the photo as the current one of its kind; any previous photo of that kind is deleted. */
  uploadProfileImage(kind: ImageKind, image: PreparedImage): Promise<ProfileImage>;
  deleteProfileImage(kind: ImageKind): Promise<void>;
  /** A URL the browser can display (photo or digital model). Object URL (device) or short-lived signed URL (account). */
  getImageUrl(image: Pick<ProfileImage, "storagePath">): Promise<string>;
  recordMeasurements(m: MeasurementsInput): Promise<BodyMeasurements>;
  savePreferences(p: Omit<AppearancePreferences, "updatedAt">): Promise<AppearancePreferences>;
  saveGeneratedLook(input: SaveLookInput): Promise<SavedLook>;
  getSavedLooks(): Promise<SavedLook[]>;
  /** Deletes every photo, digital model, generated look, measurement and preference, then the profile itself. */
  deleteProfile(): Promise<void>;
}

/** Validation shared by both implementations, matching the database constraints. */
export { RANGES } from "./units";

export const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
