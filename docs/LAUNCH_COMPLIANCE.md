# Launch compliance check (October 2026)

Checked against two widely shared lists: "20 legal mistakes that could get your app sued" and "the fines a vibe-coded app racks up". **This is not legal advice.** Have a lawyer review it before taking payments.

| Risk | Status in GlowMax | Done in code |
|---|---|---|
| **Under-13s / minors (COPPA and similar)** | Setup now has a neutral age question that includes "Under 18", and setup stops there. Terms and Privacy both say 18+. | Yes |
| **Face photos = biometric data (BIPA, Texas CUBI, GDPR art. 9)** | Explicit consent checkbox before any face analysis. It says what is measured, where it stays and how to delete it. The consent date is stored on the device. The Privacy page explains it in full. | Yes |
| **Third-party IP leak (the Google Fonts ruling)** | Fonts are self-hosted. The face model is still downloaded from Google's tfhub.dev when a scan starts; that is disclosed in the consent text and the Privacy page. **To-do:** self-host the model files in `/public/models` (this sandbox can't download them). | Partly |
| **Session replay / analytics (CIPA)** | None installed. No trackers, pixels or session recording. If you add any, it needs consent first. | Yes |
| **Cookie policy / consent** | No cookies. Local storage holds only the user's own data, which is strictly necessary. Disclosed in Privacy → "Cookies and local storage", linked from the footer. | Yes |
| **Auto-renewal disclosure (California ARL and others)** | The renewal terms ("Renews every year at $190 until you cancel") now sit under every plan button. Checkout already showed them. | Yes |
| **Hidden fees** | Yearly shows the per-month price **and** the real yearly total next to it. Checkout says "plus applicable tax". | Yes |
| **Dark patterns** | Yearly is pre-selected but clearly labelled with its total, and Monthly is one tap away. Cancel is "any time in Settings". There's no confirm-shaming and no fake urgency. | Yes |
| **Fake reviews / testimonials** | None on the site. Example screens are labelled "Example" with an illustrated, non-real person. | Yes |
| **Unsupported claims** | No "proven", "clinically" or results guarantees. Terms has a "No guaranteed results" section. | Yes |
| **Licenses (fonts, icons, images)** | Archivo is under the SIL Open Font License, included at `public/fonts/ARCHIVO-OFL.txt`. Lucide icons are ISC. There are no stock or scraped photos: the reference-photo slot is empty until a licensed photo is recorded in `ASSET_SOURCES.md`. | Yes |
| **CAN-SPAM (marketing email)** | The early-access form has an explicit opt-in. **To-do:** every email must include your postal address and an unsubscribe link (set it in your email tool). | You |
| **DMCA agent** | Users' photos never reach our servers, so we don't host user content. Register a DMCA agent if that changes. | n/a now |
| **Business details** | `src/config/site.ts` still has `[Legal company name]`, `[Registered business address]`, support/privacy emails and jurisdiction. **Must be filled before launch.** | **You** |
| **Accessibility** | Contrast raised, every image has alt text, keyboard focus is visible, tap areas are at least 44 px and reduced motion is respected. | Yes |
