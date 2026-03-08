import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sparkles, Shirt, Dumbbell, Brain, Eye, DollarSign, ArrowRight } from "lucide-react";

const modules = [
  { id: "skin", icon: Sparkles, label: "SKIN MAX", gradient: "from-rose-500/20 to-pink-500/10" },
  { id: "style", icon: Shirt, label: "STYLE MAX", gradient: "from-blue-500/20 to-indigo-500/10" },
  { id: "body", icon: Dumbbell, label: "BODY MAX", gradient: "from-orange-500/20 to-amber-500/10" },
  { id: "iq", icon: Brain, label: "IQ MAX", gradient: "from-violet-500/20 to-purple-500/10" },
  { id: "presence", icon: Eye, label: "PRESENCE MAX", gradient: "from-emerald-500/20 to-green-500/10" },
  { id: "money", icon: DollarSign, label: "MONEY MAX", gradient: "from-yellow-500/20 to-amber-500/10" },
];

const StarterPage = () => {
  const navigate = useNavigate();
  const [visibleModules, setVisibleModules] = useState<string[]>([]);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  useEffect(() => {
    modules.forEach((module, i) => {
      setTimeout(() => {
        setVisibleModules((prev) => [...prev, module.id]);
      }, 300 + i * 150);
    });
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 flow-lines opacity-30" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-foreground/[0.02] blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/3 w-[400px] h-[400px] rounded-full bg-foreground/[0.015] blur-[100px]" />

      <div className="relative z-10 mb-16 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s" }}>
        <h2 className="font-display text-sm tracking-[0.3em] text-silver-dim uppercase">
          The System
        </h2>
      </div>

      <div className="relative z-10 flex flex-wrap justify-center gap-5 md:gap-8 max-w-3xl px-6 mb-20">
        {modules.map((module, i) => {
          const Icon = module.icon;
          const isVisible = visibleModules.includes(module.id);
          const isHovered = hoveredModule === module.id;

          return (
            <div
              key={module.id}
              className={cn(
                "relative group transition-all duration-700 ease-out",
                isVisible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-12 scale-90"
              )}
              onMouseEnter={() => setHoveredModule(module.id)}
              onMouseLeave={() => setHoveredModule(null)}
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <div
                className={cn(
                  "w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-all duration-500 cursor-pointer glass-card",
                  isHovered && "glass-card-strong scale-110"
                )}
                style={isHovered ? { animation: "float 2s ease-in-out infinite" } : {}}
              >
                <div className={cn(
                  "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500",
                  module.gradient,
                  isHovered && "opacity-100"
                )} />
                <Icon
                  className={cn(
                    "w-7 h-7 md:w-9 md:h-9 transition-all duration-500 relative z-10",
                    isHovered ? "text-foreground" : "text-silver-dim"
                  )}
                />
              </div>
              <span
                className={cn(
                  "absolute -bottom-8 left-1/2 -translate-x-1/2 font-display text-[10px] tracking-widest whitespace-nowrap transition-all duration-500",
                  isHovered ? "text-foreground opacity-100" : "text-silver-dim/60 opacity-0 translate-y-1"
                )}
              >
                {module.label}
              </span>
              <div
                className={cn(
                  "absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-lg glass-card-strong text-foreground text-xs font-display whitespace-nowrap transition-all duration-300",
                  isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                )}
              >
                Unlock inside
              </div>
            </div>
          );
        })}
      </div>

      <div className="relative z-10 text-center px-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.8s" }}>
        <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground mb-5 tracking-tight">
          Control what actually
          <br />
          <span className="text-silver">matters</span>.
        </h1>
        <p className="text-muted-foreground text-lg mb-12 max-w-md mx-auto font-light">
          A system for those who want results, not motivation.
        </p>
        <button
          onClick={() => navigate("/membership")}
          className="btn-premium group inline-flex items-center gap-3"
        >
          Enter System
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-silver/20 to-transparent" />
    </div>
  );
};

export default StarterPage;
