/**
 * Where the browser gets a MetaPerson access token. Never the client secret.
 *   1. server   the `metaperson-token` function. It gives a token to a signed-in user, or to whoever
 *               enters the test passcode (TWIN_TEST_PASSCODE), kept in this tab only.
 *   2. manual   a token pasted into this tab by a developer (sessionStorage, this tab only).
 */
export interface Credentials {
  clientId: string;
  accessToken: string;
  source: "server" | "manual";
}

export type CredentialsCode = "credentials_missing" | "credentials_failed" | "passcode_not_set" | "passcode_required" | "passcode_wrong";

export class CredentialsError extends Error {
  constructor(public code: CredentialsCode, message: string) {
    super(message);
    this.name = "CredentialsError";
  }
}

const MANUAL_KEY = "gm_metaperson_manual_v1";
const PASSCODE_KEY = "gm_twin_passcode_v1";

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {
    /* private mode: the user can enter it again */
  }
}

export function readManual(): { clientId: string; accessToken: string } | null {
  try {
    const v = JSON.parse(read(MANUAL_KEY) ?? "null");
    return v && typeof v.clientId === "string" && typeof v.accessToken === "string" && v.clientId && v.accessToken ? v : null;
  } catch {
    return null;
  }
}
export const saveManual = (clientId: string, accessToken: string) => write(MANUAL_KEY, JSON.stringify({ clientId: clientId.trim(), accessToken: accessToken.trim() }));
export const clearManual = () => write(MANUAL_KEY, null);

export const readPasscode = () => read(PASSCODE_KEY);
export const savePasscode = (code: string) => write(PASSCODE_KEY, code.trim());
export const clearPasscode = () => write(PASSCODE_KEY, null);

/** Turns the function's answer into credentials or a specific, actionable error. */
export function credentialsFromResponse(status: number, body: unknown): Credentials {
  const b = (body ?? {}) as { clientId?: unknown; accessToken?: unknown; error?: { code?: unknown } };
  if (status === 200 && typeof b.clientId === "string" && b.clientId && typeof b.accessToken === "string" && b.accessToken) {
    return { clientId: b.clientId, accessToken: b.accessToken, source: "server" };
  }
  const code = typeof b.error?.code === "string" ? b.error.code : undefined;
  if (code === "not_configured") throw new CredentialsError("credentials_missing", "METAPERSON_CLIENT_ID / METAPERSON_CLIENT_SECRET aren't set.");
  if (code === "passcode_not_set") throw new CredentialsError("passcode_not_set", "TWIN_TEST_PASSCODE isn't set (or is shorter than 12 characters).");
  if (code === "passcode_required") throw new CredentialsError("passcode_required", "Passcode needed.");
  if (code === "passcode_wrong") {
    clearPasscode();
    throw new CredentialsError("passcode_wrong", "Wrong passcode.");
  }
  if (status === 404) throw new CredentialsError("credentials_missing", "The metaperson-token function isn't deployed.");
  // e.g. 401 from the platform before the function runs: verify_jwt must be off for this function
  throw new CredentialsError("credentials_failed", `token function: HTTP ${status}${code ? ` ${code}` : ""}`);
}

async function fromServer(): Promise<Credentials> {
  if (!import.meta.env.VITE_SUPABASE_URL) throw new CredentialsError("credentials_missing", "No backend is connected to this build.");
  // loaded on demand: only this page needs it
  const { supabase } = await import("@/integrations/supabase/client");
  const passcode = readPasscode();
  const { data, error } = await supabase.functions.invoke("metaperson-token", { body: {}, headers: passcode ? { "x-twin-passcode": passcode } : undefined });
  if (!error) return credentialsFromResponse(200, data);
  const res = (error as { context?: unknown }).context;
  if (res instanceof Response) return credentialsFromResponse(res.status, await res.clone().json().catch(() => null));
  throw new CredentialsError("credentials_failed", `token function: ${error.name}`);
}

export async function getCredentials(): Promise<Credentials> {
  if (__TWIN_SIMULATOR__) return { clientId: "preview-simulator", accessToken: "preview-simulator", source: "manual" };
  const manual = readManual();
  if (manual) return { ...manual, source: "manual" };
  return fromServer();
}
