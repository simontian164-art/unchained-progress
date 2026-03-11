import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { motion, useInView } from "framer-motion";
import {
  Sparkles, Shirt, Dumbbell, Brain, Eye, DollarSign,
  ArrowRight, Star, Users, TrendingUp, Zap, Shield, ChevronDown,
  ScanFace, Camera
} from "lucide-react";

const modules = [
  { id: "skin", icon: Sparkles, label: "SKIN MAX", desc: "Clear skin protocol", gradient: "from-rose-500/20 to-pink-500/10" },
  { id: "style", icon: Shirt, label: "STYLE MAX", desc: "Dress sharper instantly", gradient: "from-blue-500/20 to-indigo-500/10" },
  { id: "body", icon: Dumbbell, label: "BODY MAX", desc: "Build the right frame", gradient: "from-orange-500/20 to-amber-500/10" },
  { id: "iq", icon: Brain, label: "IQ MAX", desc: "Think faster & clearer", gradient: "from-violet-500/20 to-purple-500/10" },
  { id: "presence", icon: Eye, label: "PRESENCE MAX", desc: "Command any room", gradient: "from-emerald-500/20 to-green-500/10" },
  { id: "money", icon: DollarSign, label: "MONEY MAX", desc: "Build real leverage", gradient: "from-yellow-500/20 to-amber-500/10" },
];

const stats = [
  { value: "12,400+", label: "Active users" },
  { value: "91%", label: "See results in 30 days" },
  { value: "4.9", label: "Average rating", icon: Star },
];

const testimonials = [
  { text: "Went from 'invisible' to getting compliments weekly. The style + skin combo changed everything.", name: "Alex M.", tag: "3 months in" },
  { text: "I was skeptical but the structured approach actually works. No fluff, just action steps.", name: "Jordan K.", tag: "Core member" },
  { text: "The face analysis alone is worth it. Knowing exactly what to fix changed my whole approach.", name: "Chris R.", tag: "All Access" },
];

const beforeAfter = [
  { before: "Random skincare products", after: "Targeted routine that actually works" },
  { before: "Wearing whatever's in the closet", after: "Strategic wardrobe that fits your frame" },
  { before: "No structure, no tracking", after: "Measurable progress every week" },
  { before: "Guessing what to improve", after: "AI-powered face analysis tells you exactly" },
];

const StarterPage = () => {
  const navigate = useNavigate();
  const [visibleModules, setVisibleModules] = useState<string[]>([]);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const modulesRef = useRef<HTMLDivElement>(null);
  const modulesInView = useInView(modulesRef, { once: true, margin: "-100px" });

  useEffect(() => {
    if (modulesInView) {
      modules.forEach((module, i) => {
        setTimeout(() => setVisibleModules((prev) => [...prev, module.id]), i * 120);
      });
    }
  }, [modulesInView]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      <div className="absolute inset-0 gradient-mesh" />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 flow-lines opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-foreground/[0.02] blur-[150px]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8">
            <span className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-xs font-display text-muted-foreground tracking-wide">
              {stats[0].value} people already leveling up
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-foreground mb-6 tracking-tight leading-[1.1]">
            Stop guessing.
            <br />
            <span className="text-gold">Start winning.</span>
          </h1>

          <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-lg mx-auto font-light leading-relaxed">
            The only system that tells you <em className="text-foreground not-italic font-medium">exactly</em> what to fix, how to fix it, and tracks your progress.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/membership")}
              className="btn-premium group inline-flex items-center gap-3 text-lg"
            >
              Get Started
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => modulesRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="btn-premium-outline inline-flex items-center gap-2"
            >
              See what's inside
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 mt-20 flex flex-wrap justify-center gap-8 md:gap-16"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                {stat.icon && <stat.icon className="w-4 h-4 text-gold fill-gold" />}
                <span className="text-2xl md:text-3xl font-display font-bold text-foreground">{stat.value}</span>
              </div>
              <span className="text-xs text-muted-foreground tracking-wide">{stat.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-5 h-5 text-muted-foreground animate-bounce" />
        </motion.div>
      </section>

      {/* ─── BEFORE / AFTER ─── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-display font-bold text-foreground text-center mb-4"
          >
            Without a system, you're just <span className="text-muted-foreground">hoping</span>.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-center mb-14 max-w-md mx-auto"
          >
            Here's what changes when you stop winging it.
          </motion.p>

          <div className="space-y-4">
            {beforeAfter.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-6"
              >
                <div className="glass-card rounded-xl p-4 text-right">
                  <span className="text-muted-foreground text-sm line-through decoration-muted-foreground/30">{item.before}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gold flex-shrink-0" />
                <div className="glass-card-strong rounded-xl p-4 ring-1 ring-gold-dim/30">
                  <span className="text-foreground text-sm font-medium">{item.after}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODULES ─── */}
      <section ref={modulesRef} className="relative z-10 py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-2xl md:text-4xl font-display font-bold text-foreground mb-4">
              6 modules. <span className="text-gold">One system.</span>
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Each module is a structured playbook — not random tips. Follow the system, see the results.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
            {modules.map((module, i) => {
              const Icon = module.icon;
              const isVisible = visibleModules.includes(module.id);
              const isHovered = hoveredModule === module.id;

              return (
                <div
                  key={module.id}
                  className={cn(
                    "relative group transition-all duration-700 ease-out cursor-pointer",
                    isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                  )}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  onClick={() => navigate("/membership")}
                >
                  <div className={cn(
                    "glass-card rounded-2xl p-6 md:p-8 transition-all duration-500 h-full",
                    isHovered && "glass-card-strong ring-1 ring-silver/20 -translate-y-1"
                  )}>
                    <div className={cn(
                      "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 transition-opacity duration-500",
                      module.gradient,
                      isHovered && "opacity-100"
                    )} />
                    <div className="relative z-10">
                      <Icon className={cn(
                        "w-8 h-8 mb-4 transition-colors duration-300",
                        isHovered ? "text-foreground" : "text-silver-dim"
                      )} />
                      <h3 className="font-display font-bold text-foreground text-sm tracking-wide mb-1">{module.label}</h3>
                      <p className="text-muted-foreground text-xs leading-relaxed">{module.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bonus tools */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 grid grid-cols-2 md:grid-cols-3 gap-4"
          >
            {[
              { icon: ScanFace, label: "AI Face Analysis", desc: "Know your exact strengths" },
              { icon: Camera, label: "Photo Max", desc: "Take better photos" },
              { icon: TrendingUp, label: "Progress Tracking", desc: "Measurable improvement" },
            ].map((tool, i) => (
              <div key={tool.label} className="glass-card rounded-xl p-5 flex items-start gap-3 group cursor-pointer hover:glass-card-strong transition-all duration-300" onClick={() => navigate("/membership")}>
                <tool.icon className="w-5 h-5 text-silver-dim mt-0.5 group-hover:text-silver transition-colors" />
                <div>
                  <span className="text-foreground text-xs font-display font-semibold block">{tool.label}</span>
                  <span className="text-muted-foreground text-xs">{tool.desc}</span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-display font-bold text-foreground mb-14"
          >
            Real people. <span className="text-silver">Real results.</span>
          </motion.h2>

          <div className="relative h-[180px]">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={false}
                animate={{
                  opacity: activeTestimonial === i ? 1 : 0,
                  y: activeTestimonial === i ? 0 : 20,
                  scale: activeTestimonial === i ? 1 : 0.95,
                }}
                transition={{ duration: 0.5 }}
                className="absolute inset-0 flex flex-col items-center justify-center"
                style={{ pointerEvents: activeTestimonial === i ? "auto" : "none" }}
              >
                <div className="glass-card-strong rounded-2xl p-8 max-w-lg">
                  <p className="text-foreground text-base md:text-lg leading-relaxed mb-4 italic">"{t.text}"</p>
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-display font-bold text-foreground">{t.name[0]}</span>
                    </div>
                    <div className="text-left">
                      <span className="text-foreground text-sm font-medium block">{t.name}</span>
                      <span className="text-muted-foreground text-xs">{t.tag}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  activeTestimonial === i ? "bg-foreground w-6" : "bg-muted-foreground/30"
                )}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ─── WHY DIFFERENT ─── */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-2xl md:text-4xl font-display font-bold text-foreground text-center mb-14"
          >
            This isn't a course. <span className="text-silver">It's a system.</span>
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: Zap, title: "Structured, not random", desc: "Step-by-step playbooks that build on each other. No scrolling through tips you'll forget." },
              { icon: ScanFace, title: "AI-powered analysis", desc: "Face scanning, style simulation, and progress tracking that adapts to you." },
              { icon: Shield, title: "No BS, just results", desc: "No motivation speeches. No genetics cope. Only controllable, actionable improvements." },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card rounded-2xl p-7"
              >
                <div className="w-12 h-12 rounded-xl bg-muted/50 flex items-center justify-center mb-5">
                  <item.icon className="w-6 h-6 text-silver" />
                </div>
                <h3 className="font-display font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-6 tracking-tight">
              Your future self is waiting.
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
              Every day you wait is a day you could've been improving. Start now.
            </p>
            <button
              onClick={() => navigate("/membership")}
              className="btn-premium group inline-flex items-center gap-3 text-lg"
            >
              Start Your Transformation
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <div className="flex items-center justify-center gap-6 mt-8 text-muted-foreground text-sm">
              <span className="flex items-center gap-1.5"><Shield className="w-4 h-4" /> Cancel anytime</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {stats[0].value} members</span>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-silver/20 to-transparent" />
    </div>
  );
};

export default StarterPage;
