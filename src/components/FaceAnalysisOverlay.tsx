import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type ViewAngle = "front" | "left" | "right";

// ─── Front-facing landmarks (68-point subset, relative %) ──────────
const frontLandmarks = {
  // Forehead
  foreheadCenter: { x: 50, y: 18 },
  foreheadLeft: { x: 38, y: 20 },
  foreheadRight: { x: 62, y: 20 },
  // Brow
  browInnerL: { x: 40, y: 30 },
  browPeakL: { x: 35, y: 27 },
  browOuterL: { x: 30, y: 30 },
  browInnerR: { x: 60, y: 30 },
  browPeakR: { x: 65, y: 27 },
  browOuterR: { x: 70, y: 30 },
  // Eyes
  eyeInnerL: { x: 42, y: 36 },
  eyeCenterL: { x: 38, y: 35 },
  eyeOuterL: { x: 33, y: 36 },
  pupilL: { x: 38, y: 36 },
  eyeInnerR: { x: 58, y: 36 },
  eyeCenterR: { x: 62, y: 35 },
  eyeOuterR: { x: 67, y: 36 },
  pupilR: { x: 62, y: 36 },
  // Nose
  nasion: { x: 50, y: 33 },
  noseBridge: { x: 50, y: 42 },
  noseTip: { x: 50, y: 50 },
  noseWingL: { x: 44, y: 51 },
  noseWingR: { x: 56, y: 51 },
  // Philtrum
  philtrumTop: { x: 50, y: 54 },
  // Mouth
  mouthCornerL: { x: 41, y: 60 },
  mouthCornerR: { x: 59, y: 60 },
  upperLipCenter: { x: 50, y: 58 },
  lowerLipCenter: { x: 50, y: 63 },
  // Chin
  mentolabialFold: { x: 50, y: 68 },
  chinTip: { x: 50, y: 78 },
  // Jaw contour
  jawAngleL: { x: 26, y: 58 },
  jawMidL: { x: 28, y: 68 },
  jawLowL: { x: 35, y: 75 },
  jawAngleR: { x: 74, y: 58 },
  jawMidR: { x: 72, y: 68 },
  jawLowR: { x: 65, y: 75 },
  // Cheekbones
  cheekHighL: { x: 27, y: 42 },
  cheekHighR: { x: 73, y: 42 },
  // Ears
  earTopL: { x: 22, y: 32 },
  earLobeL: { x: 22, y: 48 },
  earTopR: { x: 78, y: 32 },
  earLobeR: { x: 78, y: 48 },
  // Temples
  templeL: { x: 24, y: 28 },
  templeR: { x: 76, y: 28 },
};

// ─── Side-facing landmarks ──────────
const sideLandmarks = {
  foreheadTop: { x: 45, y: 15 },
  foreheadMid: { x: 48, y: 20 },
  glabella: { x: 52, y: 28 },
  nasion: { x: 53, y: 32 },
  noseBridge: { x: 56, y: 40 },
  noseTip: { x: 62, y: 48 },
  columella: { x: 58, y: 51 },
  philtrumBase: { x: 55, y: 54 },
  upperLip: { x: 55, y: 57 },
  lowerLip: { x: 54, y: 62 },
  mentolabial: { x: 52, y: 66 },
  chinTip: { x: 50, y: 72 },
  chinUnder: { x: 45, y: 75 },
  neckStart: { x: 38, y: 78 },
  jawAngle: { x: 32, y: 62 },
  earTragus: { x: 30, y: 40 },
  earTop: { x: 28, y: 30 },
  earLobe: { x: 30, y: 48 },
  crownTop: { x: 38, y: 10 },
  occipital: { x: 25, y: 22 },
};

// ─── Front measurements ──────────
const frontMeasurements = [
  { label: "Interpupillary Distance", from: "pupilL", to: "pupilR", value: "63.2mm", ratio: "1.00", category: "eyes" },
  { label: "Bizygomatic Width", from: "cheekHighL", to: "cheekHighR", value: "138mm", ratio: "φ 1.02", category: "structure" },
  { label: "Bigonial Width", from: "jawAngleL", to: "jawAngleR", value: "118mm", ratio: "0.85x BZ", category: "jaw" },
  { label: "Upper Facial Third", from: "foreheadCenter", to: "browInnerL", value: "32mm", ratio: "⅓ 0.98", category: "thirds" },
  { label: "Middle Facial Third", from: "browInnerL", to: "noseTip", value: "34mm", ratio: "⅓ 1.03", category: "thirds" },
  { label: "Lower Facial Third", from: "noseTip", to: "chinTip", value: "33mm", ratio: "⅓ 0.99", category: "thirds" },
  { label: "Nose Width / IPD", from: "noseWingL", to: "noseWingR", value: "34mm", ratio: "0.54x", category: "nose" },
  { label: "Mouth Width / Nose", from: "mouthCornerL", to: "mouthCornerR", value: "51mm", ratio: "φ 1.50x", category: "mouth" },
  { label: "Canthal Tilt (L)", from: "eyeInnerL", to: "eyeOuterL", value: "+4.2°", ratio: "positive", category: "eyes" },
  { label: "Canthal Tilt (R)", from: "eyeInnerR", to: "eyeOuterR", value: "+3.8°", ratio: "positive", category: "eyes" },
  { label: "Philtrum Length", from: "philtrumTop", to: "upperLipCenter", value: "14mm", ratio: "ideal", category: "mouth" },
  { label: "Eye Spacing Ratio", from: "eyeInnerL", to: "eyeInnerR", value: "34mm", ratio: "1.04x eye", category: "eyes" },
];

// ─── Side measurements ──────────
const sideMeasurements = [
  { label: "Nasal Projection", from: "nasion", to: "noseTip", value: "28mm", ratio: "0.67x", category: "nose" },
  { label: "Nasofrontal Angle", from: "glabella", to: "nasion", value: "136°", ratio: "ideal 130-140°", category: "angles" },
  { label: "Nasolabial Angle", from: "columella", to: "philtrumBase", value: "98°", ratio: "ideal 90-105°", category: "angles" },
  { label: "Mentolabial Angle", from: "lowerLip", to: "mentolabial", value: "124°", ratio: "ideal 120-130°", category: "angles" },
  { label: "Chin Projection", from: "chinTip", to: "philtrumBase", value: "−2mm", ratio: "near ideal", category: "chin" },
  { label: "Gonial Angle", from: "earTragus", to: "jawAngle", value: "128°", ratio: "ideal 120-130°", category: "jaw" },
  { label: "Facial Convexity", from: "glabella", to: "chinTip", value: "168°", ratio: "ideal 165-175°", category: "profile" },
  { label: "Nose-Forehead Line", from: "foreheadMid", to: "noseTip", value: "—", ratio: "aligned", category: "profile" },
  { label: "Ear-Nose Vertical", from: "earTragus", to: "noseTip", value: "—", ratio: "horizontal", category: "profile" },
  { label: "Neck-Chin Angle", from: "chinUnder", to: "neckStart", value: "112°", ratio: "ideal 105-120°", category: "profile" },
];

// ─── Connections (lines between landmarks) ──────────
const frontConnections: [string, string][] = [
  // Jaw contour
  ["jawAngleL", "jawMidL"], ["jawMidL", "jawLowL"], ["jawLowL", "chinTip"],
  ["jawAngleR", "jawMidR"], ["jawMidR", "jawLowR"], ["jawLowR", "chinTip"],
  // Brow lines
  ["browOuterL", "browPeakL"], ["browPeakL", "browInnerL"],
  ["browOuterR", "browPeakR"], ["browPeakR", "browInnerR"],
  // Eye outlines
  ["eyeOuterL", "eyeCenterL"], ["eyeCenterL", "eyeInnerL"],
  ["eyeOuterR", "eyeCenterR"], ["eyeCenterR", "eyeInnerR"],
  // Nose bridge
  ["nasion", "noseBridge"], ["noseBridge", "noseTip"],
  ["noseTip", "noseWingL"], ["noseTip", "noseWingR"],
  // Mouth
  ["mouthCornerL", "upperLipCenter"], ["upperLipCenter", "mouthCornerR"],
  ["mouthCornerL", "lowerLipCenter"], ["lowerLipCenter", "mouthCornerR"],
  // Symmetry verticals
  ["foreheadCenter", "nasion"], ["noseTip", "chinTip"],
];

const sideConnections: [string, string][] = [
  ["crownTop", "foreheadTop"], ["foreheadTop", "foreheadMid"],
  ["foreheadMid", "glabella"], ["glabella", "nasion"],
  ["nasion", "noseBridge"], ["noseBridge", "noseTip"],
  ["noseTip", "columella"], ["columella", "philtrumBase"],
  ["philtrumBase", "upperLip"], ["upperLip", "lowerLip"],
  ["lowerLip", "mentolabial"], ["mentolabial", "chinTip"],
  ["chinTip", "chinUnder"], ["chinUnder", "neckStart"],
  ["jawAngle", "earTragus"],
  ["earTop", "earTragus"], ["earTragus", "earLobe"],
  ["crownTop", "occipital"],
];

const categoryColors: Record<string, string> = {
  eyes: "#818cf8",
  structure: "#a78bfa",
  jaw: "#f472b6",
  thirds: "#34d399",
  nose: "#fbbf24",
  mouth: "#fb923c",
  angles: "#38bdf8",
  chin: "#f472b6",
  profile: "#a78bfa",
};

interface FaceOverlayProps {
  images: string[];
}

export function FaceAnalysisOverlay({ images }: FaceOverlayProps) {
  const [activeView, setActiveView] = useState<ViewAngle>("front");
  const [mirrorMode, setMirrorMode] = useState<"none" | "left" | "right">("none");
  const [showGrid, setShowGrid] = useState(true);
  const [showLandmarks, setShowLandmarks] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [activeMetric, setActiveMetric] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const isSide = activeView === "left" || activeView === "right";
  const landmarks = isSide ? sideLandmarks : frontLandmarks;
  const measurements = isSide ? sideMeasurements : frontMeasurements;
  const connections = isSide ? sideConnections : frontConnections;

  const imageIndex = activeView === "front" ? 0 : activeView === "left" ? 1 : 2;
  const currentImage = images[imageIndex] || images[0];

  const filteredMeasurements = activeCategory
    ? measurements.filter(m => m.category === activeCategory)
    : measurements;

  const categories = [...new Set(measurements.map(m => m.category))];

  const getPoint = (key: string) => (landmarks as Record<string, { x: number; y: number }>)[key];

  const symmetryScore = isSide ? null : 94.2;
  const profileScore = isSide ? 87.6 : null;

  return (
    <div className="space-y-3">
      {/* Angle tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-accent/50">
        {([
          { key: "front" as ViewAngle, label: "Front", available: true },
          { key: "left" as ViewAngle, label: "Left Profile", available: images.length > 1 },
          { key: "right" as ViewAngle, label: "Right Profile", available: images.length > 2 },
        ]).map(tab => (
          <button
            key={tab.key}
            onClick={() => { if (tab.available) { setActiveView(tab.key); setActiveMetric(null); setActiveCategory(null); setMirrorMode("none"); } }}
            className={cn(
              "flex-1 text-[11px] font-medium py-2 rounded-lg transition-all",
              activeView === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground",
              !tab.available && "opacity-30 cursor-not-allowed"
            )}
          >
            {tab.label}
            {!tab.available && " ✕"}
          </button>
        ))}
      </div>

      {/* Symmetry Mirror Toggle (Front only) */}
      {!isSide && (
        <div className="flex gap-1 p-1 rounded-xl bg-accent/30">
          {[
            { key: "none", label: "Original" },
            { key: "left", label: "Left Mirrored" },
            { key: "right", label: "Right Mirrored" },
          ].map(mode => (
            <button
              key={mode.key}
              onClick={() => setMirrorMode(mode.key as any)}
              className={cn(
                "flex-1 text-[10px] font-medium py-1.5 rounded-lg transition-all",
                mirrorMode === mode.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              {mode.label}
            </button>
          ))}
        </div>
      )}

      {/* Photo with overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-black">
        <img
          src={currentImage}
          alt={`${activeView} view`}
          className="w-full aspect-square object-cover opacity-85"
        />
        
        {/* Mirror overlays */}
        {!isSide && mirrorMode === "left" && (
          <img
            src={currentImage}
            alt="Left mirrored"
            className="absolute inset-0 w-full h-full aspect-square object-cover opacity-85"
            style={{ clipPath: "polygon(50% 0, 100% 0, 100% 100%, 50% 100%)", transform: "scaleX(-1)" }}
          />
        )}
        {!isSide && mirrorMode === "right" && (
          <img
            src={currentImage}
            alt="Right mirrored"
            className="absolute inset-0 w-full h-full aspect-square object-cover opacity-85"
            style={{ clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)", transform: "scaleX(-1)" }}
          />
        )}

        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="symLine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.6" />
              <stop offset="50%" stopColor="#ec4899" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.6" />
            </linearGradient>
            <filter id="glow2"><feGaussianBlur stdDeviation="0.4" /></filter>
          </defs>

          {/* Grid lines */}
          {showGrid && !isSide && (
            <g opacity="0.25">
              {/* Vertical symmetry */}
              <line x1="50" y1="8" x2="50" y2="85" stroke="url(#symLine)" strokeWidth="0.25" strokeDasharray="1.2 0.8" />
              {/* Horizontal thirds */}
              {[28, 50, 68].map(y => (
                <line key={y} x1="20" y1={y} x2="80" y2={y} stroke="#a78bfa" strokeWidth="0.15" strokeDasharray="0.8 1.2" />
              ))}
              {/* Horizontal fifths */}
              {[22, 36, 50, 64, 78].map(y => (
                <line key={`f${y}`} x1="22" y1={y} x2="78" y2={y} stroke="#34d399" strokeWidth="0.08" strokeDasharray="0.4 1.5" opacity="0.5" />
              ))}
            </g>
          )}

          {showGrid && isSide && (
            <g opacity="0.25">
              {/* Vertical reference (ear alignment) */}
              <line x1="30" y1="10" x2="30" y2="80" stroke="#38bdf8" strokeWidth="0.2" strokeDasharray="1 1" />
              {/* Frankfort horizontal */}
              <line x1="15" y1="40" x2="85" y2="40" stroke="#fbbf24" strokeWidth="0.2" strokeDasharray="1 1" />
              {/* E-line (nose to chin) */}
              <line x1="62" y1="48" x2="50" y2="72" stroke="#f472b6" strokeWidth="0.2" strokeDasharray="0.8 0.8" />
              {/* Vertical from forehead */}
              <line x1="48" y1="10" x2="48" y2="80" stroke="#a78bfa" strokeWidth="0.15" strokeDasharray="0.6 1.2" />
            </g>
          )}

          {/* Connections */}
          {showConnections && connections.map(([from, to], i) => {
            const p1 = getPoint(from);
            const p2 = getPoint(to);
            if (!p1 || !p2) return null;
            return (
              <motion.line
                key={`c${i}`}
                x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                stroke="rgba(167,139,250,0.25)"
                strokeWidth="0.2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.4, delay: i * 0.02 }}
              />
            );
          })}

          {/* Landmark dots */}
          {showLandmarks && Object.entries(landmarks).map(([key, pos], i) => (
            <motion.g key={key}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.015 }}
            >
              <circle cx={pos.x} cy={pos.y} r="0.9" fill="rgba(236,72,153,0.15)" />
              <circle cx={pos.x} cy={pos.y} r="0.4" fill="rgba(236,72,153,0.7)" />
            </motion.g>
          ))}

          {/* Active measurement highlight */}
          {activeMetric !== null && (() => {
            const m = filteredMeasurements[activeMetric];
            if (!m) return null;
            const p1 = getPoint(m.from);
            const p2 = getPoint(m.to);
            if (!p1 || !p2) return null;
            const color = categoryColors[m.category] || "#fff";
            return (
              <g>
                <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
                  stroke={color} strokeWidth="0.5" filter="url(#glow2)" />
                <circle cx={p1.x} cy={p1.y} r="1.2" fill={color} opacity="0.8" />
                <circle cx={p2.x} cy={p2.y} r="1.2" fill={color} opacity="0.8" />
                {/* Value label */}
                <rect x={(p1.x + p2.x) / 2 - 6} y={(p1.y + p2.y) / 2 - 2.5} width="12" height="5" rx="1"
                  fill="rgba(0,0,0,0.7)" />
                <text x={(p1.x + p2.x) / 2} y={(p1.y + p2.y) / 2 + 0.8}
                  textAnchor="middle" fill="white" fontSize="2.2" fontFamily="monospace">
                  {m.value}
                </text>
              </g>
            );
          })()}

          {/* Front: facial thirds brackets */}
          {!isSide && showGrid && (
            <g opacity="0.4">
              <text x="82" y="24" fill="#34d399" fontSize="2" fontFamily="monospace">⅓ upper</text>
              <text x="82" y="40" fill="#34d399" fontSize="2" fontFamily="monospace">⅓ mid</text>
              <text x="82" y="60" fill="#34d399" fontSize="2" fontFamily="monospace">⅓ lower</text>
            </g>
          )}

          {/* Side: angle arcs */}
          {isSide && showGrid && (
            <g opacity="0.5">
              {/* Nasofrontal angle arc */}
              <path d="M 48,20 Q 53,28 56,40" fill="none" stroke="#38bdf8" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
              <text x="58" y="30" fill="#38bdf8" fontSize="1.8" fontFamily="monospace">136°</text>
              {/* Nasolabial angle arc */}
              <path d="M 56,40 Q 62,48 55,54" fill="none" stroke="#fbbf24" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
              <text x="64" y="52" fill="#fbbf24" fontSize="1.8" fontFamily="monospace">98°</text>
              {/* Gonial angle */}
              <path d="M 30,40 Q 32,55 32,62" fill="none" stroke="#f472b6" strokeWidth="0.3" strokeDasharray="0.6 0.6" />
              <text x="20" y="55" fill="#f472b6" fontSize="1.8" fontFamily="monospace">128°</text>
            </g>
          )}
        </svg>

        {/* Score badge */}
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
          <p className="text-[8px] text-white/40 uppercase tracking-widest">
            {isSide ? "Profile Score" : "Symmetry"}
          </p>
          <p className="text-lg font-display font-black text-white leading-none">
            {isSide ? profileScore : symmetryScore}%
          </p>
        </div>

        {/* View label */}
        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md rounded-lg px-2.5 py-1 border border-white/10">
          <p className="text-[10px] font-bold text-white/70 uppercase tracking-wider">
            {isSide ? "Profile Analysis" : "Frontal Analysis"}
          </p>
        </div>

        {/* Toggle buttons */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {[
            { label: "Grid", active: showGrid, toggle: () => setShowGrid(!showGrid) },
            { label: "Points", active: showLandmarks, toggle: () => setShowLandmarks(!showLandmarks) },
            { label: "Lines", active: showConnections, toggle: () => setShowConnections(!showConnections) },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.toggle}
              className={cn("text-[9px] px-2 py-1 rounded-md backdrop-blur-md border transition-all font-medium",
                btn.active ? "bg-violet-500/20 border-violet-500/30 text-violet-300" : "bg-black/40 border-white/10 text-white/30"
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
        <button
          onClick={() => { setActiveCategory(null); setActiveMetric(null); }}
          className={cn("text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all",
            !activeCategory ? "bg-accent border-border text-foreground" : "border-border/50 text-muted-foreground"
          )}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => { setActiveCategory(activeCategory === cat ? null : cat); setActiveMetric(null); }}
            className={cn("text-[10px] px-2.5 py-1 rounded-lg border whitespace-nowrap capitalize transition-all",
              activeCategory === cat ? "bg-accent border-border text-foreground" : "border-border/50 text-muted-foreground"
            )}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full mr-1.5" style={{ backgroundColor: categoryColors[cat] }} />
            {cat}
          </button>
        ))}
      </div>

      {/* Measurements panel */}
      <div className="rounded-2xl border border-border bg-card p-3 space-y-0.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <h4 className="text-[10px] font-display font-bold text-muted-foreground uppercase tracking-widest">
            {isSide ? "Profile Measurements & Angles" : "Frontal Ratios & Distances"}
          </h4>
          <span className="text-[10px] text-muted-foreground">{filteredMeasurements.length} metrics</span>
        </div>

        {filteredMeasurements.map((m, i) => {
          const isGolden = m.ratio.includes("φ");
          const isIdeal = m.ratio.includes("ideal") || m.ratio.includes("positive") || m.ratio.includes("aligned");
          const color = categoryColors[m.category] || "#a78bfa";
          return (
            <button
              key={`${m.label}-${i}`}
              onMouseEnter={() => setActiveMetric(i)}
              onMouseLeave={() => setActiveMetric(null)}
              onClick={() => setActiveMetric(activeMetric === i ? null : i)}
              className={cn(
                "w-full flex items-center justify-between py-2 px-2.5 rounded-lg text-left transition-all",
                activeMetric === i ? "bg-accent" : "hover:bg-accent/40"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <div className="min-w-0">
                  <p className="text-[11px] font-medium text-foreground truncate">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground">{m.value}</p>
                </div>
              </div>
              <div className={cn(
                "text-[10px] font-display font-bold px-2 py-0.5 rounded shrink-0 ml-2",
                isGolden ? "text-amber-400 bg-amber-500/10" :
                isIdeal ? "text-emerald-400 bg-emerald-500/10" :
                "text-violet-400 bg-violet-500/10"
              )}>
                {m.ratio}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="rounded-xl border border-border bg-card/50 p-3 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-display font-bold text-sm">φ</span>
          <span className="text-[10px] text-muted-foreground">Golden Ratio (1.618)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-display font-bold text-sm">⅓</span>
          <span className="text-[10px] text-muted-foreground">Facial Thirds</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded border border-dashed border-violet-400/50" />
          <span className="text-[10px] text-muted-foreground">Symmetry Grid</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-pink-400" />
          <span className="text-[10px] text-muted-foreground">Landmarks (68pt)</span>
        </div>
      </div>
    </div>
  );
}
