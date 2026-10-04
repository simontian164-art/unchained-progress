/**
 * Product categories for "Shop my plan".
 *
 * Honesty rules:
 * - Prices are rough USD estimates by budget tier, converted to local currency and ALWAYS shown as estimates.
 * - Example products are long-established, widely sold items, shown only as "examples to compare",
 *   with a note that formula, price and availability are not verified for the user's country.
 * - We never claim a product is organic, vegan, cruelty-free or fragrance-free. Preferences are
 *   turned into search terms and label-check advice instead.
 */
import type { Budget, ModuleId, ShopItem } from "../../types";

export interface Ingredient {
  name: string;
  role: string;
}

export const INGREDIENTS: Record<string, Ingredient> = {
  ceramides: { name: "Ceramides", role: "Help the skin barrier hold moisture." },
  glycerin: { name: "Glycerin", role: "Draws water into the skin; gentle and widely tolerated." },
  hyaluronic: { name: "Hyaluronic acid", role: "Holds water on the skin's surface; apply to damp skin." },
  niacinamide: { name: "Niacinamide", role: "Commonly used for oil control, uneven tone and redness-prone skin." },
  salicylic: { name: "Salicylic acid (BHA)", role: "Oil-soluble exfoliant that works inside pores; used for blackheads and breakouts." },
  azelaic: { name: "Azelaic acid", role: "Used for uneven tone, dark marks and redness-prone skin; usually well tolerated." },
  retinoid: { name: "Retinoids (retinol, adapalene)", role: "Increase skin turnover; used for texture, breakouts and fine lines. Can irritate at first." },
  benzoyl: { name: "Benzoyl peroxide", role: "Reduces acne-causing bacteria. Can bleach fabric and dry skin." },
  zinc: { name: "Zinc oxide / titanium dioxide", role: "Mineral UV filters; can leave a white cast, tinted versions help." },
  chemfilters: { name: "Organic (chemical) UV filters", role: "Absorb UV; usually invisible on all skin tones." },
  petrolatum: { name: "Petrolatum", role: "Seals in moisture; very low allergy risk." },
  zpt: { name: "Zinc pyrithione", role: "Common anti-dandruff ingredient." },
  keto: { name: "Ketoconazole", role: "Anti-fungal used in anti-dandruff shampoos; strength and availability vary by country." },
  fragrance: { name: "Fragrance / essential oils", role: "Add scent only. A common cause of irritation, including 'natural' fragrance." },
};

type Tier = Record<Budget, [number, number]>;

export interface Category {
  id: string;
  module: ModuleId;
  group: ShopItem["group"];
  name: string;
  purpose: string;
  replaces?: string;
  how: string;
  when: string;
  frequency: string;
  avoidWith?: string[];
  ingredients?: (keyof typeof INGREDIENTS)[];
  price: Tier;
  cheaper?: string;
  examples?: string[];
  flags?: string[];
  localQuery?: string;
  onlineQuery: string;
  freeFirst?: string;
  naturalNote?: string;
}

const t = (low: [number, number], mid: [number, number], high: [number, number]): Tier => ({ low, mid, high });

export const CATEGORIES: Record<string, Category> = {
  "cleanser-gel": {
    id: "cleanser-gel", module: "skin", group: "essentials",
    name: "Gentle gel or foaming cleanser",
    purpose: "Removes oil, sunscreen and sweat without stripping the skin.",
    replaces: "Body wash or bar soap on your face",
    how: "Massage onto damp skin for 30–60 seconds, rinse with lukewarm water.",
    when: "Evening (and morning if you get oily overnight)", frequency: "Daily",
    ingredients: ["glycerin", "niacinamide"],
    price: t([8, 15], [15, 30], [30, 50]),
    cheaper: "Pharmacy brands work as well as premium ones for cleansing.",
    examples: ["CeraVe Foaming Facial Cleanser", "La Roche-Posay Toleriane Purifying Foaming Cleanser"],
    localQuery: "pharmacy", onlineQuery: "gentle foaming facial cleanser",
  },
  "cleanser-cream": {
    id: "cleanser-cream", module: "skin", group: "essentials",
    name: "Gentle cream or hydrating cleanser",
    purpose: "Cleans without leaving dry or sensitive skin tight.",
    replaces: "Body wash or bar soap on your face",
    how: "Massage onto damp skin, rinse with lukewarm water. Mornings, water alone is fine.",
    when: "Evening", frequency: "Daily",
    ingredients: ["ceramides", "glycerin"],
    price: t([8, 15], [15, 30], [30, 50]),
    cheaper: "Pharmacy brands are fine here.",
    examples: ["CeraVe Hydrating Facial Cleanser", "Vanicream Gentle Facial Cleanser"],
    localQuery: "pharmacy", onlineQuery: "gentle hydrating facial cleanser",
  },
  "moist-light": {
    id: "moist-light", module: "skin", group: "essentials",
    name: "Lightweight moisturizer",
    purpose: "Hydrates without feeling greasy; supports the skin barrier while using actives.",
    how: "A pea-to-almond amount on face and neck.", when: "Morning and evening", frequency: "Daily",
    ingredients: ["ceramides", "glycerin", "niacinamide"],
    price: t([10, 18], [18, 35], [35, 60]),
    examples: ["CeraVe PM Facial Moisturizing Lotion", "La Roche-Posay Toleriane Double Repair Face Moisturizer"],
    localQuery: "pharmacy", onlineQuery: "lightweight oil free face moisturizer",
  },
  "moist-rich": {
    id: "moist-rich", module: "skin", group: "essentials",
    name: "Richer barrier cream",
    purpose: "Holds moisture in dry or easily irritated skin.",
    how: "Apply to slightly damp skin.", when: "Morning and evening", frequency: "Daily",
    ingredients: ["ceramides", "glycerin", "petrolatum"],
    price: t([10, 18], [18, 35], [35, 60]),
    examples: ["CeraVe Moisturizing Cream", "Vanicream Moisturizing Cream"],
    localQuery: "pharmacy", onlineQuery: "ceramide moisturizing cream face",
  },
  sunscreen: {
    id: "sunscreen", module: "skin", group: "essentials",
    name: "Broad-spectrum sunscreen, SPF 30+",
    purpose: "Prevents sun damage and stops dark marks from lingering. The highest-impact skin product.",
    how: "Two finger-lengths for face and neck, last step in the morning.",
    when: "Every morning, including cloudy days", frequency: "Daily; reapply every 2 hours outdoors",
    ingredients: ["chemfilters", "zinc"],
    price: t([10, 20], [20, 35], [35, 55]),
    cheaper: "Any broad-spectrum SPF 30+ you'll wear daily beats an expensive one you skip.",
    examples: ["La Roche-Posay Anthelios range (formulas differ by country)", "EltaMD UV Clear SPF 46 (mainly sold in the US)"],
    naturalNote: "Mineral sunscreens (zinc oxide / titanium dioxide) are often chosen by people who prefer natural products. Tinted versions avoid a white cast on deeper skin tones.",
    localQuery: "pharmacy", onlineQuery: "broad spectrum face sunscreen SPF 30",
  },
  bha: {
    id: "bha", module: "skin", group: "optional",
    name: "Salicylic acid (BHA) exfoliant 0.5–2%",
    purpose: "Clears inside pores; used for blackheads and breakouts.",
    how: "Thin layer after cleansing, before moisturizer.", when: "Evening", frequency: "2–3 evenings a week, then up to daily if tolerated",
    avoidWith: ["Retinoids on the same night", "Other acid exfoliants (AHA) on the same night", "Scrubs"],
    ingredients: ["salicylic"],
    price: t([10, 15], [25, 35], [35, 50]),
    cheaper: "A salicylic acid cleanser is a cheaper, gentler starting point.",
    examples: ["Paula's Choice Skin Perfecting 2% BHA Liquid Exfoliant"],
    flags: ["Patch test 3 days", "Skip if you're allergic to aspirin/salicylates"],
    localQuery: "pharmacy", onlineQuery: "2% salicylic acid BHA exfoliant",
  },
  niacinamide: {
    id: "niacinamide", module: "skin", group: "optional",
    name: "Niacinamide serum",
    purpose: "Commonly used for oiliness, uneven tone and redness-prone skin.",
    how: "2–3 drops after cleansing, before moisturizer.", when: "Morning or evening", frequency: "Daily",
    ingredients: ["niacinamide"],
    price: t([6, 12], [15, 30], [30, 60]),
    cheaper: "Many moisturizers already contain niacinamide, so you may not need a separate serum.",
    examples: ["The Ordinary Niacinamide 10% + Zinc 1% (some people find 4–5% gentler)"],
    flags: ["Patch test 3 days"],
    localQuery: "pharmacy", onlineQuery: "niacinamide serum",
  },
  azelaic: {
    id: "azelaic", module: "skin", group: "optional",
    name: "Azelaic acid 10%",
    purpose: "Used for dark marks, uneven tone and redness-prone skin; usually well tolerated.",
    how: "Thin layer after cleansing.", when: "Evening (or morning under sunscreen)", frequency: "Every other day, then daily",
    ingredients: ["azelaic"],
    price: t([8, 15], [20, 35], [35, 60]),
    examples: ["The Ordinary Azelaic Acid Suspension 10%"],
    flags: ["May tingle at first", "Patch test 3 days"],
    localQuery: "pharmacy", onlineQuery: "azelaic acid 10%",
  },
  retinoid: {
    id: "retinoid", module: "skin", group: "optional",
    name: "Gentle retinoid (retinol or adapalene)",
    purpose: "Used for texture, breakouts and fine lines over months.",
    how: "Pea-sized amount for the whole face on dry skin, then moisturizer.", when: "Evening only", frequency: "2 nights a week, build up over 4–6 weeks",
    avoidWith: ["BHA/AHA on the same night", "Benzoyl peroxide at the same time", "Waxing the face"],
    ingredients: ["retinoid"],
    price: t([10, 20], [20, 40], [40, 80]),
    examples: ["Differin Gel (adapalene 0.1%): over the counter in the US, status differs by country", "The Ordinary Retinol 0.2% in Squalane"],
    flags: ["Not during pregnancy. Ask a doctor", "Use sunscreen daily", "Expect some dryness in the first weeks"],
    localQuery: "pharmacy", onlineQuery: "retinol serum beginner",
  },
  hyaluronic: {
    id: "hyaluronic", module: "skin", group: "optional",
    name: "Hyaluronic acid serum",
    purpose: "Adds a layer of hydration for dry or dehydrated skin.",
    how: "On damp skin, then moisturizer on top.", when: "Morning", frequency: "Daily",
    ingredients: ["hyaluronic"],
    price: t([7, 12], [15, 30], [30, 60]),
    cheaper: "A good moisturizer applied to damp skin gets you most of the way.",
    examples: ["The Ordinary Hyaluronic Acid 2% + B5"],
    localQuery: "pharmacy", onlineQuery: "hyaluronic acid serum",
  },
  "lip-balm": {
    id: "lip-balm", module: "smile", group: "essentials",
    name: "Plain lip balm (ideally with SPF for daytime)",
    purpose: "Keeps lips from cracking and peeling.",
    how: "Thin layer; reapply after eating.", when: "Day and before bed", frequency: "As needed",
    ingredients: ["petrolatum"],
    price: t([3, 6], [6, 12], [12, 25]),
    examples: ["Plain petroleum jelly", "Aquaphor Healing Ointment"],
    flags: ["Flavored/minty balms can irritate some people"],
    localQuery: "pharmacy", onlineQuery: "SPF lip balm fragrance free",
    freeFirst: "Stop licking or peeling your lips; drink water.",
  },
  "anti-dandruff": {
    id: "anti-dandruff", module: "hair", group: "optional",
    name: "Anti-dandruff shampoo",
    purpose: "Controls flakes and an itchy or oily scalp.",
    how: "Massage into the scalp, leave 3–5 minutes, rinse.", when: "In the shower", frequency: "2 times a week",
    ingredients: ["zpt", "keto"],
    price: t([8, 15], [12, 25], [20, 40]),
    examples: ["Head & Shoulders (zinc pyrithione)", "Nizoral (ketoconazole; strength varies by country)"],
    flags: ["See a dermatologist if no better after 4–6 weeks"],
    localQuery: "pharmacy", onlineQuery: "anti dandruff shampoo",
  },
  "hair-product": {
    id: "hair-product", module: "hair", group: "grooming",
    name: "Styling product for your cut",
    purpose: "Holds the shape your barber cut.",
    how: "Pea-sized amount, warm between palms, work from back to front.", when: "After towel-drying", frequency: "Most days",
    price: t([10, 18], [18, 30], [30, 45]),
    cheaper: "Start small; one tub lasts months.",
    localQuery: "barber supply store", onlineQuery: "hair styling",
  },
  "haircut-service": {
    id: "haircut-service", module: "hair", group: "grooming",
    name: "Haircut (service)",
    purpose: "The single highest-impact change for most people.",
    how: "Show your barber or stylist the 'Show my barber' card.", when: "This week", frequency: "Every few weeks, depending on the cut",
    price: t([20, 35], [35, 60], [60, 110]),
    cheaper: "Barber schools and trainee nights are cheaper; bring the card so the result is still what you want.",
    localQuery: "barber shop", onlineQuery: "",
  },
  trimmer: {
    id: "trimmer", module: "beard", group: "grooming",
    name: "Beard trimmer with length guards",
    purpose: "Keeps beard length even and lines clean at home.",
    replaces: "Disposable razors for stubble",
    how: "Trim with the grain using the same guard each time; clean up lines without a guard.", when: "Before a shower", frequency: "Every 3–7 days",
    price: t([25, 40], [40, 80], [80, 150]),
    examples: ["Philips OneBlade or Multigroom range", "Wahl beard trimmer range"],
    localQuery: "electronics store", onlineQuery: "beard trimmer with guards",
  },
  "brow-kit": {
    id: "brow-kit", module: "eyes", group: "grooming",
    name: "Slant tweezers and small grooming scissors",
    purpose: "Tidy stray brow hairs and trim nose/ear hair.",
    how: "Tweeze one hair at a time after a shower; comb brows up and trim only what sticks out past the top line.",
    when: "Once a week", frequency: "Weekly",
    price: t([5, 10], [10, 20], [20, 35]),
    localQuery: "pharmacy", onlineQuery: "slant tweezers grooming scissors",
    freeFirst: "Brush brows into place with a clean spoolie or toothbrush.",
  },
  floss: {
    id: "floss", module: "smile", group: "essentials",
    name: "Floss or interdental brushes",
    purpose: "Cleans between teeth where a brush can't reach.",
    how: "Once a day, gently along each tooth.", when: "Before bed", frequency: "Daily",
    price: t([3, 6], [5, 10], [8, 20]),
    localQuery: "pharmacy", onlineQuery: "dental floss",
  },
  "whitening-paste": {
    id: "whitening-paste", module: "smile", group: "optional",
    name: "Fluoride whitening toothpaste",
    purpose: "Helps lift surface stains from coffee, tea or wine.",
    how: "Brush 2 minutes, spit, don't rinse.", when: "Morning and night", frequency: "Daily",
    price: t([4, 8], [6, 12], [10, 20]),
    flags: ["Stop if teeth become sensitive", "Crowns and fillings don't whiten"],
    localQuery: "pharmacy", onlineQuery: "fluoride whitening toothpaste",
    freeFirst: "Rinse with water after coffee, tea or red wine.",
  },
  capsule: {
    id: "capsule", module: "style", group: "style",
    name: "Starter capsule (tees, overshirt, trousers)",
    purpose: "A few well-fitting basics in your best colors.",
    how: "Buy for shoulder fit first; hem trousers.", when: "When replacing worn items", frequency: "Once",
    price: t([100, 180], [180, 400], [400, 900]),
    cheaper: "Tailor what you already own that almost fits.",
    localQuery: "clothing store", onlineQuery: "",
    freeFirst: "Remove anything that doesn't fit at the shoulders or waist, then build outfits from what's left.",
  },
  tailoring: {
    id: "tailoring", module: "style", group: "style",
    name: "Tailoring (hem trousers, take in shirts)",
    purpose: "Makes clothes you own fit properly.",
    how: "Bring shoes you'll wear with the trousers.", when: "This month", frequency: "As needed",
    price: t([15, 25], [20, 40], [30, 60]),
    localQuery: "tailor alterations", onlineQuery: "",
  },
};

/** Map a haircut product type to a search term. */
export const HAIR_PRODUCT_QUERY: Record<string, string> = {
  clay: "matte hair clay",
  paste: "hair styling paste",
  pomade: "water based pomade",
  "sea-salt": "sea salt texture spray",
  "curl-cream": "curl cream",
  "leave-in": "leave in conditioner",
};
