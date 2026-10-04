import { useEffect, useRef, useState } from "react";
import { Navigate, NavLink, useLocation, useOutlet } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import { Camera, ChevronLeft, CalendarCheck, LineChart, ListChecks, UserRound } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { cn } from "@/lib/utils";
import { useApp } from "./store";
import { RewardDirector } from "./RewardDirector";

/**
 * Navigation follows the conventions people already know from the apps they use daily:
 * five tabs max · Home far left · the "create" action (check-in photo) in the middle ·
 * profile far right · settings inside the profile, not in the tab bar.
 */
const TABS = [
  { to: "/app", label: "Today", icon: CalendarCheck, end: true },
  { to: "/app/plan", label: "Plan", icon: ListChecks },
  { to: "/app/checkin", label: "Check-in", icon: Camera, create: true },
  { to: "/app/progress", label: "Progress", icon: LineChart },
  { to: "/app/you", label: "You", icon: UserRound },
];
/** Screens that live inside the You tab: the tab stays lit and a back link returns to You. */
const UNDER_YOU = ["/app/analysis", "/app/barber", "/app/shop", "/app/guides", "/app/briefing", "/app/settings"];
const underYou = (path: string) => UNDER_YOU.some((p) => path.startsWith(p));

/** Signed-in app shell. Sends people to setup until they have a first analysis. */
const AppLayout = () => {
  const { state, storageError } = useApp();
  const loc = useLocation();
  const outlet = useOutlet();
  const reduce = useReducedMotion();
  // Page transition: a hairline ring expands from where you tapped, while the new page is revealed
  // top-down behind it. ~350ms, never blocks input.
  const origin = useRef<{ x: number; y: number } | null>(null);
  const [ring, setRing] = useState<{ x: number; y: number; k: number } | null>(null);
  const prev = useRef(loc.pathname);
  useEffect(() => {
    if (prev.current === loc.pathname) return;
    prev.current = loc.pathname;
    window.scrollTo({ top: 0 });
    if (!reduce && origin.current) setRing({ ...origin.current, k: Date.now() });
    origin.current = null;
  }, [loc.pathname, reduce]);
  const mark = (e: React.PointerEvent) => (origin.current = { x: e.clientX, y: e.clientY });
  if (!state.analyses.length) return <Navigate to="/app/start" replace state={{ from: loc.pathname }} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background">
        Skip to content
      </a>
      <header className="glass-bar sticky top-0 z-40 border-b border-white/[0.07]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-1">
          <div className="mr-2 lg:mr-4"><RewardDirector /></div>
          <nav aria-label="App" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {TABS.filter((t) => !t.create && t.to !== "/app/you").map((t) => (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    end={t.end}
                    onPointerDown={mark}
                    className={({ isActive }) =>
                      cn("relative rounded-full px-3 py-1.5 text-sm transition-colors", isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && <motion.span layoutId="nav-pill" className="absolute inset-0 -z-10 rounded-full bg-white/[0.08]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                        {t.label}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <NavLink to="/app/checkin" onPointerDown={mark} className="press ml-2 hidden h-9 items-center gap-1.5 rounded-full bg-[#ede6d6] px-4 text-sm font-medium text-black md:inline-flex">
            <Camera className="h-4 w-4" aria-hidden="true" /> Check-in
          </NavLink>
          <NavLink to="/app/you" onPointerDown={mark} aria-label="You: profile and settings" title="You" className={({ isActive }) => cn("ml-2 hidden h-9 w-9 items-center justify-center rounded-full border text-sm md:inline-flex", isActive || underYou(loc.pathname) ? "border-[#ede6d6]/60 text-foreground" : "border-white/15 text-muted-foreground hover:text-foreground")}>
            {state.profile?.name?.trim()?.[0]?.toUpperCase() ?? <UserRound className="h-4 w-4" aria-hidden="true" />}
          </NavLink>
          </div>
        </div>
      </header>

      {storageError && (
        <p role="alert" className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-200">
          {storageError}
        </p>
      )}

      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-28 pt-6 outline-none sm:px-6 sm:pt-10 md:pb-16">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={loc.pathname}
            initial={reduce ? { opacity: 0 } : { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 6 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, clipPath: "inset(0 0 0% 0)", y: 0, transitionEnd: { clipPath: "none" } }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {underYou(loc.pathname) && (
              <Link to="/app/you" className="-ml-1 mb-4 inline-flex items-center gap-0.5 rounded-full py-1 pr-2 text-sm text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" /> You
              </Link>
            )}
            {outlet}
          </motion.div>
        </AnimatePresence>
      </main>
      <AnimatePresence>
        {ring && (
          <motion.svg
            key={ring.k}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 h-full w-full"
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onAnimationComplete={() => setRing(null)}
          >
            <motion.circle cx={ring.x} cy={ring.y} fill="none" stroke="#ede6d6" strokeWidth={1} initial={{ r: 8 }} animate={{ r: Math.hypot(window.innerWidth, window.innerHeight) }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} />
            <motion.circle cx={ring.x} cy={ring.y} fill="none" stroke="#ede6d6" strokeWidth={0.5} strokeDasharray="2 6" initial={{ r: 4 }} animate={{ r: Math.hypot(window.innerWidth, window.innerHeight) * 0.6 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: 0.04 }} />
          </motion.svg>
        )}
      </AnimatePresence>

      {/* mobile tab bar */}
      <nav aria-label="App" className="glass-bar fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.1] md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <ul className="grid grid-cols-5 items-end">
          {TABS.map((t) => (
            <li key={t.to}>
              {t.create ? (
                <NavLink to={t.to} onPointerDown={mark} aria-label="Check-in: take a progress photo" className="group flex flex-col items-center gap-1 pb-2 pt-1 text-[11px]">
                  {({ isActive }) => (
                    <>
                      <span className={cn("press -mt-3 flex h-11 w-11 items-center justify-center rounded-full shadow-[0_8px_24px_-6px_rgba(237,230,214,0.45)] transition-colors", isActive ? "bg-white text-black" : "bg-[#ede6d6] text-black")}>
                        <t.icon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className={isActive ? "text-foreground" : "text-muted-foreground"}>{t.label}</span>
                    </>
                  )}
                </NavLink>
              ) : (
                <NavLink
                  to={t.to}
                  end={t.end}
                  onPointerDown={mark}
                  className={({ isActive }) => cn("relative flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors", isActive || (t.to === "/app/you" && underYou(loc.pathname)) ? "text-foreground" : "text-muted-foreground")}
                >
                  {({ isActive }) => (
                    <>
                      {(isActive || (t.to === "/app/you" && underYou(loc.pathname))) && <motion.span layoutId="tab-dot" className="absolute top-0 h-px w-8 bg-[#ede6d6]" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                      <t.icon className="h-5 w-5" aria-hidden="true" />
                      {t.label}
                    </>
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AppLayout;
