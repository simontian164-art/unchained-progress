import { Link, Outlet } from "react-router-dom";
import { Lock, Info } from "lucide-react";
import { Logo } from "@/components/marketing/Logo";
import { isDemoCheckout } from "@/lib/checkout";
import { SITE } from "@/config/site";

/** Distraction-free layout for checkout: logo, secure label, legal links. No main nav. */
const CheckoutLayout = () => (
  <div className="flex min-h-screen flex-col bg-background text-foreground">
    {isDemoCheckout && (
      <div role="note" className="border-b border-amber-500/25 bg-amber-500/[0.08] px-4 py-2.5 text-center text-xs leading-5 text-amber-100/90">
        <Info className="mr-1.5 inline h-3.5 w-3.5 -translate-y-px" aria-hidden="true" />
        Demo checkout: payments and accounts aren't connected yet. No account is created and no card is charged.
      </div>
    )}
    <header className="border-b border-white/[0.07]">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <p className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Secure checkout
        </p>
      </div>
    </header>
    <main id="main" className="flex-1">
      <Outlet />
    </main>
    <footer className="border-t border-white/[0.07]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          Questions? <a href={`mailto:${SITE.supportEmail}`} className="text-foreground underline-offset-4 hover:underline">{SITE.supportEmail}</a>
        </p>
        <nav aria-label="Legal" className="flex gap-4">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/refunds" className="hover:text-foreground">Refunds</Link>
        </nav>
      </div>
    </footer>
  </div>
);

export default CheckoutLayout;
