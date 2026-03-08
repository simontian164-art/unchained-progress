import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { HubSidebar } from "@/components/HubSidebar";

const HubLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <HubSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-12 flex items-center border-b border-border bg-background/60 backdrop-blur-xl sticky top-0 z-20 px-2">
            <SidebarTrigger className="ml-1" />
          </header>
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default HubLayout;
