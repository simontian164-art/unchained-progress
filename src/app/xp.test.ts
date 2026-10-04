import { describe, expect, it } from "vitest";
import { levelOf, phaseOf, streakInfo, weekStats } from "./xp";
import { todayKey } from "./store";
import type { AppState } from "./types";

const ago = (n: number) => { const d = new Date(); d.setDate(d.getDate() - n); return todayKey(d); };
const base = (log: Record<string, string[]>): AppState => ({ version: 2, photos: [], analyses: [], tasks: [], routineLog: log, checkIns: [] });

describe("streak (forgiving)", () => {
  it("counts consecutive days ending today", () => {
    expect(streakInfo(base({ [ago(0)]: ["a"], [ago(1)]: ["a"], [ago(2)]: ["a"] })).streak).toBe(3);
  });
  it("keeps yesterday's streak alive until today is done", () => {
    const s = streakInfo(base({ [ago(1)]: ["a"], [ago(2)]: ["a"] }));
    expect(s.streak).toBe(2);
    expect(s.returning).toBe(false);
  });
  it("after a gap: no streak, welcome-back flag, never negative", () => {
    const s = streakInfo(base({ [ago(4)]: ["a"] }));
    expect(s.streak).toBe(0);
    expect(s.returning).toBe(true);
  });
  it("brand-new user is not 'returning'", () => {
    expect(streakInfo(base({})).returning).toBe(false);
  });
  it("tasks completed today count as activity", () => {
    const st = base({});
    st.tasks = [{ id: "t", title: "T", module: "hair", horizon: "today", done: true, doneOn: ago(0) } as AppState["tasks"][number]];
    expect(streakInfo(st).todayDone).toBe(true);
  });
});

describe("phases & levels", () => {
  it("maps days to phases, clamping past 90", () => {
    expect(phaseOf(1).n).toBe("I");
    expect(phaseOf(31).n).toBe("II");
    expect(phaseOf(90).n).toBe("III");
    expect(phaseOf(140).n).toBe("III");
  });
  it("front-loaded curve: fast early levels, longer later, continues past the table", () => {
    expect(levelOf(0).level).toBe(1);
    expect(levelOf(119).level).toBe(1);
    expect(levelOf(120).level).toBe(2);
    expect(levelOf(350).level).toBe(3);
    expect(levelOf(4900).level).toBe(10);
    expect(levelOf(5900).level).toBe(11);
    const l = levelOf(500);
    expect(l.into + l.toNext).toBe(l.size);
    expect(l.progress).toBeCloseTo(150 / 350);
  });
  it("weekStats counts only the last 7 days", () => {
    const w = weekStats(base({ [ago(0)]: ["a", "b"], [ago(9)]: ["a"] }));
    expect(w.days).toBe(1);
    expect(w.xp).toBe(10);
  });
});
