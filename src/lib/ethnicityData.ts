import { Ethnicity } from "@/contexts/UserProfileContext";

// ─── Skincare by Ethnicity ────────────────────────────────────────────

export const skincareTipsByEthnicity: Record<Ethnicity, { routine: string; tips: string[]; concerns: string[]; visual: string }> = {
  caucasian: {
    routine: "Focus on sun protection and anti-aging. SPF 30+ daily is critical due to lower melanin.",
    tips: ["Prioritize retinoids for early wrinkle prevention", "Use vitamin C serums for brightening", "Mineral sunscreen works well for fair tones"],
    concerns: ["Sun damage & premature aging", "Rosacea-prone skin", "Visible redness"],
    visual: "☀️ Sun-first approach",
  },
  african: {
    routine: "Hydration-first approach. Avoid harsh actives that cause hyperpigmentation.",
    tips: ["Use gentle exfoliants (mandelic acid over glycolic)", "Shea butter & squalane for deep moisture", "Avoid benzoyl peroxide above 2.5% to prevent dark spots"],
    concerns: ["Hyperpigmentation", "Keloid-prone scarring", "Dryness & ashy appearance"],
    visual: "💧 Hydration-first approach",
  },
  asian: {
    routine: "Multi-step hydration with lightweight layers. Korean/Japanese skincare philosophy works well.",
    tips: ["Layer toners for deep hydration", "Niacinamide for pore refinement", "Centella asiatica for calming redness"],
    concerns: ["PIH (post-inflammatory hyperpigmentation)", "Oiliness in T-zone", "Sensitivity to strong retinoids"],
    visual: "🧴 Layer-based hydration",
  },
  hispanic: {
    routine: "Balanced approach — combination skin is common. Focus on even tone and sun protection.",
    tips: ["Azelaic acid for hyperpigmentation", "SPF is still essential despite higher melanin", "Aloe vera and green tea extracts for soothing"],
    concerns: ["Melasma", "Combination skin zones", "Uneven skin tone"],
    visual: "⚖️ Balance & tone focus",
  },
  "middle-eastern": {
    routine: "Oil-control combined with deep hydration. Beard area needs extra care.",
    tips: ["Salicylic acid for oil control", "Argan oil as a natural moisturizer", "Gentle cleansing to prevent irritation from heat/dryness"],
    concerns: ["Oily skin & large pores", "Ingrown hairs (beard area)", "Hyperpigmentation"],
    visual: "🫧 Oil-control + hydration",
  },
  "south-asian": {
    routine: "Even tone is the priority. Gentle actives with consistent SPF application.",
    tips: ["Tranexamic acid for dark spots", "Turmeric-based masks (use cosmetic-grade only)", "Lightweight gel moisturizers for humid climates"],
    concerns: ["Dark circles", "Hyperpigmentation around mouth/eyes", "Uneven skin tone"],
    visual: "✨ Tone-evening focus",
  },
};

// ─── Skincare Products by Ethnicity ───────────────────────────────────

export const skincareProductsByEthnicity: Record<Ethnicity, Array<{ name: string; price: string; note: string }>> = {
  caucasian: [
    { name: "EltaMD UV Clear SPF 46", price: "$39", note: "Best-in-class SPF, minimal white cast" },
    { name: "SkinCeuticals C E Ferulic", price: "$182", note: "Gold-standard vitamin C" },
    { name: "Tretinoin 0.025% (Rx)", price: "$15", note: "Start low, anti-aging powerhouse" },
  ],
  african: [
    { name: "Black Girl Sunscreen SPF 30", price: "$16", note: "Zero white cast, melanin-friendly" },
    { name: "Topicals Faded Serum", price: "$36", note: "For dark spots & hyperpigmentation" },
    { name: "SheaMoisture African Black Soap", price: "$12", note: "Gentle cleansing, anti-inflammatory" },
  ],
  asian: [
    { name: "Biore UV Aqua Rich Watery Essence", price: "$15", note: "Lightweight, no white cast" },
    { name: "COSRX Snail Mucin Essence", price: "$25", note: "Hydration & repair powerhouse" },
    { name: "Hada Labo Gokujyun Lotion", price: "$14", note: "Hyaluronic acid layering toner" },
  ],
  hispanic: [
    { name: "La Roche-Posay Anthelios SPF 50", price: "$35", note: "Broad-spectrum, lightweight" },
    { name: "The Ordinary Azelaic Acid 10%", price: "$8", note: "Targets melasma & uneven tone" },
    { name: "Cetaphil Daily Hydrating Lotion", price: "$14", note: "Non-comedogenic, lightweight" },
  ],
  "middle-eastern": [
    { name: "Bioderma Sébium H2O Micellar", price: "$15", note: "Oil-control cleansing" },
    { name: "Josie Maran Argan Oil", price: "$49", note: "Pure argan oil moisturizer" },
    { name: "Paula's Choice 2% BHA", price: "$32", note: "Pore-clearing, prevents ingrowns" },
  ],
  "south-asian": [
    { name: "Minimalist Tranexamic Acid Serum", price: "$16", note: "Dark spot treatment" },
    { name: "Neutrogena Hydro Boost Gel", price: "$18", note: "Lightweight gel for humidity" },
    { name: "Dot & Key Vitamin C Serum", price: "$20", note: "Brightening for Indian skin tones" },
  ],
};

// ─── Body/Fitness by Ethnicity ────────────────────────────────────────

export const bodyTipsByEthnicity: Record<Ethnicity, { focus: string; tips: string[] }> = {
  caucasian: {
    focus: "V-taper & lean mass",
    tips: ["Higher volume training responds well", "Focus on compound lifts for frame building", "Moderate carb cycling for lean gains"],
  },
  african: {
    focus: "Leveraging natural athletic advantage",
    tips: ["Fast-twitch dominant — explosive training works great", "Higher protein needs for muscle preservation", "Supplement with vitamin D (common deficiency)"],
  },
  asian: {
    focus: "Frame building & proportions",
    tips: ["Prioritize shoulder & lat width for V-taper", "Higher frequency training (4-5x/week)", "Rice-based diets support training volume well"],
  },
  hispanic: {
    focus: "Balanced physique development",
    tips: ["Natural tendency for stocky build — use it", "Focus on waist management for V-taper", "Moderate volume, progressive overload"],
  },
  "middle-eastern": {
    focus: "Strength-focused aesthetics",
    tips: ["Naturally higher testosterone — leverage for muscle gain", "Mediterranean diet supports performance", "Focus on definition over pure mass"],
  },
  "south-asian": {
    focus: "Lean mass & body recomposition",
    tips: ["Prioritize resistance training over cardio", "Watch insulin sensitivity — reduce refined carbs", "Focus on progressive overload for frame building"],
  },
};

// ─── Grooming by Ethnicity ────────────────────────────────────────────

export const groomingTipsByEthnicity: Record<Ethnicity, { hairCare: string[]; skinPrep: string[] }> = {
  caucasian: {
    hairCare: ["Use heat protectant before styling", "Clarifying shampoo 1x/week for buildup", "Sea salt spray for natural texture"],
    skinPrep: ["Pre-shave oil for sensitive skin", "Alum block post-shave for irritation", "Witch hazel toner"],
  },
  african: {
    hairCare: ["Moisturize daily — LOC method (Liquid, Oil, Cream)", "Protective styles to retain length", "Avoid sulfate shampoos — co-wash instead"],
    skinPrep: ["Single-blade razor to prevent ingrowns", "Bump patrol for razor bumps", "Tea tree oil for ingrown prevention"],
  },
  asian: {
    hairCare: ["Lightweight pomade for thick, straight hair", "Volumizing products at roots", "Perm for added texture if desired"],
    skinPrep: ["Japanese shaving cream for smooth glide", "Double cleanse method post-shave", "Green tea toner for redness"],
  },
  hispanic: {
    hairCare: ["Deep conditioning weekly for thick/curly hair", "Anti-frizz serum for humidity control", "Wide-tooth comb for wet hair only"],
    skinPrep: ["Exfoliate before shaving to prevent ingrowns", "Aloe vera post-shave", "Gentle glycolic wash"],
  },
  "middle-eastern": {
    hairCare: ["Argan oil for beard and hair conditioning", "Regular trimming to manage density", "Boar bristle brush for beard grooming"],
    skinPrep: ["Multi-blade avoidance — use safety razor", "Warm towel pre-shave ritual", "Oud-based aftershave for skin + scent"],
  },
  "south-asian": {
    hairCare: ["Coconut oil pre-wash treatment", "Gentle shampoo — hair can be fine", "Biotin supplements for thickness"],
    skinPrep: ["Turmeric paste for skin brightening", "Gentle exfoliation 2x/week", "Niacinamide serum post-shave"],
  },
};

// ─── Makeup by Ethnicity ──────────────────────────────────────────────

export const makeupByEthnicity: Record<Ethnicity, {
  foundations: Array<{ name: string; shade: string; price: string; note: string }>;
  tips: string[];
  colorPalette: string[];
}> = {
  caucasian: {
    foundations: [
      { name: "NARS Natural Radiant", shade: "Deauville / Barcelona", price: "$49", note: "Medium coverage, natural finish" },
      { name: "MAC Studio Fix", shade: "NC15-NC30", price: "$39", note: "Full coverage, matte" },
    ],
    tips: ["Cool-toned contour for sculpting", "Blush placement on apples of cheeks", "Rose gold highlighter suits most fair tones"],
    colorPalette: ["Rose", "Dusty pink", "Mauve", "Berry", "Champagne"],
  },
  african: {
    foundations: [
      { name: "Fenty Beauty Pro Filt'r", shade: "385-495", price: "$40", note: "Wide shade range, matte finish" },
      { name: "Pat McGrath Sublime", shade: "Deep 30-36", price: "$68", note: "Luxe formula, natural radiance" },
    ],
    tips: ["Avoid ashy contour — use warm-toned bronzer", "Orange/peach corrector under eyes before concealer", "Gold & copper highlighters pop beautifully"],
    colorPalette: ["Rich burgundy", "Copper", "Gold", "Plum", "Terracotta"],
  },
  asian: {
    foundations: [
      { name: "Sulwhasoo Perfecting Cushion", shade: "21-25", price: "$50", note: "Dewy finish, buildable" },
      { name: "Shiseido Synchro Skin", shade: "220-340", price: "$47", note: "Self-refreshing, long-wear" },
    ],
    tips: ["Gradient lip (ombre) technique for natural look", "Subtle aegyo-sal (under-eye highlight) adds warmth", "Straight brow shape flatters most face shapes"],
    colorPalette: ["Coral", "Peach", "Soft pink", "Warm nude", "Brick red"],
  },
  hispanic: {
    foundations: [
      { name: "Maybelline Fit Me", shade: "220-330", price: "$8", note: "Budget-friendly, good match" },
      { name: "Too Faced Born This Way", shade: "Warm Nude-Chai", price: "$40", note: "Medium-full, warm undertones" },
    ],
    tips: ["Warm bronzer for natural sun-kissed glow", "Terracotta lip colors complement warm undertones", "Peachy blush over pink for natural warmth"],
    colorPalette: ["Terracotta", "Warm nude", "Burnt sienna", "Coral", "Mango"],
  },
  "middle-eastern": {
    foundations: [
      { name: "Huda Beauty #FauxFilter", shade: "Toasted Coconut-Café Au Lait", price: "$40", note: "Full coverage, olive-friendly" },
      { name: "Giorgio Armani Luminous Silk", shade: "5.5-7", price: "$64", note: "Radiant finish, olive undertone options" },
    ],
    tips: ["Olive undertone matching is key — avoid too pink/yellow", "Smoky kohl looks are classic and flattering", "Rose gold highlighter on cheekbones"],
    colorPalette: ["Olive gold", "Deep plum", "Smoky mauve", "Warm brown", "Rose"],
  },
  "south-asian": {
    foundations: [
      { name: "Kay Beauty Foundation", shade: "130Y-210W", price: "$25", note: "Made for Indian skin tones" },
      { name: "Bobbi Brown Skin Long-Wear", shade: "Warm Sand-Warm Walnut", price: "$50", note: "Natural finish, great shade range" },
    ],
    tips: ["Orange color corrector neutralizes dark circles", "Berry lip colors pop against medium-deep skin", "Bronzer with red undertone for warmth"],
    colorPalette: ["Berry", "Deep red", "Gold", "Burnt orange", "Warm pink"],
  },
};

// ─── Hair by Ethnicity ────────────────────────────────────────────────

export const hairByEthnicity: Record<Ethnicity, {
  hairType: string;
  products: Array<{ name: string; price: string; note: string }>;
  styles: string[];
  tips: string[];
}> = {
  caucasian: {
    hairType: "Straight to wavy (Type 1-2)",
    products: [
      { name: "Olaplex No. 3 Treatment", price: "$30", note: "Bond repair for colored/heat-damaged hair" },
      { name: "Living Proof Full Shampoo", price: "$32", note: "Volume without weight" },
    ],
    styles: ["Curtain bangs", "Long layers", "Soft waves", "Sleek bob", "Beach waves"],
    tips: ["Protect from heat — always use 400°F max", "Purple shampoo for blondes 1x/week", "Keratin treatments for frizz control"],
  },
  african: {
    hairType: "Coily/Kinky (Type 3C-4C)",
    products: [
      { name: "Shea Moisture Curl Enhancing Smoothie", price: "$13", note: "Defines curls, deep moisture" },
      { name: "Mielle Rosemary Mint Oil", price: "$10", note: "Scalp health & growth stimulation" },
    ],
    styles: ["Twist-outs", "Bantu knots", "Goddess locs", "Afro puff", "Braided styles"],
    tips: ["Satin/silk pillowcase is non-negotiable", "Deep condition weekly", "Detangle with conditioner only, never dry"],
  },
  asian: {
    hairType: "Straight & thick (Type 1A-1B)",
    products: [
      { name: "Shiseido Tsubaki Shampoo", price: "$18", note: "Japanese formula for thick, straight hair" },
      { name: "Mise en Scène Perfect Serum", price: "$12", note: "K-beauty staple, frizz control" },
    ],
    styles: ["Hime cut", "C-curl perm", "Korean layered bob", "Straight with face framing", "Soft S-wave"],
    tips: ["Digital perm for lasting waves", "Volume powder at roots for lift", "Avoid heavy products — hair lies flat easily"],
  },
  hispanic: {
    hairType: "Wavy to curly (Type 2B-3B)",
    products: [
      { name: "Moroccanoil Treatment", price: "$48", note: "Argan oil for frizz & shine" },
      { name: "Cantu Curl Activator Cream", price: "$6", note: "Budget-friendly curl definition" },
    ],
    styles: ["Natural curls embrace", "Layered waves", "Side-swept bangs", "Curly bob", "Half-up curls"],
    tips: ["Diffuser attachment for curl definition", "Microfiber towel to reduce frizz", "Co-washing between shampoo days"],
  },
  "middle-eastern": {
    hairType: "Thick, wavy to curly (Type 2A-3A)",
    products: [
      { name: "Moroccan Gold Series Argan Oil", price: "$35", note: "Traditional argan treatment" },
      { name: "Kerastase Discipline Masque", price: "$55", note: "Smoothing for thick, unruly hair" },
    ],
    styles: ["Sleek blowout", "Voluminous waves", "Long layers with movement", "Middle part with waves", "Braided crown"],
    tips: ["Weekly hair mask for density management", "Argan oil as leave-in is traditional & effective", "Anti-humidity spray for hold"],
  },
  "south-asian": {
    hairType: "Straight to wavy, thick (Type 1B-2A)",
    products: [
      { name: "Forest Essentials Hair Cleanser", price: "$28", note: "Ayurvedic, sulfate-free" },
      { name: "Biotique Bio Kelp Shampoo", price: "$8", note: "Anti-hair fall, natural ingredients" },
    ],
    styles: ["Classic long layers", "Soft waves", "Side braid", "Blunt cut with bangs", "Loose curls"],
    tips: ["Coconut oil pre-wash is a proven tradition", "Avoid tight hairstyles that cause traction alopecia", "Hibiscus rinse for shine & strength"],
  },
};

// ─── Fragrance by Ethnicity ──────────────────────────────────────────

export const fragranceByEthnicity: Record<Ethnicity, {
  profile: string;
  scents: Array<{ name: string; type: string; price: string; season: string }>;
}> = {
  caucasian: {
    profile: "Fresh & floral with subtle woody base",
    scents: [
      { name: "Chanel No. 5", type: "Floral Aldehyde", price: "$105", season: "Year-round" },
      { name: "Jo Malone Peony & Blush Suede", type: "Floral", price: "$75", season: "Spring/Summer" },
      { name: "Tom Ford Black Orchid", type: "Oriental Floral", price: "$150", season: "Fall/Winter" },
    ],
  },
  african: {
    profile: "Rich, warm & bold — shea, cocoa, amber",
    scents: [
      { name: "Juvia's Place The Warrior", type: "Warm Spicy", price: "$52", season: "Year-round" },
      { name: "Tom Ford Tobacco Vanille", type: "Oriental Spicy", price: "$155", season: "Fall/Winter" },
      { name: "Viktor & Rolf Flowerbomb", type: "Oriental Floral", price: "$95", season: "Year-round" },
    ],
  },
  asian: {
    profile: "Light, clean & elegant — green tea, cherry blossom",
    scents: [
      { name: "Issey Miyake L'Eau d'Issey", type: "Aquatic Floral", price: "$65", season: "Spring/Summer" },
      { name: "Shiseido Ever Bloom", type: "Floral", price: "$55", season: "Spring" },
      { name: "Diptyque Do Son", type: "White Floral", price: "$100", season: "Summer" },
    ],
  },
  hispanic: {
    profile: "Warm, tropical & passionate — vanilla, jasmine",
    scents: [
      { name: "Carolina Herrera Good Girl", type: "Oriental Floral", price: "$88", season: "Year-round" },
      { name: "Dolce & Gabbana Light Blue", type: "Citrus Floral", price: "$80", season: "Summer" },
      { name: "YSL Libre", type: "Fougère Floral", price: "$95", season: "Fall/Winter" },
    ],
  },
  "middle-eastern": {
    profile: "Opulent & complex — oud, rose, saffron, amber",
    scents: [
      { name: "Amouage Honour Woman", type: "Floral Woody", price: "$200", season: "Year-round" },
      { name: "Swiss Arabian Shaghaf Oud", type: "Oud Floral", price: "$38", season: "Fall/Winter" },
      { name: "Kayali Vanilla 28", type: "Oriental Vanilla", price: "$78", season: "Year-round" },
    ],
  },
  "south-asian": {
    profile: "Spiced florals — jasmine, sandalwood, turmeric notes",
    scents: [
      { name: "Forest Essentials Nargis", type: "Indian Floral", price: "$45", season: "Spring" },
      { name: "Le Labo Santal 33", type: "Woody Aromatic", price: "$195", season: "Year-round" },
      { name: "Gucci Bloom", type: "White Floral", price: "$90", season: "Summer" },
    ],
  },
};

// ─── Nail care by Ethnicity ──────────────────────────────────────────

export const nailsByEthnicity: Record<Ethnicity, {
  tips: string[];
  colors: string[];
  shapes: string[];
}> = {
  caucasian: {
    tips: ["Cuticle oil daily for stronger nails", "Gel manicure every 2-3 weeks", "Nail hardener base coat for brittle nails"],
    colors: ["Nude pink", "Classic red", "French tips", "Dusty rose", "Burgundy"],
    shapes: ["Almond", "Oval", "Squoval"],
  },
  african: {
    tips: ["Moisturize cuticles — they show more", "Bright & bold colors pop beautifully", "Shorter nails with press-ons for versatility"],
    colors: ["Electric blue", "Hot pink", "Gold chrome", "Deep plum", "Neon coral"],
    shapes: ["Coffin", "Stiletto", "Square"],
  },
  asian: {
    tips: ["Japanese gel nails for longevity", "Nail art & subtle designs", "Thin, precise application layers"],
    colors: ["Soft pink", "Milky white", "Lavender", "Sheer glitter", "Sage green"],
    shapes: ["Round", "Oval", "Short squoval"],
  },
  hispanic: {
    tips: ["Dip powder for durability", "Warm tones complement skin beautifully", "Accent nail with glitter or design"],
    colors: ["Coral", "Burnt orange", "Nude tan", "Cherry red", "Metallic bronze"],
    shapes: ["Coffin", "Almond", "Ballerina"],
  },
  "middle-eastern": {
    tips: ["Henna-inspired nail art for special occasions", "Rich jewel tones for elegance", "Regular cuticle care is key"],
    colors: ["Deep emerald", "Ruby red", "Gold", "Midnight blue", "Cream"],
    shapes: ["Almond", "Oval", "Stiletto"],
  },
  "south-asian": {
    tips: ["Turmeric staining prevention — base coat always", "Festive nail art for celebrations", "Coconut oil cuticle treatment"],
    colors: ["Maroon", "Gold glitter", "Deep red", "Magenta", "Turquoise"],
    shapes: ["Round", "Almond", "Square"],
  },
};
