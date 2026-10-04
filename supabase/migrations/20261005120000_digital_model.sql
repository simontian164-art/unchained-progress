-- Digital model ("primary avatar"): an AI-generated upper-body model of the user, built server-side
-- from their front face photo. One row per generation attempt, so cost and history are auditable.
--
-- Who writes what:
--   - avatar_generations rows are written ONLY by the `digital-model` Edge Function (service role).
--     The browser can read its own rows but never insert or edit them, so it can't fake a status,
--     point a row at another provider job, or mark something approved.
--   - digital_profiles.primary_avatar_id is likewise server-only (column privilege below).
--   - Result images live in the private `digital-you` bucket under "<user id>/avatars/", next to the
--     user's photos, so "Delete Digital You" (which empties "<user id>/") removes them too, and the
--     rows cascade with the profile.
-- Requires Postgres 15+ (ON DELETE SET NULL with a column list).

-- profile_images needs (id, user_id) to be referenceable as a pair, like digital_profiles.
alter table public.profile_images add constraint profile_images_id_user_id_key unique (id, user_id);

create table public.avatar_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  -- the face photo it was made from; becomes null if that photo is later replaced or deleted
  -- (the model itself stays until the user deletes it)
  source_image_id uuid,
  provider text not null check (provider ~ '^[a-z0-9_-]{2,40}$'),
  provider_model text not null check (char_length(provider_model) between 1 and 80),
  -- the provider's job id; never sent to the browser
  provider_job_id text check (char_length(provider_job_id) <= 200),
  -- raw provider state, kept for support/debugging (e.g. 'in_queue', 'processing')
  provider_status text check (char_length(provider_status) <= 40),
  provider_checked_at timestamptz,
  attempts smallint not null default 1 check (attempts between 1 and 5),
  seed integer,
  generation_status text not null default 'queued'
    check (generation_status in ('queued', 'processing', 'finalizing', 'ready', 'failed', 'discarded')),
  -- provider-neutral failure reason; the raw provider message is only logged server-side
  failure_code text check (failure_code in ('photo_unusable', 'content_blocked', 'provider_busy', 'provider_unavailable', 'timed_out', 'unknown')),
  result_path text unique check (result_path is null or split_part(result_path, '/', 1) = user_id::text),
  result_mime text check (result_mime in ('image/jpeg', 'image/png')),
  approved_by_user boolean not null default false,
  approved_at timestamptz,
  generated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (profile_id, user_id) references public.digital_profiles (id, user_id) on delete cascade,
  foreign key (source_image_id, user_id) references public.profile_images (id, user_id) on delete set null (source_image_id),
  -- a ready model always has its image; approval only for ready models
  check (generation_status <> 'ready' or result_path is not null),
  check (not approved_by_user or generation_status = 'ready')
);
create index avatar_generations_user_created_idx on public.avatar_generations (user_id, created_at desc);
create index avatar_generations_profile_id_user_id_idx on public.avatar_generations (profile_id, user_id);
create index avatar_generations_source_image_id_idx on public.avatar_generations (source_image_id, user_id);
-- at most one generation in flight per user, so a double tap can't start (and pay for) two
create unique index avatar_generations_one_active on public.avatar_generations (user_id)
  where generation_status in ('queued', 'processing', 'finalizing');
-- at most one approved model per user
create unique index avatar_generations_one_approved on public.avatar_generations (user_id) where approved_by_user;
create trigger avatar_generations_updated_at before update on public.avatar_generations
  for each row execute function public.dy_set_updated_at();

alter table public.avatar_generations enable row level security;
revoke all on table public.avatar_generations from anon, authenticated;
grant select on table public.avatar_generations to authenticated;
create policy "avatar_generations: owner can read" on public.avatar_generations
  for select to authenticated using ((select auth.uid()) = user_id);

-- ─── primary avatar on the profile ───────────────────────────────────────
alter table public.digital_profiles add column primary_avatar_id uuid;
alter table public.digital_profiles
  add constraint digital_profiles_primary_avatar_fk
  foreign key (primary_avatar_id, user_id) references public.avatar_generations (id, user_id)
  on delete set null (primary_avatar_id);
create index digital_profiles_primary_avatar_idx on public.digital_profiles (primary_avatar_id, user_id);

-- The browser may create and edit its own profile fields, but never choose the primary model.
revoke insert, update on table public.digital_profiles from authenticated;
grant insert (id, user_id, status, age_range, goal, unit_system, last_scan_at) on table public.digital_profiles to authenticated;
grant update (status, age_range, goal, unit_system, last_scan_at) on table public.digital_profiles to authenticated;

-- Generated models may be PNG or JPEG.
update storage.buckets
  set allowed_mime_types = array['image/jpeg', 'image/webp', 'image/png']
  where id = 'digital-you';
