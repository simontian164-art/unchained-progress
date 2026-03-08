import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FaceOverlayProps {
  imageSrc: string;
}

// Simulated landmark positions (relative %, based on average face proportions)
const landmarks = {
  // Eyes
  leftEye: { x: 38, y: 38 },
  rightEye: { x: 62, y: 38 },
  // Nose
  noseBridge: { x: 50, y: 42 },
  noseTip: { x: 50, y: 52 },
  // Mouth
  mouthLeft: { x: 40, y: 62 },
  mouthRight: { x: 60, y: 62 },
  mouthCenter: { x: 50, y: 62 },
  // Jaw
  chinCenter: { x: 50, y: 78 },
  jawLeft: { x: 30, y: 65 },
  jawRight: { x: 70, y: 65 },
  // Forehead
  foreheadCenter: { x: 50, y: 22 },
  // Cheekbones
  cheekLeft: { x: 28, y: 45 },
  cheekRight: { x: 72, y: 45 },
};

const measurements = [
  { label: "Interpupillary", from: "leftEye", to: "rightEye", value: "64mm", ratio: "1.00" },
  { label: "Nose-Chin", from: "noseTip", to: "chinCenter", value: "52mm", ratio: "φ 0.97" },
  { label: "Eye-Mouth", from: "leftEye", to: "mouthLeft", value: "71mm", ratio: "φ 1.03" },
  { label: "Forehead-Nose", from: "foreheadCenter", to: "noseTip", value: "68mm", ratio: "φ 1.01" },
  { label: "Jaw Width", from: "jawLeft", to: "jawRight", value: "118mm", ratio: "0.96" },
];

const symmetryScore = 94.2;
const goldenRatio = 1.618;

export function FaceAnalysisOverlay({ imageSrc }: FaceOverlayProps) {
  const [showLines, setShowLines] = useState(true);
  const [showMeasurements, setShowMeasurements] = useState(true);
  const [activeMetric, setActiveMetric] = useState<number | null>(null);

  const getPoint = (key: keyof typeof landmarks) => landmarks[key];

  return (
    <div className="space-y-4">
      {/* Photo with overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-black">
        <img src={imageSrc} alt="Face analysis" className="w-full aspect-square object-cover opacity-90" />

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="symGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.8" />
            </linearGradient>
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="0.3" />
            </filter>
          </defs>

          {showLines && (
            <g>
              {/* Vertical symmetry line */}
              <motion.line
                x1="50" y1="15" x2="50" y2="85"
                stroke="url(#symGrad)" strokeWidth="0.3" strokeDasharray="1.5 1"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              />

              {/* Horizontal thirds */}
              {[32, 46, 62].map((y, i) => (
                <motion.line
                  key={y} x1="25" y1={y} x2="75" y2={y}
                  stroke="rgba(167,139,250,0.3)" strokeWidth="0.2" strokeDasharray="1 1.5"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 + i * 0.15 }}
                />
              ))}

              {/* Golden ratio markers on symmetry line */}
              {[22, 38, 52, 62, 78].map((y, i) => (
                <motion.circle
                  key={y} cx="50" cy={y} r="0.6"
                  fill="#f59e0b" opacity="0.7"
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + i * 0.1 }}
                />
              ))}
            </g>
          )}

          {/* Landmark dots */}
          {showLines && Object.entries(landmarks).map(([key, pos], i) => (
            <motion.circle
              key={key}
              cx={pos.x} cy={pos.y} r="0.7"
              fill="none" stroke="rgba(236,72,153,0.6)" strokeWidth="0.3"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            />
          ))}

          {/* Active measurement line */}
          {showMeasurements && activeMetric !== null && (() => {
            const m = measurements[activeMetric];
            const from = getPoint(m.from as keyof typeof landmarks);
            const to = getPoint(m.to as keyof typeof landmarks);
            return (
              <g>
                <line
                  x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                  stroke="#f59e0b" strokeWidth="0.4" filter="url(#lineGlow)"
                />
                <circle cx={from.x} cy={from.y} r="1" fill="#f59e0b" opacity="0.8" />
                <circle cx={to.x} cy={to.y} r="1" fill="#f59e0b" opacity="0.8" />
              </g>
            );
          })()}
        </svg>

        {/* Symmetry score badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md rounded-lg px-3 py-1.5 border border-white/10">
          <p className="text-[9px] text-white/50 uppercase tracking-wider">Symmetry</p>
          <p className="text-base font-display font-bold text-white">{symmetryScore}%</p>
        </div>

        {/* Toggle buttons */}
        <div className="absolute bottom-3 left-3 flex gap-2">
          <button
            onClick={() => setShowLines(!showLines)}
            className={cn("text-[10px] px-2.5 py-1 rounded-md backdrop-blur-md border transition-all",
              showLines ? "bg-violet-500/20 border-violet-500/30 text-violet-300" : "bg-black/40 border-white/10 text-white/40"
            )}
          >
            Lines
          </button>
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className={cn("text-[10px] px-2.5 py-1 rounded-md backdrop-blur-md border transition-all",
              showMeasurements ? "bg-amber-500/20 border-amber-500/30 text-amber-300" : "bg-black/40 border-white/10 text-white/40"
            )}
          >
            Math
          </button>
        </div>
      </div>

      {/* Measurements panel */}
      {showMeasurements && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-4 space-y-1"
        >
          <h4 className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Facial Ratios & Measurements
          </h4>
          {measurements.map((m, i) => {
            const isGolden = m.ratio.includes("φ");
            return (
              <button
                key={m.label}
                onMouseEnter={() => setActiveMetric(i)}
                onMouseLeave={() => setActiveMetric(null)}
                onClick={() => setActiveMetric(activeMetric === i ? null : i)}
                className={cn(
                  "w-full flex items-center justify-between py-2 px-3 rounded-lg text-left transition-all",
                  activeMetric === i ? "bg-accent" : "hover:bg-accent/50"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    isGolden ? "bg-amber-400" : "bg-violet-400"
                  )} />
                  <div>
                    <p className="text-xs font-medium text-foreground">{m.label}</p>
                    <p className="text-[10px] text-muted-foreground">{m.value}</p>
                  </div>
                </div>
                <div className={cn(
                  "text-xs font-display font-bold px-2 py-0.5 rounded",
                  isGolden ? "text-amber-400 bg-amber-500/10" : "text-violet-400 bg-violet-500/10"
                )}>
                  {m.ratio}
                </div>
              </button>
            );
          })}

          {/* Golden ratio info */}
          <div className="mt-3 pt-3 border-t border-border flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <span className="text-amber-400 font-display font-bold text-sm">φ</span>
            </div>
            <div>
              <p className="text-[11px] font-medium text-foreground">Golden Ratio: {goldenRatio}</p>
              <p className="text-[10px] text-muted-foreground">Ratios marked φ are compared to the divine proportion</p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
