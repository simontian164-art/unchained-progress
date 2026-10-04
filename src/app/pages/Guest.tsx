import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../store";
import { analyze } from "../engine/analyze";
import type { Profile } from "../types";

/** Sample answers for the guest preview: lets visitors explore the app with no sign-up or photos. */
const GUEST: Profile = {
  name: "Guest",
  goal: "overall", age: "25-34", presentation: "masculine", country: "CA", maintenance: "medium", proOpen: "maybe", worry: "skip",
  skinType: "combination", skinConcerns: [], sensitive: false, routine: "basic", usesSpf: true, sunReaction: "sometimes", allergies: [],
  hairType: "wavy", hairDensity: "medium", hairLength: "short", hairConcerns: [], hairlineShape: "straight", hairlineChange: "no",
  lastCut: "4-8w", sides: "medium", cutHappy: "mostly", hairHabits: [],
  facialHair: "full", beardPref: "open", brows: [], glasses: false, teeth: [], floss: "sometimes",
  vibe: "clean-casual", budget: "mid", fitIssues: [], contrast: "medium", undertone: "neutral", build: "skip", height: "skip", dressCode: "skip",
  training: "1-2", bodyGoal: "maintain", sleep: "6-7",
  natural: "mix", fragranceFree: false, vegan: false, crueltyFree: false, shopping: "both", owned: ["moisturizer", "sunscreen"],
};

const Guest = () => {
  const { state, saveProfile, addAnalysis } = useApp();
  const navigate = useNavigate();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!state.analyses.length) {
      saveProfile(GUEST);
      const { analysis, tasks } = analyze({ profile: GUEST, faceShape: "oval", faceShapeSource: "chosen", photoChecks: [], photoSlots: [], feedback: state.feedback });
      addAnalysis(analysis, tasks);
    }
    navigate("/app", { replace: true });
  }, [state, saveProfile, addAnalysis, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background" role="status">
      <p className="text-sm text-muted-foreground">Opening the guest preview…</p>
    </div>
  );
};

export default Guest;
