# GlowMax: next product pass (personalization depth)

Reviewed from the perspectives of a facial-aesthetics creator, facial plastic surgeon, maxillofacial specialist, dermatologist, trichologist, barber, hairstylist, cosmetic dentist, orthodontics-informed reviewer, stylist, grooming expert, fitness expert, body-image psychologist, behavioral/product psychologist, product-recommendation expert and AI product architect. **No real person reviewed or endorsed this.** It's a review written from those perspectives.

The brief was cut off at "P2". I've used: **P0** = don't launch without it, **P1** = high impact, **P2** = worth doing after launch, **P3** = later or only with the right data or partners.

---

## 1. Does the overview match the code?

This compares what the overview document claimed with what the code actually did **before this pass**, and what's true now.

| Feature (as described) | Before this pass | Now |
|---|---|---|
| Marketing site, example, pricing | Working | Working |
| Legal pages | Placeholder (brackets, needs a lawyer) | Placeholder (unchanged; P0) |
| Waitlist | Partially working (opens an email; no database) | Same (P0, backend) |
| Accounts / sign-in | UI only | UI only (P0, backend) |
| Stripe checkout | UI only (demo mode) | UI only (P0, backend) |
| Essentials vs Plus limits | **Not implemented**: the app behaves the same for both | Same. **P0: pricing promises things the app doesn't enforce** |
| 7-step setup | Working | Working, plus conditional follow-ups |
| Photo quality checks | Working (tested on synthetic images only) | Same. **A real face has still never been tested** (P0) |
| Face shape estimate + user confirmation | Working | Working; confirmed shape now counts as the user's answer |
| Photo cues (lower face, brows, under-eye) | Working but **over-weighted**: one selfie ratio could swing the beard choice by 2 points | Down-weighted; photo-only recommendations can't reach the top 3 |
| "Hairline tracking every 8–12 weeks" / Plus "hairline & crown tracking" | **Not implemented.** One hairline photo was saved at setup; Progress compared front photos only | **Built**: 5-angle controlled sets, interval comparison |
| Haircut engine "uses combinations" | Partially working: face shape, texture, density, length, sides, upkeep, hairline. **Ignored** style identity, dress code, beard and fine hair at length | All of those now affect the score and the explanation |
| Beard engine | Partially working: **ignored upkeep tolerance** | Upkeep-aware; routine text changes with upkeep |
| Skin routine | Working for single concerns. Combinations were weak (dry + breakouts got salicylic acid; breakouts + dark marks ignored the marks) | Combination-aware; always 0–1 new active |
| "Already using" products | **Not collected.** The plan could add a second active on top of one you already use | Collected; no stacking; conflicts explained |
| Top 3 | Partially working: ignored budget, upkeep and evidence quality; told clean-shaven users to "keep a clean shave" as a priority | Weighs evidence, budget and upkeep; "keep doing" items leave the task list |
| Frames | Face shape only | Types, style, prescription, beard/haircut interplay, in-store fit checks |
| Brows | 1–4 generic lines | Stray, tail, between-brows, regrowth, threading/waxing option; "leave them alone" if happy |
| Wellbeing: "This plan is deliberately short" | **Broken claim**: the plan wasn't shorter; only the note and check-in spacing changed | True now: at most 6 actions, no photo observations, no cosmetic extras, re-analysis every 28 days |
| Shop "only what your plan uses" | Working, with one **bug**: sunscreen was listed even when the user said they wear it daily | Fixed; owned items listed as "not listed because you already have them" |
| "When to see a professional" | Working (who and when) | Adds "questions to ask" and "what to bring" (the user's own reports, never a diagnosis) |
| Guides | Working (education) | Working; capsule now drawn from the matching guide |
| Old member area (PSL, golden ratio, "ethnicity" skincare data) | **Dead code still in the repo**, unrouted | **Deleted locally.** It must also be deleted on GitHub (the ZIP can't delete files) |

### Answers that were collected but didn't change anything (fixed in this pass)
- Upkeep tolerance → beard choice (now used).
- Style identity → haircut (now used). Only 5 styles existed; "quiet luxury", "athletic" and "rugged" couldn't be picked, even though the Guides covered them (added).
- Frequent appearance worry → the plan itself (now shortens it).
- "I wear sunscreen daily" → still listed sunscreen to buy (fixed).

### Still thin (honest)
- **Natural/organic preference** adds label guidance and a certified-organic search link. Without real product data it can't do more, and shouldn't pretend to.
- **Shop local vs online** only changes which links show.
- **Country** changes currency estimates, units and links, not which products exist.
- **Undertone and contrast** only change colour text.

---

## 2. Four very different people (before → after)

All four use an oval face shape so that only the answers differ.

**Before this pass**, B, C and D shared most of their plan. Examples:
- **A:** the top priority was "Keep a clean shave, done well".
- **D:** long, fine hair plus low upkeep produced long layers with no warning.
- **B:** the changing temples produced a generic "track calmly" item.

**After** (generated by `personalization.test.ts`):

| | Top 3 | Best cut | Facial hair | Skin active | No change needed | Hairline | Actions | Items to buy |
|---|---|---|---|---|---|---|---|---|
| **A** straight thick, stable, dry sensitive, clean-shaven, quiet luxury, high budget | New haircut: textured crop with a fringe · Edit your closet first · Round out your basics | Textured crop with a fringe | Clean-shaven (kept) | Hyaluronic acid | Clean shave, sunscreen, brows, fit, training | — | 10 | 8 |
| **B** curly, temples changing 1–3 years with family history, oily breakouts, full beard, streetwear, low budget, natural | New haircut: shaped curls · Sunscreen · Short boxed beard | Curly shag (hairline-friendly spec) | Short boxed beard | Salicylic acid | Brows | Track + professional | 17 | 11 |
| **C** coily, stable, razor bumps, stubble, athletic, fragrance-free, cruelty-free, local | New haircut: curly top with a low taper · Sunscreen · Light stubble | Curly top with a low taper | Light stubble | Salicylic acid (for bumps) | Brows | — | 14 | 11 |
| **D** long fine hair, dandruff + sensitive scalp, no facial hair, minimal, very low upkeep | New haircut: long layers · Sunscreen · Edit your closet first | Long layers, with a fine-hair warning and a lob as the low-upkeep option | n/a | None (no concerns) | Brows, flossing, fit | — | 7 | 7 |

Honest read:
- **Sunscreen appears in three of four top 3s.** That's correct: none of B, C or D wear it, and it's the highest-value skin habit.
- **A still gets a crop, not a classic side part.** The test profile inherits "low upkeep", and a side part needs daily styling. The explanation says so.
- **D keeps the long hair they asked for.** Honouring a stated preference (with a warning) is better than overriding it.

---

## 3. Your ideas, classified

| Idea | Status before | What I did |
|---|---|---|
| Hairline history (when, shedding, family, habits) | Missing | **Built**: follow-ups appear only if a change is reported; habits are always optional |
| Style it / track it / change care / see a professional | Missing | **Built** as an "approach", never a diagnosis |
| Controlled hairline capture (5 angles, conditions) | Missing | **Built**: all 5 conditions must be ticked; smaller images to save storage |
| Baseline / 8 weeks / 12 weeks / 6 months comparison | Missing | **Built**: side-by-side per angle, gated by date, cautious wording, never "got worse" |
| Multi-variable haircut logic | Partially exists | **Extended**: style, dress code, beard pairing, fine hair, rejected cuts, upkeep feedback |
| "See this haircut on me" | Missing | **Not built.** Architecture below; current generative try-on is not reliable enough to show as "you" |
| Constraint-aware beard | Partially exists | **Extended**: upkeep, patchy growth, bumps; photo cue reduced to a nudge |
| Brow depth | Partially exists | **Extended** (practical grooming, no "ideal brow") |
| Frames beyond face shape | Partially exists | **Extended**: types, characteristics, in-store checks, prescription |
| Skin combination stress test | Partially exists | **Fixed**: dry/sensitive + breakouts → azelaic; breakouts + marks → one product for both; oily + sensitive → gel + light moisturizer; existing actives are never stacked |
| Structured product data | Missing | **Designed** (section 6). Needs a data source; not faked |
| Real local availability | Missing | **Designed** (section 6). Needs Places plus retailer data |
| Best match / budget / natural / premium | Missing | Designed; depends on product data |
| What I already own (skin/hair) | Missing | **Built** for skin, hair and trimmer |
| "Does this fit my plan?" product check | Missing | Designed (P2) |
| Your capsule from your style | Partially exists (generic by budget) | **Built**: from the matching style guide, counted by budget, plus work pieces for smart/formal dress codes |
| Wardrobe inventory ("what I own" for clothes) | Missing | P1, not built this pass |
| "What should I wear today?" | Missing | P2 (needs wardrobe inventory first) |
| Live capture guidance | Missing | Designed (section 7); needs real-device testing |
| "You may not need to change this" | Missing | **Built**: a "No change needed" section driven by answers (sunscreen, routine, cut, shave, brows, flossing, fit, training, features) |
| Wellbeing lowers intensity | Missing (note only) | **Built**: light mode |
| Intelligent Top 3 | Partially exists | **Extended**: evidence weight, budget, upkeep, "helpful" feedback |
| Confidence / evidence labels | Partially exists (on observations only) | **Built** for recommendations: answers / answers + photo / photo only / general |
| "Why is this in my plan?" | Missing | **Built** on every recommendation (enforced by a test) |
| User corrections | Missing | Partially built: "Not accurate? Update your answers" on every explanation. Per-observation corrections are P1 |
| Helpful / Not for me + reasons | Missing | **Built**: the plan rebuilds immediately; rejected haircuts and beards are swapped; removed items can be restored |
| Personalization memory | Missing | Partially built (feedback, owned products, hairline sets, all local, exported and deleted with the existing controls). Cross-device sync needs accounts |
| Expert escalation | Partially exists | **Extended**: questions to ask and what to bring for each professional |
| Remove pseudoscience | Mostly done; dead legacy pages remained | **Deleted** 48 unrouted legacy files, including golden-ratio and PSL pages and "ethnicity" skincare data |
| Educate on viral claims | Partially exists (Guides "what won't help") | P1: a dedicated "claims checked" guide |
| Symmetry score, better-side verdicts, attractiveness ratings | — | **SHOULD NOT BUILD** |

---

## 4. Gaps you didn't mention (independent review)

**Facial plastic surgeon / maxillofacial**
- Face shape is one label from one photo. Side photos are collected but not used for anything except storage. **P2:** use them only for photo-setup guidance, never for structural judgments.
- **P1:** a clear line for the looksmaxxing audience about cosmetic procedures: what non-surgical and surgical options exist, their risks, and questions for a board-certified surgeon. Educational only, no recommendation.

**Dermatologist**
- Irritation vs expected adjustment wasn't explained. **Added** (stop on burning, swelling, rash).
- Retinoids and pregnancy were only a shop flag. **Added** to the plan step.
- **P1:** re-check the active at 8–12 weeks: keep, adjust or stop, and step up only one variable at a time.
- **P2:** seasonal adjustment (winter barrier, summer SPF reapplication); body and back breakouts; shaving technique for the neck.

**Trichologist**
- Diffuse thinning along the part isn't captured. **Added** a middle-part hint to the "top" angle.
- **P2:** wash frequency and moisture routines by texture (coily and curly hair usually need fewer washes).
- **P2:** explain in plain words that shedding after illness or stress is common and often temporary, without naming conditions.

**Barber / hairstylist**
- **P1:** the app doesn't know the current cut or current length. It can't say "grow 6 weeks before this cut" (hair grows roughly 1–1.5 cm a month).
- **P1:** cowlick and crown-whorl location, and head shape at the back.
- **P2:** a script for the chair ("I'd like…, keep…, don't…") in addition to the card.

**Stylist**
- **P1:** no wardrobe inventory, climate, measurements storage or occasion planning. The capsule is still "what to buy", not "what to wear".
- **P2:** shoes and accessories logic; formality by occasion.

**Dental**
- Safely useful scope is already right. **P3:** night-grinding and jaw-clenching signals → dentist; a whitening timeline that sets expectations.

**Body-image psychologist**
- The before/after slider and repeated hairline comparisons can feed scrutiny. Both are now paced, but **P1:** a "take a break" mode that hides photo comparisons for a set period.
- **P1:** a periodic check on how the plan feels ("Is this taking more time or worry than it's worth?") that can lighten the plan.
- Watch the language on the body module: "Priority" next to body can read as a judgment of the user's body. **P1:** use "Focus" wording there.

**Behavioral / product psychologist (why people won't follow the plan)**
- 10–17 actions is still a lot, even though Today is capped at 3.
  - **P1:** a "minimum version" of the routine for bad days.
  - **P1:** "when and where" prompts ("after brushing your teeth").
- There's no feedback between setup and the first 8-week check.
  - **P1:** small weekly wins from the routine log.
  - **P2:** reminders (these need a backend).

**Looksmaxxing-audience expert (practical, non-pseudoscientific)**
- **P1:** a "claims checked" guide: mewing, bone smashing, canthal tilt, jawline gum, facial ratios. Each explains *why* the claim is weak, which builds trust with this audience.
- **P1:** leanness and the face, handled honestly: body-fat changes do affect how the face and jaw look. This belongs in body goals with realistic rates and no photo estimates.
- **P2:** posture for photos and neck and trap training, in the posture guide.

**AI product architect (where it still pretends)**
- Everything is hand-written rules with hand-picked weights. That's fine and auditable, but the weights are **not validated with real users**. **P1:** log anonymized "helpful / not for me" rates per recommendation once a backend exists, and review the weights.
- The natural, local and budget preferences are thin, as noted above.
- Face-shape detection has **never been tested on a real face**. **P0:** do that.

**Business**
- See section 5.

---

## 5. What would make someone pay monthly? (honest)

After setup, a user has their analysis, haircut card, routine, shopping list and style guide. **Most of the value is delivered in week one.** Today, the only real recurring features are:
- the routine checklist
- check-ins every 14 days
- hairline sets every 8–12 weeks
- barber rebooking (no reminders yet)

That doesn't justify $19–39 every month for most people, and churn after month one is the likely outcome.

The recurring value that is **real** (not manufactured):
1. **Hairline tracking** for the minority who need it: quarterly, and valuable to them.
2. **Routine review at 8–12 weeks**: adjust, keep or stop the active.
3. **Haircut upkeep**: rebooking timing and a fresh barber card when growing into a new cut.
4. **Wardrobe and outfits** (not built): the one area with daily and weekly value.
5. **Seasonal and event prep**: a few times a year.

**Recommendation:** one-time analysis with an optional low-cost membership.
- A one-time full analysis and plan.
- An optional membership for tracking, routine reviews, hairline sets, wardrobe and outfits, with annual as the default.
- Keep the monthly price only once wardrobe and outfits exist.

The current Essentials/Plus split promises limits the app doesn't enforce. **Fix before charging anyone (P0).** Test prices with real users; this isn't financial advice.

---

## 6. Architecture for product data and local availability (not built: needs data sources)

### Product record
The product record would hold:
- **Identity:** `id`, `name`, `brand`, `category`, `size` + `unit`, `pricePerUnit`.
- **Where it's sold:**
  - `countries[]`: where it's actually sold
  - `retailers[]`: `{ name, url, country, lastCheckedAt, affiliate: boolean }`
- **Composition:** `keyIngredients[]` and `fullIngredients[]` (INCI).
- **What it suits:** `skinTypes[]`, `hairTypes[]`, `concerns[]` and `incompatibleWith[]` (ingredient classes).
- **Verified attributes:** `fragranceFree`, `vegan`, `crueltyFree` and `organicCert`.
  - Each is stored as `{ value, source, verifiedAt }`.
  - **Absent means unknown, never false or true.**
  - Certifications (Leaping Bunny, COSMOS, Ecocert, Vegan Society) come only from the certifier's own list or the pack, never from marketing words.

### Ranking for one user
1. **Hard filters:** allergies, fragrance-free if required, sold in the user's country, not already owned.
2. **Fit score:** matches concerns, skin or hair type, sensitivity and budget.
3. **Output four slots:** Best match, Best budget, Natural/organic (only if a verified certification exists), Premium.
4. **Each result shows:**
   - **Why this matches you**, for example "fragrance-free and under $25".
   - **Trade-off**, for example "not certified organic" or "not sold in stores near you".
5. **Commission is joined only after ranking.** A test asserts that the ranking is identical with affiliate data removed. Affiliate links carry a visible disclosure.

### Local availability
- **Places data** (for example Google Places or Mapbox) with the user's postcode or city (GPS optional). This gives stores by category (pharmacy, beauty, natural, barber, salon, department store) with distance and opening hours.
- **Stock:** few retailers offer public inventory APIs.
  - Show "Stock not verified: check before visiting" unless a retailer feed confirms stock.
  - Always show "last checked".
- **Price:** "listed price at [retailer], checked [date]", never a guess.

### Already own / "Does this fit my plan?"
The user searches for or scans a product. The system matches its ingredients to the plan and returns one of:
- **Good fit**
- **Already covered** (duplicates a step)
- **Not necessary**
- **Possible conflict** (for example retinoid + acid on the same night)
- **Doesn't match your preferences**

No medical claims. Ingredient interactions stay at the level of common label guidance.

### "See this haircut on me"
The flow would be: recommended cut → reference photos → preview → barber card → find a barber.
- **Now:** licensed reference photos of each cut on a range of hair textures. Commission these from barbers or UGC creators with releases, per texture.
- **Later:** an on-device or server hair-segmentation try-on, labelled "simulation, not a prediction", with no face changes. Only after testing it on a wide range of textures, since coily and curly hair are where these models usually fail.

---

## 7. Live capture guidance (designed, P2)

Use the existing FaceMesh landmarks on a video stream (throttled) to give live prompts:
- **Face size in frame** → "step back" or "come closer".
- **Roll and yaw** → "face forward".
- **Brightness and backlight** → "more light" or "face the window".
- **Sharpness** → "hold still".
- **Mirrored preview** plus a note about how the saved photo differs.

"Remove filter" can't be detected reliably, so show it as a reminder instead. Needs testing on real phones and a wide range of skin tones before launch.

---

## 8. Priorities

**P0: don't launch without these**
1. Accounts, Stripe and a waitlist database (backend prompts A–D in LAUNCH_CHECKLIST).
2. Make pricing match the product: either enforce Essentials/Plus differences or change the offer (see section 5).
3. Test the face scan on real faces across skin tones and lighting.
4. Legal pages filled in and reviewed (face photos can be biometric data).
5. Delete the legacy pages on GitHub (the list is in the handoff notes).

**P1: high impact, next**
- Wardrobe inventory and "your capsule" that subtracts what you own.
- An 8–12 week routine review.
- Current-cut and length input, with grow-out timing.
- Per-observation corrections.
- "Take a break" mode and a "how does the plan feel?" check.
- A minimum routine and "when and where" prompts.
- A "claims checked" guide and an honest leanness-and-face section.
- A shareable barber card and top-3 card (no face photos by default).
- Licensed haircut reference photos by texture.

**P2: after launch**
- Structured product data and ranking.
- Real local discovery.
- A "does this fit my plan?" check.
- Outfit generation.
- Live capture guidance.
- Reminders.
- Seasonal adjustments.
- A chair script for the barber.

**P3: later or with partners**
- Hair try-on (labelled as a simulation).
- Virtual frame try-on.
- Retailer inventory feeds.

**Should not build**
- Attractiveness, symmetry or "better side" scoring.
- Half-face mirror composites as a verdict.
- Leaderboards.
- Ratio or phi targets.
- Ethnicity-based ideals.
- Diagnoses from photos.
- Medication dosing.
- Body-fat estimates from photos.
- AI "future you" morphs shown as expected results.
