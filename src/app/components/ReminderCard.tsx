import { useState } from "react";
import { motion } from "framer-motion";
import { BellRing, CalendarPlus, Check, X } from "lucide-react";
import { downloadIcs, googleCalendarUrl } from "../reminder";
import { seen } from "../xp";

/** "Now" rounded down to the half hour: if you just did your routine at this time, that's the time to be nudged. */
const nowSlot = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${d.getMinutes() < 30 ? "00" : "30"}`;
};

/**
 * "Remind me daily". Asked ONCE, in context, right after a win (not on first open, when there's no
 * reason to say yes). The question names the reason: tomorrow's day number. If dismissed it never
 * comes back on Today; it stays available in Settings (`inline`).
 */
export const ReminderCard = ({ day, inline = false, context }: { day: number; inline?: boolean; context?: string }) => {
  const s = seen.get();
  const [hidden, setHidden] = useState(!inline && (!!s.reminder || !!s.reminderDismissed));
  const [time, setTime] = useState(String(s.reminderTime ?? (inline ? "08:00" : nowSlot())));
  const [done, setDone] = useState(!!s.reminder);
  if (hidden) return null;
  const mark = () => {
    seen.set("reminder", 1);
    seen.set("reminderTime", time);
    setDone(true);
  };
  return (
    <motion.section
      aria-labelledby="rem-h"
      initial={inline ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={inline ? "" : "surface-card relative rounded-2xl p-5"}
    >
      {!inline && (
        <button type="button" aria-label="Not now, don't ask again" onClick={() => { seen.set("reminderDismissed", 1); setHidden(true); }} className="absolute right-3 top-3 rounded-full p-1.5 text-muted-foreground hover:bg-white/5 hover:text-foreground">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
      <h2 id="rem-h" className="font-display text-base font-semibold text-foreground">Daily reminder
      </h2>
      <p className="mt-1 pr-6 text-sm leading-6 text-muted-foreground">
        {done ? "Added. Your calendar will nudge you each day. Change the time and add it again any time." : context ?? "A daily nudge is the easiest way to keep showing up. Pick a time and add it to your calendar."}
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="sr-only" htmlFor="rem-time">Reminder time</label>
        <input id="rem-time" type="time" value={time} onChange={(e) => setTime(e.target.value || "08:00")} className="h-11 rounded-full border border-white/[0.14] bg-white/[0.03] px-4 text-sm text-foreground [color-scheme:dark]" />
        <button type="button" className="btn-primary h-11 px-5 text-sm" onClick={() => { downloadIcs(time, day); mark(); }}>
          {done ? <Check className="h-4 w-4" aria-hidden="true" /> : <CalendarPlus className="h-4 w-4" aria-hidden="true" />} Apple / Outlook
        </button>
        <a className="btn-secondary h-11 px-5 text-sm" href={googleCalendarUrl(time, day)} target="_blank" rel="noopener noreferrer" onClick={mark}>
          Google Calendar
        </a>
      </div>
    </motion.section>
  );
};
