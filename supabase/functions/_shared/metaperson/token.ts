// MetaPerson (Avatar SDK) access tokens, minted server-side so the client secret never reaches a
// browser. Per https://docs.metaperson.avatarsdk.com/js_api/ the creator iframe accepts
// `authenticate { clientId, accessToken }` instead of the secret, and tokens come from:
//   POST https://api.avatarsdk.com/o/token/   (HTTP Basic client_id:client_secret)
//   grant_type=client_credentials  →  { access_token, token_type: "Bearer", expires_in: 36000 }
// Runtime-agnostic (Deno Edge Function, Node dev server, tests).

export const TOKEN_URL = "https://api.avatarsdk.com/o/token/";
const REFRESH_MARGIN_MS = 10 * 60_000;

export interface MetaPersonToken {
  clientId: string;
  accessToken: string;
  /** seconds left */
  expiresIn: number;
}

export class TokenError extends Error {
  constructor(public code: "not_configured" | "rejected" | "unavailable", message: string) {
    super(message);
    this.name = "TokenError";
  }
}

export function createTokenProvider(opts: { clientId?: string; clientSecret?: string; fetch?: typeof fetch; now?: () => number }) {
  const f = opts.fetch ?? fetch;
  const now = opts.now ?? (() => Date.now());
  let cached: { token: string; expiresAt: number } | null = null;
  let inflight: Promise<{ token: string; expiresAt: number }> | null = null;

  async function mint() {
    if (!opts.clientId || !opts.clientSecret) throw new TokenError("not_configured", "METAPERSON_CLIENT_ID / METAPERSON_CLIENT_SECRET are not set");
    let res: Response;
    try {
      res = await f(TOKEN_URL, {
        method: "POST",
        headers: { Authorization: `Basic ${btoa(`${opts.clientId}:${opts.clientSecret}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
        // (guarded: some test DOMs ship an AbortSignal without timeout())
        signal: typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(15_000) : undefined,
      });
    } catch {
      throw new TokenError("unavailable", "token endpoint unreachable");
    }
    const json = (await res.json().catch(() => ({}))) as { access_token?: unknown; expires_in?: unknown };
    if (res.status === 400 || res.status === 401) throw new TokenError("rejected", `token endpoint rejected the credentials (HTTP ${res.status})`);
    if (!res.ok || typeof json?.access_token !== "string") throw new TokenError("unavailable", `token endpoint HTTP ${res.status}`);
    const ttl = Number(json.expires_in) > 0 ? Number(json.expires_in) : 3600;
    return { token: json.access_token as string, expiresAt: now() + ttl * 1000 };
  }

  return {
    async get(): Promise<MetaPersonToken> {
      if (!cached || cached.expiresAt - now() < REFRESH_MARGIN_MS) {
        inflight ??= mint().finally(() => (inflight = null));
        cached = await inflight;
      }
      return { clientId: opts.clientId!, accessToken: cached.token, expiresIn: Math.floor((cached.expiresAt - now()) / 1000) };
    },
  };
}
