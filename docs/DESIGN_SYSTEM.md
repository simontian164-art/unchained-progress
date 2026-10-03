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
