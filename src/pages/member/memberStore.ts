import { useEffect, useState } from "react";

// Tiny shared in-memory store so ticks on Today show on Plan and Progress.
// Resets on reload (frontend-only preview).
const done = new Set<string>();
const listeners = new Set<() => void>();

export function toggleDone(id: string) {
  done.has(id) ? done.delete(id) : done.add(id);
  listeners.forEach((l) => l());
}

export function useDone() {
  const [, force] = useState(0);
  useEffect(() => {
    const l = () => force((n) => n + 1);
    listeners.add(l);
    return () => void listeners.delete(l);
  }, []);
  return { isDone: (id: string) => done.has(id), count: (ids: string[]) => ids.filter((i) => done.has(i)).length };
}
