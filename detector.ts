/**
 * On-device face scan. Runs TensorFlow.js FaceMesh in the browser; the image never leaves the device.
 * Loaded lazily so the ~1 MB of model code only downloads when someone actually scans.
 */
import type { FaceMeasurements, PhotoCheck, PhotoCues } from "../types";
import { checkPhoto, geometryCues, LM, measure, pixelStats, type Pt } from "./face";

type Detector = { estimateFaces: (input: HTMLCanvasElement) => Promise<{ keypoints: Pt[] }[]> };
let detectorPromise: Promise<Detector> | null = null;

async function getDetector(): Promise<Detector> {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const tf = await import("@tensorflow/tfjs-core");
      await import("@tensorflow/tfjs-backend-webgl");
      const fld = await import("@tensorflow-models/face-landmarks-detection");
      if (tf.getBackend() !== "webgl") await tf.setBackend("webgl");
      await tf.ready();
      return (await fld.createDetector(fld.SupportedModels.MediaPipeFaceMesh, {
        runtime: "tfjs",
        refineLandmarks: false,
        maxFaces: 1,
      })) as unknown as Detector;
    })().catch((e) => {
      detectorPromise = null;
      throw e;
    });
  }
  return detectorPromise;
}

export const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Couldn't read that image. Try a JPG or PNG."));
    img.src = src;
  });

/** Downscale any image file to a small JPEG data URL for storage. */
export async function fileToDataUrl(file: File, maxSide = 720, quality = 0.82): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("That file isn't an image. Choose a JPG or PNG photo.");
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement("canvas");
    c.width = Math.round(img.naturalWidth * scale);
    c.height = Math.round(img.naturalHeight * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", quality);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export interface ScanResult {
  detected: boolean;
  measurements: FaceMeasurements | null;
  checks: PhotoCheck[];
  modelAvailable: boolean;
  cues?: PhotoCues;
}

/** Mean luminance of a small square patch around a point. */
function patchLuma(ctx: CanvasRenderingContext2D, p: Pt, r: number) {
  const x = Math.max(0, Math.round(p.x - r));
  const y = Math.max(0, Math.round(p.y - r));
  const s = Math.max(2, Math.round(r * 2));
  const d = ctx.getImageData(x, y, s, s).data;
  let sum = 0;
  for (let i = 0; i < d.length; i += 4) sum += 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
  return sum / (d.length / 4);
}

export async function scanFace(dataUrl: string): Promise<ScanResult> {
  const img = await loadImage(dataUrl);
  const c = document.createElement("canvas");
  c.width = img.naturalWidth;
  c.height = img.naturalHeight;
  const ctx = c.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);

  // Pixel stats on a small copy (fast).
  const s = document.createElement("canvas");
  const sw = 256;
  const sh = Math.round((img.naturalHeight / img.naturalWidth) * sw);
  s.width = sw;
  s.height = sh;
  const sctx = s.getContext("2d", { willReadFrequently: true })!;
  sctx.drawImage(img, 0, 0, sw, sh);
  const { meanLuma, sharpness } = pixelStats(sctx.getImageData(0, 0, sw, sh).data, sw, sh);

  let keypoints: Pt[] | null = null;
  let modelAvailable = true;
  try {
    const det = await getDetector();
    const faces = await det.estimateFaces(c);
    keypoints = faces[0]?.keypoints ?? null;
  } catch {
    modelAvailable = false;
  }

  const checks = checkPhoto({ keypoints, imageWidth: img.naturalWidth, imageHeight: img.naturalHeight, meanLuma, sharpness });
  let cues: PhotoCues | undefined;
  if (keypoints) {
    cues = geometryCues(keypoints);
    try {
      const cheekW = Math.hypot(keypoints[LM.cheekL].x - keypoints[LM.cheekR].x, keypoints[LM.cheekL].y - keypoints[LM.cheekR].y);
      const r = cheekW * 0.035;
      const under = (patchLuma(ctx, keypoints[LM.underEyeL], r) + patchLuma(ctx, keypoints[LM.underEyeR], r)) / 2;
      const cheek = (patchLuma(ctx, keypoints[LM.cheekPatchL], r) + patchLuma(ctx, keypoints[LM.cheekPatchR], r)) / 2;
      if (cheek > 0) cues.underEyeRatio = under / cheek;
    } catch {
      /* pixel read failed; skip this cue */
    }
  }
  return {
    detected: !!keypoints,
    measurements: keypoints ? measure(keypoints) : null,
    checks: modelAvailable ? checks : checks.filter((x) => ["light", "sharp", "resolution"].includes(x.id)),
    modelAvailable,
    cues,
  };
}
