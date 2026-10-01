// Sample plan content for the member preview. No real analysis behind it.
export type Category = "beard" | "hair" | "face" | "skin" | "smile" | "style" | "body" | "eyes";

export const categoryMeta: Record<Category, { label: string; text: string; border: string }> = {
  beard: { label: "Facial hair", text: "text-cat-beard", border: "border-l-cat-beard" },
  hair: { label: "Hair", text: "text-cat-hair", border: "border-l-cat-hair" },
  face: { label: "Face", text: "text-cat-face", border: "border-l-cat-face" },
  skin: { label: "Skin", text: "text-cat-skin", border: "border-l-cat-skin" },
  smile: { label: "Smile", text: "text-cat-smile", border: "border-l-cat-smile" },
  style: { label: "Style", text: "text-cat-style", border: "border-l-cat-style" },
  body: { label: "Body", text: "text-cat-body", border: "border-l-cat-body" },
  eyes: { label: "Eyes & brows", text: "text-cat-eyes", border: "border-l-cat-eyes" },
};

export interface Action {
  id: string;
  cat: Category;
  title: string;
  desc: string;
  where: "At home" | "Barber / stylist" | "Product";
  bigImpact?: boolean;
  free?: boolean;
  cost?: string;
  when: "Instant" | "Shows in weeks" | "Shows in months";
  bucket: "today" | "month" | "later";
  steps: string[];
  why?: string;
}

export const actions: Action[] = [
  { id: "a1", cat: "beard", title: "Shape it as heavy stubble (3–5 mm)", desc: "Frames the jaw with little maintenance.", where: "At home", bigImpact: true, cost: "$", when: "Instant", bucket: "today",
    steps: ["Set your trimmer to 4 mm and go over the whole beard.", "Clean the neckline one finger above your Adam's apple.", "Keep cheek lines natural; just remove strays."], why: "You have full growth, and short stubble adds jaw definition in photos." },
  { id: "a2", cat: "hair", title: "New haircut: textured crop with a fringe", desc: "Oval face: easy, modern and suits balanced proportions. Works with curly hair and medium density.", where: "Barber / stylist", bigImpact: true, cost: "$", when: "Instant", bucket: "today",
    steps: ["Ask for a low taper on the sides.", "Keep 4–6 cm on top, point-cut for texture.", "Leave a short, choppy fringe."], why: "Oval faces suit most cuts; texture works with your curl pattern." },
  { id: "a3", cat: "face", title: "Fix the photo setup before changing anything", desc: "Most 'I look bad in photos' comes from the camera, not your face: close-up wide lenses, overhead light, and seeing yourself un-mirrored.", where: "At home", bigImpact: true, free: true, when: "Instant", bucket: "today",
    steps: ["Stand facing a window, not under a ceiling light.", "Hold the phone at eye level, at arm's length or further.", "Use the 2x lens if you have one."], why: "Wide lenses up close distort the nose and face shape." },
  { id: "a4", cat: "hair", title: "Style with matte clay", desc: "Holds the shape of your cut without looking greasy.", where: "Product", cost: "$", when: "Shows in weeks", bucket: "month",
    steps: ["Towel-dry hair until damp.", "Warm a pea-sized amount in your palms.", "Work it in from the back forward, then shape with fingers."] },
  { id: "a5", cat: "hair", title: "Ease tension and heat on your hairline", desc: "Changing how hair is styled is the part of hairline care you control.", where: "At home", free: true, when: "Shows in months", bucket: "month",
    steps: ["Avoid tight hats and pulling styles for long periods.", "Use low heat when drying."] },
  { id: "a6", cat: "hair", title: "Start a hairline photo set", desc: "Five controlled photos now, then at 8 weeks, 12 weeks and 6 months. The mirror and random selfies can't show slow change reliably.", where: "At home", free: true, when: "Shows in months", bucket: "month",
    steps: ["Same room, same light, same time of day.", "Front, top, left temple, right temple, crown."] },
  { id: "a7", cat: "skin", title: "Round out your basics", desc: "Cleanse, moisturize, and keep up your sunscreen. Consistency for 8 weeks matters more than product count.", where: "Product", cost: "$", when: "Shows in weeks", bucket: "month",
    steps: ["Gentle cleanser at night only.", "Moisturizer morning and night.", "SPF 30+ every morning."] },
  { id: "a8", cat: "smile", title: "Floss daily for 4 weeks", desc: "Healthier gums make teeth look brighter in photos.", where: "Product", cost: "$", when: "Shows in weeks", bucket: "month",
    steps: ["Floss before brushing at night.", "Be gentle; bleeding usually stops within 2 weeks."] },
  { id: "a9", cat: "style", title: "Edit your closet first", desc: "Remove anything that doesn't fit before buying anything new.", where: "At home", free: true, when: "Instant", bucket: "later",
    steps: ["Try on everything you wore in the last 3 months.", "Keep what fits at the shoulders.", "Note the gaps."] },
  { id: "a10", cat: "body", title: "Posture: stack ears over shoulders", desc: "A two-minute daily reset makes you look taller and more confident.", where: "At home", free: true, when: "Shows in weeks", bucket: "later",
    steps: ["Wall stand: heels, back and head touching for 60 seconds.", "Chin tucks: 10 slow reps."] },
  { id: "a11", cat: "eyes", title: "Hands off your brows", desc: "You're happy with them; over-grooming is the most common brow mistake.", where: "At home", free: true, when: "Instant", bucket: "later",
    steps: ["Only remove obvious strays between the brows."] },
];

export const routine = {
  morning: [
    { id: "m1", title: "Rinse with water", note: "Cleanser only at night" },
    { id: "m2", title: "Moisturize", note: "Keep using yours" },
    { id: "m3", title: "Sunscreen SPF 30+", note: "Keep using yours" },
  ],
  evening: [
    { id: "e1", title: "Cleanse", note: "Gentle cream or hydrating cleanser" },
    { id: "e2", title: "Azelaic acid 10%", note: "Every other day, then daily" },
    { id: "e3", title: "Moisturize", note: "Keep using yours" },
  ],
};
