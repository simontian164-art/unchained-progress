import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { SiteNav } from "./SiteNav";
import { SiteFooter } from "./SiteFooter";

/** Scrolls to top on route change, or to the #hash target when present. */
const ScrollManager = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = decodeURIComponent(hash.slice(1));
      // wait a frame so the target section has rendered
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    window.scrollTo({ top: 0 });
  }, [pathname, hash]);
  return null;
};

const MarketingLayout = () => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    <ScrollManager />
    <SiteNav />
    <main id="main" className="flex-1" tabIndex={-1}>
      <Outlet />
    </main>
    <SiteFooter />
  </div>
);

export default MarketingLayout;
