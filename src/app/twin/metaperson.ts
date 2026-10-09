/**
 * MetaPerson Creator (Avatar SDK) iframe integration, per https://docs.metaperson.avatarsdk.com/js_api/
 * (checked 5 Oct 2026). This file is the only place that knows MetaPerson's message format.
 *
 *   GlowMax page ──postMessage──▶ iframe (metaperson.avatarsdk.com)
 *      authenticate { clientId, accessToken }      ← token minted server-side; the secret never ships
 *      set_ui_parameters / set_export_parameters
 *      generate_avatar { gender, age, image: base64 }
 *      show_avatar { avatarCode, avatarState? }
 *      export_avatar
 *   iframe ──postMessage──▶ GlowMax page   (all carry source: "metaperson_creator")
 *      metaperson_creator_loaded, authentication_status, model_generated, model_exported,
 *      model_screenshot, action_availability_changed
 *
 * Security: messages are only accepted from the iframe's exact origin and window, and are only posted
 * to that exact origin (the docs' samples use "*", which would hand the access token to whatever page
 * the frame happens to be showing).
 */

export type Variant = "desktop" | "mobile";
export type BodyType = "male" | "female";

const PROD = {
  desktop: "https://metaperson.avatarsdk.com/iframe.html",
  mobile: "https://mobile.metaperson.avatarsdk.com/generator",
};

/**
 * Build-time only: automated tests point the frame at a local mock of the documented protocol.
 * Deliberately not configurable at runtime (a URL parameter could redirect the access token).
 */
const TEST_ORIGIN = import.meta.env.VITE_METAPERSON_TEST_ORIGIN as string | undefined;

export function creatorUrl(variant: Variant): string {
  // Shareable preview only (compiled out elsewhere): a labelled stand-in page served next to the app,
  // because the preview host can't reach MetaPerson and has no credentials.
  if (__TWIN_SIMULATOR__) return new URL(`metaperson-sim.html${variant === "mobile" ? "?mobile=1" : ""}`, document.baseURI).href;
  if (TEST_ORIGIN) return `${TEST_ORIGIN}${variant === "desktop" ? "/iframe.html" : "/generator"}`;
  return PROD[variant];
}
export const originOf = (url: string) => new URL(url).origin;

/** The phone creator is built for touch and small screens; the desktop one has the full editor. */
export const pickVariant = (width: number): Variant => (width < 768 ? "mobile" : "desktop");

// ─── messages to the creator ─────────────────────────────────────────────
export type ToCreator =
  | { eventName: "authenticate"; clientId: string; accessToken: string }
  | ({ eventName: "set_ui_parameters" } & Record<string, unknown>)
  | ({ eventName: "set_export_parameters" } & Record<string, unknown>)
  | { eventName: "generate_avatar"; gender: BodyType; age: "adult"; image: string }
  | { eventName: "show_avatar"; avatarCode: string; avatarState?: string }
  | { eventName: "export_avatar" };

/**
 * GlowMax drives the flow, so MetaPerson's own photo, sample, export and sharing controls are hidden.
 * The 3D viewer and its editing panels stay.
 */
export function uiParameters(variant: Variant): ToCreator {
  if (variant === "mobile") {
    return {
      eventName: "set_ui_parameters",
      isExportButtonVisible: false,
      isLoginButtonVisible: false,
      isHomeButtonVisible: false,
      isScreenshotButtonVisible: false,
      isNoPhotoVisible: false,
      theme: "dark",
    };
  }
  return {
    eventName: "set_ui_parameters",
    isExportButtonVisible: false,
    isScreenshotButtonVisible: false,
    isLanguageSelectionVisible: false,
    showLatestCreatedAvatar: false,
    isTakeSelfieButtonVisible: false,
    isBrowsePhotoButtonVisible: false,
    showSampleAvatars: false,
    ageSelectionAvailable: false,
    pipelineSelectionAvailable: false,
    computationParametersPanelVisible: false,
    enableLipsync: false,
    isGifButtonVisible: false,
    isPngButtonVisible: false,
    isAnimateButtonVisible: false,
    closeExportDialogWhenExportCompleted: true,
  };
}

/** For a later custom renderer: one GLB file, no zip. Only used by the developer "Export GLB" action. */
export const exportParameters: ToCreator = {
  eventName: "set_export_parameters",
  format: "glb",
  lod: 1,
  textureProfile: "1K.jpg",
  useZip: false,
};

/**
 * The docs only say "image_encoded_to_base64_string". MetaPerson's own integration sample
 * (metaperson.avatarsdk.com/business.html, read 5 Oct 2026) sends FileReader.readAsDataURL output,
 * i.e. the full "data:image/jpeg;base64,…" string, so that's what we send.
 */
export const SEND_DATA_URI = true;
export function toImageField(dataUrlOrBase64: string): string {
  if (SEND_DATA_URI) return dataUrlOrBase64;
  const i = dataUrlOrBase64.indexOf(",");
  return dataUrlOrBase64.startsWith("data:") && i >= 0 ? dataUrlOrBase64.slice(i + 1) : dataUrlOrBase64;
}

// ─── messages from the creator ───────────────────────────────────────────
export type FromCreator =
  | { eventName: "metaperson_creator_loaded" }
  | { eventName: "authentication_status"; isAuthenticated: boolean; errorMessage?: string }
  | { eventName: "model_generated"; avatarCode: string; gender?: string }
  | { eventName: "model_exported"; url: string; avatarCode?: string; gender?: string; avatarState?: string }
  | { eventName: "model_screenshot"; screenshotUrl?: string }
  | { eventName: "action_availability_changed"; actionName: string; isAvailable: boolean };

/** The live creator sends 1/0 as well as true/false (seen 5 Oct 2026: isAvailable: 1). */
const flag = (v: unknown) => v === true || v === 1 || v === "true";

// "unity_loaded" (undocumented, sent with metaperson_creator_loaded) is deliberately ignored.
const KNOWN = new Set(["metaperson_creator_loaded", "authentication_status", "model_generated", "model_exported", "model_screenshot", "action_availability_changed"]);

/**
 * Accept a window message only if it comes from the creator frame we embedded, from its origin, and
 * looks like a documented MetaPerson event. Returns a trimmed copy (never the photo bytes/URL that
 * model_generated also carries, which GlowMax has no reason to keep).
 */
export function parseCreatorMessage(evt: { origin: string; source: unknown; data: unknown }, expectedOrigin: string, expectedWindow: unknown): FromCreator | null {
  if (evt.origin !== expectedOrigin || !expectedWindow || evt.source !== expectedWindow) return null;
  const d = evt.data as Record<string, unknown> | null;
  if (!d || typeof d !== "object" || d.source !== "metaperson_creator" || typeof d.eventName !== "string" || !KNOWN.has(d.eventName)) return null;
  switch (d.eventName) {
    case "metaperson_creator_loaded":
      return { eventName: "metaperson_creator_loaded" };
    case "authentication_status":
      return { eventName: "authentication_status", isAuthenticated: flag(d.isAuthenticated), errorMessage: typeof d.errorMessage === "string" ? d.errorMessage.slice(0, 300) : undefined };
    case "model_generated":
      if (typeof d.avatarCode !== "string" || !d.avatarCode) return null;
      return { eventName: "model_generated", avatarCode: d.avatarCode.slice(0, 200), gender: typeof d.gender === "string" ? d.gender : undefined };
    case "model_exported":
      if (typeof d.url !== "string") return null;
      return { eventName: "model_exported", url: d.url, avatarCode: typeof d.avatarCode === "string" ? d.avatarCode : undefined, gender: typeof d.gender === "string" ? d.gender : undefined, avatarState: typeof d.avatarState === "string" ? d.avatarState : undefined };
    case "model_screenshot":
      return { eventName: "model_screenshot", screenshotUrl: typeof d.screenshotUrl === "string" ? d.screenshotUrl : undefined };
    case "action_availability_changed":
      return { eventName: "action_availability_changed", actionName: String(d.actionName ?? ""), isAvailable: flag(d.isAvailable) };
  }
  return null;
}
