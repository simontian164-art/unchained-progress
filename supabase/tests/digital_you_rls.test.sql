-- RLS tests for Digital You. Plain SQL: every check raises if a policy is wrong.
-- Run against a database where the migration has been applied (locally: see docs/DIGITAL_YOU.md).
begin;
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.com');

-- ── as user A ──
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
insert into public.digital_profiles (id, user_id, status, age_range, goal) values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active', '25-34', 'dating');
insert into public.profile_images (user_id, profile_id, kind, storage_path, mime_type, width, height, byte_size)
  values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'head_front', '11111111-1111-1111-1111-111111111111/profile/head_front-1.jpg', 'image/jpeg', 1200, 1600, 300000);
insert into public.body_measurements (user_id, profile_id, height_cm, weight_kg) values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 180, 78);
insert into public.saved_looks (user_id, profile_id, kind, result_path, status) values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'hair', '11111111-1111-1111-1111-111111111111/looks/1.jpg', 'ready');
insert into storage.objects (bucket_id, name, owner_id) values ('digital-you', '11111111-1111-1111-1111-111111111111/profile/head_front-1.jpg', '11111111-1111-1111-1111-111111111111');

-- A cannot write into B's identity or B's folder
do $$ begin
  begin
    insert into public.digital_profiles (user_id) values ('22222222-2222-2222-2222-222222222222');
    raise exception 'FAIL: A created a profile for B';
  exception when insufficient_privilege then null; end;
  begin
    insert into storage.objects (bucket_id, name) values ('digital-you', '22222222-2222-2222-2222-222222222222/profile/x.jpg');
    raise exception 'FAIL: A uploaded into B''s folder';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.profile_images (user_id, profile_id, kind, storage_path, mime_type, width, height, byte_size)
      values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'head_left', '22222222-2222-2222-2222-222222222222/profile/x.jpg', 'image/jpeg', 10, 10, 10);
    raise exception 'FAIL: A referenced a path in B''s folder';
  exception when check_violation then null; end;
end $$;

-- ── as user B ──
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.digital_profiles) <> 0 then raise exception 'FAIL: B can see A''s profile'; end if;
  if (select count(*) from public.profile_images) <> 0 then raise exception 'FAIL: B can see A''s images'; end if;
  if (select count(*) from public.body_measurements) <> 0 then raise exception 'FAIL: B can see A''s measurements'; end if;
  if (select count(*) from public.saved_looks) <> 0 then raise exception 'FAIL: B can see A''s looks'; end if;
  if (select count(*) from storage.objects where bucket_id = 'digital-you') <> 0 then raise exception 'FAIL: B can see A''s files'; end if;
end $$;
update public.digital_profiles set goal = 'hacked';
delete from public.profile_images;
delete from storage.objects;
-- B can't attach its rows to A's profile (composite FK on (profile_id, user_id))
insert into public.digital_profiles (id, user_id) values ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222');
do $$ begin
  begin
    insert into public.body_measurements (user_id, profile_id, height_cm) values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', 170);
    raise exception 'FAIL: B attached a row to A''s profile';
  exception when foreign_key_violation then null; end;
end $$;

-- ── anon sees nothing and can't write ──
reset role; set local role anon;
select set_config('request.jwt.claims', '', true);
do $$ begin
  begin
    perform 1 from public.digital_profiles;
    raise exception 'FAIL: anon can query digital_profiles';
  exception when insufficient_privilege then null; end;
end $$;

-- ── back as A: data untouched by B, then deleting the profile cascades to every child row ──
reset role; set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
do $$ begin
  if (select goal from public.digital_profiles) <> 'dating' then raise exception 'FAIL: B modified A''s profile'; end if;
  if (select count(*) from public.profile_images) <> 1 then raise exception 'FAIL: B deleted A''s image row'; end if;
  if (select count(*) from storage.objects where bucket_id = 'digital-you') <> 1 then raise exception 'FAIL: B deleted A''s file'; end if;
end $$;
-- the updated_at trigger runs for a normal user
update public.digital_profiles set goal = 'work';
delete from public.digital_profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001';
do $$ begin
  if (select count(*) from public.profile_images) + (select count(*) from public.body_measurements) + (select count(*) from public.saved_looks) <> 0
    then raise exception 'FAIL: profile delete did not cascade'; end if;
end $$;
select 'ALL DIGITAL YOU RLS TESTS PASSED' as result;
rollback;
