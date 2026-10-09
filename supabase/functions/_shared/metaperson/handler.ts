// The metaperson-token endpoint, kept apart from the Deno wiring (../../metaperson-token/index.ts) so
// it can be tested anywhere.
//
// MetaPerson access tokens cover GlowMax's whole developer account for about 10 hours, so they're only
// handed to (a) a signed-in, non-anonymous user, or (b) someone holding the test passcode
// (TWIN_TEST_PASSCODE secret) while /digital-twin-test is a prototype without sign-in. Nobody else can
// mint one and spend the account's avatar quota. Tokens and passcodes are never logged.
import { TokenError, type MetaPersonToken } from "./token.ts";

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-twin-passcode",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
export const MIN_PASSCODE_LENGTH = 12;

export interface TokenDeps {
  /** METAPERSON_CLIENT_ID and METAPERSON_CLIENT_SECRET are both set */
  configured: boolean;
  tokens: { get(): Promise<MetaPersonToken> };
  /** TWIN_TEST_PASSCODE, if set */
  passcode?: string;
  /** null unless the bearer token belongs to a signed-in, non-anonymous user */
  verifyUser(jwt: string): Promise<{ id: string } | null>;
  log(event: string, fields?: Record<string, unknown>): void;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS_HEADERS, "Content-Type": "application/json", "Cache-Control": "no-store" } });
const refuse = (status: number, code: string, message: string) => json({ error: { code, message } }, status);

/** Constant-time comparison (of SHA-256 digests, so lengths don't leak either). */
async function sameSecret(a: string, b: string): Promise<boolean> {
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([crypto.subtle.digest("SHA-256", enc.encode(a)), crypto.subtle.digest("SHA-256", enc.encode(b))]);
  const u = new Uint8Array(x);
  const v = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < u.length; i++) diff |= u[i] ^ v[i];
  return diff === 0;
}

export async function handleTokenRequest(req: Request, deps: TokenDeps): Promise<Response> {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== "POST") return refuse(405, "method", "POST only.");
  if (!deps.configured) return refuse(503, "not_configured", "MetaPerson isn't configured: set METAPERSON_CLIENT_ID and METAPERSON_CLIENT_SECRET.");

  let via: "user" | "passcode" | null = null;
  const bearer = req.headers.get("authorization")?.match(/^Bearer\s+(\S+)$/i)?.[1];
  // A publishable/anon key also arrives as a bearer; it simply isn't a user, so we fall through.
  if (bearer && bearer.split(".").length === 3) {
    if (await deps.verifyUser(bearer).catch(() => null)) via = "user";
  }
  if (!via) {
    const set = deps.passcode ?? "";
    const given = req.headers.get("x-twin-passcode") ?? "";
    if (!set) return refuse(401, "passcode_not_set", "Set the TWIN_TEST_PASSCODE secret, or sign in.");
    if (set.length < MIN_PASSCODE_LENGTH) {
      deps.log("passcode_unusable");
      return refuse(401, "passcode_not_set", `TWIN_TEST_PASSCODE must be at least ${MIN_PASSCODE_LENGTH} characters.`);
    }
    if (!given) return refuse(401, "passcode_required", "Enter the test passcode.");
    if (!(await sameSecret(given, set))) {
      deps.log("passcode_wrong");
      return refuse(403, "passcode_wrong", "That passcode didn't match.");
    }
    via = "passcode";
  }

  try {
    const t = await deps.tokens.get();
    deps.log("token_issued", { via });
    return json({ clientId: t.clientId, accessToken: t.accessToken, expiresIn: t.expiresIn });
  } catch (e) {
    const code = e instanceof TokenError ? e.code : "unavailable";
    deps.log("token_failed", { code, detail: e instanceof Error ? e.message : "?" });
    if (code === "not_configured") return refuse(503, code, "MetaPerson isn't configured.");
    if (code === "rejected") return refuse(502, code, "MetaPerson rejected the developer credentials.");
    return refuse(502, code, "Couldn't reach MetaPerson. Try again.");
  }
}
