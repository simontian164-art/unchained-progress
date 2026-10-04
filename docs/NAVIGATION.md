# GlowMax navigation

The navigation copies the patterns people already use in Instagram, TikTok and YouTube every day (Jakob's Law: people expect your app to work like the apps they already know). We don't invent our own.

| Rule | GlowMax |
|---|---|
| Five tabs max | Today · Plan · Check-in · Progress · You (was 6, plus a settings gear) |
| Home far left | **Today** |
| Create in the middle | **Check-in**: the raised camera button. Taking a progress photo is the one thing you *make* in GlowMax |
| Profile far right | **You**: name, day/phase, level, then Analysis, Barber card, Shop, Guides, Weekly briefing, Settings |
| Settings live inside the profile, not the tab bar | The header gear is gone; Settings is under You → Account |
| Swipe from the edge = back | Every screen is a real URL, so iOS edge-swipe, the Android back button and browser Back all work. Full-screen overlays (the barber card) add a history entry, so Back closes the overlay instead of leaving the page (`src/app/useBackClose.ts`) |
| Pull down refreshes | The browser's native pull-to-refresh is left alone. Nothing sets `overscroll-behavior: none` |

Screens under **You** keep the You tab lit and show a "‹ You" back link at the top.

On desktop the same structure appears as Today / Plan / Progress, a Check-in button and a profile circle at the far right.

**Lesson kept in mind:** Snapchat's 2018 redesign moved familiar things around and over a million people petitioned to reverse it. Don't move these five again without a strong reason.
