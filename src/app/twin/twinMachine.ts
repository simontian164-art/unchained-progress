/**
 * The digital twin flow as a pure reducer, so every transition can be unit-tested without the iframe.
 *
 *   setup ──GENERATE──▶ connecting ──(loaded + authenticated, intent sent)──▶ building
 *                                                                  model_generated ▼
 *   viewing ◀──REVEAL── finalizing ◀───────────────────────────────────────────────┘
 *   (saved twin) SHOW ──▶ connecting ──▶ opening ──REVEAL──▶ viewing
 *
 * MetaPerson has no "generation failed" event. Two real signals stand in for it:
 *   1. action_availability_changed(avatar_generation): it becomes unavailable while a model is being
 *      built; if it becomes available again and no model arrives shortly after, generation failed.
 *   2. a time limit (MetaPerson quotes about a minute; we allow several).
 */
import type { CredentialsCode } from "./credentials";
import type { BodyType } from "./metaperson";

export type TwinPhase = "setup" | "connecting" | "building" | "finalizing" | "opening" | "viewing" | "error";
export type TwinErrorCode = CredentialsCode | "creator_unavailable" | "auth_rejected" | "generation_failed" | "generation_timeout";

export type Intent = { kind: "generate"; image: string; gender: BodyType } | { kind: "show"; code: string; state?: string };

export interface TwinState {
  phase: TwinPhase;
  /** metaperson_creator_loaded received for the current frame */
  loaded: boolean;
  auth: "none" | "pending" | "ok";
  intent: Intent | null;
  sent: boolean;
  /** last reported availability of avatar_generation (null: not reported yet) */
  genReady: boolean | null;
  /** avatar_generation went unavailable after we asked for a model */
  sawBusy: boolean;
  /** ...and then came back without a model: confirm failure after a short grace period */
  suspectFailure: boolean;
  avatarCode?: string;
  gender?: BodyType;
  error?: { code: TwinErrorCode; detail?: string };
}

export type TwinAction =
  | { type: "GENERATE"; image: string; gender: BodyType }
  | { type: "SHOW"; code: string; state?: string }
  | { type: "LOADED" }
  | { type: "FRAME_RESET" }
  | { type: "AUTH_SENT" }
  | { type: "AUTH_RESULT"; ok: boolean; detail?: string }
  | { type: "SENT" }
  | { type: "AVAILABILITY"; action: string; available: boolean }
  | { type: "MODEL_GENERATED"; code: string; gender?: string }
  | { type: "CONFIRM_FAILURE" }
  | { type: "REVEAL" }
  | { type: "TIMEOUT"; what: "load" | "auth" | "ready" | "generate" }
  | { type: "CREDENTIALS_ERROR"; code: CredentialsCode; detail?: string }
  | { type: "RESET" };

export const initialTwin: TwinState = { phase: "setup", loaded: false, auth: "none", intent: null, sent: false, genReady: null, sawBusy: false, suspectFailure: false };

const fail = (s: TwinState, code: TwinErrorCode, detail?: string): TwinState => ({ ...s, phase: "error", error: { code, detail }, intent: null, sent: false, sawBusy: false, suspectFailure: false });

export function twinReducer(s: TwinState, a: TwinAction): TwinState {
  switch (a.type) {
    case "GENERATE":
      return { ...s, phase: "connecting", intent: { kind: "generate", image: a.image, gender: a.gender }, sent: false, sawBusy: false, suspectFailure: false, error: undefined, avatarCode: undefined, gender: a.gender };
    case "SHOW":
      return { ...s, phase: "connecting", intent: { kind: "show", code: a.code, state: a.state }, sent: false, error: undefined, avatarCode: a.code };
    case "LOADED":
      // a (re)loaded frame has forgotten any previous authentication
      return { ...s, loaded: true, auth: "none", genReady: null, sent: s.phase === "viewing" ? s.sent : false };
    case "FRAME_RESET":
      // a new iframe is being created: nothing is loaded or authenticated in it yet
      return { ...s, loaded: false, auth: "none", genReady: null, sent: false };
    case "AUTH_SENT":
      return { ...s, auth: "pending" };
    case "AUTH_RESULT":
      if (!a.ok) return { ...fail(s, "auth_rejected", a.detail), loaded: s.loaded, auth: "none" };
      return { ...s, auth: "ok" };
    case "SENT":
      if (!s.intent) return s;
      return { ...s, sent: true, phase: s.intent.kind === "generate" ? "building" : "opening" };
    case "AVAILABILITY": {
      if (a.action !== "avatar_generation") return s;
      const t = { ...s, genReady: a.available };
      if (s.phase !== "building") return t;
      if (!a.available) return { ...t, sawBusy: true, suspectFailure: false };
      return s.sawBusy ? { ...t, suspectFailure: true } : t;
    }
    case "CONFIRM_FAILURE":
      return s.phase === "building" && s.suspectFailure ? fail(s, "generation_failed") : s;
    case "MODEL_GENERATED":
      // only a model we asked for counts (the creator can also report models made in its own UI)
      if (s.phase !== "building" && s.phase !== "connecting") return s.phase === "viewing" ? { ...s, avatarCode: a.code } : s;
      return { ...s, phase: "finalizing", avatarCode: a.code, gender: a.gender === "female" || a.gender === "male" ? a.gender : s.gender, intent: null, suspectFailure: false };
    case "REVEAL":
      return s.phase === "finalizing" || s.phase === "opening" ? { ...s, phase: "viewing", intent: null } : s;
    case "TIMEOUT":
      if (a.what === "load" && !s.loaded && s.phase === "connecting") return fail(s, "creator_unavailable");
      if (a.what === "auth" && s.auth === "pending") return fail(s, "auth_rejected", "No answer to authentication.");
      if (a.what === "ready" && s.phase === "connecting" && s.auth === "ok" && !s.sent) return fail(s, "creator_unavailable", "Avatar generation never became available.");
      if (a.what === "generate" && s.phase === "building") return fail(s, "generation_timeout");
      return s;
    case "CREDENTIALS_ERROR":
      return fail(s, a.code, a.detail);
    case "RESET":
      return { ...initialTwin, loaded: s.loaded, auth: s.auth, genReady: s.genReady };
  }
}

/** What the loading checklist shows. Each step is a real state of the flow above. */
export const TWIN_STEPS = [
  { key: "connecting", label: "Preparing" },
  { key: "building", label: "Building model" },
  { key: "finalizing", label: "Finalizing" },
] as const;
export const stepIndexOf = (phase: TwinPhase) => (phase === "connecting" ? 0 : phase === "building" ? 1 : phase === "finalizing" ? 2 : phase === "viewing" ? 3 : -1);

export const TWIN_ERRORS: Record<TwinErrorCode, { title: string; body: string; tips?: boolean; retry: boolean }> = {
  generation_failed: { title: "We couldn't build a twin from this photo.", body: "Try a photo with:", tips: true, retry: true },
  generation_timeout: { title: "This took too long and was stopped.", body: "MetaPerson usually needs about a minute. Try again; if it keeps happening, try a different photo.", retry: true },
  creator_unavailable: { title: "The 3D creator didn't load.", body: "Check your connection, or turn off content blockers for this page, then try again.", retry: true },
  auth_rejected: { title: "MetaPerson didn't accept GlowMax's developer credentials.", body: "This is a setup problem on our side, not your photo.", retry: true },
  credentials_failed: { title: "Couldn't get a MetaPerson access token.", body: "The token service didn't respond. Try again in a moment.", retry: true },
  credentials_missing: { title: "MetaPerson isn't connected yet.", body: "Add the developer credentials (see the setup steps below), then try again.", retry: true },
  passcode_not_set: { title: "This test page needs a passcode first.", body: "Add a TWIN_TEST_PASSCODE secret of at least 12 characters (see the setup steps below), then try again.", retry: true },
  passcode_required: { title: "Enter the test passcode.", body: "This page is locked so only you can use GlowMax's MetaPerson account.", retry: false },
  passcode_wrong: { title: "That passcode didn't match.", body: "Use the value of the TWIN_TEST_PASSCODE secret.", retry: false },
};
