-- Tests for the digital model tables (migration 20261005120000_digital_model.sql).
-- Plain SQL: every check raises if a rule is wrong. Run after both Digital You migrations.
begin;
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'a@example.com'),
  ('22222222-2222-2222-2222-222222222222', 'b@example.com');

-- ── A creates a profile and a face photo the normal way ──
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
insert into public.digital_profiles (id, user_id, status) values ('aaaaaaaa-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'active');
insert into public.profile_images (id, user_id, profile_id, kind, storage_path, mime_type, width, height, byte_size)
  values ('a1a1a1a1-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'head_front', '11111111-1111-1111-1111-111111111111/profile/head_front-1.jpg', 'image/jpeg', 1200, 1600, 300000);

-- the browser can't create, edit or delete generations, or pick the primary model
do $$ begin
  begin
    insert into public.avatar_generations (user_id, profile_id, provider, provider_model)
      values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'fashn', 'face-to-model');
    raise exception 'FAIL: browser inserted a generation';
  exception when insufficient_privilege then null; end;
  begin
    update public.digital_profiles set primary_avatar_id = gen_random_uuid();
    raise exception 'FAIL: browser set primary_avatar_id';
  exception when insufficient_privilege then null; end;
  begin
    insert into public.digital_profiles (user_id, primary_avatar_id) values ('11111111-1111-1111-1111-111111111111', gen_random_uuid());
    raise exception 'FAIL: browser inserted a profile with primary_avatar_id';
  exception when insufficient_privilege then null; end;
end $$;
-- ordinary profile edits still work
update public.digital_profiles set goal = 'work';

-- ── the Edge Function (service role) records generations ──
reset role; set local role service_role;
insert into public.avatar_generations (id, user_id, profile_id, source_image_id, provider, provider_model, generation_status, provider_job_id)
  values ('9e9e9e9e-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000001', 'fashn', 'face-to-model', 'processing', 'job-1');
do $$ begin
  -- one generation in flight per user
  begin
    insert into public.avatar_generations (user_id, profile_id, provider, provider_model)
      values ('11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'fashn', 'face-to-model');
    raise exception 'FAIL: two active generations for one user';
  exception when unique_violation then null; end;
  -- a result must sit in the owner's folder
  begin
    update public.avatar_generations set result_path = '22222222-2222-2222-2222-222222222222/avatars/x.jpg' where id = '9e9e9e9e-0000-0000-0000-000000000001';
    raise exception 'FAIL: result path in another user''s folder';
  exception when check_violation then null; end;
  -- ready needs an image; approval needs ready
  begin
    update public.avatar_generations set generation_status = 'ready' where id = '9e9e9e9e-0000-0000-0000-000000000001';
    raise exception 'FAIL: ready without a result';
  exception when check_violation then null; end;
  begin
    update public.avatar_generations set approved_by_user = true where id = '9e9e9e9e-0000-0000-0000-000000000001';
    raise exception 'FAIL: approved before ready';
  exception when check_violation then null; end;
  -- a generation can't point at another user's photo
  begin
    insert into public.avatar_generations (user_id, profile_id, source_image_id, provider, provider_model, generation_status)
      values ('22222222-2222-2222-2222-222222222222', 'aaaaaaaa-0000-0000-0000-000000000001', 'a1a1a1a1-0000-0000-0000-000000000001', 'fashn', 'face-to-model', 'failed');
    raise exception 'FAIL: cross-user generation';
  exception when foreign_key_violation then null; end;
end $$;
update public.avatar_generations
  set generation_status = 'ready', result_path = '11111111-1111-1111-1111-111111111111/avatars/9e9e9e9e.jpg', result_mime = 'image/jpeg', generated_at = now(), approved_by_user = true, approved_at = now()
  where id = '9e9e9e9e-0000-0000-0000-000000000001';
update public.digital_profiles set primary_avatar_id = '9e9e9e9e-0000-0000-0000-000000000001' where id = 'aaaaaaaa-0000-0000-0000-000000000001';

-- ── B sees none of it and can't point at it ──
reset role; set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.avatar_generations) <> 0 then raise exception 'FAIL: B can see A''s generations'; end if;
end $$;
insert into public.digital_profiles (id, user_id) values ('bbbbbbbb-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222');
reset role; set local role service_role;
do $$ begin
  begin
    update public.digital_profiles set primary_avatar_id = '9e9e9e9e-0000-0000-0000-000000000001' where id = 'bbbbbbbb-0000-0000-0000-000000000002';
    raise exception 'FAIL: B''s profile points at A''s model';
  exception when foreign_key_violation then null; end;
end $$;

-- ── A can read its own generation, but not change or delete it ──
reset role; set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
do $$ begin
  if (select count(*) from public.avatar_generations) <> 1 then raise exception 'FAIL: A can''t read its generation'; end if;
  begin
    update public.avatar_generations set generation_status = 'ready';
    raise exception 'FAIL: browser edited a generation';
  exception when insufficient_privilege then null; end;
  begin
    delete from public.avatar_generations;
    raise exception 'FAIL: browser deleted a generation row';
  exception when insufficient_privilege then null; end;
end $$;

-- deleting (or replacing) the source photo keeps the model, just unlinks it
delete from public.profile_images where id = 'a1a1a1a1-0000-0000-0000-000000000001';
do $$ begin
  if (select source_image_id from public.avatar_generations) is not null then raise exception 'FAIL: source not unlinked'; end if;
  if (select primary_avatar_id from public.digital_profiles) is null then raise exception 'FAIL: primary model lost with the photo'; end if;
end $$;

-- deleting the generation clears the primary pointer but keeps the profile's owner
reset role; set local role service_role;
insert into public.avatar_generations (id, user_id, profile_id, provider, provider_model, generation_status)
  values ('9e9e9e9e-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'fashn', 'face-to-model', 'failed');
delete from public.avatar_generations where id = '9e9e9e9e-0000-0000-0000-000000000001';
do $$ begin
  if (select primary_avatar_id from public.digital_profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001') is not null then raise exception 'FAIL: primary pointer not cleared'; end if;
  if (select user_id from public.digital_profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001') is null then raise exception 'FAIL: owner cleared'; end if;
end $$;
-- set a primary again, then the user deletes the whole profile: everything cascades
insert into public.avatar_generations (id, user_id, profile_id, provider, provider_model, generation_status, result_path, approved_by_user)
  values ('9e9e9e9e-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-0000-0000-0000-000000000001', 'fashn', 'face-to-model', 'ready', '11111111-1111-1111-1111-111111111111/avatars/3.jpg', true);
update public.digital_profiles set primary_avatar_id = '9e9e9e9e-0000-0000-0000-000000000003' where id = 'aaaaaaaa-0000-0000-0000-000000000001';
reset role; set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', true);
delete from public.digital_profiles where id = 'aaaaaaaa-0000-0000-0000-000000000001';
reset role;
do $$ begin
  if (select count(*) from public.avatar_generations where user_id = '11111111-1111-1111-1111-111111111111') <> 0 then raise exception 'FAIL: generations survived profile delete'; end if;
end $$;
do $$ begin
  if not exists (select 1 from storage.buckets where id = 'digital-you' and 'image/png' = any (allowed_mime_types))
    then raise exception 'FAIL: bucket does not accept PNG models'; end if;
end $$;

select 'digital model tests passed' as result;
rollback;
