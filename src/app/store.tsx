import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Analysis, AppState, CheckIn, Feedback, HairlineSet, Profile, StoredPhoto, Task } from "./types";

/**
 * Member-app state, persisted to this browser's localStorage.
 * TODO(backend): when accounts exist, sync this object to the user's row in the database.
 */
const KEY = "glowmax_app_v1"; // key kept; the object carries its own version

const EMPTY: AppState = { version: 2, photos: [], analyses: [], tasks: [], routineLog: {}, checkIns: [] };

const load = (): AppState => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    if (parsed?.version === 2) return { ...EMPTY, ...parsed };
    if (parsed?.version === 1) {
      // v1 → v2: the questionnaire and analysis changed shape, so keep only progress photos
      // and the front photo; the user re-does setup (answers are quicker than photos).
      return {
        ...EMPTY,
        checkIns: parsed.checkIns ?? [],
        photos: (parsed.photos ?? []).filter((p: { slot: string }) => p.slot === "front"),
        routineLog: parsed.routineLog ?? {},
      };
    }
    return EMPTY;
  } catch {
    return EMPTY;
  }
};

export const todayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

interface Ctx {
  state: AppState;
  latest?: Analysis;
  storageError: string | null;
  saveProfile: (p: Profile) => void;
  savePhotos: (photos: StoredPhoto[]) => void;
  addAnalysis: (a: Analysis, tasks: Task[]) => void;
  toggleTask: (id: string) => void;
  toggleRoutine: (stepId: string, day?: string) => void;
  addCheckIn: (c: CheckIn) => void;
  removeCheckIn: (id: string) => void;
  /** Set or clear (null) feedback for a recommendation key ("recId" or "recId:ref"). */
  setFeedback: (key: string, f: Feedback | null) => void;
  addHairlineSet: (h: HairlineSet) => void;
  removeHairlineSet: (id: string) => void;
  resetAll: () => void;
}

const AppCtx = createContext<Ctx | null>(null);

export const AppStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AppState>(load);
  const [storageError, setStorageError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
      setStorageError(null);
    } catch {
      setStorageError("Your browser's storage is full, so the latest change couldn't be saved. Remove an old check-in photo and try again.");
    }
  }, [state]);

  const saveProfile = useCallback((profile: Profile) => setState((s) => ({ ...s, profile })), []);
  const savePhotos = useCallback((photos: StoredPhoto[]) => setState((s) => ({ ...s, photos })), []);

  const addAnalysis = useCallback(
    (a: Analysis, tasks: Task[]) =>
      setState((s) => {
        // Keep completion for tasks that survive a re-analysis.
        const doneIds = new Set(s.tasks.filter((t) => t.done).map((t) => t.id));
        // keep done state for recommendations that survive a re-analysis
        return {
          ...s,
          analyses: [a, ...s.analyses].slice(0, 12),
          tasks: tasks.map((t) => ({ ...t, done: doneIds.has(t.id) })),
          planStartedAt: s.planStartedAt ?? a.createdAt,
        };
      }),
    [],
  );

  const toggleTask = useCallback(
    (id: string) =>
      setState((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === id ? { ...t, done: !t.done, doneOn: !t.done ? todayKey() : undefined } : t)) })),
    [],
  );

  const toggleRoutine = useCallback(
    (stepId: string, day = todayKey()) =>
      setState((s) => {
        const cur = new Set(s.routineLog[day] ?? []);
        if (cur.has(stepId)) cur.delete(stepId);
        else cur.add(stepId);
        return { ...s, routineLog: { ...s.routineLog, [day]: [...cur] } };
      }),
    [],
  );

  const addCheckIn = useCallback((c: CheckIn) => setState((s) => ({ ...s, checkIns: [c, ...s.checkIns].slice(0, 24) })), []);
  const removeCheckIn = useCallback((id: string) => setState((s) => ({ ...s, checkIns: s.checkIns.filter((c) => c.id !== id) })), []);

  const setFeedback = useCallback(
    (key: string, f: Feedback | null) =>
      setState((s) => {
        const next = { ...(s.feedback ?? {}) };
        if (f) next[key] = f;
        else delete next[key];
        return { ...s, feedback: next };
      }),
    [],
  );
  // Hairline sets: capped at 6 (baseline + 5 follow-ups) to stay within browser storage.
  const addHairlineSet = useCallback((h: HairlineSet) => setState((s) => ({ ...s, hairlineSets: [...(s.hairlineSets ?? []), h].slice(-6) })), []);
  const removeHairlineSet = useCallback((id: string) => setState((s) => ({ ...s, hairlineSets: (s.hairlineSets ?? []).filter((h) => h.id !== id) })), []);

  const resetAll = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setState(EMPTY);
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      state,
      latest: state.analyses[0],
      storageError,
      saveProfile,
      savePhotos,
      addAnalysis,
      toggleTask,
      toggleRoutine,
      addCheckIn,
      removeCheckIn,
      setFeedback,
      addHairlineSet,
      removeHairlineSet,
      resetAll,
    }),
    [state, storageError, saveProfile, savePhotos, addAnalysis, toggleTask, toggleRoutine, addCheckIn, removeCheckIn, setFeedback, addHairlineSet, removeHairlineSet, resetAll],
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used inside AppStateProvider");
  return ctx;
};
