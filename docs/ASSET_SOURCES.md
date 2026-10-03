# Asset sources and licences

Every third-party asset that ships in GlowMax is listed here. **If it isn't listed, it doesn't ship.**
Retrieved/verified: 2026-10-03.

## Third-party (in use)
| Asset | Source | Creator | Licence | Source URL | Where used |
|---|---|---|---|---|---|
| Lucide icons (`lucide-react`) | npm | Lucide contributors | ISC (some icons derived from Feather, MIT) | https://lucide.dev/license | All icons |
| Inter font | Google Fonts | Rasmus Andersson | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Inter | UI text |
| Space Grotesk font | Google Fonts | Florian Karsten | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Space+Grotesk | Headings |
| Framer Motion (Motion for React) | npm | Motion | MIT | https://motion.dev | Interface animation |
| MediaPipe FaceMesh model + TF.js | TF Hub / npm | Google | Apache 2.0 | https://www.tensorflow.org/hub | On-device face landmarks (not a visual asset, listed for completeness) |

## Made by GlowMax (no third-party licence needed)
| Asset | File | Where used |
|---|---|---|
| Haircut proportion sketches (15 cuts, generated from cut data) | `src/app/visuals/diagrams/HaircutDiagram.tsx` | Barber card, haircut options, report, landing hero |
| Hairline capture diagrams (5 angles) | `.../HairlineAngles.tsx` | Progress → hairline tracking (capture, empty state, comparison) |
| Fit diagrams (6) | `.../FitDiagrams.tsx` | Guides → Fit |
| Posture exercise figures (6) | `.../PostureDiagrams.tsx` | Guides → Posture |
| Outfit flat-lays (generated from each outfit formula's pieces and colours) | `.../OutfitFigure.tsx` | Guides → Style boards |
| Routine rail + amount chips | `src/app/visuals/RoutineSteps.tsx` | Analysis → Skin |
| Product type tiles | `src/app/visuals/ProductImage.tsx` | Shop |
| Share image | `public/og-image.png` (rendered from HTML, 2026-10-03) | Social previews |
| Logo mark, favicon | `src/components/marketing/Logo.tsx`, `public/favicon.*` | Brand |

## Removed
| Asset | Why |
|---|---|
| `public/intro-bg.mp4` (1.7 MB) | Unused since the old intro page was deleted; source and licence unknown. |
| `public/placeholder.svg` | Unused Lovable template file. |
| Infinite "scan sweep" on the landing portrait | Decorative loop that read as a scanner cliché. |

## Considered and NOT used (yet)
| Source | Decision |
|---|---|
| Unsplash / Pexels photos | Licence allows commercial use (checked 2026-10-03), but recognisable people in an appearance-analysis product can read as customers or "analysed" subjects. No photo was added. Haircut/style references need accurate cut + texture labelling, which stock search can't guarantee. Commission instead (below). |
| Pinterest / Instagram images | Not licensed for reuse. Used only as outbound search links. |
| unDraw / Storyset illustrations | Generic startup look; custom diagrams communicate more. |
| LottieFiles / Rive | Motion already covers every interaction; adding a runtime for a spinner isn't worth the bundle. Revisit Rive only for a commissioned signature animation. |
| Phosphor icons | One icon family only (Lucide). |
| Mobbin | Flows require an account; I could not log in from this environment. Member-app patterns follow widely used app conventions (stepped onboarding, bottom tab bar, card lists, sheet-style detail, undo toasts). Do a Mobbin review with a logged-in designer before the next pass. |

## Template for new entries
`| asset | source | creator | licence | source URL | where used | date retrieved | model release (Y/N/n.a.) |`
