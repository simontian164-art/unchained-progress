// digital-model: turns the user's front face photo into an upper-body digital model.
// The ONLY place the avatar provider is called. The provider key lives in Supabase secrets.
//
//   browser ──(user JWT)──▶ this function ──▶ avatarGenerationProvider (FASHN today)
//                               │                     │
//                               ▼                     ▼
//               avatar_generations row      result image ─▶ digital-you/<user id>/avatars/<id>.jpg
//
// Actions (POST JSON): { action: "start", consent: true } | { action: "status", id? }
//                      { action: "approve", id } | { action: "discard", id }
// Secrets: FASHN_API_KEY (required), AVATAR_PROVIDER (default "fashn"), FASHN_RESOLUTION (default
//          "2k"), FASHN_GENERATION_MODE (default "balanced"), AVATAR_DAILY_LIMIT (default 8).
// Docs: https://supabase.com/docs/guides/functions/auth · /background-tasks · /secrets
import { withSupabase } from "npm:@supabase/server@^1";
import { consoleLogger, handleAvatarRequest } from "../_shared/avatar/handler.ts";
import { SupabaseAvatarRepo } from "../_shared/avatar/repo.ts";
import { createAvatarProvider } from "../_shared/avatar/registry.ts";
import { type AvatarDeps, DEFAULT_CONFIG } from "../_shared/avatar/service.ts";

declare const EdgeRuntime: { waitUntil(task: Promise<unknown>): void } | undefined;

const provider = createAvatarProvider((name) => Deno.env.get(name));
const limit = Number(Deno.env.get("AVATAR_DAILY_LIMIT"));
const config = { ...DEFAULT_CONFIG, dailyLimit: Number.isFinite(limit) && limit > 0 ? limit : DEFAULT_CONFIG.dailyLimit };
const randomSeed = () => (crypto.getRandomValues(new Uint32Array(1))[0] % 2_147_483_646) + 1;

if (!provider) consoleLogger("error", "avatar.not_configured", { hint: "set FASHN_API_KEY" });

export default {
  fetch: withSupabase({ auth: "user" }, async (req, ctx) => {
    const userId = ctx.userClaims?.id;
    // Generation costs money: signed-in, non-anonymous users only.
    if (!userId || ctx.jwtClaims?.is_anonymous === true) {
      return Response.json({ error: { code: "bad_request", message: "Sign in to create a digital model." } }, { status: 401 });
    }
    const deps: AvatarDeps = {
      repo: new SupabaseAvatarRepo(ctx.supabase, ctx.supabaseAdmin),
      provider,
      log: consoleLogger,
      now: () => new Date(),
      randomSeed,
      config,
    };
    const background = (task: Promise<unknown>) => {
      if (typeof EdgeRuntime !== "undefined") EdgeRuntime.waitUntil(task);
      else task.catch(() => undefined);
    };
    return await handleAvatarRequest(req, userId, deps, background);
  }),
};
