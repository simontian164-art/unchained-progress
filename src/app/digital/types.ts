/**
 * Digital You: a private visual baseline of the user (photos + self-reported measurements) that later
 * features (try-on, hair/facial-hair previews, physique and future-self views) build on.
 * Shapes mirror supabase/migrations/20261004120000_digital_you.sql (camelCase here, snake_case there).
 */
import type { AgeRange, Goal } from "../types";

export type ImageKind = "head_front" | "head_left" | "head_right" | "body_front" | "body_side";
export type UnitSystem = "metric" | "imperial";
export type StorageMode = "device" | "account";

export interface DigitalProfile {
  id: string;
  status: "draft" | "active";
  ageRange?: AgeRange;
  goal?: Goal;
  unitSystem: UnitSystem;
  lastScanAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Result of the on-device checks when the photo was taken. Stored with the image. */
export interface PhotoChecks {
  person: "passed" | "unverified";
  warnings: string[];
}

export interface ProfileImage {
  id: string;
  kind: ImageKind;
  storagePath: string;
  mimeType: "image/jpeg" | "image/webp";
  width: number;
  height: number;
  byteSize: number;
  checks: PhotoChecks;
  createdAt: string;
}

/** Self-reported. Never presented as medically precise. */
export interface BodyMeasurements {
  id: string;
  measuredAt: string;
  heightCm?: number;
  weightKg?: number;
  waistCm?: number;
  chestCm?: number;
  shoulderCm?: number;
}

export interface AppearancePreferences {
  styleGoals: string[];
  fitPreference?: "slim" | "regular" | "relaxed";
  avoid: string[];
  hairGoal?: string;
  facialHairGoal?: string;
  updatedAt: string;
}

export type LookKind = "outfit" | "hair" | "facial_hair" | "physique" | "future_self";

/** A generated derivative of the user's photos. Produced server-side only (never in the browser). */
export interface SavedLook {
  id: string;
  kind: LookKind;
  sourceImageId?: string;
  resultPath?: string;
  status: "pending" | "ready" | "failed";
  provider?: string;
  params: Record<string, unknown>;
  createdAt: string;
}

/**
 * The approved AI-generated digital model ("primary avatar"). Generated server-side from the front face
 * photo and stored separately from it; the original photo is never modified.
 * Mirrors avatar_generations (migration 20261005120000_digital_model.sql).
 */
export interface DigitalModel {
  id: string;
  storagePath: string;
  generatedAt: string;
  approvedAt?: string;
  /** The face photo it was made from; unset if that photo has since been replaced or deleted. */
  sourceImageId?: string;
}

/** A model generation that still needs the user: running, or finished and waiting for approval. */
export interface PendingModel {
  id: string;
  status: "working" | "review";
}

/** Everything the You screen needs, in one read. */
export interface DigitalProfileBundle {
  profile: DigitalProfile;
  images: Partial<Record<ImageKind, ProfileImage>>;
  latest?: BodyMeasurements;
  preferences?: AppearancePreferences;
  /** primary_avatar */
  model?: DigitalModel;
  pendingModel?: PendingModel;
}

/** A photo that passed the checks and was re-encoded on the device (EXIF/GPS stripped). */
export interface PreparedImage {
  blob: Blob;
  mimeType: "image/jpeg";
  width: number;
  height: number;
  checks: PhotoChecks;
}

export const IMAGE_KINDS: { kind: ImageKind; label: string; required: boolean; area: "head" | "body"; view: "front" | "left" | "right" | "side" }[] = [
  { kind: "head_front", label: "Face and shoulders", required: true, area: "head", view: "front" },
  { kind: "head_left", label: "Left profile", required: false, area: "head", view: "left" },
  { kind: "head_right", label: "Right profile", required: false, area: "head", view: "right" },
  { kind: "body_front", label: "Full body, front", required: true, area: "body", view: "front" },
  { kind: "body_side", label: "Full body, side", required: false, area: "body", view: "side" },
];
