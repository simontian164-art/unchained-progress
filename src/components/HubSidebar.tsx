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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive(item.url, item.end)
                  ? "bg-accent text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              )}
              activeClassName=""
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive(item.url, item.end) ? "text-foreground" : "text-muted-foreground")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background">
      <SidebarContent>
        {/* Brand */}
        <div className={cn("pt-5 pb-3", collapsed ? "flex justify-center" : "px-4")}>
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-status-warning shrink-0" />
            {!collapsed && <span className="font-display font-bold text-foreground text-sm tracking-tight">GLOWMAX</span>}
          </div>
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            {renderItems(mainNav)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground/50 tracking-widest px-3 uppercase">
            {!collapsed ? "Modules" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(modulesNav)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] text-muted-foreground/50 tracking-widest px-3 uppercase">
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
