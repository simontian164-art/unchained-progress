# Digital You: foundation

The persistent visual baseline of the user (photos + self-reported measurements). Later features (outfit try-on, hairstyle and facial-hair previews, physique and future-self views, scan-to-scan comparison) build on it. **This step builds only the foundation.**

## Research this was built from (read October 2026)

| Source | What it changed in the build |
|---|---|
| **Apple HIG: Privacy** | Ask only when needed, never at launch: the scan starts from the You tab. Explain why in one plain sentence (the consent line names the purpose and where data is stored). Prefer on-device processing: every photo check runs on the device. |
| **Apple HIG: Accessibility** | 44 pt default hit targets; 17 pt default and 11 pt minimum text; 4.5:1 contrast; when Reduce Motion is on, replace movement with fades. Inputs are 17 px, buttons are at least 44 px, and spinners stop under reduced motion. |
| **Apple Vision: detecting human body poses** | Native iOS/macOS only, so it isn't usable in this web app. The same approach comes from TF.js MoveNet MultiPose (one pose per person), with Vision's guidance applied: subject at least ⅓ of the image height (we require ½ for a full-body baseline), avoid crowds, avoid loose clothing. |
| **Supabase changelog** | Since 2026-10-30, new public tables are **not** exposed to the Data API automatically. The migration grants `authenticated` explicitly and revokes `anon`. |
| **Supabase RLS** | `to authenticated` plus `(select auth.uid()) = user_id` on every policy. UPDATE has both `using` and `with check`. Indexes on every column used in a policy. |
| **Supabase Storage access control** | Private bucket. Per-user folder via `(storage.foldername(name))[1] = (select auth.jwt()->>'sub')`. Insert, select, update and delete policies, so replacing (upsert) works. |
| **Supabase Storage: deleting objects** | Files are deleted with the Storage API `remove()`, never in SQL (SQL would orphan the files). The client deletes files first, then the rows. |
| **Supabase Auth: passwordless** | Email one-time code (`signInWithOtp` + `verifyOtp`). The email template must include `{{ .Token }}`. |
| **Supabase Edge Functions: auth, CORS** | `withSupabase({ auth: 'user' })` from `@supabase/server`. Provider keys come from `Deno.env`, never from the app. |

## Architecture

```
You tab (pages/You.tsx)            Scan flow (pages/DigitalScan.tsx, /app/you/scan)
        │                                   │  photoCheck.ts: type, size, dimensions,
        │                                   │  people-in-frame (TF.js), EXIF-free JPEG
        ▼                                   ▼
useDigitalProfile() ─────► DigitalProfileService (digital/service.ts)
                              ├─ LocalDigitalProfileService     IndexedDB (today's default)
                              └─ SupabaseDigitalProfileService  RLS tables + private bucket
                                       ▲  (picked automatically when VITE_SUPABASE_* is set
                                       │   and the user is signed in)
supabase/functions/generate-look  ◄── future: the only place an image provider is called
```

- **UI never calls an AI provider or holds a key.** Generated looks are written by an Edge Function to `digital-you/<user id>/looks/…` plus a `saved_looks` row. The app only reads and saves them through the service.
- **Files are stored at the same paths in both modes:** `<owner>/profile/<kind>-<id>.jpg` and `<owner>/looks/<id>.jpg`.
- **Deleting is complete.** `deleteProfile()` removes every file under the user's folder (source photos and generated looks), then the profile row. The images, measurements, preferences and looks rows go with it through `on delete cascade`. Settings → "Delete everything" calls it too.

## Database (`supabase/migrations/20261004120000_digital_you.sql`)

| Table | Holds | Notes |
|---|---|---|
| `digital_profiles` | One per user: status, age range, goal, units, last scan | `user_id` is unique and references `auth.users` with on delete cascade |
| `profile_images` | Storage *references* plus capture checks | One current photo per kind (a partial unique index). Path must start with the owner's id. |
| `body_measurements` | Self-reported history | The ranges match the app's validation |
| `appearance_preferences` | One per profile | For style personalisation later |
| `saved_looks` | Generated derivatives | `result_path` must be in the owner's folder |

Each child row has a composite foreign key `(profile_id, user_id)` pointing at `digital_profiles(id, user_id)`, so a row can never point at another user's profile, even with a valid profile id.

**Verified locally on Postgres 16** with Supabase-shaped `auth` and `storage` stubs, using `supabase/tests/digital_you_rls.test.sql`. The test checks that:

- user B can't see, update or delete A's rows or files
- B can't upload into A's folder or attach rows to A's profile
- `anon` has no access
- deleting the profile cascades to every child row

Deliberately adding a leaky policy makes the test fail.

## Turning on accounts (when you're ready)

1. Create or connect a Supabase project (Lovable → Supabase integration, or supabase.com).
2. Run the migration (SQL editor or `supabase db push`).
3. Auth → Email: enable email OTP and add `{{ .Token }}` to the "Magic Link" email template.
4. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` in Lovable. Use the publishable key only, never the secret or service-role key.
5. Digital You switches to account mode by itself: a sign-in screen appears, and data is stored per user.
6. Update the Privacy Policy placeholders (storage region, provider).

Until then, Digital You runs entirely on the device, consistent with GlowMax's current privacy promise.

## Known limits

- **Person checks can't be run here, so they're unit-tested only.** The headless browser used for testing has no WebGL and can't download the models. The decision logic (one face / one person, head-to-feet, size in frame) has unit tests, and the "couldn't verify" fallback was tested end to end. Run one real face and one real full-body photo on a phone before launch.
- **The models download from Google's tfhub.dev on first use.** This is disclosed in the Privacy Policy. Self-host them before launch to remove the third-party request.
- **Existing local data won't move to accounts on its own.** Moving a device-only Digital You into an account needs a one-time "upload my scans" step, which isn't built yet.

---

# Digital model (face → upper-body model)

The first AI feature. A user with a good face photo gets an upper-body model that keeps their face recognisable, used later for style previews and looks. No clothing yet.

## What the FASHN docs say (checked 5 Oct 2026)

| | Verified |
|---|---|
| Auth | `Authorization: Bearer <FASHN_API_KEY>` ([API fundamentals](https://docs.fashn.ai/api-overview/api-fundamentals)) |
| Submit | `POST https://api.fashn.ai/v1/run` with `{ model_name: "face-to-model", inputs: {…} }` and response `{ id, error }` ([Face to Model](https://docs.fashn.ai/api-reference/face-to-model)) |
| Inputs used | `face_image` (data URI), `aspect_ratio: "3:4"`, `resolution: "2k"`, `generation_mode: "balanced"`, `seed` (random per attempt; **the default 42 would make "Regenerate" return the same image**), `num_images: 1`, `output_format: "jpeg"`, `return_base64: true`. No `prompt`, so body shape is inferred from the face. |
| Poll | `GET /v1/status/{id}` with statuses `starting`, `in_queue`, `processing`, `completed`, `failed`. The docs show `output` both as `["…"]` and as `{ images: ["…"] }`, so both are accepted. |
| Errors | HTTP: 400, 401, 404, 429 (`RateLimitExceeded`, `ConcurrencyLimitExceeded`, `OutOfCredits`), 500. Runtime: `ImageLoadError`, `ContentModerationError`, `InputValidationError`, `ThirdPartyError`, `UnavailableError`, `PipelineError`. Failed jobs cost no credits ([error handling](https://docs.fashn.ai/api-overview/error-handling)). |
| Limits | `/run` allows 50 requests a minute, `/status` 50 every 10 seconds, and **6 jobs at once** across the whole FASHN account. |
| Cost / time | balanced + 2k = 3 credits, about 25 s. fast + 1k = 1 credit, about 10 s. Set this with `FASHN_GENERATION_MODE` / `FASHN_RESOLUTION`. |
| Privacy | Base64 input: FASHN deletes its processing copy when the job ends, with a 1-day backstop. `return_base64`: the output is kept 60 min instead of 3 days on their CDN. FASHN doesn't train on customer content. Deleting request records means emailing legal@fashn.ai ([data retention](https://docs.fashn.ai/api-overview/data-retention-privacy)). |
| Status | Face to Model is marked **Experimental** (released 19 Sep 2025). |

Webhooks exist, but the docs describe no way to verify them, so this build doesn't use them. It polls from the server instead.

## How it works

```
You screen ── "Generate model" ──▶ /app/you/model
   │  consent (the processor's name comes from the server)
   ▼
avatarClient (src/app/digital/avatarClient.ts)       ← the UI only knows stages and failure codes
   │  supabase.functions.invoke("digital-model", { action })
   ▼
Edge Function supabase/functions/digital-model       ← user JWT checked by withSupabase
   │  service.ts: consent, profile, face photo, 1 active job, daily limit
   │  repo.ts: reads with the user's RLS client; writes generation rows with the service role
   ▼
avatarGenerationProvider ─▶ FashnAvatarProvider       ← the only code that knows FASHN
   │  submit, then poll in the background (EdgeRuntime.waitUntil, ≤140 s) and on each status request
   ▼
result ─▶ digital-you/<user>/avatars/<id>.jpg  +  avatar_generations row (ready)
"Use this model" ─▶ approved_by_user = true, digital_profiles.primary_avatar_id = id
```

Each stage shown to the user is a real backend state. Nothing is timed:

| Shown | Backend state |
|---|---|
| Preparing profile | our function is checking the profile and sending the photo |
| Building model | provider `starting` / `in_queue` |
| Preserving identity | provider `processing` |
| Finalizing | provider finished; saving to storage |

No percentages are shown, because FASHN doesn't return progress.

**Swapping providers:** add a class implementing `AvatarGenerationProvider` (`start`, `status`, `disclosure`), register it in `registry.ts`, and set `AVATAR_PROVIDER`. The UI, database and function don't change. The consent line shows `disclosure.name`, which comes from the server.

**Tracked per attempt (`avatar_generations`):** `provider`, `provider_model`, `generated_at`, `source_image_id`, `generation_status`, `approved_by_user`, plus `seed`, `attempts`, `failure_code` and the provider's job id. The job id is never sent to the browser.

**Rules enforced by the database:**
- The browser can only read these rows.
- Only one job runs per user, and only one model is approved.
- Results must sit in the owner's folder.
- `primary_avatar_id` can only point at the user's own generation, and only the server can set it.

These are tested in `supabase/tests/digital_model_rls.test.sql`.

**Privacy rules:**
- The original photo is never changed.
- Unapproved results are deleted when the user generates or approves another model.
- Replacing the face photo keeps the model but unlinks it.
- "Delete model" removes the file.
- "Delete Digital You" removes everything, including models.
- Logs carry only truncated generation ids, codes, counts and timings. There's no image data, no user id and no tokens, and a test checks this.

**Cost control:** each user gets 8 generations per rolling 24 h (`AVATAR_DAILY_LIMIT`), one job at a time, and one automatic retry for retryable provider failures.

## Turning it on

1. Turn on accounts first (above).
2. Run `supabase/migrations/20261005120000_digital_model.sql`. It needs Postgres 15 or later, which Supabase has.
3. Run `supabase secrets set FASHN_API_KEY=…`. Optional: `FASHN_GENERATION_MODE`, `FASHN_RESOLUTION`, `AVATAR_DAILY_LIMIT`.
4. Run `supabase functions deploy digital-model`.
5. Sign FASHN's DPA, confirm where they process data, and fill the placeholder in the Privacy Policy's "Digital model" section.

The preview build (`VITE_AVATAR_DEMO=1`) uses a labelled demo generator that uses no AI and keeps everything on the device, so the screens can be seen and tested before steps 1–4. Production builds don't include it.

## Tests

- `supabase/functions/_shared/avatar/avatar.test.ts` (26 tests) covers:
  - the FASHN request shape and every documented status and error
  - URL output restricted to FASHN hosts
  - the start rules, stage walk, throttling and save-once claim
  - retry, timeout and background polling
  - approve and discard file clean-up
  - log redaction and the HTTP handler
- `src/app/digital/avatar.integration.test.ts` runs the real supabase-js `functions.invoke`, the function handler and the FASHN adapter against a mock FASHN.
- `supabase/functions/_shared/avatar/testing/smoke.deno.ts` runs the same flow in the Deno runtime:
  `deno run --allow-net=127.0.0.1 supabase/functions/_shared/avatar/testing/smoke.deno.ts`.
- `supabase/tests/digital_model_rls.test.sql` checks the database rules.

## Known limits (digital model)

- **Not run against the real FASHN API or a real Supabase project.** No keys were available. Everything matches the docs and was tested against mocks. Make one real generation before launch, and check how good the identity match is.
- **Face to Model is "Experimental" at FASHN.** Expect changes; the adapter accepts both documented output shapes.
- **FASHN allows 6 jobs at once for the whole account.** Beyond that, users see "busy, try again in a minute". Ask FASHN for higher limits before a launch spike.
- **Cancel doesn't stop the FASHN job.** We discard the result, but if FASHN finishes it, the credits are spent.
- **If the background poller dies and nobody opens the app within 60 minutes, the result is lost.** The base64 output expires, the job is marked timed out, and the user regenerates (credits spent). This is the price of the 60-minute privacy window rather than FASHN's 3-day CDN.
