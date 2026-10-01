/**
 * How-to guides: facial balance, posture, fit, and style niches with outfit formulas.
 *
 * Inspiration images are NOT embedded. Photos on Pinterest / Instagram / TikTok belong to the
 * people in them and the creators who shot them, so we link to searches instead. To show images
 * in-app later, license them (stock with model releases) or commission creators directly.
 */
import type { StylePresentation, StyleVibe } from "../../types";

// ─── Facial balance ───────────────────────────────────────────────
export const BALANCE = {
  intro:
    "Every face is asymmetric. That's normal and it's part of why faces look like faces. Mirror-image 'perfect symmetry' composites tend to look uncanny, not better. What you can change is the grooming around your face, which is where most visible unevenness comes from.",
  mirrorNote:
    "The mirror shows you flipped; everyone else (and the camera) sees the other version. Most people prefer the one they see every day, which is why photos of yourself can feel 'off'. That's familiarity, not a flaw in the photo.",
  steps: [
    {
      title: "Line up your brows",
      how: [
        "Hold a pencil straight up from the outer edge of your nostril: that's where each brow should start.",
        "Angle it from the nostril through the centre of your pupil: that's the highest point.",
        "Angle it from the nostril past the outer corner of your eye: that's where each brow ends.",
        "Only tidy strays outside those points. Do one side, then match the other, checking in the mirror from a step back.",
      ],
    },
    {
      title: "Get even sideburns and sides",
      how: [
        "Ask your barber to check both sides in the mirror before finishing, from the front, not just from the chair's side.",
        "Use a fixed landmark for sideburns (for example level with the middle of the ear), not by eye.",
        "Let the barber know if one side grows or sticks out differently (common with cowlicks); they can leave that side slightly longer.",
      ],
    },
    {
      title: "Trim a symmetric beard line",
      how: [
        "Neckline: about two fingers above the Adam's apple, curving back towards the back of each ear.",
        "Cheek line: a straight or slightly curved line from the top of the sideburn to the corner of the moustache. Mark both ends before trimming.",
        "Trim one side, then use the same guard and the same landmarks for the other. Go longer first; you can always take more off.",
      ],
    },
    {
      title: "Use your parting and hair on purpose",
      how: [
        "Parting on the side where your hair naturally falls reads cleaner than fighting a cowlick.",
        "Volume on one side of the top can balance a brow or hairline that sits slightly higher on the other side.",
      ],
    },
    {
      title: "Take photos that don't distort",
      how: [
        "Hold the camera at arm's length or further (or use the 2× lens). Close-up wide lenses enlarge the nose and the side of the face nearer the camera.",
        "Camera at eye level, light facing you (a window works), not from above or one side.",
        "Try a slight turn (15–20°) to each side and keep whichever you like. There's no right answer.",
      ],
    },
  ],
  wontHelp: [
    "Tongue-posture or 'bone smashing' trends: there's no good evidence they reshape adult bone, and hitting your face can injure it.",
    "Facial-ratio calculators and 'ideal' proportions: they aren't reliable measures of anything, and photos distort the inputs.",
    "Claims that sleeping or chewing on one side reshapes your face: not well supported for adults.",
  ],
  urgent:
    "If one side of your face suddenly droops, feels numb or won't move, get emergency care right away: it can be a sign of a stroke or other nerve problem. For jaw pain, clicking or bite concerns, see a dentist.",
};

// ─── Posture ──────────────────────────────────────────────────────
export const POSTURE = {
  intro:
    "Posture isn't about standing to attention all day. It's about not spending hours in one slumped position, and having the strength to stand tall without effort.",
  check: [
    "Stand with your heels, glutes and upper back against a wall.",
    "Notice whether the back of your head touches without tipping your chin up. If there's a big gap, your head probably drifts forward.",
    "Slide a hand behind your lower back: about a flat hand's space is typical.",
    "This is a rough self-check, not an assessment.",
  ],
  setup: [
    "Top of the screen at or just below eye level; laptop on a stand with a separate keyboard if you use it for hours.",
    "Hold your phone higher rather than dropping your head.",
    "Get up every 30–45 minutes. Changing position matters more than finding one perfect position.",
  ],
  routine: [
    { name: "Chin tucks", dose: "2 × 10, hold 2 s", how: "Glide your head straight back as if making a double chin. Don't tip it down." },
    { name: "Wall slides", dose: "2 × 10", how: "Back and forearms against a wall, slide your arms up and down slowly without your lower back arching." },
    { name: "Band pull-aparts or rows", dose: "3 × 12–15", how: "Pull your shoulder blades back and down. Rows (cable, dumbbell or band) build the upper back that holds you up." },
    { name: "Upper-back extension", dose: "1–2 min", how: "Lie over a rolled towel or foam roller at mid-back height and let your chest open." },
    { name: "Hip-flexor stretch", dose: "2 × 30 s per side", how: "Half-kneeling, squeeze the glute of the back leg and shift forward gently." },
    { name: "Glute bridges", dose: "2 × 12", how: "Drive through your heels, squeeze at the top without arching your lower back." },
  ],
  frequency: "3–4 times a week takes about 10 minutes. Most people notice it feels easier to stand tall within a few weeks.",
  photos: "In photos: weight on both feet, shoulders relaxed down (not pulled back hard), chin slightly forward and down to define the jawline.",
  pro: "See a physiotherapist or doctor for pain that lasts, numbness or tingling in the arms or legs, or a curve you've been told about.",
};

// ─── Fit fundamentals ─────────────────────────────────────────────
export const FIT = [
  { part: "Shoulders", rule: "The seam sits at the edge of your shoulder bone. This is the one thing a tailor can't easily fix, so buy for it." },
  { part: "Sleeves", rule: "Shirt cuffs reach the wrist bone; jacket sleeves show about 1 cm of shirt cuff." },
  { part: "T-shirts", rule: "Hem around the middle of the fly; sleeves end mid-bicep and don't flare out." },
  { part: "Shirts", rule: "No pulling into an X at the buttons; you can pinch 3–5 cm at each side of the waist." },
  { part: "Trousers", rule: "Sit at the waist without a belt holding them up; a slight or no break at the shoe. Hemming is cheap." },
  { part: "Jackets", rule: "Cover roughly your seat; button without pulling; collar sits against your shirt collar." },
  { part: "Fabric", rule: "Heavier cotton and wool drape and hide creases. Thin, shiny fabrics look cheaper at any price." },
];

// ─── Style niches ─────────────────────────────────────────────────
export type Swatch = { name: string; hex: string };
export type Formula = { pieces: string[]; colors: Swatch[]; when: string };
export type Niche = {
  id: string;
  title: string;
  summary: string;
  matches: StyleVibe[];
  pieces: { masculine: string[]; feminine: string[] };
  formulas: { masculine: Formula[]; feminine: Formula[] };
  budget: string;
  avoid: string[];
  /** search phrase without gender, e.g. "old money outfit" */
  query: string;
  hashtags: string[];
};

const S = (name: string, hex: string): Swatch => ({ name, hex });
const NAVY = S("Navy", "#1f2a44"), CREAM = S("Cream", "#efe6d2"), WHITE = S("White", "#f5f5f2"), CAMEL = S("Camel", "#b88a55"),
  BROWN = S("Brown", "#5b3a26"), GREY = S("Grey", "#8a8d91"), CHARCOAL = S("Charcoal", "#36383c"), BLACK = S("Black", "#141414"),
  OLIVE = S("Olive", "#5d6240"), SKY = S("Light blue", "#b9cde3"), STONE = S("Stone", "#c9c0ad"), BURGUNDY = S("Burgundy", "#5e1f2a"),
  DENIM = S("Indigo denim", "#2e3d5c"), FOREST = S("Forest", "#2f4a3a"), RUST = S("Rust", "#9a4a2a"), SAND = S("Sand", "#d8c7a6");

export const NICHES: Niche[] = [
  {
    id: "old-money",
    title: "Old money / quiet luxury",
    summary: "Classic, understated pieces in natural fabrics. No logos. It looks expensive because of fit, fabric and restraint, not price tags.",
    matches: ["classic", "smart", "minimal"],
    pieces: {
      masculine: ["Knit polo or quarter-zip", "Oxford cloth button-down", "Pleated or flat-front trousers in cream, grey or navy", "Navy blazer (unstructured is easier)", "Cable-knit or merino crew", "Suede loafers, leather loafers or clean white tennis shoes", "Simple leather belt and a plain watch"],
      feminine: ["Fine-knit cardigan or crew", "Crisp white or blue shirt", "Tailored wide-leg or straight trousers", "Pleated midi skirt", "Trench coat or navy blazer", "Loafers, ballet flats or low slingbacks", "Small gold or pearl jewellery, structured bag without logos"],
    },
    formulas: {
      masculine: [
        { pieces: ["Navy knit polo", "Cream trousers", "Brown suede loafers"], colors: [NAVY, CREAM, BROWN], when: "Summer, dinners, dates" },
        { pieces: ["Light blue oxford shirt", "Navy blazer", "Grey trousers", "Dark brown loafers"], colors: [SKY, NAVY, GREY, BROWN], when: "Work, events" },
        { pieces: ["Cream cable-knit over an oxford", "Navy chinos", "White tennis shoes"], colors: [CREAM, NAVY, WHITE], when: "Weekends, autumn" },
      ],
      feminine: [
        { pieces: ["Cream fine-knit", "Navy wide-leg trousers", "Brown loafers"], colors: [CREAM, NAVY, BROWN], when: "Everyday, office" },
        { pieces: ["White shirt", "Camel trench", "Straight indigo jeans", "Ballet flats"], colors: [WHITE, CAMEL, DENIM, BLACK], when: "Weekends, travel" },
        { pieces: ["Navy cardigan over shoulders", "Pleated cream midi skirt", "Tan slingbacks"], colors: [NAVY, CREAM, CAMEL], when: "Lunch, events" },
      ],
    },
    budget: "Thrift and second-hand are made for this look: wool, cashmere and leather hold up for decades. Spend on shoes and a tailor.",
    avoid: ["Visible logos", "Shiny synthetic fabrics", "Skinny fits", "Too much jewellery"],
    query: "old money outfit",
    hashtags: ["oldmoneystyle", "oldmoneyaesthetic", "quietluxury"],
  },
  {
    id: "clean-casual",
    title: "Clean casual / minimal",
    summary: "Plain basics that fit perfectly in 3–4 colors. The easiest look to get right and the best base for everything else.",
    matches: ["clean-casual", "minimal", "unsure"],
    pieces: {
      masculine: ["Heavyweight plain tees (white, black, grey, navy)", "Overshirt or chore jacket", "Dark straight or tapered jeans", "Chinos", "Minimal white leather sneakers", "Crew-neck sweatshirt"],
      feminine: ["Fitted and relaxed plain tees", "Straight or wide-leg jeans", "Oversized button-down", "Neutral knit", "White leather sneakers", "Simple tote"],
    },
    formulas: {
      masculine: [
        { pieces: ["White tee", "Dark indigo jeans", "White sneakers"], colors: [WHITE, DENIM, WHITE], when: "Anything casual" },
        { pieces: ["Grey tee", "Olive overshirt", "Black jeans", "White sneakers"], colors: [GREY, OLIVE, BLACK, WHITE], when: "Weekends, dates" },
        { pieces: ["Navy crew sweatshirt", "Stone chinos", "White sneakers"], colors: [NAVY, STONE, WHITE], when: "Everyday" },
      ],
      feminine: [
        { pieces: ["White tee", "Straight blue jeans", "White sneakers", "Tote"], colors: [WHITE, DENIM, WHITE], when: "Everyday" },
        { pieces: ["Oversized blue shirt", "Black straight trousers", "Loafers"], colors: [SKY, BLACK, BLACK], when: "Office, casual Fridays" },
      ],
    },
    budget: "Basics-focused shops are fine for tees. Put the money into jeans that fit and one good pair of shoes.",
    avoid: ["Graphic prints mixed with other patterns", "Worn-out tees with stretched collars", "Too many colors in one outfit"],
    query: "minimalist outfit",
    hashtags: ["minimalstyle", "capsulewardrobe", "cleanstyle"],
  },
  {
    id: "smart-casual",
    title: "Smart casual (work)",
    summary: "One step up from casual for offices, interviews and dinners. A collar or a structured layer does most of the work.",
    matches: ["smart"],
    pieces: {
      masculine: ["Oxford and poplin shirts", "Merino crew or V-neck", "Chinos and wool trousers", "Unstructured blazer", "Chelsea boots or derby shoes", "Leather belt matching the shoes"],
      feminine: ["Blouses and fine knits", "Tailored trousers", "Blazer", "Midi skirt or dress", "Loafers or block heels", "Structured bag"],
    },
    formulas: {
      masculine: [
        { pieces: ["White oxford", "Charcoal trousers", "Brown derbies"], colors: [WHITE, CHARCOAL, BROWN], when: "Interviews, office" },
        { pieces: ["Merino crew over a collared shirt", "Navy chinos", "Brown chelsea boots"], colors: [BURGUNDY, NAVY, BROWN], when: "Office, winter" },
      ],
      feminine: [
        { pieces: ["Cream blouse", "Charcoal tailored trousers", "Black loafers"], colors: [CREAM, CHARCOAL, BLACK], when: "Interviews, office" },
        { pieces: ["Navy blazer", "White tee", "Stone trousers", "Loafers"], colors: [NAVY, WHITE, STONE, BROWN], when: "Office, dinners" },
      ],
    },
    budget: "Two pairs of trousers hemmed to your length and two shirts that fit beat a closet of near-misses.",
    avoid: ["Square-toe shoes", "Shirts too long to wear untucked, worn untucked", "Mismatched belt and shoes"],
    query: "smart casual outfit",
    hashtags: ["smartcasual", "businesscasual", "officestyle"],
  },
  {
    id: "streetwear",
    title: "Streetwear",
    summary: "Relaxed and oversized silhouettes, statement sneakers, layers. It looks deliberate when proportions are controlled.",
    matches: ["street"],
    pieces: {
      masculine: ["Boxy heavyweight tees", "Hoodies and crew sweats", "Wide or straight cargo pants and jeans", "Work jacket or bomber", "Statement sneakers", "Cap or beanie"],
      feminine: ["Cropped or boxy tees", "Oversized hoodie", "Baggy jeans or cargos", "Bomber or varsity jacket", "Chunky or retro sneakers", "Baby tee with wide trousers"],
    },
    formulas: {
      masculine: [
        { pieces: ["Black boxy tee", "Olive cargo pants", "Retro sneakers"], colors: [BLACK, OLIVE, WHITE], when: "Everyday" },
        { pieces: ["Grey hoodie", "Black bomber", "Baggy indigo jeans", "Chunky sneakers"], colors: [GREY, BLACK, DENIM, WHITE], when: "Autumn, going out" },
      ],
      feminine: [
        { pieces: ["Baby tee", "Wide cargo trousers", "Retro sneakers"], colors: [WHITE, OLIVE, WHITE], when: "Everyday" },
        { pieces: ["Oversized hoodie", "Bike shorts or baggy jeans", "Chunky sneakers"], colors: [GREY, BLACK, WHITE], when: "Weekends" },
      ],
    },
    budget: "Spend on one pair of sneakers you love; basics can be cheap. Oversized should still fit at the shoulders or be clearly intentional.",
    avoid: ["Everything oversized at once (pick top or bottom)", "Head-to-toe logos", "Trousers pooling far below the shoe"],
    query: "streetwear outfit",
    hashtags: ["streetwear", "streetstyle", "outfitinspo"],
  },
  {
    id: "athletic",
    title: "Athletic / gym fit",
    summary: "Performance fabrics and clean athletic shapes that look put-together outside the gym too.",
    matches: ["athletic", "clean-casual", "street"],
    pieces: {
      masculine: ["Fitted performance tees", "Tapered joggers or 5–7 inch shorts", "Quarter-zip or zip hoodie", "Clean trainers", "Plain cap"],
      feminine: ["Matching set (leggings or flares + top)", "Oversized zip hoodie", "Bike shorts", "Clean trainers", "Claw clip, simple cap"],
    },
    formulas: {
      masculine: [
        { pieces: ["Black fitted tee", "Grey tapered joggers", "White trainers"], colors: [BLACK, GREY, WHITE], when: "Gym, errands" },
        { pieces: ["Navy quarter-zip", "Black shorts", "Trainers"], colors: [NAVY, BLACK, WHITE], when: "Warm days, coffee runs" },
      ],
      feminine: [
        { pieces: ["Matching set in one color", "Oversized zip hoodie", "Trainers"], colors: [FOREST, GREY, WHITE], when: "Gym, errands" },
      ],
    },
    budget: "Mid-price sportswear is fine. Replace pieces once they pill or stretch out; that's what makes gym clothes look tired.",
    avoid: ["Faded, stretched workout clothes worn as daywear", "Mixing too many bright colors"],
    query: "athleisure outfit",
    hashtags: ["athleisure", "gymfit", "gymoutfit"],
  },
  {
    id: "rugged",
    title: "Rugged / workwear",
    summary: "Denim, canvas, flannel and boots. Durable pieces that look better as they wear in.",
    matches: ["rugged", "clean-casual", "street"],
    pieces: {
      masculine: ["Raw or dark denim", "Chore or trucker jacket", "Flannel and heavy twill shirts", "Heavyweight henley", "Leather or work boots", "Wool beanie"],
      feminine: ["Straight-leg denim", "Chore jacket", "Flannel shirt", "Knit vest or chunky sweater", "Leather boots", "Canvas tote"],
    },
    formulas: {
      masculine: [
        { pieces: ["Cream henley", "Brown chore jacket", "Dark jeans", "Brown boots"], colors: [CREAM, BROWN, DENIM, BROWN], when: "Autumn, weekends" },
        { pieces: ["Rust flannel", "White tee", "Black jeans", "Boots"], colors: [RUST, WHITE, BLACK, BROWN], when: "Casual, outdoors" },
      ],
      feminine: [
        { pieces: ["Sand chunky knit", "Straight jeans", "Brown boots"], colors: [SAND, DENIM, BROWN], when: "Autumn, weekends" },
      ],
    },
    budget: "Denim and boots are worth buying second-hand in good condition; canvas and leather last.",
    avoid: ["Costume-level head-to-toe 'lumberjack'", "Distressed denim with rugged boots and flannel all at once"],
    query: "workwear outfit",
    hashtags: ["workwearstyle", "rawdenim", "heritagestyle"],
  },
];

// ─── Inspiration searches ─────────────────────────────────────────
/** Optional filter so people can find inspiration featuring people who look like them. Color advice comes from contrast/undertone, never from this. */
export const SEEN_ON: { id: string; label: string; term: string }[] = [
  { id: "any", label: "Everyone", term: "" },
  { id: "black", label: "Black", term: "black" },
  { id: "east-asian", label: "East Asian", term: "asian" },
  { id: "south-asian", label: "South Asian", term: "indian" },
  { id: "southeast-asian", label: "Southeast Asian", term: "filipino" },
  { id: "latino", label: "Latino", term: "latino" },
  { id: "middle-eastern", label: "Middle Eastern", term: "arab" },
  { id: "white", label: "White", term: "white" },
];

const genderTerm = (p: StylePresentation) => (p === "masculine" ? "men" : p === "feminine" ? "women" : "");

export const inspoQuery = (n: Niche, p: StylePresentation, seenOn: string) => {
  const term = SEEN_ON.find((s) => s.id === seenOn)?.term ?? "";
  return [n.query, term, genderTerm(p)].filter(Boolean).join(" ");
};

export const pinterestUrl = (q: string) => `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(q)}`;
export const tiktokUrl = (q: string) => `https://www.tiktok.com/search?q=${encodeURIComponent(q)}`;
export const instagramTagUrl = (tag: string) => `https://www.instagram.com/explore/tags/${encodeURIComponent(tag)}/`;

export const piecesFor = (n: Niche, p: StylePresentation) =>
  p === "feminine" ? n.pieces.feminine : p === "masculine" ? n.pieces.masculine : [...n.pieces.masculine.slice(0, 4), ...n.pieces.feminine.slice(0, 3)];
export const formulasFor = (n: Niche, p: StylePresentation) =>
  p === "feminine" ? n.formulas.feminine : p === "masculine" ? n.formulas.masculine : [...n.formulas.masculine.slice(0, 2), ...n.formulas.feminine.slice(0, 1)];
