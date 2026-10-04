/**
 * Photo checks for Digital You, run entirely on the device before anything is saved or uploaded.
 *
 *   1. file type and size              (instant)
 *   2. decode + minimum dimensions     (instant)
 *   3. people in frame                 (on-device ML, lazy-loaded)
 *        head shots: face detection (MediaPipe FaceMesh via TF.js, up to 3 faces)
 *        body shots: pose estimation (MoveNet MultiPose via TF.js, up to 6 people)
 *      Apple's Vision framework does the same job natively on iOS (VNDetectHumanBodyPoseRequest, one
 *      observation per person). This is a web app, so we use the TF.js equivalents and follow the same
 *      guidance: the subject should be large in the frame, not a crowd, not in very loose clothing.
 *   4. re-encode to JPEG on a canvas   (strips EXIF, including GPS location)
 *
 * If the ML models can't load (offline, blocked), the photo is still accepted with person check
 * "unverified" and the user is asked to confirm they're the only person in it.
 */
import type { ImageKind, PhotoChecks, PreparedImage } from "./types";
import { IMAGE_KINDS } from "./types";

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const MAX_INPUT_BYTES = 20 * 1024 * 1024;
const OUTPUT_LONG_SIDE = 2048;
const OUTPUT_QUALITY = 0.9;

export const MIN_DIMENSIONS: Record<"head" | "body", { w: number; h: number }> = {
  head: { w: 600, h: 600 },
  body: { w: 600, h: 1000 },
};

/** Shown above the capture button for each kind. Short, specific, actionable. */
export const GUIDANCE: Record<ImageKind, string[]> = {
  head_front: ["Face the camera at eye level, arm's length away.", "Use even light from the front, like a window.", "Keep your shoulders in the frame and your hair as you usually wear it."],
  head_left: ["Turn so your left side faces the camera.", "Keep the same light and distance as the front photo."],
  head_right: ["Turn so your right side faces the camera.", "Keep the same light and distance as the front photo."],
  body_front: ["Stand straight with your arms slightly away from your body.", "Keep your whole body in frame, head to feet.", "Wear fitted clothes. Avoid oversized clothing for this baseline.", "Use a self-timer or ask someone, with the camera at chest height."],
  body_side: ["Turn 90° so your side faces the camera.", "Stand naturally, arms relaxed, whole body in frame."],
};

export type CheckStage = "file" | "dimensions" | "person" | "encode";
export class PhotoRejected extends Error {
  constructor(public stage: CheckStage, message: string) {
    super(message);
  }
}

const meta = (kind: ImageKind) => IMAGE_KINDS.find((k) => k.kind === kind)!;

// ─── 1. file ─────────────────────────────────────────────────────────────
export function checkFile(file: { type: string; size: number; name?: string }): string | null {
  const type = file.type || (file.name?.toLowerCase().match(/\.(heic|heif)$/) ? "image/heic" : "");
  if (!ACCEPTED_TYPES.includes(type)) return "Choose a photo (JPG, PNG, WebP or HEIC).";
  if (file.size > MAX_INPUT_BYTES) return "That photo is over 20 MB. Choose a smaller one or take a new photo.";
  return null;
}

// ─── 2. dimensions ───────────────────────────────────────────────────────
export function checkDimensions(kind: ImageKind, w: number, h: number): string | null {
  const area = meta(kind).area;
  const min = MIN_DIMENSIONS[area];
  if (area === "body" && w > h) return "Hold the phone upright (portrait) so your whole body fits.";
  if (w < min.w || h < min.h) return `That photo is too small (${w}×${h}). It needs to be at least ${min.w}×${min.h} pixels. Use your phone's camera at full resolution.`;
  return null;
}

// ─── 3. people (pure assessment, testable without ML) ────────────────────
export interface FaceBox { xMin: number; xMax: number; yMin: number; yMax: number }
export interface Keypoint { name?: string; x: number; y: number; score?: number }
export interface Pose { score?: number; keypoints: Keypoint[] }

export interface Assessment { block?: string; warnings: string[] }

export function assessHead(kind: ImageKind, faces: FaceBox[], w: number): Assessment {
  const view = meta(kind).view;
  if (faces.length > 1) return { block: "More than one face is in this photo. Retake it with only you in frame.", warnings: [] };
  if (view !== "front") {
    // Profile views often aren't detected as faces at 90°; only more-than-one is a hard stop.
    return { warnings: faces.length === 0 ? ["We couldn't confirm a face in profile. Make sure your head and shoulders are in frame."] : [] };
  }
  if (faces.length === 0) return { block: "We couldn't find a face. Face the camera in even light, with nothing covering your face.", warnings: [] };
  const fw = (faces[0].xMax - faces[0].xMin) / w;
  if (fw < 0.15) return { block: "Your face is too small in the frame. Move closer, so your head and shoulders fill most of it.", warnings: [] };
  return { warnings: fw > 0.8 ? ["You're very close. Include your shoulders next time for the best results."] : [] };
}

const MIN_KP = 0.3;
const kp = (p: Pose, ...names: string[]) => p.keypoints.filter((k) => names.includes(k.name ?? "") && (k.score ?? 0) >= MIN_KP);

export function assessBody(kind: ImageKind, poses: Pose[], w: number, h: number): Assessment {
  const people = poses.filter((p) => (p.score ?? 0) >= 0.25);
  if (people.length > 1) return { block: "More than one person is in this photo. Retake it with only you in frame.", warnings: [] };
  if (people.length === 0) return { block: "We couldn't find a person. Stand in good light with your whole body in frame.", warnings: [] };
  const p = people[0];
  const head = kp(p, "nose", "left_eye", "right_eye", "left_ear", "right_ear");
  const ankles = kp(p, "left_ankle", "right_ankle");
  if (!head.length) return { block: "Your head is cut off. Keep your whole body in frame, head to feet.", warnings: [] };
  if (!ankles.length) return { block: "Your feet are cut off. Step back so your whole body is in frame, head to feet.", warnings: [] };
  const top = Math.min(...head.map((k) => k.y));
  const bottom = Math.max(...ankles.map((k) => k.y));
  // Apple Vision's guidance is a subject at least 1/3 of the image height; a body baseline needs more.
  if ((bottom - top) / h < 0.5) return { block: "You're too far away. Move closer so your body fills at least half the height of the photo.", warnings: [] };
  const warnings: string[] = [];
  const xs = p.keypoints.filter((k) => (k.score ?? 0) >= MIN_KP).map((k) => k.x);
  if (xs.length && (Math.min(...xs) < w * 0.03 || Math.max(...xs) > w * 0.97)) warnings.push("You're close to the edge of the frame. Stand in the middle next time.");
  if (meta(kind).view === "front") {
    const sh = kp(p, "left_shoulder", "right_shoulder");
    if (sh.length < 2) warnings.push("We couldn't see both shoulders. Face the camera directly.");
  }
  return { warnings };
}

// ─── ML loaders (lazy; cached) ───────────────────────────────────────────
type FaceDet = { estimateFaces: (c: HTMLCanvasElement) => Promise<{ box: FaceBox }[]> };
type PoseDet = { estimatePoses: (c: HTMLCanvasElement) => Promise<Pose[]> };
let faceDet: Promise<FaceDet> | null = null;
let poseDet: Promise<PoseDet> | null = null;

async function tfReady() {
  const tf = await import("@tensorflow/tfjs-core");
  await import("@tensorflow/tfjs-backend-webgl");
  if (tf.getBackend() !== "webgl") await tf.setBackend("webgl");
  await tf.ready();
}
function getFaceDetector() {
  faceDet ??= (async () => {
    await tfReady();
    const fld = await import("@tensorflow-models/face-landmarks-detection");
    return (await fld.createDetector(fld.SupportedModels.MediaPipeFaceMesh, { runtime: "tfjs", refineLandmarks: false, maxFaces: 3 })) as unknown as FaceDet;
  })().catch((e) => {
    faceDet = null;
    throw e;
  });
  return faceDet;
}
function getPoseDetector() {
  poseDet ??= (async () => {
    await tfReady();
    const pd = await import("@tensorflow-models/pose-detection");
    return (await pd.createDetector(pd.SupportedModels.MoveNet, { modelType: pd.movenet.modelType.MULTIPOSE_LIGHTNING, enableTracking: false })) as unknown as PoseDet;
  })().catch((e) => {
    poseDet = null;
    throw e;
  });
  return poseDet;
}

// ─── 2+4. decode / encode ────────────────────────────────────────────────
async function decode(file: Blob): Promise<{ draw: CanvasImageSource; w: number; h: number; close: () => void }> {
  if ("createImageBitmap" in window) {
    try {
      // Browsers apply the EXIF orientation by default, so phone photos come out upright.
      const bmp = await createImageBitmap(file);
      return { draw: bmp, w: bmp.width, h: bmp.height, close: () => bmp.close() };
    } catch {
      /* fall through to <img> */
    }
  }
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = () => rej(new Error("decode"));
      i.src = url;
    });
    return { draw: img, w: img.naturalWidth, h: img.naturalHeight, close: () => URL.revokeObjectURL(url) };
  } catch {
    URL.revokeObjectURL(url);
    throw new PhotoRejected("file", "This browser can't open that photo. If it's HEIC, set your camera to “Most compatible” or choose a JPG.");
  }
}

function toCanvas(src: CanvasImageSource, w: number, h: number, longSide: number) {
  const scale = Math.min(1, longSide / Math.max(w, h));
  const c = document.createElement("canvas");
  c.width = Math.round(w * scale);
  c.height = Math.round(h * scale);
  c.getContext("2d")!.drawImage(src, 0, 0, c.width, c.height);
  return c;
}

/**
 * Run every check and return a prepared, metadata-free JPEG, or throw PhotoRejected with a message
 * written for the user. `onStage` lets the UI say what it's doing.
 */
export async function preparePhoto(kind: ImageKind, file: File, onStage?: (s: CheckStage) => void): Promise<PreparedImage> {
  onStage?.("file");
  const fileErr = checkFile(file);
  if (fileErr) throw new PhotoRejected("file", fileErr);

  const { draw, w, h, close } = await decode(file);
  try {
    onStage?.("dimensions");
    const dimErr = checkDimensions(kind, w, h);
    if (dimErr) throw new PhotoRejected("dimensions", dimErr);

    onStage?.("person");
    const area = meta(kind).area;
    const work = toCanvas(draw, w, h, 720); // detection runs on a small copy: fast, and enough
    const sx = w / work.width;
    let checks: PhotoChecks = { person: "unverified", warnings: [] };
    try {
      let a: Assessment;
      if (area === "head") {
        const faces = await (await getFaceDetector()).estimateFaces(work);
        a = assessHead(kind, faces.map((f) => ({ xMin: f.box.xMin * sx, xMax: f.box.xMax * sx, yMin: f.box.yMin * sx, yMax: f.box.yMax * sx })), w);
      } else {
        const poses = await (await getPoseDetector()).estimatePoses(work);
        a = assessBody(kind, poses.map((p) => ({ score: p.score, keypoints: p.keypoints.map((k) => ({ ...k, x: k.x * sx, y: k.y * sx })) })), w, h);
      }
      if (a.block) throw new PhotoRejected("person", a.block);
      checks = { person: "passed", warnings: a.warnings };
    } catch (e) {
      if (e instanceof PhotoRejected) throw e;
      checks = { person: "unverified", warnings: ["We couldn't run the automatic check on this device. Make sure you're the only person in the photo."] };
    }

    onStage?.("encode");
    const out = toCanvas(draw, w, h, OUTPUT_LONG_SIDE);
    const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/jpeg", OUTPUT_QUALITY));
    if (!blob) throw new PhotoRejected("encode", "Couldn't process that photo. Try again or choose another.");
    return { blob, mimeType: "image/jpeg", width: out.width, height: out.height, checks };
  } finally {
    close();
  }
}
