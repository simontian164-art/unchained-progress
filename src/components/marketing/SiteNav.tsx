import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger, SheetClose, SheetDescription } from "@/components/ui/sheet";
import { Logo } from "./Logo";
import { FEATURES } from "@/config/site";
import { cn } from "@/lib/utils";

export const NAV_LINKS = [
  { label: "How it works", to: "/#how-it-works" },
  { label: "Example analysis", to: "/example" },
  { label: "Features", to: "/#what-we-analyze" },
  { label: "Pricing", to: "/pricing" },
  { label: "FAQ", to: "/#faq" },
];

const hasAppData = () => {
  try {
    return !!JSON.parse(localStorage.getItem("glowmax_app_v1") || "null")?.analyses?.length;
  } catch {
    return false;
  }
};

export const SiteNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [returning] = useState(hasAppData);
  const cta = returning ? { to: "/app", label: "Open app" } : { to: "/get-started", label: "Get started" };
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (to: string) => !to.includes("#") && location.pathname === to;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 transition-colors duration-300",
        scrolled ? "glass-bar border-b border-white/[0.07]" : "border-b border-transparent",
      )}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-foreground focus:px-3 focus:py-2 focus:text-background"
      >
        Skip to content
      </a>
      <nav aria-label="Main" className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={cn(
                  "rounded-full px-3 py-2 text-sm transition-colors",
                  isActive(l.to) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-2 lg:flex">
          {FEATURES.accounts && (
            <Link to="/checkout?mode=signin" className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground">
              Sign in
            </Link>
          )}
          <Link to={cta.to} className="btn-primary btn-sm">
            {cta.label}
          </Link>
        </div>

        <Sheet>
          <SheetTrigger
            className="inline-flex h-10 w-10 items-center justify-center rounded-full text-foreground hover:bg-white/5 lg:hidden"
            aria-label="Open menu"
            title="Menu"
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent side="right" className="w-[86vw] max-w-sm border-white/10 bg-background">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SheetDescription className="sr-only">Site navigation</SheetDescription>
            <div className="mt-8 flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <SheetClose asChild key={l.to}>
                  <Link to={l.to} className="rounded-xl px-3 py-3 text-lg text-foreground hover:bg-white/5">
                    {l.label}
                  </Link>
                </SheetClose>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6">
              <SheetClose asChild>
                <Link to={cta.to} className="btn-primary w-full">
                  {cta.label}
                </Link>
              </SheetClose>
              {FEATURES.accounts && (
                <SheetClose asChild>
                  <Link to="/checkout?mode=signin" className="btn-secondary w-full">
                    Sign in
                  </Link>
                </SheetClose>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};
