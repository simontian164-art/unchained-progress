import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, ScanFace, Dumbbell, Flame, Trophy,
} from "lucide-react";

const tabs = [
  { icon: LayoutDashboard, label: "Home", path: "/hub", end: true },
  { icon: ScanFace, label: "Face", path: "/hub/facemax" },
  { icon: Dumbbell, label: "Body", path: "/hub/body" },
  { icon: Flame, label: "Progress", path: "/hub/glowup" },
  { icon: Trophy, label: "Rank", path: "/hub/gamification" },
];

export function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-xl safe-area-bottom">
      <div className="flex items-center justify-around px-2 h-16">
        {tabs.map((tab) => {
          const active = isActive(tab.path, tab.end);
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-[56px]",
                active ? "text-foreground" : "text-muted-foreground"
              )}
            >
              <div className={cn(
                "h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200",
                active ? "bg-accent scale-110" : ""
              )}>
                <tab.icon className={cn("h-[18px] w-[18px]", active ? "text-foreground" : "text-muted-foreground")} />
              </div>
              <span className={cn("text-[10px] font-medium", active ? "text-foreground" : "text-muted-foreground/70")}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
