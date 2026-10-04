# Live Transformation Home

## Goal
Make the member home screen feel like a live transformation dashboard. The user’s Digital You is the first and largest element, showing who they are now and realistic versions of what they could become. Daily actions, goals, and supporting information remain immediately below it.

## Main experience
- Replace the current Today-first layout with a visually dominant **Digital You transformation viewer**.
- Present the user’s saved scan/model as an interactive 3D-style person, with subtle drag/orbit movement and depth rather than a static card.
- Add a clear **Now / 30 days / 60 days / 90 days** timeline.
- Let the user preview individual or combined changes:
  - darker or more defined eyebrows
  - improved haircut/style
  - clearer, more even-looking skin
  - target weight gain or loss
- Show active changes as compact controls beside or beneath the person, with a reset option and a clear “Generate projection” action.
- Keep projections realistic and identity-preserving: same face, hairline, skin tone, body identity, and pose where possible. Skin changes mean clarity and tone consistency, not changing ethnicity.
- Label generated outcomes as projections, not guaranteed results.

## Live progression
- Each timeline stage will combine the selected appearance goals with realistic timing:
  - **Now:** current saved Digital You image/model.
  - **30 days:** early grooming, haircut, eyebrow, and skincare improvements.
  - **60 days:** stronger consistency and early body-composition change.
  - **90 days:** the complete selected target look within realistic limits.
- Changing a control updates the pending projection state immediately; generated stage images are requested asynchronously and remain available when the user leaves and returns.
- The viewer shows honest processing states without fake percentages and handles failed generations with a retry action.

## Today and goals
- Place a compact **Today** section immediately below the transformation viewer.
- Show up to three highest-priority actions with completion controls.
- Add the morning/evening routine and this week’s goals below Today, using the app’s existing task data.
- Tie actions to the transformation where possible, such as eyebrow grooming, haircut preparation, skincare, nutrition, or training.
- Keep Plan, Analysis, Progress, Style Lab, and You available through the existing navigation.

## Empty and fallback states
- If the user has no Digital You yet, the main screen leads directly into the existing scan flow.
- Guests can use the guest model and sample projections without creating an account.
- If image generation is unavailable, keep the current model visible and show the selected goals and timeline plan instead of a broken or blank viewer.
- Preserve manual photo capture/upload fallbacks for unavailable or denied cameras.

## Technical details
- Reuse the existing Digital You photos/model, `PortraitFrame`, task store, and asynchronous job patterns.
- Build the main experience into the member home route rather than hiding it inside the You page.
- Use a lightweight 3D-style viewer derived from available Digital You views; do not substitute a generic mannequin that loses the person’s identity.
- Add a provider-neutral `future_self` generation flow through the server boundary, with AI Gateway as the first implementation and all secrets kept server-side.
- Store selected transformation settings, target weight, generated stages, timestamps, and job status in Lovable Cloud for signed-in users; keep a local guest fallback.
- Apply row-level access controls so each user can only access their own projections.
- Reuse the existing before/after comparison for detailed inspection from the Progress page.
- Respect reduced-motion settings and keep the viewer usable on mobile.

## Validation
- Verify the guest path and a signed-in path from scan/model through projection generation.
- Confirm Now/30/60/90 switching, each transformation control, combined changes, retry behavior, and persistence.
- Check desktop and mobile layouts, reduced motion, camera denial fallback, loading/failure states, and that the 3D-style person is visible rather than blank.
- Test the real AI request and response before marking the feature complete.
