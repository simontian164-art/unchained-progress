import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase, isSupabaseConfigured } from "./supabaseShim";
import type { DigitalProfileService } from "./service";
import { IndexedDbKV, LocalDigitalProfileService } from "./localService";
import { SupabaseDigitalProfileService } from "./supabaseService";
import type { DigitalProfileBundle, ImageKind } from "./types";
import { SupabaseAvatarClient, type AvatarClient } from "./avatarClient";

let localSingleton: LocalDigitalProfileService | null = null;
const localService = () => (localSingleton ??= new LocalDigitalProfileService(new IndexedDbKV()));

/** Preview builds only: a labelled stand-in generator so the flow can be seen without a backend. */
const AVATAR_DEMO = __AVATAR_DEMO__;

/** Supabase client + session, if Supabase is configured. `session` is `undefined` while it's being read. */
export function useSession() {
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [session, setSession] = useState<Session | null | undefined>(isSupabaseConfigured ? undefined : null);
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let unsub: (() => void) | undefined;
    let alive = true;
    getSupabase()
      .then((sb) => {
        if (!alive) return;
        setClient(sb);
        sb.auth.getSession().then(({ data }) => alive && setSession(data.session));
        unsub = sb.auth.onAuthStateChange((_e, s) => setSession(s)).data.subscription.unsubscribe;
      })
      .catch(() => alive && setSession(null));
    return () => {
      alive = false;
      unsub?.();
    };
  }, []);
  return { client, session };
}

/** Picks the right backend: account (Supabase, signed in) or this device. */
export function useDigitalService(): { service: DigitalProfileService | null; needsSignIn: boolean; checking: boolean } {
  const { client, session } = useSession();
  const userId = session?.user.id;
  const state = session === undefined ? "checking" : session ? "in" : "out";
  return useMemo(() => {
    if (!isSupabaseConfigured) return { service: localService(), needsSignIn: false, checking: false };
    if (state === "checking" || !client) return { service: null, needsSignIn: state === "out", checking: state === "checking" };
    if (state === "out" || !userId) return { service: null, needsSignIn: true, checking: false };
    // Keyed on the user id, not the session object, so token refreshes don't reload the screen.
    return { service: new SupabaseDigitalProfileService(client, userId), needsSignIn: false, checking: false };
  }, [state, userId, client]);
}

/**
 * The digital model generator for the current user, or none.
 *   account mode (Supabase configured + signed in) → the digital-model Edge Function
 *   preview demo (VITE_AVATAR_DEMO=1, device mode)  → DemoAvatarClient
 *   otherwise                                       → none: generation needs a GlowMax account
 */
export function useAvatarClient(): { client: AvatarClient | null; checking: boolean } {
  const { client: sb, session } = useSession();
  const userId = session?.user.id;
  const sessionKnown = session !== undefined;
  const [demo, setDemo] = useState<AvatarClient | null>(null);
  useEffect(() => {
    // `__AVATAR_DEMO__` is replaced with a literal at build time, so this whole branch (and the demo
    // chunk) disappears from production builds.
    if (__AVATAR_DEMO__ && !isSupabaseConfigured) {
      let alive = true;
      import("./avatarDemo").then(({ DemoAvatarClient }) => alive && setDemo(new DemoAvatarClient(localService())));
      return () => {
        alive = false;
      };
    }
  }, []);
  return useMemo(() => {
    if (isSupabaseConfigured) {
      if (!sessionKnown || !sb) return { client: null, checking: !sessionKnown };
      return { client: userId ? new SupabaseAvatarClient(sb) : null, checking: false };
    }
    if (AVATAR_DEMO) return { client: demo, checking: !demo };
    return { client: null, checking: false };
    // keyed on the user, not the session object, so token refreshes don't recreate the client
  }, [sb, sessionKnown, userId, demo]);
}

export type LoadState = "loading" | "ready" | "error" | "signed-out";

/** The You screen's data: profile bundle + displayable photo URLs, with loading/error states. */
export function useDigitalProfile() {
  const { service, needsSignIn, checking } = useDigitalService();
  const [bundle, setBundle] = useState<DigitalProfileBundle | null>(null);
  const [urls, setUrls] = useState<Partial<Record<ImageKind, string>>>({});
  const [modelUrl, setModelUrl] = useState<string | undefined>();
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!service) return;
    setState("loading");
    setError(null);
    try {
      const b = await service.getProfile();
      setBundle(b);
      const entries = await Promise.all(
        Object.values(b?.images ?? {}).map(async (img) => [img!.kind, await service.getImageUrl(img!).catch(() => undefined)] as const),
      );
      setUrls(Object.fromEntries(entries.filter(([, u]) => u)));
      setModelUrl(b?.model ? await service.getImageUrl(b.model).catch(() => undefined) : undefined);
      setState("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong loading your profile.");
      setState("error");
    }
  }, [service]);

  useEffect(() => {
    if (needsSignIn) setState("signed-out");
    else if (checking) setState("loading");
    else void reload();
  }, [reload, needsSignIn, checking]);

  return { service, bundle, urls, modelUrl, state, error, reload };
}
