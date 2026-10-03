# Visual asset, motion and design-system pass

**References used:**
- Member app: real-app conventions (Mobbin couldn't be accessed without an account; see `ASSET_SOURCES.md`).
- Marketing site: principles only from Awwwards, Land-book and Godly (product UI over stock, one restrained motion moment).

**Nothing was copied.**

## Inventory: before → after

| Page | Before | Added / changed | Kept deliberately text-driven |
|---|---|---|---|
| Landing | Product-window hero with an illustrated portrait and an **infinite scan sweep**; focus cards with their own icon set | The hero now uses the app's real area colours, signs and card stripe, plus a mini barber card with a haircut sketch and the morning routine. Sweep removed. | FAQ, pricing, privacy copy |
| Example | Product UI | Unchanged (it already shows the product) | — |
| Onboarding | Text questions; photo slots | Unchanged except the photo step's sequence (below) | Questions stay text: faster than pictures |
| Photo scan | Photo plus a looping white sweep and a spinner | **Signature sequence:** photo settles into the frame, three real checks tick, the detected landmark points fade in faintly, then the areas populate in their colours, the real top 3 resolves, and "Your plan is ready" appears. Skippable. | — |
| Analysis | Text modules; AM/PM lists | Coloured section edges and area icons; skin **routine rail** with order, product type and amount ("2 finger-lengths", "pea-size"); haircut sketch on the best-match link; "What you told us" folded | Observations, explanations |
| Today | Checklists | Tick animation, "Done" badge when a routine is complete | — |
| Plan | Long list | Area filter, removal slides out with **Undo** toast, empty states | — |
| Barber | Light card with text rows | Option tabs show a **proportion sketch per cut**. Card has a large name, row icons, an "avoid" block, a reference slot (licensed photo later), and **full-screen mode** for turning the phone around. No animation. | — |
| Shop | Text cards | Standardised product tile (type icon in the area colour; licensed packshot later), location spinner, empty state | Prices stay labelled "estimate" |
| Guides: Style | Swatch bar + text | **Outfit flat-lays** drawn from each formula's pieces and colours, a colour strip and colour names | Pinterest/TikTok links stay links |
| Guides: Fit | Text list | **6 fit diagrams** (shoulder seam, sleeve, tee, shirt, trouser break, jacket length) | Fabric note |
| Guides: Posture | 1 stacked-posture sketch | **6 exercise figures** (movement direction in accent) | Doses and cues |
| Guides: Facial balance | Mirror/flipped photos | Unchanged | — |
| Progress | Slider with a separate range input | **CompareSlider**: drag anywhere, keyboard-accessible, same frame and crop for both photos. Hairline capture has **5 angle diagrams**, a side-by-side/slider toggle, and a designed empty state. | — |
| Pricing / Settings | Text | Unchanged: utility screens | — |
| App loading | Centred spinner | Layout skeleton | — |

## Review against the brief (honest)

- **Does it look like one product?** Yes.
  - The landing hero and the landing "areas" cards now use the app's colours and icons.
  - The neutral icon tiles in "how it works" stay silver on purpose: they're steps, not areas.
  - While checking the landing page I also fixed three copy claims the product doesn't support:
    - "analyzes skin, fit and posture from your photos": skin is self-reported, and fit and posture aren't analysed from photos.
    - "90-day plan": the plan is today / this week / this month / later.
    - "proportions from your full-body photo": there are no body estimates from photos.
  - The example "90-day roadmap" became the real plan horizons. Its "add a second skin active" step became "review your one active at 8–12 weeks", matching the engine.
- **Anything stock or template-looking?** No stock photos or illustrations were added.
- **Anything that looks AI-generated?** The haircut sketches are deliberately schematic.
  - At small sizes, quiff and side-part look similar.
  - They show proportions only, not appearance. Licensed photos will do the rest.
- **Too many animations?** None loop in the app. The longest is the plan-build sequence (~1.8s), and it's skippable.
- **Too few visuals?** Still missing:
  - photos of the actual haircuts on different textures
  - real outfit photography
  - a patch-test diagram
  - a shaving-direction diagram for razor bumps

  These are listed for commission below.
- **Any stock photo implying a customer?** None. The rule is enforced in the `RefImage` type (`showsCustomer: false`).

## Remaining assets to commission or create
1. **Haircut reference library**, the highest value.
   - 15 cuts × straight / wavy / curly / coily, front and side views, plus a barber's back-of-head view.
   - Shot by a barber partner, with model releases, on a neutral background.
   - About 120–150 images. Register under `haircut:<id>:<texture>`.
2. **Style boards**: 6 styles × 3 outfits × menswear/womenswear.
   - Flat-lay or on-body with faces cropped, so nobody reads as a "customer".
   - Commission from UGC creators of varied backgrounds, which also answers the representation request.
3. **Skin technique diagrams:**
   - patch-test spot and timing
   - shaving with the grain and pressure
   - sunscreen amount, shown on a hand
4. **Product packshots**, only with retailer or brand permission.
5. **Rive signature animation (optional):** a commissioned version of the scan → plan sequence. Only if it stays this restrained.
6. **Posture exercise photos or short loops** from a physio or coach, replacing the stick figures.

## Visual features that should NOT be built yet
- **"See this haircut on me"** (generative try-on). Unreliable on curly and coily hair, and easy to mistake for a prediction.
- **Before/after "results" marketing** of any kind until there are real, consented customers.
- **Face-mesh or wireframe overlays** on the user's own photo beyond the faint points in the scan sequence. They push toward the biometric/"rating" look.
- **Stock-photo testimonials or model faces on the landing page.**
- **Virtual frame try-on, live AR filters, or animated "glow-up" morphs.**
- **Lottie success confetti, streak flames, or other reward animation.** They work against the no-pressure design.
- **Live camera capture guidance.** Designed in `NEXT_PASS_AUDIT.md` §7, but needs real-device testing across skin tones first.
