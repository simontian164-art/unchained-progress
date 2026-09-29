import { Link, Outlet } from "react-router-dom";
import { Info } from "lucide-react";
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

          {/* The member area currently runs without accounts or a backend and most
              analysis screens show hard-coded sample results. Keep this banner until
              real analysis and authentication are connected. */}
          <div role="note" className="flex items-start gap-2 border-b border-amber-500/20 bg-amber-500/[0.07] px-4 py-2.5 text-xs leading-5 text-amber-100/90">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <p>
              Preview build — results on these screens are sample data, not an analysis of you.{" "}
              <Link to="/" className="underline underline-offset-2">Back to site</Link>
            </p>
          </div>

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
