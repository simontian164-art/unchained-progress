# Expert audit of the member app (v1 → v2)

The question: *what would each expert expect this platform to analyze or recommend that's missing, and what would they reject?*
No expert endorsed this. It's a review written from those perspectives.

## What v1 actually did

| Area | v1 | Problem |
|---|---|---|
| Face | Face-shape estimate from 4 landmark ratios; user confirms | Nothing else used from the photo. No thirds, no brows, no under-eye, no lips. |
| Hair | One cut name per face shape × length | No density, hairline, maintenance, current cut, no barber instructions, one option only. |
| Hairline | Not a category | Biggest omission for the audience. |
| Facial hair | One sentence per face shape | No options, no neckline/cheek/moustache/sideburn detail, no link to haircut. |
| Skin | Self-reported type + concerns → AM/PM with one active | Reasonable, but no sun-reactivity (post-inflammatory hyperpigmentation risk), no allergies/fragrance, no ingredient guidance, no "don't combine", no pro triggers. |
| Eyes/brows/lips/smile/neck | One grooming line | Missing. |
| Style | Palette by contrast, capsule by budget, fit issues | No necklines/collars, glasses/sunglasses, undertone, build/height, measurements. |
| Body | Optional generic plan | Fine, but no sleep. |
| Products | Generic category list | No why / replaces / how / when / combine / cost / where / alternatives / preferences / location. |
| Prioritization | 5 areas sorted by a label | No impact/effort/cost/timeframe, no Top 3, no "do later". |
| Professionals | Scattered cautions | No clear at-home vs product vs barber vs derm vs dentist split. |
| Psychology | No scores (good) | Streak counter invites compulsive checking; unlimited re-analysis; no pacing; no wellbeing safeguard. |
| Localization | None | USD only, no country, no metric, no local/online shopping. |

## Gaps by expert lens

- **Facial-aesthetics creator:** expects hairline, haircut specifics, beard framing, brows, skin basics, leanness/posture, "what to tell the barber". Would push canthal tilt, PSL ratings, mewing: **rejected** (no evidence or harmful).
- **Facial plastic surgeon:** would warn against implying structural "deficiencies" from phone photos (lens distortion at close range changes nose and jaw appearance). Only non-surgical, reversible suggestions belong here. Surgery questions go to a board-certified surgeon.
- **Maxillofacial specialist:** jaw position, bite and airway can't be assessed from selfies. Refer jaw pain, clicking and bite concerns to a dentist or orthodontist. Never diagnose "recessed maxilla".
- **Dermatologist:** needs sun reactivity (PIH risk on deeper skin tones), sensitivity and allergies, one active at a time, patch testing, SPF adherence, and clear triggers for a visit: painful or cystic acne, a changing mole, persistent redness or rash, sudden shedding. Photo skin assessment is lighting-dependent, so frame it as "appears in this photo".
- **Trichologist:** density, hairline and crown photos over time, scalp care (dandruff, oiliness), and gentle wording for progressive thinning with referral. Never diagnose androgenetic alopecia from a photo, never dose medication.
- **Barber:** wants face shape and head shape, texture, density, cowlicks, hairline, maintenance tolerance, current length, sides preference, and a spec to hand over: guard or taper type, top length in cm/in, neckline, sideburns, temples, finish.
- **Cosmetic dentist / orthodontics-informed reviewer:** smile section limited to hygiene habits, visible staining (self-reported), lip care, whitening safety (dentist first if sensitive teeth or restorations). Alignment and bite go to professionals.
- **Grooming expert:** beard options (not one "correct" beard), neckline/cheek line/moustache/sideburn instructions, brows, nose and ear hair, nails, fragrance restraint.
- **Stylist:** collars and necklines vs face shape, glasses and sunglasses, undertone (heuristic), build and height proportions, measurements for online shopping, and the connection between haircut, beard and wardrobe formality.
- **Fitness expert:** realistic rates of change, protein, steps, sleep, posture; no extreme leanness default; no body-fat estimates from photos.
- **Psychologist:** remove streak pressure, cap analysis frequency, show "what's working" first, pace actions (Today ≤ 3), avoid defect language, avoid asymmetry call-outs that aren't actionable, and add an optional wellbeing check with a supportive route if appearance worries take up a lot of someone's day.
- **Consumer-safety reviewer:** no fabricated products, prices, stock, distances or certifications; "natural" isn't automatically safer; fragrance and essential oils are common irritants; list what not to combine.
- **Product-recommendation expert:** free actions first, then low-cost, then product, then service. Say what each product replaces. Give a cheaper option, a total cost and budget filters.
- **Localization expert:** country, currency, metric/imperial, retailer and search links per country, product availability varies (sunscreen filters and adapalene status differ by country).

## Classification

### MUST HAVE (built in v2)
1. Expanded profile: country, optional postcode, shopping preference, budget, maintenance tolerance, product preferences (natural/organic, fragrance-free, vegan, cruelty-free), known allergies, sun reactivity, hair density and hairline self-report, sides preference, facial-hair preference, brows, smile habits, build/height (optional), professional openness, optional wellbeing check.
2. Modular analysis with **Strong / Opportunity / Priority** status (no numbers), "What's working" first, and observations labelled by source (*photo* vs *your answers*).
3. Hair + hairline module with guided hairline/temple/crown photos for self-review, and careful referral wording.
4. Haircut engine with Best match / Low-maintenance / Shorter / Longer / Approach carefully, each with reasons.
5. **Show My Barber** card with measurable instructions (cm/in by country).
6. Facial-hair options with neckline, cheek line, moustache and sideburn instructions tied to the haircut.
7. Skin routine AM/PM/weekly personalized by type, sensitivity, sun reactivity, allergies, preferences and budget, plus ingredient notes, "don't combine", patch testing and pro triggers.
8. Eyes/brows, lips/smile, neck/posture and style modules (collars, glasses, undertone, build).
9. Every recommendation tagged **impact / effort / cost / timeframe** and **type** (at home, product, barber/stylist, professional, lifestyle). **Top 3** plus Today (≤ 3) / This week / This month / Later.
10. **Shop My Plan**: Essentials, Optional, Grooming, Style; purpose, replaces, how/when/how often, avoid combining, estimated price range, cheaper and preference-matched alternatives, local map search and online search links; total cost range and budget filters. Free actions listed first.
11. **When to see a professional** section with at-home vs product vs barber vs derm vs dentist vs other.
12. Psychology guardrails: no streaks (weekly consistency instead), 14-day minimum between re-analyses, check-in cadence guidance, neutral language, wellbeing route.
13. Better photo-quality checks (resolution, expression) and more photo slots (front, left, right, hairline, crown, smile, full body).

### HIGH VALUE (built in v2 where safe)
- Photo-based observations with conservative thresholds and lighting caveats: apparent mid- vs lower-face balance (used only to steer beard length), brow-height difference (only shown if the user flagged uneven brows), under-eye brightness vs cheeks, mouth-open check.
- **Dropped after review:** photo-based redness or skin grading. Simple colour measures are unreliable across skin tones and lighting, so skin stays self-reported.
- Location: "use my location" or postcode builds map searches (pharmacy, natural beauty store, barber, dermatologist) **without** showing unverifiable distances, hours or stock.
- Example products: a short list of long-established, widely sold products, always labelled "availability, price and formula not verified for your country". No certification claims.

### NICE TO HAVE (later, needs backend or partners)
- Live product data and inventory through retailer or affiliate APIs; Places API for distance, hours and ratings.
- Reminders (push/email) for routine and check-ins.
- Account sync across devices; barber booking; shareable barber card image; multilingual UI.
- AI hairstyle try-on, **only** with clear "simulation" labelling.

### DO NOT BUILD
- Attractiveness, "PSL" or per-feature numeric scores; leaderboards; ranking against others.
- Canthal tilt / "hunter eyes" rules, golden-ratio or phi scoring, "ideal" facial-ratio targets, ethnicity-based ideals.
- Mewing, bone smashing, jaw-exercise devices marketed for bone change.
- Skeletal or medical diagnoses from photos (recessed maxilla, alopecia type, acne grade, rosacea, eczema, skin cancer).
- Medication or prescription dosing (finasteride, minoxidil strengths, isotretinoin, peptides, steroids).
- Body-fat percentage or weight estimates from photos; extreme leanness targets.
- Daily face scans or daily before/after comparison.
- AI "future you" morphs presented as expected results.


---

# Re-audit after v2 (what each expert would still say)

| Lens | Now covered | Still missing / next |
|---|---|---|
| Aesthetics creator | Hairline category, 5 haircut options with reasons, barber card with guards and cm/in, beard options with lines, brows, posture, top 3 | No visual try-on; no side-profile analysis (photos are stored for self-review only) |
| Facial plastic / maxillofacial | No structural claims; alignment and bite referred out; lens-distortion caveats | Could add a "why selfies distort" explainer on the photo step |
| Dermatologist | Routine by type, sensitivity, sun reaction, allergies; one active at a time; "don't combine"; patch testing; mole / acne / redness referral | Real ingredient lists per product need a product database; no reminder when to re-assess an active at 8–12 weeks |
| Trichologist | Density, hairline shape and change, scalp care, 8–12-week hairline photo cadence, careful referral wording | Side-by-side hairline comparison view (photos are saved; UI compares front photos only) |
| Barber | Sides, top length, fringe, neckline, sideburns, temples, texture, finish, avoid list, rebook interval, cowlick handling, beard blend | Head-shape and crown-whorl questions; barber card as a shareable image |
| Cosmetic dentist / orthodontics | Floss, staining, whitening safety, sensitivity/gums → dentist, alignment → orthodontist; no photo assessment | — (deliberately limited) |
| Grooming expert | Beard options, neckline/cheek/moustache/sideburns, brows, nose/ear hair, lips | Fragrance guidance intentionally light |
| Stylist | Necklines by face shape, frames, palette by contrast, undertone heuristic, build and height, measurements, capsule by budget, nickel-free jewelry | Outfit builder; sizing across brands |
| Fitness | Training frequency, realistic rates, protein range, posture, sleep; no body-fat estimates | Program templates by equipment |
| Psychologist | No scores; "what's working" first; Top 3 and Today ≤ 3; no streaks (7-day consistency count instead); 14-day re-analysis spacing; 14/28-day check-ins; wellbeing question with supportive note and therapist route; neutral language enforced by tests | Optional "take a break" mode; periodic check on how the plan feels |
| Consumer safety | No fabricated stock, prices, distances or certifications; price ranges labelled estimates; examples labelled "not verified for your country"; natural ≠ safer; allergy flags | Formal medical/legal review of copy before launch |
| Product-recommendation | Free first; each item has purpose, replaces, how/when/how often, don't combine, ingredients, cheaper route, natural route, local + online search, budget filter and total | Live prices and stock need retailer/affiliate APIs; affiliate links would need disclosure |
| Localization | Country, currency estimates, cm/in, country-specific Amazon and shopping links, postcode or one-time location for maps | Translations; retailer names per country |

## Still intentionally not built
Everything in the DO NOT BUILD list above, plus: live distances, opening hours and stock (no verified data source yet).
