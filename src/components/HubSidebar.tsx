import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, ScanFace, Sparkles, Shirt, Dumbbell, Camera,
  Eye, Flame, Trophy, Crown,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/hub", icon: LayoutDashboard, end: true },
];

const modulesNav = [
  { title: "Face", url: "/hub/facemax", icon: ScanFace },
  { title: "Skin", url: "/hub/skin", icon: Sparkles },
  { title: "Style", url: "/hub/style", icon: Shirt },
  { title: "Body", url: "/hub/body", icon: Dumbbell },
  { title: "Photo", url: "/hub/photo", icon: Camera },
  { title: "Social", url: "/hub/presence", icon: Eye },
];

const trackingNav = [
  { title: "Progress", url: "/hub/glowup", icon: Flame },
  { title: "Leaderboard", url: "/hub/gamification", icon: Trophy },
];

export function HubSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string, end?: boolean) =>
    end ? location.pathname === path : location.pathname.startsWith(path);

  const renderItems = (items: { title: string; url: string; icon: React.ElementType; end?: boolean }[]) => (
    <SidebarMenu>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton asChild>
            <NavLink
              to={item.url}
              end={item.end}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200",
                isActive(item.url, item.end)
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/40"
              )}
              activeClassName=""
            >
              <item.icon className={cn(
                "h-4 w-4 shrink-0 transition-colors",
                isActive(item.url, item.end) ? "text-foreground" : "text-muted-foreground"
              )} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card/50">
      <SidebarContent>
        {/* Brand */}
        <div className={cn("pt-5 pb-4", collapsed ? "flex justify-center" : "px-4")}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-accent flex items-center justify-center">
              <Crown className="h-4 w-4 text-status-warning" />
            </div>
            {!collapsed && (
              <div>
                <span className="font-display font-bold text-foreground text-sm tracking-tight block leading-none">GLOWMAX</span>
                <span className="text-[10px] text-muted-foreground">Self-improvement</span>
              </div>
            )}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            {renderItems(mainNav)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground/40 tracking-widest px-3 uppercase font-medium">
            {!collapsed ? "Modules" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(modulesNav)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground/40 tracking-widest px-3 uppercase font-medium">
            {!collapsed ? "Track" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(trackingNav)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
