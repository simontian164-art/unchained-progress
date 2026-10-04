import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useApp, todayKey } from "./store";
import { XpHud } from "./visuals/ring/XpHud";
import { DayComplete, LevelUp, Milestone } from "./visuals/ring/Moments";
import { dayNumber, levelName, levelOf, missionOf, pad2, phaseOf, PHASES, PROTOCOL_AT, seen, streakInfo, totalXp } from "./xp";
import { shareCard } from "./share";

/**
 * One place decides which reward plays, so moments never stack or compete.
 * Hierarchy: L1 micro (in the component) · L2 day complete · L3 milestone (streak 7/30/60/90,
 * new phase) · L4 level up. Queue order is highest first; each plays once (seen flags).
 * Calmer mode (members who said appearance worries take up a lot of their day): no XP HUD,
 * no fanfare. The ring on Today still shows progress.
 */
type Moment =
  | { k: "level"; level: number }
  | { k: "day" }
  | { k: "streak"; n: number }
  | { k: "phase"; i: number };

const STREAK_MARKS = [7, 30, 60, 90];

export const RewardDirector = () => {
  const { state, latest } = useApp();
  const nav = useNavigate();
  const [queue, setQueue] = useState<Moment[]>([]);
  const light = !latest || !!latest.light;
  const xp = latest ? totalXp(state, latest) : 0;
  const level = levelOf(xp).level;
  const day = dayNumber(state.planStartedAt);
  const mission = latest ? missionOf(state, latest) : { done: 0, total: 0, complete: false };
  const st = streakInfo(state);
  const push = (m: Moment) => setQueue((q) => (q.some((x) => x.k === m.k) ? q : [...q, m].sort((a, b) => rank(b) - rank(a))));

  // First visit on this browser: record where they already are, so existing progress isn't celebrated.
  useEffect(() => {
    const s = seen.get();
    if (s.level === undefined) seen.set("level", level);
    if (s.phase === undefined) seen.set("phase", PHASES.indexOf(phaseOf(day)));
    if (s.streak === undefined) seen.set("streak", st.streak);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Level: the HUD reports it after the XP has visibly landed, so the bar fills first, then the moment.
  const onLevel = useCallback(
    (lv: number) => {
      if (light || lv <= Number(seen.get().level ?? lv)) return;
      seen.set("level", lv);
      push({ k: "level", level: lv });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [light],
  );

  useEffect(() => {
    if (light) return;
    const s = seen.get();
    if (mission.complete && s.missionDay !== todayKey()) {
      seen.set("missionDay", todayKey());
      // let the last tick's XP land first
      setTimeout(() => push({ k: "day" }), 650);
    }
    const mark = STREAK_MARKS.filter((m) => st.streak >= m && Number(s.streak ?? 0) < m).pop();
    if (mark) setTimeout(() => push({ k: "streak", n: mark }), 700);
    if (st.streak !== Number(s.streak)) seen.set("streak", st.streak);
    const pi = PHASES.indexOf(phaseOf(day));
    if (pi > Number(s.phase ?? pi)) {
      seen.set("phase", pi);
      push({ k: "phase", i: pi });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mission.complete, st.streak, day, light]);

  const next = () => setQueue((q) => q.slice(1));
  const cur = queue[0];
  const proto = cur?.k === "level" ? PROTOCOL_AT[cur.level] : undefined;

  return (
    <>
      {!light && <XpHud xp={xp} onLevel={onLevel} />}
      {createPortal(
        <AnimatePresence>
          {cur?.k === "level" && (
            <LevelUp
              key={`l${cur.level}`}
              level={cur.level}
              name={levelName(cur.level)}
              protocol={proto?.title}
              onView={proto ? () => { next(); nav(proto.to); } : undefined}
              onShare={() => shareCard({ eyebrow: "Level up", big: pad2(cur.level), title: levelName(cur.level), sub: `Day ${pad2(day)} of 90`, ring: 1 })}
              onDone={next}
            />
          )}
          {cur?.k === "day" && (
            <DayComplete
              key="d"
              done={mission.done}
              total={mission.total}
              day={day}
              streak={st.streak}
              last7={st.last7}
              onShare={() => shareCard({ eyebrow: "Today complete", big: pad2(day), title: `Day ${pad2(day)} of 90`, sub: st.streak > 1 ? `${st.streak} day streak` : undefined, ring: Math.min(1, day / 90) })}
              onDone={next}
            />
          )}
          {cur?.k === "streak" && (
            <Milestone
              key={`s${cur.n}`}
              eyebrow="Streak"
              big={pad2(cur.n)}
              title={`${cur.n} days in a row`}
              sub={cur.n >= 30 ? "This is who you are now" : "Discipline is showing"}
              onShare={() => shareCard({ eyebrow: "Streak", big: pad2(cur.n), title: `${cur.n} days in a row`, sub: `Day ${pad2(day)} of 90`, ring: Math.min(1, cur.n / 90) })}
              onDone={next}
            />
          )}
          {cur?.k === "phase" && (
            <Milestone
              key={`p${cur.i}`}
              eyebrow={`Phase ${PHASES[cur.i].n}`}
              big={PHASES[cur.i].name}
              title={`Day ${pad2(PHASES[cur.i].from)}`}
              sub="New focus unlocked"
              onShare={() => shareCard({ eyebrow: `Phase ${PHASES[cur.i].n}`, big: PHASES[cur.i].n, title: PHASES[cur.i].name, sub: `Day ${pad2(day)} of 90`, ring: day / 90 })}
              onDone={next}
            />
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
};

const rank = (m: Moment) => (m.k === "level" ? 4 : m.k === "phase" || m.k === "streak" ? 3 : 2);
