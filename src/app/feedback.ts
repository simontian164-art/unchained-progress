/**
 * Haptics + sound. Both optional and quiet. Sound is ON by default but uses the "ambient" audio
 * session where supported, so the phone's silent switch mutes it; it can be turned off in Settings.
 * Sounds are synthesised on the fly with the Web Audio API (original, tiny, no audio files):
 * short clicks and tonal resolves, never music. Haptics use navigator.vibrate (Android Chrome;
 * iOS Safari ignores it).
 */
const KEY = "glowmax_fx_v1";
type Prefs = { sound: boolean; haptics: boolean };
export const fxPrefs = {
  get(): Prefs {
    try {
      return { sound: true, haptics: true, ...JSON.parse(localStorage.getItem(KEY) || "{}") };
    } catch {
      return { sound: true, haptics: true };
    }
  },
  set(p: Partial<Prefs>) {
    try {
      localStorage.setItem(KEY, JSON.stringify({ ...fxPrefs.get(), ...p }));
    } catch {
      /* ignore */
    }
  },
};

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export type Fx = "tick" | "xp" | "day" | "level" | "unlock" | "ready";

const HAPTIC: Record<Fx, number | number[]> = { tick: 8, xp: 0, day: 18, level: [12, 60, 12, 60, 28], unlock: [10, 40, 16], ready: 10 };

let ctx: AudioContext | null = null;
const tone = (freq: number, at: number, dur: number, gain = 0.04, type: OscillatorType = "sine") => {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + at);
  g.gain.setValueAtTime(0, ctx.currentTime + at);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + at + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + at + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + at);
  o.stop(ctx.currentTime + at + dur + 0.02);
};

const SOUND: Record<Fx, () => void> = {
  tick: () => tone(2200, 0, 0.03, 0.03, "triangle"),
  xp: () => [0, 0.05, 0.1].forEach((t, i) => tone(1400 + i * 220, t, 0.04, 0.02, "triangle")),
  day: () => { tone(660, 0, 0.12, 0.035); tone(990, 0.09, 0.22, 0.03); },
  level: () => { tone(110, 0, 0.5, 0.05, "sawtooth"); tone(220, 0.15, 0.45, 0.025); tone(1320, 0.5, 0.35, 0.03); tone(1760, 0.56, 0.4, 0.02); },
  unlock: () => { tone(1800, 0, 0.025, 0.03, "square"); tone(1200, 0.06, 0.03, 0.025, "square"); tone(880, 0.14, 0.25, 0.03); },
  ready: () => { tone(523, 0, 0.18, 0.03); tone(784, 0.08, 0.3, 0.025); },
};

/** Create/resume the audio context. Must run inside a user gesture (every caller is a tap). */
function ensureCtx() {
  if (!ctx) {
    // Respect the iPhone silent switch and never interrupt the user's music (Safari 16.4+).
    const nav = navigator as Navigator & { audioSession?: { type: string } };
    if (nav.audioSession) nav.audioSession.type = "ambient";
    ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (ctx.state === "suspended") void ctx.resume();
}

export function fx(kind: Fx) {
  const p = fxPrefs.get();
  try {
    if (p.haptics && !reduced() && "vibrate" in navigator && HAPTIC[kind]) navigator.vibrate(HAPTIC[kind]);
  } catch {
    /* ignore */
  }
  if (!p.sound) return;
  try {
    ensureCtx();
    SOUND[kind]();
  } catch {
    /* no audio */
  }
}

/** XP "energy transfer": a completed action announces where it happened and how much it earned. */
export type XpEvent = { amount: number; from?: { x: number; y: number } };
const listeners = new Set<(e: XpEvent) => void>();
export const xpBus = {
  emit(e: XpEvent) {
    listeners.forEach((l) => l(e));
  },
  on(l: (e: XpEvent) => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
export const centerOf = (el: Element | null) => {
  if (!el) return undefined;
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
};

/** L1 micro reward: a tick (haptic/sound if enabled) and XP sparks from the element that was completed. */
/**
 * Combo: completions in quick succession (within 6 s) climb a major scale, one note per tick, and the
 * haptic firms up slightly. Ticking off a routine feels like it's building to something. Resets
 * quietly after a pause. Purely sensory: XP is never multiplied, so nothing is misrepresented.
 */
const SCALE = [0, 2, 4, 5, 7, 9, 11, 12];
let combo = 0;
let lastTick = 0;
export const comboStep = () => combo;

export const reward = (el: Element | null, amount: number) => {
  const now = Date.now();
  combo = now - lastTick < 6000 ? Math.min(combo + 1, SCALE.length - 1) : 0;
  lastTick = now;
  const p = fxPrefs.get();
  try {
    if (p.haptics && !reduced() && "vibrate" in navigator) navigator.vibrate(8 + combo * 2);
  } catch {
    /* ignore */
  }
  if (p.sound) {
    try {
      ensureCtx();
      const f = 880 * Math.pow(2, SCALE[combo] / 12);
      tone(f, 0, 0.09, 0.03, "sine");
      tone(f * 2, 0.012, 0.05, 0.008, "triangle");
    } catch {
      /* no audio */
    }
  }
  xpBus.emit({ amount, from: centerOf(el) });
};
