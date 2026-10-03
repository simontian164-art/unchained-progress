import { Navigate, NavLink, Outlet, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import { BookOpen, CalendarCheck, LineChart, ListChecks, ScanFace, Settings, ShoppingBag } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { cn } from "@/lib/utils";
import { useApp } from "./store";

const TABS = [
  { to: "/app", label: "Today", icon: CalendarCheck, end: true },
  { to: "/app/plan", label: "Plan", icon: ListChecks },
  { to: "/app/analysis", label: "Analysis", icon: ScanFace },
  { to: "/app/shop", label: "Shop", icon: ShoppingBag },
  { to: "/app/guides", label: "Guides", icon: BookOpen },
  { to: "/app/progress", label: "Progress", icon: LineChart },
];

/** Signed-in app shell. Sends people to setup until they have a first analysis. */
const AppLayout = () => {
  const { state, storageError } = useApp();
  const loc = useLocation();
  if (!state.analyses.length) return <Navigate to="/app/start" replace state={{ from: loc.pathname }} />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-white/[0.07] bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-1">
          <nav aria-label="App" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {TABS.map((t) => (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    end={t.end}
                    className={({ isActive }) =>
                      cn("rounded-full px-3 py-1.5 text-sm transition-colors", isActive ? "bg-white/[0.08] text-foreground" : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    {t.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <Link to="/app/settings" aria-label="Settings" title="Settings" className="ml-1 rounded-full p-2 text-muted-foreground hover:bg-white/5 hover:text-foreground">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>
          </div>
        </div>
      </header>

      {storageError && (
        <p role="alert" className="border-b border-red-500/30 bg-red-500/10 px-4 py-2 text-center text-sm text-red-200">
          {storageError}
        </p>
      )}

      <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 pb-28 pt-6 outline-none sm:px-6 sm:pt-10 md:pb-16">
        <Outlet />
      </main>

      {/* mobile tab bar */}
      <nav aria-label="App" className="fixed inset-x-0 bottom-0 z-40 border-t border-white/[0.08] bg-background/95 backdrop-blur-xl md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <ul className="grid grid-cols-6">
          {TABS.map((t) => (
            <li key={t.to}>
              <NavLink
                to={t.to}
                end={t.end}
                className={({ isActive }) => cn("flex flex-col items-center gap-1 py-2.5 text-[11px]", isActive ? "text-foreground" : "text-muted-foreground")}
              >
                <t.icon className="h-5 w-5" aria-hidden="true" />
                {t.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default AppLayout;
