/**
 * Member-app data model (v2). Everything is stored in the browser until accounts exist.
 * Principle: separate what we SEE (observations), what we SUGGEST (recommendations, by type),
 * and what needs a PROFESSIONAL. No numeric attractiveness scores anywhere.
 */

// ─── Profile ──────────────────────────────────────────────────────
export type Goal = "work" | "dating" | "event" | "overall" | "confidence";
export type AgeRange = "18-24" | "25-34" | "35-44" | "45+";
export type StylePresentation = "masculine" | "feminine" | "neutral";
export type Country = "CA" | "US" | "UK" | "AU" | "IE" | "NZ" | "OTHER";
export type Level3 = "low" | "medium" | "high";

export type SkinType = "oily" | "dry" | "combination" | "normal" | "unsure";
export type SkinConcern =
  | "breakouts"
  | "dark-spots"
  | "texture"
  | "redness"
  | "dryness"
  | "fine-lines"
  | "dark-circles"
  | "puffiness"
  | "razor-bumps";
export type RoutineLevel = "none" | "basic" | "full";
/** Fitzpatrick-style proxy, self-reported. Used for sunscreen and dark-mark guidance, never for "ideals". */
export type SunReaction = "burns" | "sometimes" | "rarely";
export type Allergy =
  | "fragrance"
  | "essential-oils"
  | "lanolin"
  | "salicylates"
  | "benzoyl-peroxide"
  | "nickel"
  | "sunscreen-filters";

export type HairType = "straight" | "wavy" | "curly" | "coily";
export type HairDensity = "thick" | "medium" | "fine";
export type HairLength = "short" | "medium" | "long";
export type HairConcern = "thinning" | "frizz" | "flat" | "oily-scalp" | "dandruff" | "cowlick" | "sensitive-scalp";
/** When the user first noticed a hairline/density change. Used to pick an approach, never to diagnose. */
export type HairlineSince = "none" | "<6m" | "6-12m" | "1-3y" | "3y+" | "unsure";
export type HairHabit = "tight-styles" | "chemical" | "heat" | "concealers";
export type CutHappy = "yes" | "mostly" | "no";
export type HairlineShape = "straight" | "rounded" | "m-shape" | "uneven" | "unsure";
export type YesNoUnsure = "yes" | "no" | "unsure";
export type LastCut = "under-4w" | "4-8w" | "8w-plus";
export type Sides = "tight" | "medium" | "full";
export type FacialHair = "none" | "patchy" | "full" | "not-applicable";
export type BeardPref = "clean" | "stubble" | "beard" | "open";
export type BrowConcern = "sparse" | "unruly" | "unibrow" | "uneven";
export type TeethConcern = "staining" | "sensitivity" | "alignment" | "gums" | "whiter";
export type Floss = "daily" | "sometimes" | "rarely";

export type StyleVibe = "clean-casual" | "smart" | "classic" | "street" | "minimal" | "athletic" | "rugged" | "unsure";
export type Budget = "low" | "mid" | "high";
export type FitIssue = "tops-loose" | "tops-tight" | "pants-long" | "pants-baggy";
export type Contrast = "high" | "medium" | "low";
export type Undertone = "cool" | "warm" | "neutral" | "unsure";
export type Build = "slim" | "average" | "broad" | "heavier" | "skip";
export type Height = "shorter" | "average" | "taller" | "skip";

export type TrainingFreq = "0" | "1-2" | "3-4" | "5+";
export type BodyGoal = "leaner" | "build" | "posture" | "maintain" | "skip";
export type Sleep = "<6" | "6-7" | "7-9" | "9+";

export type Natural = "prefer" | "mix" | "none";
export type Shopping = "local" | "online" | "both";
export type Worry = "rarely" | "sometimes" | "often" | "skip";
export type DressCode = "casual" | "smart" | "formal" | "uniform" | "skip";
export type GlassesRx = "mild" | "strong" | "unsure";
/** Products the user already uses. Stops the plan from telling them to buy what they own. */
export type OwnedProduct =
  | "cleanser"
  | "moisturizer"
  | "sunscreen"
  | "retinoid"
  | "exfoliating-acid"
  | "benzoyl-peroxide"
  | "azelaic"
  | "vitamin-c"
  | "niacinamide"
  | "anti-dandruff"
  | "hair-product"
  | "trimmer";

export interface Profile {
  name?: string;
  goal: Goal;
  age: AgeRange;
  presentation: StylePresentation;
  country: Country;
  /** Optional postcode / city, only used to build map searches. */
  area?: string;
  maintenance: Level3;
  proOpen: "yes" | "maybe" | "no";
  worry: Worry;

  skinType: SkinType;
  skinConcerns: SkinConcern[];
  sensitive: boolean;
  routine: RoutineLevel;
  usesSpf: boolean;
  sunReaction: SunReaction;
  allergies: Allergy[];

  hairType: HairType;
  hairDensity: HairDensity;
  hairLength: HairLength;
  hairConcerns: HairConcern[];
  hairlineShape: HairlineShape;
  hairlineChange: YesNoUnsure;
  lastCut: LastCut;
  sides: Sides;
  /** Optional follow-ups (older saved profiles won't have them). */
  cutHappy?: CutHappy;
  hairlineSince?: HairlineSince;
  shedding?: YesNoUnsure;
  familyHistory?: YesNoUnsure | "skip";
  hairHabits?: HairHabit[];

  facialHair: FacialHair;
  beardPref: BeardPref;
  brows: BrowConcern[];
  glasses: boolean;
  glassesRx?: GlassesRx;
  teeth: TeethConcern[];
  floss: Floss;

  vibe: StyleVibe;
  budget: Budget;
  fitIssues: FitIssue[];
  contrast: Contrast;
  undertone: Undertone;
  build: Build;
  height: Height;
  dressCode?: DressCode;

  training: TrainingFreq;
  bodyGoal: BodyGoal;
  sleep: Sleep;

  natural: Natural;
  fragranceFree: boolean;
  vegan: boolean;
  crueltyFree: boolean;
  shopping: Shopping;
  owned?: OwnedProduct[];
  /** "I usually dislike how I look in photos." Routes to photo basics before appearance changes. */
  photoDislike?: boolean;
}

// ─── Photos ───────────────────────────────────────────────────────
export type PhotoSlot = "front" | "left" | "right" | "hairline" | "crown" | "smile" | "body";

export interface StoredPhoto {
  slot: PhotoSlot;
  dataUrl: string;
  takenAt: string;
}

export interface FaceMeasurements {
  lengthToWidth: number;
  foreheadToCheek: number;
  jawToCheek: number;
  chinTaper: number;
}

/** Cautious, photo-derived cues. Every one is lighting/angle dependent and shown with that caveat. */
export interface PhotoCues {
  /** lower face (nose base → chin) ÷ mid face (brows → nose base) */
  lowerToMid?: number;
  /** vertical brow-height difference ÷ eye distance */
  browDiff?: number;
  /** under-eye brightness ÷ cheek brightness (same photo) */
  underEyeRatio?: number;
  mouthOpen?: boolean;
}

export interface PhotoCheck {
  id: "face" | "light" | "sharp" | "angle" | "distance" | "resolution" | "expression";
  ok: boolean;
  label: string;
  tip?: string;
}

// ─── Analysis ─────────────────────────────────────────────────────
export type FaceShape = "oval" | "round" | "square" | "oblong" | "heart" | "diamond";
export type ModuleId = "face" | "hair" | "beard" | "skin" | "eyes" | "smile" | "style" | "body";
export type Status = "strong" | "opportunity" | "priority";
export type RecKind = "home" | "lifestyle" | "product" | "barber" | "professional";
export type Cost = "free" | "$" | "$$" | "$$$";
export type Timeframe = "immediate" | "weeks" | "months";
export type Horizon = "today" | "week" | "month" | "later";

export interface Observation {
  text: string;
  source: "photo" | "answers" | "both";
  caveat?: string;
}

export interface Rec {
  id: string;
  module: ModuleId;
  title: string;
  detail: string;
  steps: string[];
  kind: RecKind;
  impact: Level3;
  effort: Level3;
  cost: Cost;
  timeframe: Timeframe;
  shopIds?: string[];
  /** "Why this is in your plan": the specific answers/inputs that produced it. */
  why?: string[];
  /** What it's based on. Photo-only cues are the least reliable and carry the least weight. */
  basis?: "answers" | "answers+photo" | "photo" | "general";
  /** The specific option behind the rec (e.g. a haircut id), so "not for me" can target it. */
  ref?: string;
}

/** Something the user already does well: shown as "no change needed" instead of a task. */
export interface KeepItem {
  id: string;
  module: ModuleId;
  title: string;
  why: string;
}

export type NotForMeReason = "expensive" | "maintenance" | "style" | "tried" | "own" | "goals" | "other";
export interface Feedback {
  verdict: "helpful" | "not";
  reason?: NotForMeReason;
  /** e.g. the haircut id that was rejected */
  ref?: string;
  at: string;
}

export type HairlineApproach = "style" | "track" | "care" | "pro";
export interface HairlinePlan {
  approach: HairlineApproach[];
  reasons: string[];
  steps: string[];
}

export type HairlineAngle = "front" | "left-temple" | "right-temple" | "top" | "crown";
export interface HairlineSet {
  id: string;
  date: string;
  photos: Partial<Record<HairlineAngle, string>>;
  /** conditions the user confirmed when taking this set */
  conditions: string[];
}

export interface ModuleResult {
  id: ModuleId;
  title: string;
  status: Status;
  summary: string;
  working: string[];
  observations: Observation[];
  recIds: string[];
  pro?: string[];
  notes?: string[];
}

export interface BarberSpec {
  cutName: string;
  sides: string;
  top: string;
  fringe: string;
  neckline: string;
  sideburns: string;
  temples: string;
  texture: string;
  finish: string;
  avoid: string[];
  rebook: string;
}

export interface HaircutOption {
  slot: "best" | "low" | "shorter" | "longer" | "careful";
  id: string;
  name: string;
  why: string[];
  maintenance: string;
  styling: string[];
  spec: BarberSpec;
}

export interface BeardOption {
  id: string;
  name: string;
  length: string;
  fit: "best" | "good" | "careful";
  why: string;
}

export interface BeardPlan {
  options: BeardOption[];
  neckline: string;
  cheekLine: string;
  moustache: string;
  sideburns: string;
  maintenance: string[];
}

export interface RoutineStep {
  id: string;
  label: string;
  detail?: string;
  shopId?: string;
}

export interface ShopItem {
  id: string;
  group: "essentials" | "optional" | "grooming" | "style";
  name: string;
  purpose: string;
  replaces?: string;
  how: string;
  when: string;
  frequency: string;
  avoidWith?: string[];
  ingredients?: { name: string; role: string }[];
  /** Rough estimate in local currency. Always labelled as an estimate. */
  price: [number, number];
  cheaper?: string;
  preferenceNote?: string;
  examples?: string[];
  flags: string[];
  localQuery?: string;
  onlineQuery: string;
  freeFirst?: string;
  moduleId: ModuleId;
  /** The user said they already own this. Excluded from totals. */
  owned?: boolean;
}

export interface ProNote {
  who: "dermatologist" | "hair-loss" | "dentist" | "orthodontist" | "doctor" | "barber" | "stylist" | "tailor" | "therapist" | "optician";
  when: string;
  mapQuery?: string;
  /** Questions worth asking, so the user arrives prepared. */
  ask?: string[];
  /** What to bring: the user's own reported history, never a diagnosis. */
  bring?: string[];
}

export interface Analysis {
  version: 2;
  id: string;
  createdAt: string;
  faceShape: FaceShape;
  faceShapeSource: "measured" | "chosen";
  measurements?: FaceMeasurements;
  cues?: PhotoCues;
  photoChecks: PhotoCheck[];
  working: string[];
  modules: ModuleResult[];
  recs: Rec[];
  top3: string[];
  haircuts: HaircutOption[];
  beard?: BeardPlan;
  routine: { am: RoutineStep[]; pm: RoutineStep[]; weekly: RoutineStep[] };
  shop: ShopItem[];
  pros: ProNote[];
  wellbeing?: string;
  /** Things that don't need changing. */
  keep?: KeepItem[];
  hairline?: HairlinePlan;
  /** Recs the user marked "not for me", kept so they can be restored. */
  hidden?: { id: string; title: string; reason?: NotForMeReason }[];
  /** Shorter, calmer plan (set when appearance worries take up a lot of the user's day). */
  light?: boolean;
}

export interface Task {
  id: string;
  title: string;
  module: ModuleId;
  horizon: Horizon;
  done: boolean;
  /** Local date (YYYY-MM-DD) it was ticked off. Powers weekly XP and "biggest win". */
  doneOn?: string;
}

export interface CheckIn {
  id: string;
  date: string;
  photo?: string;
  note?: string;
}

export interface AppState {
  version: 2;
  profile?: Profile;
  photos: StoredPhoto[];
  analyses: Analysis[];
  tasks: Task[];
  routineLog: Record<string, string[]>;
  checkIns: CheckIn[];
  planStartedAt?: string;
  feedback?: Record<string, Feedback>;
  hairlineSets?: HairlineSet[];
}
