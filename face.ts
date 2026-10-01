/**
 * Pure geometry helpers for the face scan. No TensorFlow in here, so it's unit-testable.
 * Landmark indices follow the MediaPipe FaceMesh 468-point topology.
 */
import type { FaceMeasurements, FaceShape, PhotoCheck, PhotoCues } from "../types";

export type Pt = { x: number; y: number };

export const LM = {
  top: 10, // upper forehead (the mesh stops below the hairline)
  chin: 152,
  cheekL: 234,
  cheekR: 454,
  foreheadL: 54,
  foreheadR: 284,
  jawL: 172,
  jawR: 397,
  chinL: 150,
  chinR: 379,
  eyeL: 33,
  eyeR: 263,
  nose: 1,
  glabella: 9,
  subnasale: 2,
  browL: 105,
  browR: 334,
  lidL: 159,
  lidR: 386,
  lipTop: 13,
  lipBottom: 14,
  underEyeL: 119,
  underEyeR: 348,
  cheekPatchL: 205,
  cheekPatchR: 425,
} as const;

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

export function measure(k: Pt[]): FaceMeasurements | null {
  const need = [LM.top, LM.chin, LM.cheekL, LM.cheekR, LM.foreheadL, LM.foreheadR, LM.jawL, LM.jawR, LM.chinL, LM.chinR];
  if (need.some((i) => !k[i] || Number.isNaN(k[i].x))) return null;
  const cheek = dist(k[LM.cheekL], k[LM.cheekR]);
  if (cheek <= 0) return null;
  const jaw = dist(k[LM.jawL], k[LM.jawR]);
  return {
    lengthToWidth: dist(k[LM.top], k[LM.chin]) / cheek,
    foreheadToCheek: dist(k[LM.foreheadL], k[LM.foreheadR]) / cheek,
    jawToCheek: jaw / cheek,
    chinTaper: dist(k[LM.chinL], k[LM.chinR]) / Math.max(jaw, 1e-6),
  };
}

/** Geometry-only cues. Pixel-based cues (under-eye) are added by the detector. */
export function geometryCues(k: Pt[]): PhotoCues {
  const has = (...ids: number[]) => ids.every((i) => k[i] && !Number.isNaN(k[i].x));
  const cues: PhotoCues = {};
  if (has(LM.glabella, LM.subnasale, LM.chin)) {
    const mid = dist(k[LM.glabella], k[LM.subnasale]);
    if (mid > 0) cues.lowerToMid = dist(k[LM.subnasale], k[LM.chin]) / mid;
  }
  if (has(LM.browL, LM.browR, LM.lidL, LM.lidR, LM.eyeL, LM.eyeR)) {
    const eyeDist = dist(k[LM.eyeL], k[LM.eyeR]);
    const gapL = k[LM.lidL].y - k[LM.browL].y;
    const gapR = k[LM.lidR].y - k[LM.browR].y;
    if (eyeDist > 0) cues.browDiff = Math.abs(gapL - gapR) / eyeDist;
  }
  if (has(LM.lipTop, LM.lipBottom, LM.top, LM.chin)) {
    const h = dist(k[LM.top], k[LM.chin]);
    cues.mouthOpen = h > 0 && dist(k[LM.lipTop], k[LM.lipBottom]) / h > 0.035;
  }
  return cues;
}

/**
 * Prototype ratios for each shape (as measured on the FaceMesh, whose top point sits
 * below the real hairline). Classification = nearest prototype, weighted.
 * This is an estimate from one photo; the UI always lets people confirm or change it.
 */
const PROTOTYPES: Record<FaceShape, [number, number, number, number]> = {
  oval: [1.32, 0.86, 0.8, 0.62],
  round: [1.16, 0.88, 0.85, 0.7],
  square: [1.2, 0.9, 0.93, 0.74],
  oblong: [1.5, 0.88, 0.85, 0.66],
  heart: [1.3, 0.93, 0.74, 0.54],
  diamond: [1.32, 0.77, 0.76, 0.58],
};
const WEIGHTS = [2.2, 1.4, 1.8, 1.2];

export function classifyShape(m: FaceMeasurements): { shape: FaceShape; confidence: "high" | "low"; ranked: FaceShape[] } {
  const v = [m.lengthToWidth, m.foreheadToCheek, m.jawToCheek, m.chinTaper];
  const scored = (Object.keys(PROTOTYPES) as FaceShape[])
    .map((shape) => ({
      shape,
      d: Math.sqrt(PROTOTYPES[shape].reduce((acc, p, i) => acc + WEIGHTS[i] * (v[i] - p) ** 2, 0)),
    }))
    .sort((a, b) => a.d - b.d);
  const margin = scored[1].d - scored[0].d;
  return { shape: scored[0].shape, confidence: margin > 0.03 ? "high" : "low", ranked: scored.map((s) => s.shape) };
}

/** Photo quality checks, so people know when a retake will give a better result. */
export function checkPhoto(opts: {
  keypoints: Pt[] | null;
  imageWidth: number;
  imageHeight?: number;
  meanLuma: number;
  sharpness: number;
}): PhotoCheck[] {
  const { keypoints: k, imageWidth, meanLuma, sharpness } = opts;
  const checks: PhotoCheck[] = [];
  const minSide = Math.min(imageWidth, opts.imageHeight ?? imageWidth);
  if (minSide < 480) checks.push({ id: "resolution", ok: false, label: "Low resolution", tip: "Use your phone's main camera instead of a screenshot or compressed image." });
  checks.push(
    k
      ? { id: "face", ok: true, label: "Face found" }
      : { id: "face", ok: false, label: "No face found", tip: "Face the camera directly with your whole face in frame." },
  );
  checks.push(
    meanLuma < 70
      ? { id: "light", ok: false, label: "Too dark", tip: "Face a window or a lamp. Avoid light from behind you." }
      : meanLuma > 215
        ? { id: "light", ok: false, label: "Overexposed", tip: "Step out of direct sun or move away from the light." }
        : { id: "light", ok: true, label: "Good lighting" },
  );
  checks.push(
    sharpness < 40
      ? { id: "sharp", ok: false, label: "A bit blurry", tip: "Hold still, wipe the lens, and tap to focus." }
      : { id: "sharp", ok: true, label: "Sharp" },
  );
  if (k) {
    const roll = (Math.atan2(k[LM.eyeR].y - k[LM.eyeL].y, k[LM.eyeR].x - k[LM.eyeL].x) * 180) / Math.PI;
    const cheekW = dist(k[LM.cheekL], k[LM.cheekR]);
    const midX = (k[LM.cheekL].x + k[LM.cheekR].x) / 2;
    const yaw = (k[LM.nose].x - midX) / cheekW;
    const straight = Math.abs(roll) < 7 && Math.abs(yaw) < 0.1;
    checks.push(
      straight
        ? { id: "angle", ok: true, label: "Facing the camera" }
        : { id: "angle", ok: false, label: "Head is turned or tilted", tip: "Look straight into the lens with your chin level." },
    );
    const frac = cheekW / imageWidth;
    checks.push(
      frac < 0.22
        ? { id: "distance", ok: false, label: "Too far away", tip: "Move closer so your face fills about half the frame." }
        : frac > 0.9
          ? { id: "distance", ok: false, label: "Too close", tip: "Hold the phone at arm's length." }
          : { id: "distance", ok: true, label: "Good distance" },
    );
    const cues = geometryCues(k);
    if (cues.mouthOpen) checks.push({ id: "expression", ok: false, label: "Mouth open", tip: "A relaxed, closed-mouth expression gives the most consistent results." });
  }
  return checks;
}

/** Mean luminance (0–255) and a simple Laplacian-variance sharpness score from RGBA pixels. */
export function pixelStats(data: Uint8ClampedArray, w: number, h: number) {
  const gray = new Float32Array(w * h);
  let sum = 0;
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const y = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    gray[p] = y;
    sum += y;
  }
  let lapSum = 0;
  let lapSq = 0;
  let n = 0;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x;
      const lap = gray[i - w] + gray[i + w] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
      lapSum += lap;
      lapSq += lap * lap;
      n++;
    }
  }
  const mean = n ? lapSum / n : 0;
  return { meanLuma: sum / (w * h), sharpness: n ? lapSq / n - mean * mean : 0 };
}

export const SHAPE_LABEL: Record<FaceShape, string> = {
  oval: "Oval",
  round: "Round",
  square: "Square",
  oblong: "Oblong",
  heart: "Heart",
  diamond: "Diamond",
};

export const SHAPE_DESCRIPTION: Record<FaceShape, string> = {
  oval: "Slightly longer than wide, with a jaw a little narrower than the cheekbones.",
  round: "Similar length and width, soft jawline and full cheeks.",
  square: "Similar length and width, with a strong, wide jaw.",
  oblong: "Noticeably longer than wide, with fairly straight sides.",
  heart: "Wider forehead and cheekbones, narrowing to a pointed chin.",
  diamond: "Cheekbones are the widest point; forehead and jaw are narrower.",
};
