-- ============================================================
-- Language Leap Center — test learner accounts (confirmed, ready to sign in)
-- Run in Supabase → SQL Editor (New query → paste → Run). Safe to run again.
-- Change the passwords or delete these accounts before going live.
-- ============================================================
do $$
declare
  r record;
  uid uuid;
begin
  for r in
    select * from (values
      ('student1@test.com', 'student1@123', 'Student One'),
      ('student2@test.com', 'student2@123', 'Student Two'),
      ('student3@test.com', 'student3@123', 'Student Three')
    ) as t(email, pw, name)
  loop
    select id into uid from auth.users where email = r.email;
    if uid is null then
      uid := gen_random_uuid();
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change,
        email_change_token_current, phone_change, phone_change_token, reauthentication_token
      ) values (
        '00000000-0000-0000-0000-000000000000', uid, 'authenticated', 'authenticated', r.email,
        extensions.crypt(r.pw, extensions.gen_salt('bf')), now(),
        '{"provider":"email","providers":["email"]}'::jsonb, jsonb_build_object('full_name', r.name), now(), now(),
        '', '', '', '', '', '', '', ''
      );
      insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (gen_random_uuid(), uid, uid::text,
              jsonb_build_object('sub', uid::text, 'email', r.email, 'email_verified', true),
              'email', now(), now(), now());
    else
      update auth.users
         set encrypted_password = extensions.crypt(r.pw, extensions.gen_salt('bf')),
             email_confirmed_at = coalesce(email_confirmed_at, now())
       where id = uid;
    end if;
    -- learners have no team role
    delete from public.staff where user_id = uid;
  end loop;
end $$;

-- Check: the three learners
select email, raw_user_meta_data->>'full_name' as name, email_confirmed_at is not null as confirmed
from auth.users where email like 'student_@test.com' order by email;
