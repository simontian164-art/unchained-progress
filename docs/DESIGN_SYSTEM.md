# GlowMax design system

One product, one visual language. Pages don't invent their own.

## Foundations
| Token | Value | Where it lives |
|---|---|---|
| Typography | **Space Grotesk** (display: headings, numbers) + **Inter** (UI and body). Two families, no others. | `index.html` (Google Fonts), `tailwind.config.ts` |
| Type scale | 11 (labels, uppercase tracking 0.1em) · 12 · 14 (body small) · 15 (card titles) · 16 · 20 · 24 · 30 · 36+ (marketing) | Tailwind classes |
| Icons | **Lucide only** (outline, 1.75–2px). Phosphor not used, to avoid two styles. Size 14px in chips, 16px in rows, 20px in nav. | `lucide-react` |
| Area colours | Face `#cbd5e1` · Hair `#facc15` · Facial hair `#fb923c` · Skin `#f472b6` · Eyes `#38bdf8` · Smile `#2dd4bf` · Style `#a78bfa` · Body `#f87171`. Used for area labels, card stripes, section top edges, diagram accents. Never for status. | `src/app/visuals/areas.ts` |
| Status colours | Strong = green, Priority = gold, Opportunity = neutral silver. Big impact = gold sign, Quick = blue, Free = green. | `components/Bits.tsx` |
| Radius | Chips 9999px · inputs/buttons 9999px (pills) · inner tiles 12px (`rounded-xl`) · cards 16px (`rounded-2xl`) · hero windows/barber card 22–24px | Tailwind |
| Cards | `surface-card`: 4.5%→2% white gradient, 1px white/9% border, inset highlight + soft drop shadow. Inner blocks: `surface-inset` (3% fill, 7% border). Recommendation cards add a 3px left stripe in the area colour. | `src/index.css` |
| Shadow | Only on top-level cards and the barber card. No coloured glows inside the app. | |
| Spacing | 4px grid; card padding 16/20/24 (mobile/tablet/desktop); section gap 24. 16px page gutter on phones. | |
| Images | Photos: 3:4 for faces/progress (same crop everywhere), 4:5 for references, 1:1 for products. Radius 12–16px. Lazy-loaded, WebP, ≤960px. No filters, no retouching, never enhanced. | `visuals/ReferenceImage.tsx`, `CompareSlider.tsx` |
| Diagrams | One style: 1.75px round-capped neutral line (white 55%), ONE accent colour (the area colour) for the thing that matters, 7.5px Inter labels, no gradients, no 3D, no anatomy. | `visuals/diagrams/Figure.tsx` |

## Motion (Framer Motion = Motion for React; already a dependency, no second library)
| Token | Value |
|---|---|
| Curve | Enter `cubic-bezier(0.22, 1, 0.36, 1)` (decelerate) · Exit `cubic-bezier(0.4, 0, 1, 1)` (accelerate) |
| Speed | fast 150ms (ticks, toggles) · base 240ms (panels, rows) · slow 400ms (page-level arrivals) |
| Reduced motion | `<MotionConfig reducedMotion="user">` at the app root; CSS pulses use `motion-reduce:animate-none`. The scan sequence shortens its pauses. |
| Rule | Animate only to answer: what changed, what can I touch, what's processing, what finished, where did it go. Nothing loops in the member app. Nothing blocks input. |

Animations in use: checkbox tick (150ms scale), routine "Done" badge, card panels expand/collapse (240ms), removed recommendation slides out + undo toast, plan rebuild via layout animation, scan sequence (signature), plan-build sequence (signature), landing hero cards arrive once.

## Interaction
- Buttons: pill; primary = light fill, secondary = 4% fill + 14% border; hover lightens, `active` returns to rest; 200ms colour transitions.
- Hover is never the only affordance (mobile-first). Touch targets ≥ 32px (thumb buttons), primary actions 44–48px.
- Tabs/filters: pills with `aria-selected`/`aria-checked`; selected = 10% fill + brighter border (area colour where relevant).
- Loading: skeletons where layout is known (member app load), inline spinner for short waits (location), stepped checklist for the scan. No full-screen spinners.
- Empty states: icon, what this space is for, what to do next, one action (`visuals/EmptyState.tsx`).

## Hierarchy on every recommendation
1. Area + title (the action) → 2. one-line detail → 3. signs (impact, quick, cost, when) → 4. visual (diagram/reference) where it helps → 5. "How to do it" / "Why this?" → 6. feedback.

## Anti-template rules (October 2026)

Checked against a widely shared list of "20 signs your app looks vibe-coded". Where GlowMax stands:

| # | Tell | Status |
|---|---|---|
| 1–2 | Purple-to-blue gradient, gradient hero text | Never used |
| 3 | Emojis in headings | Never used |
| 4, 19 | Inter everywhere / Space Grotesk headings | **Replaced.** One self-hosted variable family, Archivo, using its width axis: 125% expanded for the hero and numerals (`font-wide`), 112% for headings (`font-display`), normal width for reading. Files are in `public/fonts`, so there are no third-party font requests |
| 5 | Coloured left-border cards | **Removed.** Areas are marked by their chip (colour + sign) or a colour dot |
| 6 | Glassmorphism cards | **Removed.** `.surface-card` is a solid, opaque surface with a visible edge |
| 7 | Low-contrast dark mode | **Raised.** Muted text is 70% (was 64%), borders are 17% (was 14%), and no text sits below 50% opacity |
| 8 | Three icon boxes in a row | **Removed** from every marketing section. Replaced with numbered rows, a comparison table and real example outputs |
| 9 | Badge above the headline | **Removed** from every page. Section names now sit in a quiet numbered left rail on desktop |
| 10 | Lucide icons everywhere | Icons are kept only where they carry meaning (tab bar, actions, area signs). Decorative heading icons and icon boxes are gone |
| 11 | Untouched shadcn | The FAQ uses numbered rows with a custom plus/minus. App components are custom |
| 12 | Fade-in on scroll | **Removed** (`Reveal` is now a passthrough). Motion is reserved for rewards and the analysis sequence |
| 13 | Cursor-following beam | Never used |
| 14 | Buttons fade on hover | **Replaced.** Hover is one light sweep and press is a scale with 1px depth. Opacity never changes |
| 15 | Inconsistent spacing | Landing sections share one rhythm (`py-20 sm:py-28`, 248px rail on desktop) |
| 16 | Em dashes everywhere | **Removed** from all user-facing copy |
| 17 | Generic buzzword copy | **Rewritten.** The copy now names real outputs: the haircut, three products, three actions a day |
| 18 | Serif italic accents | Never used |
| 20 | Grain over a gradient | Never used. The hero's grid background was removed too |
