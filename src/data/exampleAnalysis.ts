/**
 * Sample content for the marketing "Example analysis".
 * This is illustrative — it is always labelled "Example" in the UI and is not
 * the output of a real user's analysis.
 */

export type Priority = "High impact" | "Medium impact" | "Quick win";

export interface FocusArea {
  id: string;
  area: "Face" | "Skin" | "Hair" | "Grooming" | "Style" | "Physique";
  observation: string;
  recommendation: string;
  steps: string[];
  priority: Priority;
  effort: string;
}

export const EXAMPLE_PROFILE = {
  label: "Example profile",
  age: 27,
  goal: "Look sharper and more put-together for work and dating",
  photos: ["Front", "Side", "Full body"],
  routine: "Washes face with body wash, no sunscreen, haircut every ~3 months",
};

export const EXAMPLE_STRENGTHS = [
  "Clear, well-defined brow line",
  "Balanced proportions across forehead, mid-face and jaw",
  "Even skin tone overall",
  "Naturally broad shoulders, easy to dress well",
];

export const EXAMPLE_FOCUS_AREAS: FocusArea[] = [
  {
    id: "hair",
    area: "Hair",
    observation: "The sides have grown out, which adds width at the temples and hides the jawline.",
    recommendation: "Shorter, tapered sides with texture on top.",
    steps: [
      "Ask for a textured crop: #2–3 taper on the sides, 1.5–2 in. on top",
      "Rebook every 4–5 weeks to keep the shape",
      "Matte clay, pea-sized, worked in on towel-dried hair",
    ],
    priority: "High impact",
    effort: "One appointment",
  },
  {
    id: "skin",
    area: "Skin",
    observation: "Visible shine across the T-zone and some uneven texture on the cheeks.",
    recommendation: "A simple 3-step routine with daily sunscreen.",
    steps: [
      "AM: gentle gel cleanser → lightweight moisturizer → SPF 30+",
      "PM: cleanser → niacinamide serum → moisturizer",
      "Swap body wash for a face cleanser",
    ],
    priority: "High impact",
    effort: "5 min / day",
  },
  {
    id: "grooming",
    area: "Grooming",
    observation: "Stubble has no defined neckline and a few stray hairs sit between the brows.",
    recommendation: "Keep 3–5 mm stubble with a clean neckline; tidy the brows.",
    steps: [
      "Neckline: two fingers above the Adam's apple, faded below",
      "Trim cheek line to follow the natural growth, don't raise it",
      "Tweeze only between the brows and leave the shape alone",
    ],
    priority: "Quick win",
    effort: "10 min / week",
  },
  {
    id: "style",
    area: "Style",
    observation: "Tops fit loose through the shoulders and body, which hides your frame.",
    recommendation: "Size for the shoulders, then taper; build around 3 core colors.",
    steps: [
      "Shoulder seam should sit at the edge of the shoulder",
      "Core palette: navy, olive and charcoal suit your coloring",
      "Start with 3 fitted tees, 1 overshirt, 1 pair of tapered chinos",
    ],
    priority: "Medium impact",
    effort: "One shopping trip",
  },
  {
    id: "physique",
    area: "Physique",
    observation: "The side photo shows the head sitting slightly forward of the shoulders.",
    recommendation: "A short posture routine alongside your usual training.",
    steps: [
      "Chin tucks: 3 × 10, daily",
      "Wall angels: 3 × 12, three times a week",
      "Face pulls or band pull-aparts in upper-body sessions",
    ],
    priority: "Medium impact",
    effort: "8 min / day",
  },
];

export const EXAMPLE_FACE_NOTES = [
  { label: "Face shape", value: "Oval, slightly square jaw" },
  { label: "Best hairstyle direction", value: "Short sides, volume on top" },
  { label: "Beard", value: "Short stubble frames the jaw" },
  { label: "Glasses frames", value: "Rectangular or browline" },
];

// Mirrors the real plan's horizons (Today ≤ 3 → This week → This month → Later).
export const EXAMPLE_ROADMAP = [
  { phase: "Today", title: "Three quick starts", tasks: ["Book your haircut with the barber card", "Set the stubble neckline", "Sunscreen tomorrow morning"] },
  { phase: "This week", title: "Foundations", tasks: ["Start the AM/PM skin routine", "Tidy brows", "Edit your closet"] },
  { phase: "This month", title: "Build habits", tasks: ["Posture routine 3–4× a week", "First check-in photo", "Tailor one pair of trousers"] },
  { phase: "Later", title: "Review", tasks: ["Re-analyze after 14+ days", "Review your skin active at 8–12 weeks", "Fill wardrobe gaps only"] },
];

/** Example weekly habit completion — progress is tracked on actions, not looks ratings. */
export const EXAMPLE_PROGRESS = [
  { week: "W1", completed: 9, planned: 14 },
  { week: "W2", completed: 11, planned: 14 },
  { week: "W3", completed: 12, planned: 14 },
  { week: "W4", completed: 13, planned: 14 },
  { week: "W5", completed: 12, planned: 14 },
  { week: "W6", completed: 14, planned: 14 },
];
