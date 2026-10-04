/**
 * Preview-only stand-in for the digital model service. Loaded only when VITE_AVATAR_DEMO=1 (the
 * shareable preview), so production builds don't contain it.
 *
 * It does NOT generate anything with AI and sends nothing anywhere: it walks through the same stages
 * on a timer and returns the user's own face photo, cropped and labelled "Demo". It exists so the
 * screens can be seen and tested before the Supabase project and FASHN key are set up.
 * Add ?demoFail=1 to the URL (or localStorage gm_demo_avatar=fail) to see the failure state.
 */
import type { AvatarClient, AvatarGeneration, AvatarInfo, AvatarStage } from "./avatarClient";
import { AvatarRequestError } from "./avatarClient";
import type { LocalDigitalProfileService, LocalModelRecord } from "./localService";
import { newId } from "./service";

const TIMELINE: [AvatarStage, number][] = [
  ["preparing", 1200],
  ["building", 2200],
  ["preserving", 3000],
  ["finalizing", 1100],
];
const TOTAL = TIMELINE.reduce((a, [, ms]) => a + ms, 0);

function stageAt(elapsed: number): AvatarStage {
  let t = 0;
  for (const [stage, ms] of TIMELINE) {
    t += ms;
    if (elapsed < t) return stage;
  }
  return "ready";
}

const wantsFailure = () => {
  try {
    // the shareable preview uses a hash router, so the query can sit inside the hash
    const hashQuery = location.hash.includes("?") ? location.hash.slice(location.hash.indexOf("?")) : "";
    return [location.search, hashQuery].some((q) => new URLSearchParams(q).get("demoFail") === "1") || localStorage.getItem("gm_demo_avatar") === "fail";
  } catch {
    return false;
  }
};

async function demoImage(photo: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(photo);
  const W = 900;
  const H = 1200;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#1a1a1a");
  bg.addColorStop(1, "#0a0a0a");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);
  // cover-crop the photo into the frame
  const s = Math.max(W / bmp.width, H / bmp.height);
  const w = bmp.width * s;
  const h = bmp.height * s;
  g.filter = "grayscale(0.35) contrast(1.05)";
  g.drawImage(bmp, (W - w) / 2, (H - h) / 2, w, h);
  g.filter = "none";
  bmp.close();
  // label at the top: the frame's own caption sits at the bottom
  g.fillStyle = "rgba(0,0,0,0.6)";
  g.fillRect(0, 0, W, 96);
  g.fillStyle = "#cdbb93";
  g.font = "600 30px system-ui, sans-serif";
  g.fillText("DEMO · NOT AI-GENERATED", 64, 60);
  return new Promise((res, rej) => c.toBlob((b) => (b ? res(b) : rej(new Error("encode"))), "image/jpeg", 0.88));
}

export class DemoAvatarClient implements AvatarClient {
  readonly kind = "demo" as const;
  constructor(private local: LocalDigitalProfileService) {}

  private async view(r: LocalModelRecord): Promise<AvatarGeneration> {
    const v: AvatarGeneration = { id: r.id, stage: r.status === "working" ? stageAt(Date.now() - new Date(r.createdAt).getTime()) : r.status, approved: r.approved, createdAt: r.createdAt, sourceImageId: r.sourceImageId };
    if (r.status === "failed") v.failure = (r.failure as AvatarGeneration["failure"]) ?? "unknown";
    if (r.generatedAt) v.generatedAt = r.generatedAt;
    if (r.status === "ready" && r.storagePath) v.resultUrl = await this.local.getImageUrl({ storagePath: r.storagePath });
    return v;
  }

  private async advance(r: LocalModelRecord): Promise<LocalModelRecord> {
    if (r.status !== "working") return r;
    const elapsed = Date.now() - new Date(r.createdAt).getTime();
    if (wantsFailure() && elapsed > TOTAL - 1100) return this.patch(r.id, { status: "failed", failure: "photo_unusable" });
    if (elapsed < TOTAL) return r;
    const bundle = await this.local.getProfile();
    const src = bundle?.images.head_front;
    if (!src) return this.patch(r.id, { status: "failed", failure: "photo_unusable" });
    const url = await this.local.getImageUrl(src);
    const blob = await demoImage(await (await fetch(url)).blob());
    const path = `device/avatars/${r.id}.jpg`;
    await this.local.putModelBlob(path, blob);
    return this.patch(r.id, { status: "ready", storagePath: path, generatedAt: new Date().toISOString() });
  }

  private async patch(id: string, p: Partial<LocalModelRecord>) {
    const list = await this.local.listModelRecords();
    const next = list.map((r) => (r.id === id ? { ...r, ...p } : r));
    await this.local.saveModelRecords(next);
    return next.find((r) => r.id === id)!;
  }

  private async drop(r: LocalModelRecord) {
    if (r.storagePath) await this.local.removeModelBlob(r.storagePath);
    return { ...r, status: "discarded" as const, storagePath: undefined, approved: false, approvedAt: undefined };
  }

  async info(): Promise<AvatarInfo> {
    return { available: true, processor: { name: "this preview's demo generator", summary: "No AI is used and nothing leaves this device." }, dailyLimit: 99 };
  }

  async start(_opts: { consent: true }): Promise<AvatarGeneration> {
    const bundle = await this.local.getProfile();
    const src = bundle?.images.head_front;
    if (!src) throw new AvatarRequestError("no_face_photo", "Add a front face photo first.");
    let list = await this.local.listModelRecords();
    const active = list.find((r) => r.status === "working");
    if (active) return this.view(active);
    // like the server: unapproved earlier results are deleted
    list = await Promise.all(list.map((r) => (!r.approved && r.storagePath ? this.drop(r) : r)));
    const rec: LocalModelRecord = { id: newId(), status: "working", approved: false, sourceImageId: src.id, createdAt: new Date().toISOString() };
    await this.local.saveModelRecords([rec, ...list]);
    return this.view(rec);
  }

  async status(id?: string) {
    const list = await this.local.listModelRecords();
    const r = id ? list.find((x) => x.id === id) : list.find((x) => x.status !== "discarded");
    if (!r) return null;
    return this.view(await this.advance(r));
  }

  async approve(id: string) {
    const list = await this.local.listModelRecords();
    if (list.find((r) => r.id === id)?.status !== "ready") throw new AvatarRequestError("not_ready", "This model isn't ready yet.");
    const next = await Promise.all(list.map(async (r) => (r.id === id ? { ...r, approved: true, approvedAt: new Date().toISOString() } : r.approved || r.storagePath ? this.drop(r) : r)));
    await this.local.saveModelRecords(next);
    return this.view(next.find((r) => r.id === id)!);
  }

  async discard(id: string) {
    const list = await this.local.listModelRecords();
    await this.local.saveModelRecords(await Promise.all(list.map((r) => (r.id === id ? this.drop(r) : r))));
  }
}
