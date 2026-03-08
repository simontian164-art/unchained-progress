import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard, ScanFace, Gem, Shirt, Dumbbell, Camera,
  Eye, Flame, MessageSquare, Trophy, Settings, Crown,
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
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/hub", icon: LayoutDashboard, end: true },
];

const modulesNav = [
  { title: "FaceMax", url: "/hub/facemax", icon: ScanFace },
  { title: "GroomMax", url: "/hub/grooming", icon: Gem },
  { title: "StyleMax", url: "/hub/style", icon: Shirt },
  { title: "BodyMax", url: "/hub/body", icon: Dumbbell },
  { title: "PhotoMax", url: "/hub/photo", icon: Camera },
  { title: "SocialMax", url: "/hub/presence", icon: Eye },
];

const toolsNav = [
  { title: "GlowUp Tracker", url: "/hub/glowup", icon: Flame },
  { title: "AI Coach", url: "/hub/coach", icon: MessageSquare },
  { title: "Leaderboard", url: "/hub/gamification", icon: Trophy },
];

const bottomNav = [
  { title: "Settings", url: "/hub/settings", icon: Settings },
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
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-display transition-colors hover:bg-muted/50",
                isActive(item.url, item.end) && "bg-muted text-foreground font-bold"
              )}
              activeClassName=""
            >
              <item.icon className={cn("h-4 w-4 shrink-0", isActive(item.url, item.end) ? "text-status-warning" : "text-muted-foreground")} />
              {!collapsed && <span>{item.title}</span>}
            </NavLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-background/80 backdrop-blur-xl">
      <SidebarContent>
        {/* Brand */}
        {!collapsed && (
          <div className="px-4 pt-5 pb-2">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-status-warning" />
              <span className="font-display font-bold text-foreground text-sm tracking-tight">GLOWMAX</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="flex justify-center pt-4 pb-2">
            <Crown className="h-5 w-5 text-status-warning" />
          </div>
        )}

        <SidebarGroup>
          <SidebarGroupContent>
            {renderItems(mainNav)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-display text-muted-foreground/60 tracking-widest px-3">
            {!collapsed ? "MODULES" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(modulesNav)}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[9px] font-display text-muted-foreground/60 tracking-widest px-3">
            {!collapsed ? "TOOLS" : ""}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            {renderItems(toolsNav)}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {renderItems(bottomNav)}
      </SidebarFooter>
    </Sidebar>
  );
}
