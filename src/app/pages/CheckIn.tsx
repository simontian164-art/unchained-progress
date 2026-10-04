import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CalendarPlus, Check } from "lucide-react";
import { usePageMeta } from "@/hooks/usePageMeta";
import { useApp } from "../store";
import { PhotoInput } from "../components/PhotoInput";
import { checkInEvery } from "./Today";
import { reward } from "../feedback";
import { XP } from "../xp";
import { checkinGoogleUrl, downloadCheckinIcs } from "../reminder";

/**
 * The "create" action, reached from the centre of the tab bar: take a check-in photo.
 * When one isn't due yet it says so (comparing too often mostly shows lighting), but never blocks.
 */
const CheckIn = () => {
  usePageMeta("Check-in");
  const { state, latest, addCheckIn } = useApp();
  const nav = useNavigate();
  const [photo, setPhoto] = useState<string | undefined>();
  const [note, setNote] = useState("");
  const [early, setEarly] = useState(false);
  const [saved, setSaved] = useState<Date | null>(null);
  const [added, setAdded] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const every = checkInEvery(state.profile?.worry);
  const lastDate = state.checkIns[0]?.date ?? state.planStartedAt;
  const due = Math.max(0, every - (lastDate ? Math.floor((Date.now() - new Date(lastDate).getTime()) / 86400000) : every));

  const save = () => {
    if (!photo) return;
    reward(btn.current, XP.checkIn);
    addCheckIn({ id: `c-${Date.now()}`, date: new Date().toISOString(), photo, note: note.trim() || undefined });
    // Ask for the next reminder here, in context: the member has just done the thing it reminds them of.
    const next = new Date();
    next.setDate(next.getDate() + every);
    setSaved(next);
  };

  if (saved) {
    const when = saved.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="font-display text-3xl font-semibold text-foreground">Check-in saved</h1>
          <p className="mt-2 text-sm text-muted-foreground">Next one is due {when}. Same spot and light makes the comparison fair.</p>
        </header>
        <section aria-label="Next check-in" className="surface-card rounded-2xl p-5">
          <h2 className="font-display text-base font-semibold text-foreground">Put {when} in your calendar?</h2>
          <p className="mt-1 text-sm text-muted-foreground">One event at 9:00 with a reminder, so the next photo happens on time.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" className="btn-primary h-11 px-5 text-sm" onClick={() => { downloadCheckinIcs(saved); setAdded(true); }}>
              {added ? <Check className="h-4 w-4" aria-hidden="true" /> : <CalendarPlus className="h-4 w-4" aria-hidden="true" />} Apple / Outlook
            </button>
            <a className="btn-secondary h-11 px-5 text-sm" href={checkinGoogleUrl(saved)} target="_blank" rel="noopener noreferrer" onClick={() => setAdded(true)}>
              Google Calendar
            </a>
          </div>
        </section>
        <button type="button" onClick={() => nav("/app/progress#compare")} className="btn-secondary">
          See before and now
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold text-foreground">Check-in</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {due > 0 ? `Next one is due in ${due} day${due === 1 ? "" : "s"}. One photo every ${every} days shows real change.` : "A check-in is due. Same spot, light and distance as your first photo."}
        </p>
      </header>

      <section aria-label="New check-in" className="surface-card rounded-2xl p-5">
        <ul className="grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
          <li>• Same room, same window light, same time of day</li>
          <li>• Phone at eye level, arm's length</li>
          <li>• Relaxed, closed-mouth expression</li>
          <li>• No filters or beauty mode</li>
        </ul>
        {due > 0 && !early ? (
          <div className="mt-4 rounded-xl border border-white/10 p-4 text-sm leading-6 text-muted-foreground">
            <p>Comparing more often mostly shows changes in light and angle, which can be discouraging and misleading.</p>
            <button type="button" onClick={() => setEarly(true)} className="hit mt-2 text-foreground underline underline-offset-4">Take one anyway</button>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-[220px_1fr]">
            <PhotoInput label="Check-in photo" hint="Front, straight on." required value={photo} onChange={setPhoto} />
            <div className="flex flex-col">
              <label htmlFor="note" className="text-sm font-medium text-foreground">Note <span className="font-normal text-muted-foreground">(optional)</span></label>
              <textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="New haircut, skin calmer, started posture routine…" className="mt-2 flex-1 rounded-xl border border-white/[0.12] bg-white/[0.03] p-3 text-sm text-foreground placeholder:text-white/45 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40" />
              <button ref={btn} type="button" onClick={save} disabled={!photo} className="btn-primary mt-3 self-start disabled:opacity-50">Save check-in</button>
            </div>
          </div>
        )}
      </section>

      {(latest?.hairline || (state.hairlineSets?.length ?? 0) > 0) && (
        <Link to="/app/progress#hairline" className="surface-card press flex items-center justify-between rounded-2xl p-5 text-sm text-foreground hover:border-white/20">
          <span><span className="block font-medium">Hairline photos</span><span className="text-muted-foreground">Three fixed angles, tracked separately.</span></span>

        </Link>
      )}
    </div>
  );
};

export default CheckIn;
