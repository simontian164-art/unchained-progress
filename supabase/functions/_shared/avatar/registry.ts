// Picks the avatar provider from server-side secrets (Deno.env in the Edge Function).
import type { AvatarGenerationProvider } from "./provider.ts";
import { FashnAvatarProvider } from "./fashn.ts";

export type EnvReader = (name: string) => string | undefined;

/** Picks the provider from server-side secrets. Returns null when generation isn't configured. */
export function createAvatarProvider(env: EnvReader, fetchImpl: typeof fetch = fetch): AvatarGenerationProvider | null {
  const which = (env("AVATAR_PROVIDER") ?? "fashn").toLowerCase();
  if (which === "fashn") {
    const apiKey = env("FASHN_API_KEY");
    if (!apiKey) return null;
    return new FashnAvatarProvider({
      apiKey,
      fetch: fetchImpl,
      resolution: (env("FASHN_RESOLUTION") as "1k" | "2k" | "4k" | undefined) ?? "2k",
      generationMode: (env("FASHN_GENERATION_MODE") as "fast" | "balanced" | "quality" | undefined) ?? "balanced",
      baseUrl: env("FASHN_BASE_URL"),
    });
  }
  return null;
}
