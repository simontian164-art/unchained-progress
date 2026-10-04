# GlowMax motion system v2: "The Ring"

**Goal:** finishing something should feel good enough that you want to do the next thing.

**Atmosphere:** precision, discipline, quiet luxury. The mood is spy-film adjacent, but **nothing is taken from any film franchise**. There is:
- no franchise name, logo or numerals
- no gun-barrel or rifling device
- no silhouettes, actors, footage or stills
- no music or sound effects
- no car branding and no official typefaces
- no copied compositions or choreography

The one motif is the **GlowMax Ring**: a watch bezel, camera aperture and instrument dial. It never sits over a person and never "aims" at anything.

---

## Phase 1: Audit

| Screen | Before (v1) | Purpose | Now (v2) | Level | Tech | Duration |
|---|---|---|---|---|---|---|
| App open | Ring loader, fake % | Anticipation | Point, then arcs at different speeds, then ticks, then context lines, then % (reaches 100 only when ready), then snap and sweep, "Protocol ready" hold, then the ring opens as a mask into the app | — | Motion + SVG mask | ~2.0s, tap to skip, once per session |
| Any completion | Checkbox tick | Instant payoff | Tick, then card compress (0.985) and border glow, then 5 sparks travel to the header XP bar, then the bar eases, the total counts and "+N XP" shows | L1 | Motion, portal | 600–900ms, never blocks |
| Header | — | Somewhere for XP to go | **XP HUD**: Lv 04, bar and total. Leading edge glows at ≥90% | L1 | Motion | — |
| Today HUD | Ring + level bar | Today at a glance | Ring = today's mission. Day NN/90 and phase eyebrow. Streak (number + 7 dots, one light pass). Weekly briefing pill | — | Motion | — |
| Missed days | — | No shame | "Welcome back. Day 18 continues here." The streak reads "Starts today", never "00" | — | CSS | — |
| Mission complete | Panel | Closure | **Day complete** panel: ring closes with an outward pulse, Day NN, 7 dots (today lights last), "Streak extended", "Come back tomorrow.", Share | L2 | Motion | 4.2s auto, tap to dismiss |
| Level up | Numeral sharpens | Status | Ring centres, blades accelerate (~300ms), hard stop, flash, 01→02 drum roll, LEVEL 02 / name, metallic dust, "Your next protocol", Open protocol | L4 | Motion | ~2.2s reveal, skippable after 1.3s |
| Protocol ready | Four panels part | Access | Four ring quadrants rotate 6° and part, vertical light, card rises (rotateX 22→0, blur→sharp). No padlock | L4 | Motion | ~1.6s |
| Streak 7/30/60/90 | — | Identity | Full-screen milestone: STREAK 07, "7 days in a row", Share | L3 | Motion | 3.2s (5.2s with Share) |
| Phase change (day 31/61) | — | Chaptering | PHASE II / Refinement / Day 31 / New focus unlocked | L3 | Motion | 3.2–5.2s |
| Weekly briefing | Not built | Reflection | New route `/app/briefing`: Week NN, rule extends, 4 counters roll up, biggest win, next week's focus, Share week | L2 | Motion | ~1.6s |
| 90-day journey | — | Long arc | Progress page: 90 ticks in three phase arcs. Active days glow, quiet days stay dim (never red), today is marked | — | SVG + Motion | 0.7s once |
| Before/after | Slider | Proof | Opens on Day 01; a light line sweeps to reveal the latest, then rests at 50%. Caption "Day 01 vs Day 45 · 45 days of consistency" | — | Motion | 1.2s once, when in view |
| Photo analysis | Dot + line + label | Credibility | Each marker: ring, then leader line, then label, 120ms apart; lines converge into the ring; "Building your protocol" | — | Motion | ~3–4s, skippable |
| Buttons | Hover lift | Physicality | Press: scale .98 + 1px depth in 90–120ms. Desktop hover: one light sweep | L0 | CSS | 120ms |
| Page change | Ring from tap, clip reveal | Continuity | Unchanged. Shared elements: nav pill/tab dot (layoutId) | — | Motion | ~350ms |
| Landing (Jan) | — | Campaign | Black, then 2027, "90 days.", "Different standard.", ring forms, opens into hero "The 90-Day Protocol" / "Begin Day 01" | — | Motion | ~2.0s, once per session, skippable |

## Phase 2: System

### Reward hierarchy (the rule that keeps this from becoming a slot machine)

| Level | When | Budget | Can block? |
|---|---|---|---|
| L0 press | Every tap | 90–120ms | No |
| L1 micro | Each completed step or task | 450–900ms | No |
| L2 daily | Day complete; weekly briefing | 0.7–1.6s | Panel only, tap away |
| L3 milestone | Streak 7/30/60/90; phase change | 1.5–2.5s (+ hold) | Full screen, tap to skip |
| L4 major | Level up; protocol unlock | 2–3.5s | Full screen, skippable |

One `RewardDirector` (in the app header) owns L2–L4. It queues moments highest-first so two never overlap. Every moment plays **once**, using seen flags in `glowmax_seen_v1`. On first visit it records your current level, streak and phase, so existing progress isn't celebrated.

### Timing and easing (`src/app/visuals/motion.ts`)
- **Ease out (UI):** `[0.22, 1, 0.36, 1]`.
- **Snap (mechanism):** `[0.65, 0, 0.35, 1]`.
- **Springs:**
  - tap: 700 / 32
  - ring: 120 / 20 / 0.6 mass
  - card: 260 / 26
- **Numbers:**
  - Single steps roll on per-digit drums (`Odometer`).
  - Count-ups and fast values (a loader %) run as plain tabular figures, then settle onto the drums. Drums can't keep up at 60 changes a second; v2 testing caught a digit getting stranded.

### Sound (`src/app/feedback.ts`)
- Original and synthesized live with WebAudio: clicks, a two-note resolve, a low swell. No audio files and no music.
- **Off by default.**
- Settings → Sound & feel toggles it on or off.

### Haptics
- Light tick (8ms), day complete (18ms), staged level up (12-60-12-60-28).
- On by default; follows reduced motion.
- **iPhones ignore web vibration.** Only Android Chrome gets it until there's a native app.

### Reduced motion
- Global `MotionConfig reducedMotion="user"`.
- The loader and intro finish immediately.
- Sparks are skipped and XP lands instantly.
- Counters jump straight to their value.
- Dust, glints and light sweeps are off.
- Press transforms are off.

### Calmer mode
Members who said appearance worries take up a lot of their day get:
- **no** XP HUD, streak, level-ups or milestones
- the progress ring and Day/Phase only

### Sharing
- 9:16 PNG (1080×1920) drawn on a canvas.
- Uses the native share sheet where files are supported, otherwise downloads.
- The card function only receives text (day, streak, level, phase), so it **cannot** include a photo or assessment.

## Phase 3: Prototypes (all implemented, captured at 390px)

| # | Prototype | File |
|---|---|---|
| 1 | Loader | `visuals/ring/Moments.tsx` → `RingLoader` |
| 2–3 | XP earned and XP bar | `visuals/ring/XpHud.tsx`, `feedback.ts` (`reward`, `xpBus`) |
| 4–5 | Mission / day complete | `Moments.tsx` → `DayComplete` |
| 6 | Level up | `Moments.tsx` → `LevelUp` |
| 7 | Protocol unlocked | `Moments.tsx` → `ProtocolUnlock` |
| 8 | Photo analysis | `visuals/sequences/AnalysisSequence.tsx` |
| 9 | Weekly briefing | `pages/Briefing.tsx` |
| 10 | Phase completion | `Moments.tsx` → `Milestone`, driven by `RewardDirector.tsx` |
| + | 90-day journey | `visuals/ring/JourneyDial.tsx` |
| + | Share card | `share.ts` |
| + | January intro | `components/marketing/campaign/NewYearIntro.tsx` (`CAMPAIGN.newYear` in `config/site.ts`) |

### Ring material
The blades are drawn into an SVG mask and a fixed-light metal gradient (bright top-left, warm grey bottom-right) shows through, over a soft dark offset. The light stays still while the blades rotate under it, so they read as machined metal catching light rather than flat dashes. It costs one extra masked circle, with no filters or blur.

### Level curve
Cumulative XP to reach each level: 0, 120, 350, 700, 1150, 1700, 2350, 3100, 3950, 4900, then +1000 per level. A routine-only member reaches level 2 in about 2 days and level 3 inside week one; a consistent 90-day member ends around level 8–9. (v1 used a flat 400 per level, which made week one feel empty.)

### Reminders (retention)
Today shows a "Daily reminder" card once (dismissible; also in Settings). Pick a time, then choose:
- **Apple / Outlook:** a recurring `.ics` event with an alarm, running daily until day 90.
- **Google Calendar:** a prefilled link that does the same.

The member's own calendar does the nudging, so it works on iPhone with no accounts, server or push permissions. Calmer-mode members don't see the Today card.

## Phase 4: Persona review (honest)

- **Motion designer:**
  - The ring is consistent and the timing tiers hold.
  - Weak spot: the level-up drum roll is the only moment with real *weight*. Day complete is pleasant but small. Without Rive, the blades can't deform or stretch, so the mechanism reads as "rotating dashes", not machined metal. **That is the single biggest quality gap.**
- **Mobile game designer:**
  - The loop works: tap, sparks, bar, count, chip.
  - v2 had 400 XP per level (one level-up in week one). v2.1 uses a front-loaded curve: two level-ups in week one, ~8–9 by day 90.
  - Protocols aren't really locked, so the copy says "Your next protocol" / "Protocol ready" rather than "unlocked". Fixed in v2.1.
- **UGC creator:**
  - The share card is clean but static.
  - The most filmable moments are the loader, level-up and analysis sequence, which have to be screen-recorded. There's no "record this" helper yet.
  - The before/after sweep is the strongest TikTok asset, and it only shows with real check-in photos.
- **Luxury men's creative director:**
  - Restraint is right: ivory on black, small caps, no confetti, no flames.
  - v2 had too many uppercase micro-labels on Today. v2.1 keeps one (the Day/Phase eyebrow); the HUD labels are now sentence case.
  - The landing hero "THE 90-DAY PROTOCOL" in light caps is the right register.
- **20-year-old New Year user:**
  - The intro, "Begin Day 01" and the day count make sense in two seconds.
  - Will they come back on day 4? v2.1 adds a calendar reminder that works without accounts. Push and email still need accounts.

## Phase 5: Cut because it only "looked cool"
- A continuous scanning sweep over the face: reads as surveillance.
- Landmark meshes and boxes on the face: biometric look.
- Confetti, flames and trophy icons: cheap, and they fight the luxury register.
- Mission-complete as a full-screen takeover: daily is L2, a panel.
- Loader on every navigation: once per session only.
- An animated number for every stat: only XP, briefing counters and level use the drum.
- Sound on by default.
- A "streak lost" state: the streak just quietly reads "Starts today", and the Day count never resets.

## Honest constraints
- **Rive:** `.riv` files can't be authored from code here, so the ring's depth comes from the masked metal technique above. The ring is SVG + Motion, with states named like a Rive state machine (`orbit / spin / progress / complete`). A designer can rebuild it in Rive and swap `GlowRing` without touching callers.
- **GSAP:** not added. Every timeline is three to six steps, which Motion handles, and a second engine would add about 25 KB gzipped for nothing visible.
- **Motion's AnimateNumber** is Motion+ (paid), so `Odometer` is custom.
- **Reminders** are calendar-based for now. Real push and email still need accounts.
