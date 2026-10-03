import { useRef, useState } from "react";

/**
 * Before | Now. Both photos share one frame (same size, crop and orientation). The handle can be
 * dragged, tapped anywhere, or moved with arrow keys. No filters, no exaggeration.
 */
export const CompareSlider = ({ before, after, beforeLabel = "Before", afterLabel = "Now", alt, className }: { before: string; after: string; beforeLabel?: string; afterLabel?: string; alt: string; className?: string }) => {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const fromEvent = (clientX: number) => {
    const r = ref.current!.getBoundingClientRect();
    setPos(Math.max(0, Math.min(100, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div className={className}>
      <div
        ref={ref}
        className="relative aspect-[3/4] w-full touch-none select-none overflow-hidden rounded-2xl border border-white/10 bg-black"
        onPointerDown={(e) => { dragging.current = true; (e.target as Element).setPointerCapture?.(e.pointerId); fromEvent(e.clientX); }}
        onPointerMove={(e) => dragging.current && fromEvent(e.clientX)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
      >
        <img src={after} alt={`${alt}: ${afterLabel}`} className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
          <img src={before} alt={`${alt}: ${beforeLabel}`} className="h-full w-full object-cover" draggable={false} />
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90" style={{ left: `calc(${pos}% - 1px)` }} aria-hidden="true">
          <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[11px] font-semibold text-black shadow-lg">‹›</span>
        </div>
        <span className="pointer-events-none absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">{beforeLabel}</span>
        <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] text-white">{afterLabel}</span>
      </div>
      <input
        type="range" min={0} max={100} value={Math.round(pos)} onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare ${beforeLabel} and ${afterLabel}`} className="sr-only focus:not-sr-only mt-2 w-full accent-white"
      />
    </div>
  );
};
