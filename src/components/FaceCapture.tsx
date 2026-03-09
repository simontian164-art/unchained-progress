import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";
import { cn } from "@/lib/utils";
import { Camera, X, Sun, RotateCcw, Check, ChevronRight } from "lucide-react";
import {
  averageLiveMetrics,
  calculateLiveSymmetryMetrics,
  type LiveSymmetryMetrics,
} from "@/lib/liveFaceMath";

type CaptureStep = "center" | "left" | "right" | "done";

const steps: { key: CaptureStep; label: string; instruction: string }[] = [
  { key: "center", label: "Front", instruction: "Look straight at the camera" },
  { key: "left", label: "Left", instruction: "Slowly turn your head left" },
  { key: "right", label: "Right", instruction: "Now turn your head right" },
];

export interface CaptureAnalysisSummary {
  detectorReady: boolean;
  analyzedFrames: number;
  avgMetrics: LiveSymmetryMetrics | null;
}

interface FaceCaptureProps {
  onCapture: (images: string[], summary: CaptureAnalysisSummary) => void;
  onClose: () => void;
}

const isStepAligned = (step: CaptureStep, metrics: LiveSymmetryMetrics | null) => {
  if (!metrics?.faceDetected) return false;

  if (step === "center") {
    return (
      metrics.confidence >= 46 &&
      metrics.centerDeviationPercent <= 14 &&
      metrics.eyeTiltDeg <= 10
    );
  }

  if (step === "left" || step === "right") {
    return metrics.confidence >= 24;
  }

  return true;
};

export function FaceCapture({ onCapture, onClose }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const isAnalyzingFrameRef = useRef(false);
  const frameHistoryRef = useRef<LiveSymmetryMetrics[]>([]);

  const [ready, setReady] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [captures, setCaptures] = useState<string[]>([]);
  const [stepMetrics, setStepMetrics] = useState<LiveSymmetryMetrics[]>([]);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [liveMetrics, setLiveMetrics] = useState<LiveSymmetryMetrics | null>(null);
  const [detectorLoading, setDetectorLoading] = useState(true);
  const [detectorFailed, setDetectorFailed] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setReady(false);
      setLiveMetrics(null);
      frameHistoryRef.current = [];

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch {
      setError("Camera access denied. Please allow camera permissions.");
    }
  }, [facingMode]);

  const initDetector = useCallback(async () => {
    setDetectorLoading(true);
    setDetectorFailed(false);

    try {
      if (tf.getBackend() !== "webgl") {
        await tf.setBackend("webgl");
      }
      await tf.ready();

      detectorRef.current?.dispose();
      detectorRef.current = await faceLandmarksDetection.createDetector(
        faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
        {
          runtime: "tfjs",
          refineLandmarks: true,
          maxFaces: 1,
        },
      );
    } catch {
      setDetectorFailed(true);
    } finally {
      setDetectorLoading(false);
    }
  }, []);

  useEffect(() => {
    void Promise.all([startCamera(), initDetector()]);

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      detectorRef.current?.dispose();
    };
  }, [initDetector, startCamera]);

  const analyzeCurrentFrame = useCallback(async () => {
    if (
      detectorFailed ||
      detectorLoading ||
      isAnalyzingFrameRef.current ||
      !videoRef.current ||
      !detectorRef.current ||
      videoRef.current.readyState < HTMLMediaElement.HAVE_CURRENT_DATA
    ) {
      return;
    }

    isAnalyzingFrameRef.current = true;

    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current, {
        flipHorizontal: facingMode === "user",
        staticImageMode: false,
      });

      const primaryFace = faces[0];
      const box = primaryFace?.box;
      const frameArea = videoRef.current.videoWidth * videoRef.current.videoHeight;
      const boxArea = Math.max((box?.width ?? 0) * (box?.height ?? 0), 0);
      const boxCoverage = frameArea > 0 ? boxArea / frameArea : 0;

      if (!primaryFace || primaryFace.keypoints.length < 300 || boxCoverage < 0.03 || boxCoverage > 0.92) {
        frameHistoryRef.current = [];
        setLiveMetrics(null);
        return;
      }

      const metrics = calculateLiveSymmetryMetrics(
        primaryFace.keypoints as Array<{ x: number; y: number }>,
      );

      if (!metrics.faceDetected || metrics.confidence < 10) {
        frameHistoryRef.current = [];
        setLiveMetrics(null);
        return;
      }

      const updatedHistory = [...frameHistoryRef.current.slice(-39), metrics];
      frameHistoryRef.current = updatedHistory;
      setLiveMetrics(averageLiveMetrics(updatedHistory.slice(-5)) ?? metrics);
    } catch {
      frameHistoryRef.current = [];
      setLiveMetrics(null);
    } finally {
      isAnalyzingFrameRef.current = false;
    }
  }, [detectorFailed, detectorLoading, facingMode]);

  useEffect(() => {
    if (!ready || detectorLoading || detectorFailed || !detectorRef.current) return;

    const interval = window.setInterval(() => {
      void analyzeCurrentFrame();
    }, 220);

    return () => window.clearInterval(interval);
  }, [analyzeCurrentFrame, detectorFailed, detectorLoading, ready]);

  const buildSummary = (capturedStepMetrics: LiveSymmetryMetrics[]): CaptureAnalysisSummary => ({
    detectorReady: !detectorLoading && !detectorFailed,
    analyzedFrames: frameHistoryRef.current.length,
    avgMetrics: averageLiveMetrics(capturedStepMetrics),
  });

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    if (!detectorLoading && !detectorFailed && !liveMetrics?.faceDetected) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = Math.min(video.videoWidth, video.videoHeight);
    canvas.width = size;
    canvas.height = size;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sx = (video.videoWidth - size) / 2;
    const sy = (video.videoHeight - size) / 2;

    if (facingMode === "user") {
      ctx.translate(size, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

    ctx.globalCompositeOperation = "screen";
    ctx.fillStyle = "rgba(255,255,255,0.06)";
    ctx.fillRect(0, 0, size, size);
    ctx.globalCompositeOperation = "source-over";

    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setFlash(true);
    setTimeout(() => setFlash(false), 200);

    const captureMetrics = averageLiveMetrics(frameHistoryRef.current.slice(-8));
    const nextStepMetrics = captureMetrics ? [...stepMetrics, captureMetrics] : stepMetrics;
    const newCaptures = [...captures, dataUrl];

    setCaptures(newCaptures);
    setStepMetrics(nextStepMetrics);

    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    onCapture(newCaptures, buildSummary(nextStepMetrics));
  };

  const handleRetake = () => {
    setCaptures([]);
    setStepMetrics([]);
    setCurrentStep(0);
    setLiveMetrics(null);
    frameHistoryRef.current = [];
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
      >
        <Camera className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-foreground text-center font-medium mb-2">Camera Unavailable</p>
        <p className="text-muted-foreground text-sm text-center mb-6">{error}</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-card border border-border text-foreground text-sm font-medium"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  const step = steps[currentStep];
  const captureDisabled =
    !ready || (!detectorLoading && !detectorFailed && !liveMetrics?.faceDetected);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      <canvas ref={canvasRef} className="hidden" />

      <div className="relative z-10 flex items-center justify-between p-4 pt-6">
        <button
          onClick={onClose}
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
        >
          <X className="h-5 w-5 text-white" />
        </button>
        <div className="flex items-center gap-1.5">
          <Sun className="h-4 w-4 text-amber-400" />
          <span className="text-white/70 text-xs font-medium">Brightness boosted</span>
        </div>
        <button
          onClick={() => setFacingMode((mode) => (mode === "user" ? "environment" : "user"))}
          className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center"
        >
          <RotateCcw className="h-4 w-4 text-white" />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn(
            "absolute inset-0 w-full h-full object-cover",
            facingMode === "user" && "scale-x-[-1]",
            "brightness-[1.1] contrast-[1.02]",
          )}
        />

        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <svg className="absolute inset-0 w-full h-full">
            <defs>
              <mask id="faceMask">
                <rect width="100%" height="100%" fill="white" />
                <ellipse cx="50%" cy="48%" rx="120" ry="160" fill="black" />
              </mask>
              <linearGradient id="guideGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" fill="rgba(0,0,0,0.6)" mask="url(#faceMask)" />
            <ellipse
              cx="50%"
              cy="48%"
              rx="120"
              ry="160"
              fill="none"
              stroke="url(#guideGrad2)"
              strokeWidth="2.5"
              strokeDasharray="16 8"
            />
            <ellipse
              cx="50%"
              cy="48%"
              rx="118"
              ry="158"
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth="1"
            />
          </svg>

          <div
            className="absolute"
            style={{ top: "calc(48% + 160px)", left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="w-4 h-[2px] bg-white/20 rounded-full" />
          </div>
          <div
            className="absolute"
            style={{ top: "calc(48% - 160px)", left: "50%", transform: "translateX(-50%)" }}
          >
            <div className="w-4 h-[2px] bg-white/20 rounded-full" />
          </div>
        </div>

        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-white z-20"
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative z-10 pb-8 pt-4 px-6 bg-gradient-to-t from-black via-black/80 to-transparent">
        <div className="flex items-center justify-center gap-2 mb-3">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  i < currentStep
                    ? "bg-emerald-500 text-white"
                    : i === currentStep
                      ? "bg-gradient-to-br from-violet-500 to-pink-500 text-white scale-110"
                      : "bg-white/10 text-white/40",
                )}
              >
                {i < captures.length ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <ChevronRight
                  className={cn("h-3 w-3", i < currentStep ? "text-emerald-500" : "text-white/20")}
                />
              )}
            </div>
          ))}
        </div>

        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5"
        >
          <p className="text-white font-display font-bold text-base">{step?.label} View</p>
          <p className="text-white/50 text-sm">{step?.instruction}</p>
        </motion.div>

        <div className="mx-auto mb-4 w-full max-w-sm rounded-xl bg-white/10 border border-white/10 px-3 py-2.5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-[11px] text-white/70">
            <span>
              {detectorLoading
                ? "Starting live math…"
                : detectorFailed
                  ? "Live detector unavailable"
                  : liveMetrics?.faceDetected
                    ? "Face detected"
                    : "No face detected"}
            </span>
            <span>
              {liveMetrics?.faceDetected
                ? `${liveMetrics.symmetryScore.toFixed(1)} symmetry`
                : detectorFailed
                  ? "Capture without live score"
                  : "Align face with guide"}
            </span>
          </div>
          {liveMetrics?.faceDetected && (
            <div className="mt-2 grid grid-cols-3 gap-2 text-[10px] text-white/80">
              <div className="rounded-md bg-white/5 p-2 text-center">
                <p className="text-white/50">Midline</p>
                <p className="font-semibold">{liveMetrics.centerDeviationPercent.toFixed(2)}%</p>
              </div>
              <div className="rounded-md bg-white/5 p-2 text-center">
                <p className="text-white/50">Eye tilt</p>
                <p className="font-semibold">{liveMetrics.eyeTiltDeg.toFixed(2)}°</p>
              </div>
              <div className="rounded-md bg-white/5 p-2 text-center">
                <p className="text-white/50">Jaw balance</p>
                <p className="font-semibold">{liveMetrics.jawBalancePercent.toFixed(2)}%</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center gap-4 mb-5">
          {[
            detectorFailed ? "Detector fallback" : "Live math on",
            "Good lighting",
            "Neutral face",
          ].map((tip) => (
            <span key={tip} className="text-[10px] text-white/30 bg-white/5 px-2.5 py-1 rounded-full">
              {tip}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-center gap-6">
          {captures.length > 0 && (
            <button onClick={handleRetake} className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
              <RotateCcw className="h-5 w-5 text-white/70" />
            </button>
          )}
          <button
            onClick={takePhoto}
            disabled={captureDisabled}
            className="h-[72px] w-[72px] rounded-full border-[3px] border-white/80 flex items-center justify-center active:scale-90 transition-transform disabled:opacity-30"
          >
            <div className="h-[58px] w-[58px] rounded-full bg-white" />
          </button>
          <div className="w-12" />
        </div>
      </div>
    </motion.div>
  );
}
