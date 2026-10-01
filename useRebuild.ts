import { useCallback } from "react";
import { useApp } from "./store";
import { analyze } from "./engine/analyze";
import type { Feedback, Profile } from "./types";

/** Minimum days between photo re-analyses. Frequent re-scans show lighting changes, not real ones. */
export const REANALYZE_DAYS = 14;
/** Longer spacing when appearance worries take up a lot of someone's day. */
export const reanalyzeDays = (worry?: Profile["worry"]) => (worry === "often" ? 28 : REANALYZE_DAYS);

export const daysSince = (iso?: string) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / 86400000) : Infinity);

/** Rebuild the plan from new answers, reusing the latest photo results (no new scan needed). */
export function useRebuild() {
  const { state, latest, saveProfile, addAnalysis } = useApp();
  return useCallback(
    (profile: Profile, feedback?: Record<string, Feedback>) => {
      saveProfile(profile);
      if (!latest) return;
      const { analysis, tasks } = analyze({
        profile,
        faceShape: latest.faceShape,
        faceShapeSource: latest.faceShapeSource,
        measurements: latest.measurements,
        cues: latest.cues,
        photoChecks: latest.photoChecks,
        photoSlots: state.photos.map((p) => p.slot),
        feedback: feedback ?? state.feedback,
      });
      // Keep the original date so re-analysis spacing is based on photos, not answers.
      addAnalysis({ ...analysis, createdAt: latest.createdAt }, tasks);
    },
    [latest, saveProfile, addAnalysis, state.photos, state.feedback],
  );
}
