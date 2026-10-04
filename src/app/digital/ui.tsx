import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

/** Champagne gold: accents only (corner marks, the active tab, one status dot). Never fills or text blocks. */
export const CHAMPAGNE = "#cdbb93";

/**
 * The photo frame: precision corner marks, like a viewfinder or a watch's chapter ring, and nothing
 * else. The image is the hero, so the frame stays out of its way.
 */
export const PortraitFrame = ({ children, className, ratio = "3/4", footer, style }: { children: ReactNode; className?: string; ratio?: string; footer?: ReactNode; style?: React.CSSProperties }) => (
  <div className={cn("relative overflow-hidden rounded-[22px] bg-[#0b0b0b]", className)} style={{ aspectRatio: ratio, ...style }}>
    {children}
    {(["left-3 top-3 border-l border-t", "right-3 top-3 border-r border-t", "bottom-3 left-3 border-b border-l", "bottom-3 right-3 border-b border-r"] as const).map((c) => (
      <span key={c} aria-hidden="true" className={cn("pointer-events-none absolute h-5 w-5", c)} style={{ borderColor: CHAMPAGNE }} />
    ))}
    {footer && (
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-5 pt-16">{footer}</div>
    )}
  </div>
);

/** Neutral guide drawn inside an empty frame: where to stand / where the head goes. */
export const PoseGuide = ({ area }: { area: "head" | "body" }) => (
  <svg aria-hidden="true" viewBox={area === "head" ? "0 0 300 400" : "0 0 300 533"} className="absolute inset-0 h-full w-full" fill="none" stroke="rgba(237,230,214,0.28)" strokeWidth="1.5" strokeDasharray="5 6">
    {area === "head" ? (
      <>
        <ellipse cx="150" cy="165" rx="72" ry="92" />
        <path d="M40 400 C 50 300, 100 280, 150 280 C 200 280, 250 300, 260 400" />
      </>
    ) : (
      <>
        <circle cx="150" cy="70" r="34" />
        <path d="M150 104 V 300 M150 300 L 112 500 M150 300 L 188 500 M150 140 L 96 270 M150 140 L 204 270" />
      </>
    )}
  </svg>
);

/** Full-screen frame for Digital You flows (scan, digital model): title bar, close, thin progress line. */
export const FlowShell = ({ children, onClose, progress = 0, title = "Digital You" }: { children: ReactNode; onClose: () => void; progress?: number; title?: string }) => (
  <div className="min-h-screen bg-background text-foreground">
    <header className="glass-bar sticky top-0 z-30 border-b border-white/[0.07]">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 sm:px-6">
        <span className="font-wide text-sm font-semibold uppercase tracking-[0.06em]">{title}</span>
        <button type="button" onClick={onClose} aria-label="Close" className="hit rounded-full p-2 text-muted-foreground hover:text-foreground"><X className="h-5 w-5" aria-hidden="true" /></button>
      </div>
      <div className="h-px bg-white/[0.06]"><div className="h-px bg-[#cdbb93] transition-[width] duration-300" style={{ width: `${progress * 100}%` }} /></div>
    </header>
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-8 sm:px-6 sm:pt-12">{children}</main>
  </div>
);

/**
 * The "building" treatment over the source photo: one hairline of champagne light sweeping slowly
 * down and back, with a soft trail. No numbers, no fake progress. With Reduce Motion it doesn't move.
 */
export const ScanSweep = () => {
  const reduce = useReducedMotion();
  if (reduce) return null;
  // The element is 22% of the frame tall with the line at its centre: -50% puts the line on the top
  // edge, 404% on the bottom edge.
  return (
    <motion.div
      aria-hidden="true"
      data-testid="scan-sweep"
      className="pointer-events-none absolute inset-x-0 top-0 h-[22%]"
      initial={{ y: "-50%" }}
      animate={{ y: ["-50%", "404%"] }}
      transition={{ duration: 2.8, ease: [0.45, 0, 0.55, 1], repeat: Infinity, repeatType: "reverse" }}
    >
      <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent, ${CHAMPAGNE}1f 50%, transparent)` }} />
      <div className="absolute inset-x-0 top-1/2 h-px" style={{ background: `linear-gradient(to right, transparent, ${CHAMPAGNE} 15%, ${CHAMPAGNE} 85%, transparent)`, boxShadow: `0 0 12px ${CHAMPAGNE}66` }} />
    </motion.div>
  );
};
