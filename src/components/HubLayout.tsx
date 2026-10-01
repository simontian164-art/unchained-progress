import { useState } from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Info, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import ProfileSettingsModal from "@/components/ProfileSettingsModal";

const tabs = [
  { to: "/hub", label: "Today", end: true },
  { to: "/hub/plan", label: "Plan" },
  { to: "/hub/analysis", label: "Analysis" },
  { to: "/hub/shop", label: "Shop" },
  { to: "/hub/guides", label: "Guides" },
  { to: "/hub/progress", label: "Progress" },
  { to: "/hub/tools", label: "Tools" },
];

const HubLayout = () => {
  const [settings, setSettings] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link to="/" className="flex shrink-0 items-center gap-2 font-display font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
              <span className="h-2 w-2 rounded-full bg-gold" />
            </span>
            <span className="hidden sm:inline">GlowMax</span>
          </Link>
          <nav className="-mx-1 flex flex-1 justify-start gap-1 overflow-x-auto px-1 md:justify-end [scrollbar-width:none]">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.end}
                className={({ isActive }) => cn("shrink-0 rounded-full px-3 py-1.5 text-sm transition-colors",
                  isActive ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {t.label}
              </NavLink>
            ))}
          </nav>
          <button aria-label="Settings" onClick={() => setSettings(true)} className="shrink-0 rounded-full p-2 text-muted-foreground hover:text-foreground">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Member area has no accounts or backend; content is sample data. */}
      <div role="note" className="mx-auto flex max-w-5xl items-start gap-2 px-4 pt-4 text-xs text-gold/90">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>Preview — results are sample data, not an analysis of you. <Link to="/" className="underline underline-offset-2">Back to site</Link></p>
      </div>

      <main className="mx-auto max-w-5xl px-4 pb-16 pt-6">
        <Outlet />
      </main>

      <ProfileSettingsModal open={settings} onOpenChange={setSettings} />
    </div>
  );
};

export default HubLayout;
