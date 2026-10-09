/**
 * The generated twin's identifiers, so the same avatar reopens on the next visit instead of being
 * generated again. Prototype: this browser only. The avatar itself lives in MetaPerson's cloud under
 * GlowMax's developer account; we keep only its code (and the editor state, once exported).
 */
import type { BodyType } from "./metaperson";

export interface SavedTwin {
  avatarCode: string;
  gender: BodyType;
  createdAt: string;
  /** MetaPerson's serialized customisation, from model_exported */
  avatarState?: string;
}

const KEY = "glowmax_twin_v1";

export function loadTwin(): SavedTwin | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!v || typeof v.avatarCode !== "string" || !v.avatarCode) return null;
    return { avatarCode: v.avatarCode, gender: v.gender === "female" ? "female" : "male", createdAt: String(v.createdAt ?? ""), avatarState: typeof v.avatarState === "string" ? v.avatarState : undefined };
  } catch {
    return null;
  }
}

export function saveTwin(t: SavedTwin) {
  try {
    localStorage.setItem(KEY, JSON.stringify(t));
  } catch {
    /* storage blocked: the twin still shows this session */
  }
}

export function forgetTwin() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
