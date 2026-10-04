/**
 * 9:16 share cards (1080×1920 PNG), drawn on a canvas. Privacy-first by construction:
 * the card can only contain the text passed in (day, streak, level, phase). It never receives a
 * photo, score or assessment, so it cannot leak one.
 */
export type ShareCard = { eyebrow: string; big: string; title: string; sub?: string; ring?: number };

const W = 1080, H = 1920, IVORY = "#ede6d6";

export function drawShareCard(c: ShareCard): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const g = cv.getContext("2d")!;
  g.fillStyle = "#050505";
  g.fillRect(0, 0, W, H);
  const glow = g.createRadialGradient(W / 2, 780, 40, W / 2, 780, 700);
  glow.addColorStop(0, "rgba(237,230,214,0.10)");
  glow.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = glow;
  g.fillRect(0, 0, W, H);

  // The ring: bezel, 60 ticks, progress arc.
  const cx = W / 2, cy = 780, R = 330;
  g.strokeStyle = "rgba(237,230,214,0.18)";
  g.lineWidth = 2;
  g.beginPath();
  g.arc(cx, cy, R + 26, 0, Math.PI * 2);
  g.stroke();
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 - Math.PI / 2;
    const long = i % 5 === 0;
    const lit = (c.ring ?? 1) * 60 > i;
    g.strokeStyle = lit ? "rgba(237,230,214,0.85)" : "rgba(237,230,214,0.18)";
    g.lineWidth = long ? 4 : 2;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * (R - (long ? 22 : 12)), cy + Math.sin(a) * (R - (long ? 22 : 12)));
    g.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    g.stroke();
  }
  g.strokeStyle = IVORY;
  g.lineWidth = 6;
  g.lineCap = "round";
  g.beginPath();
  g.arc(cx, cy, R - 46, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.02, Math.min(1, c.ring ?? 1)));
  g.stroke();

  g.textAlign = "center";
  g.fillStyle = IVORY;
  (g as CanvasRenderingContext2D & { fontStretch?: string }).fontStretch = "expanded";
  g.font = "200 220px Archivo, system-ui, sans-serif";
  g.fillText(c.big, cx, cy + 78);

  const label = (s: string, y: number, size: number, alpha: number, weight = 500) => {
    g.font = `${weight} ${size}px Archivo, system-ui, sans-serif`;
    g.fillStyle = `rgba(237,230,214,${alpha})`;
    const spaced = s.toUpperCase().split("").join(String.fromCharCode(8202));
    g.fillText(spaced, cx, y);
  };
  label(c.eyebrow, 300, 34, 0.55);
  label(c.title, 1290, 64, 1, 600);
  if (c.sub) label(c.sub, 1370, 34, 0.55);
  label("GlowMax · The 90-day protocol", H - 140, 28, 0.4);
  return cv;
}

/** Share via the native sheet when it supports files, otherwise download the PNG. */
export async function shareCard(c: ShareCard) {
  try {
    await Promise.all([document.fonts?.load("200 220px Archivo"), document.fonts?.load("600 64px Archivo")]);
  } catch {
    /* draw with fallback font */
  }
  const blob: Blob | null = await new Promise((r) => drawShareCard(c).toBlob(r, "image/png"));
  if (!blob) return;
  const file = new File([blob], `glowmax-${c.big.toLowerCase().replace(/\W+/g, "-")}.png`, { type: "image/png" });
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };
  try {
    if (nav.canShare?.({ files: [file] })) return await nav.share({ files: [file], title: "GlowMax" });
  } catch {
    return; // user cancelled
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = file.name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}
