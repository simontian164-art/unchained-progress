-- Digital You: the user's private visual baseline (photos + self-reported measurements).
-- Every row belongs to exactly one auth user. Photos live in the private `digital-you` bucket under
-- "<user id>/...". All access goes through RLS; nothing here is readable by `anon`.
--
-- Data API: since 2026-10-30, new public tables are not exposed automatically, so access is
-- granted explicitly to `authenticated` only (with RLS on). See
-- https://supabase.com/docs/guides/api/securing-your-api

-- ─── helpers ─────────────────────────────────────────────────────────────
create or replace function public.dy_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- ─── digital_profiles: one per user ──────────────────────────────────────
create table public.digital_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  status text not null default 'draft' check (status in ('draft', 'active')),
  age_range text check (age_range in ('18-24', '25-34', '35-44', '45+')),
  goal text check (char_length(goal) <= 80),
  unit_system text not null default 'metric' check (unit_system in ('metric', 'imperial')),
  last_scan_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- lets child tables reference (profile, owner) together, so a row can never point at another
  -- user's profile
  unique (id, user_id)
);
create trigger digital_profiles_updated_at before update on public.digital_profiles
  for each row execute function public.dy_set_updated_at();

-- ─── profile_images: references to photos in storage (never the bytes) ─────
create table public.profile_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  kind text not null check (kind in ('head_front', 'head_left', 'head_right', 'body_front', 'body_side')),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/webp')),
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  byte_size integer not null check (byte_size > 0 and byte_size <= 10485760),
  -- result of the on-device checks at capture time (dimensions, person count, etc.)
  checks jsonb not null default '{}'::jsonb,
  is_current boolean not null default true,
  created_at timestamptz not null default now(),
  foreign key (profile_id, user_id) references public.digital_profiles (id, user_id) on delete cascade,
  -- the object must sit in the owner's folder
  check (split_part(storage_path, '/', 1) = user_id::text)
);
create index profile_images_user_id_idx on public.profile_images (user_id);
create index profile_images_profile_id_user_id_idx on public.profile_images (profile_id, user_id);
-- at most one current photo of each kind per profile
create unique index profile_images_one_current_per_kind on public.profile_images (profile_id, kind) where is_current;

-- ─── body_measurements: self-reported, kept as history ───────────────────
create table public.body_measurements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  measured_at timestamptz not null default now(),
  height_cm numeric(5, 1) check (height_cm between 120 and 230),
  weight_kg numeric(5, 1) check (weight_kg between 35 and 300),
  waist_cm numeric(5, 1) check (waist_cm between 40 and 200),
  chest_cm numeric(5, 1) check (chest_cm between 50 and 200),
  shoulder_cm numeric(5, 1) check (shoulder_cm between 25 and 80),
  source text not null default 'self_reported' check (source in ('self_reported')),
  foreign key (profile_id, user_id) references public.digital_profiles (id, user_id) on delete cascade
);
create index body_measurements_user_id_idx on public.body_measurements (user_id);
create index body_measurements_profile_latest_idx on public.body_measurements (profile_id, user_id, measured_at desc);

-- ─── appearance_preferences: one per profile ─────────────────────────────
create table public.appearance_preferences (
  profile_id uuid primary key,
  user_id uuid not null,
  style_goals text[] not null default '{}',
  fit_preference text check (fit_preference in ('slim', 'regular', 'relaxed')),
  avoid text[] not null default '{}',
  hair_goal text check (char_length(hair_goal) <= 80),
  facial_hair_goal text check (char_length(facial_hair_goal) <= 80),
  updated_at timestamptz not null default now(),
  foreign key (profile_id, user_id) references public.digital_profiles (id, user_id) on delete cascade
);
create index appearance_preferences_user_id_idx on public.appearance_preferences (user_id);
create trigger appearance_preferences_updated_at before update on public.appearance_preferences
  for each row execute function public.dy_set_updated_at();

-- ─── saved_looks: generated derivatives (try-ons, previews). Written by server-side jobs. ──
create table public.saved_looks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  profile_id uuid not null,
  kind text not null check (kind in ('outfit', 'hair', 'facial_hair', 'physique', 'future_self')),
  source_image_id uuid references public.profile_images (id) on delete set null,
  result_path text unique check (result_path is null or split_part(result_path, '/', 1) = user_id::text),
  status text not null default 'pending' check (status in ('pending', 'ready', 'failed')),
  provider text check (char_length(provider) <= 40),
  params jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (profile_id, user_id) references public.digital_profiles (id, user_id) on delete cascade
);
create index saved_looks_user_id_idx on public.saved_looks (user_id);
create index saved_looks_profile_id_user_id_idx on public.saved_looks (profile_id, user_id, created_at desc);
create index saved_looks_source_image_id_idx on public.saved_looks (source_image_id);

-- ─── privileges + RLS ────────────────────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array['digital_profiles', 'profile_images', 'body_measurements', 'appearance_preferences', 'saved_looks'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on table public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on table public.%I to authenticated', t);
    execute format($p$create policy "%1$s: owner can read" on public.%1$I for select to authenticated using ((select auth.uid()) = user_id)$p$, t);
    execute format($p$create policy "%1$s: owner can insert" on public.%1$I for insert to authenticated with check ((select auth.uid()) = user_id)$p$, t);
    execute format($p$create policy "%1$s: owner can update" on public.%1$I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)$p$, t);
    execute format($p$create policy "%1$s: owner can delete" on public.%1$I for delete to authenticated using ((select auth.uid()) = user_id)$p$, t);
  end loop;
end $$;

revoke execute on function public.dy_set_updated_at() from public, anon, authenticated;

-- ─── storage: private bucket, per-user folder ────────────────────────────
-- 10 MB cap and JPEG/WebP only: the app re-encodes every photo on the device first (which also
-- strips EXIF/GPS metadata) before upload.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('digital-you', 'digital-you', false, 10485760, array['image/jpeg', 'image/webp'])
on conflict (id) do nothing;

-- Pattern from https://supabase.com/docs/guides/storage/security/access-control
-- Upsert (replace) needs insert + select + update; delete needs delete.
create policy "digital-you: owner can read"
  on storage.objects for select to authenticated
  using (bucket_id = 'digital-you' and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub'));
create policy "digital-you: owner can upload"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'digital-you' and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub'));
create policy "digital-you: owner can replace"
  on storage.objects for update to authenticated
  using (bucket_id = 'digital-you' and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub'))
  with check (bucket_id = 'digital-you' and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub'));
create policy "digital-you: owner can delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'digital-you' and (storage.foldername(name))[1] = (select auth.jwt() ->> 'sub'));
