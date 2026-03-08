import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HubSidebar } from "@/components/HubSidebar";
import { BottomNav } from "@/components/BottomNav";

const HubLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop sidebar */}
        <div className="hidden md:block">
          <HubSidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop header */}
          <header className="hidden md:flex h-12 items-center border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20 px-2">
            <SidebarTrigger className="ml-1" />
          </header>

          <main className="flex-1 pb-20 md:pb-0">
            <Outlet />
          </main>
        </div>

        {/* Mobile bottom nav */}
        <BottomNav />
      </div>
    </SidebarProvider>
  );
};

export default HubLayout;
