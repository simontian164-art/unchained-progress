import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, VolumeX, SkipForward } from "lucide-react";

const slideTexts = [
  { text: "Your transformation", sub: "starts now." },
  { text: "Face. Body. Style.", sub: "Mind. Money. Presence." },
  { text: "Every system.", sub: "One platform." },
  { text: "Welcome to", sub: "the machine." },
];

const buildSlides = (totalDuration: number) => {
  const slideDuration = totalDuration / slideTexts.length;
  return slideTexts.map((s, i) => ({
    ...s,
    delay: i * slideDuration,
    duration: slideDuration,
  }));
};

const IntroPage = () => {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  const [videoDuration, setVideoDuration] = useState(14000);
  const slides = buildSlides(videoDuration);

  const skip = useCallback(() => {
    navigate("/onboarding", { replace: true });
  }, [navigate]);

  // Sync duration to video length
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onMeta = () => {
      if (video.duration && isFinite(video.duration)) {
        setVideoDuration(video.duration * 1000);
      }
    };
    if (video.duration && isFinite(video.duration)) {
      setVideoDuration(video.duration * 1000);
    }
    video.addEventListener("loadedmetadata", onMeta);
    return () => video.removeEventListener("loadedmetadata", onMeta);
  }, []);

  useEffect(() => {
    const startTime = Date.now();

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setProgress(Math.min((elapsed / videoDuration) * 100, 100));

      const slideIndex = slides.findIndex(
        (s) => elapsed >= s.delay && elapsed < s.delay + s.duration
      );
      if (slideIndex >= 0) setCurrentSlide(slideIndex);
    }, 50);

    const timeout = setTimeout(skip, videoDuration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [skip, videoDuration, slides]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden">
      {/* Background video */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          ref={videoRef}
          src="/intro-bg.mp4"
          autoPlay
          
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-background/60" />
        <div className="absolute inset-0 gradient-mesh opacity-30" />
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 30% 50%, hsl(var(--gold) / 0.08) 0%, transparent 60%)",
              "radial-gradient(circle at 70% 50%, hsl(var(--gold) / 0.12) 0%, transparent 60%)",
              "radial-gradient(circle at 50% 30%, hsl(var(--gold) / 0.08) 0%, transparent 60%)",
            ],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Scan lines */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, hsl(var(--foreground) / 0.1) 2px, hsl(var(--foreground) / 0.1) 4px)",
          }}
        />
      </div>

      {/* Center content */}
      <div className="relative z-10 text-center px-6 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="space-y-2"
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-foreground tracking-tight leading-none">
              {slides[currentSlide].text}
            </h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-5xl lg:text-6xl font-display font-bold text-gold tracking-tight leading-none"
            >
              {slides[currentSlide].sub}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Particle dots */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold/30"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 0.6, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-border/20">
        <motion.div
          className="h-full bg-gradient-to-r from-gold to-gold-dim"
          style={{ width: `${progress}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>

      {/* Skip button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={skip}
        className="absolute bottom-8 right-8 flex items-center gap-2 px-4 py-2 rounded-full glass-card text-muted-foreground hover:text-foreground transition-colors text-sm font-display"
      >
        Skip
        <SkipForward className="w-3.5 h-3.5" />
      </motion.button>

      {/* Mute/Unmute button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => {
          setIsMuted(!isMuted);
          if (videoRef.current) videoRef.current.muted = !isMuted;
        }}
        className="absolute top-8 right-8 p-3 rounded-full glass-card text-muted-foreground hover:text-foreground transition-colors"
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </motion.button>

      {/* Slide indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <div
            key={i}
            className={`w-8 h-1 rounded-full transition-all duration-500 ${
              i === currentSlide
                ? "bg-gold"
                : i < currentSlide
                ? "bg-foreground/20"
                : "bg-border/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default IntroPage;
