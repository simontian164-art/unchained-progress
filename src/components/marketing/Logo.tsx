import { Link } from "react-router-dom";
import { SITE } from "@/config/site";
import { cn } from "@/lib/utils";

export const LogoMark = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 64 64" aria-hidden="true" className={cn("h-7 w-7", className)}>
    <rect width="64" height="64" rx="14" fill="hsl(0 0% 100% / 0.06)" stroke="hsl(0 0% 100% / 0.12)" />
    <g fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round">
      <path d="M16 26v-6a4 4 0 0 1 4-4h6M38 16h6a4 4 0 0 1 4 4v6M48 38v6a4 4 0 0 1-4 4h-6M26 48h-6a4 4 0 0 1-4-4v-6" />
    </g>
    <circle cx="32" cy="32" r="6" fill="hsl(42 70% 63%)" />
  </svg>
);

export const Logo = ({ className }: { className?: string }) => (
  <Link to="/" className={cn("inline-flex items-center gap-2.5 text-foreground", className)} aria-label={`${SITE.name} home`}>
    <LogoMark />
    <span className="font-wide text-[16px] font-semibold uppercase tracking-[0.06em]">
      {SITE.name}
    </span>
  </Link>
);
