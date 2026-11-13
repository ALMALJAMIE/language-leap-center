-- ============================================================
-- Language Leap Center — team roles + test accounts
-- Run ONCE in Supabase → SQL Editor (New query → paste → Run).
-- Safe to run again: it updates instead of duplicating.
-- ============================================================

-- 1) Roles on the staff table -------------------------------------------
-- Rows that already exist (the owner's account) become admin.
alter table public.staff add column if not exists role text not null default 'admin';
alter table public.staff alter column role set default 'support';
alter table public.staff drop constraint if exists staff_role_check;
alter table public.staff add constraint staff_role_check
  check (role in ('admin', 'teacher', 'finance', 'academic', 'support'));
alter table public.staff add column if not exists created_at timestamptz not null default now();

-- true when the signed-in user has one of these roles (admin always passes)
create or replace function public.has_role(variadic roles text[]) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.staff
    where user_id = auth.uid() and (role = 'admin' or role = any(roles))
  );
$$;

drop policy if exists "Staff can see themselves" on public.staff;
drop policy if exists "See self or admin" on public.staff;
create policy "See self or admin" on public.staff
  for select using (auth.uid() = user_id or public.has_role('admin'));

-- 2) Support chat: only support (and admin) read every conversation -----
drop policy if exists "Read own or staff" on public.conversations;
drop policy if exists "Update own or staff" on public.conversations;
create policy "Read own or staff" on public.conversations
  for select using (user_id = auth.uid() or public.has_role('support'));
create policy "Update own or staff" on public.conversations
  for update using (user_id = auth.uid() or public.has_role('support'));

drop policy if exists "Read messages of own or staff" on public.messages;
drop policy if exists "Send in own or staff" on public.messages;
create policy "Read messages of own or staff" on public.messages for select using (
  exists (select 1 from public.conversations c
          where c.id = conversation_id and (c.user_id = auth.uid() or public.has_role('support')))
);
create policy "Send in own or staff" on public.messages for insert with check (
  sender_id = auth.uid() and from_staff = public.has_role('support')
  and exists (select 1 from public.conversations c
              where c.id = conversation_id and (c.user_id = auth.uid() or public.has_role('support')))
);

-- 3) Team members can read learner data they need ------------------------
drop policy if exists "Team reads profiles" on public.learner_profiles;
create policy "Team reads profiles" on public.learner_profiles
  for select using (public.has_role('support', 'finance', 'academic'));
drop policy if exists "Team reads progress" on public.learner_progress;
create policy "Team reads progress" on public.learner_progress
  for select using (public.has_role('support', 'academic'));
drop policy if exists "Team reads enrollments" on public.enrollments;
create policy "Team reads enrollments" on public.enrollments
  for select using (public.has_role('finance', 'academic', 'support'));

alter table public.enrollments add column if not exists note text;
alter table public.enrollments add column if not exists granted_by uuid references auth.users(id) on delete set null;

-- 4) Workspace functions ------------------------------------------------
create or replace function public.staff_overview() returns json
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.has_role('support', 'finance', 'academic') then raise exception 'Not allowed'; end if;
  return json_build_object(
    'learners', (select count(*) from auth.users u
                  where not coalesce(u.is_anonymous, false)
                    and not exists (select 1 from public.staff s where s.user_id = u.id)),
    'new_week', (select count(*) from auth.users u
                  where not coalesce(u.is_anonymous, false) and u.created_at > now() - interval '7 days'
                    and not exists (select 1 from public.staff s where s.user_id = u.id)),
    'active_week', (select count(*) from public.learner_progress p where p.updated_at > now() - interval '7 days'),
    'enrollments', (select count(*) from public.enrollments),
    'open_chats', (select count(*) from public.conversations c where c.status = 'open'),
    'team', (select count(*) from public.staff)
  );
end $$;

create or replace function public.staff_list_users(search text default '')
returns table (id uuid, email text, full_name text, created_at timestamptz, last_sign_in_at timestamptz,
               confirmed boolean, role text, courses int, last_active timestamptz)
language plpgsql security definer stable set search_path = public as $$
#variable_conflict use_column
begin
  if not public.has_role('support', 'finance', 'academic') then raise exception 'Not allowed'; end if;
  return query
  select u.id, u.email::text, coalesce(u.raw_user_meta_data->>'full_name', '')::text, u.created_at, u.last_sign_in_at,
         u.email_confirmed_at is not null, s.role,
         (select count(*)::int from public.enrollments e where e.user_id = u.id), p.updated_at
  from auth.users u
  left join public.staff s on s.user_id = u.id
  left join public.learner_progress p on p.user_id = u.id
  where not coalesce(u.is_anonymous, false)
    and (coalesce(search, '') = '' or u.email ilike '%' || search || '%'
         or (u.raw_user_meta_data->>'full_name') ilike '%' || search || '%')
  order by u.created_at desc
  limit 300;
end $$;

create or replace function public.staff_list_team()
returns table (user_id uuid, email text, full_name text, role text, created_at timestamptz, last_sign_in_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
#variable_conflict use_column
begin
  if not public.has_role('admin') then raise exception 'Not allowed'; end if;
  return query
  select s.user_id, u.email::text, coalesce(u.raw_user_meta_data->>'full_name', '')::text, s.role, s.created_at, u.last_sign_in_at
  from public.staff s join auth.users u on u.id = s.user_id
  order by s.created_at;
end $$;

create or replace function public.admin_set_role(p_email text, p_role text) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.has_role('admin') then raise exception 'Only admins can change roles.'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'No account uses this email. Ask the person to create an account first.'; end if;
  if coalesce(p_role, '') = '' then
    if uid = auth.uid() then raise exception 'You cannot remove your own admin role.'; end if;
    delete from public.staff where user_id = uid;
    return 'removed';
  end if;
  if uid = auth.uid() and p_role <> 'admin' then raise exception 'You cannot change your own role.'; end if;
  insert into public.staff (user_id, role) values (uid, p_role)
  on conflict (user_id) do update set role = excluded.role;
  return 'saved';
end $$;

create or replace function public.staff_list_enrollments()
returns table (email text, full_name text, course_slug text, created_at timestamptz, note text, granted_by text)
language plpgsql security definer stable set search_path = public as $$
#variable_conflict use_column
begin
  if not public.has_role('finance', 'academic', 'support') then raise exception 'Not allowed'; end if;
  return query
  select u.email::text, coalesce(u.raw_user_meta_data->>'full_name', '')::text, e.course_slug, e.created_at, e.note, g.email::text
  from public.enrollments e
  join auth.users u on u.id = e.user_id
  left join auth.users g on g.id = e.granted_by
  order by e.created_at desc
  limit 500;
end $$;

create or replace function public.staff_grant_course(p_email text, p_slug text, p_note text default null) returns text
language plpgsql security definer set search_path = public as $$
declare uid uuid;
begin
  if not public.has_role('finance') then raise exception 'Only finance or admin can open courses.'; end if;
  select id into uid from auth.users where lower(email) = lower(trim(p_email));
  if uid is null then raise exception 'No account uses this email.'; end if;
  insert into public.enrollments (user_id, course_slug, note, granted_by)
  values (uid, p_slug, nullif(trim(p_note), ''), auth.uid())
  on conflict (user_id, course_slug) do update set note = excluded.note, granted_by = excluded.granted_by;
  return 'granted';
end $$;

create or replace function public.staff_revoke_course(p_email text, p_slug text) returns text
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Only finance or admin can remove access.'; end if;
  delete from public.enrollments e
  using auth.users u
  where u.id = e.user_id and lower(u.email) = lower(trim(p_email)) and e.course_slug = p_slug;
  return 'revoked';
end $$;

-- 5) Test accounts (confirmed, ready to sign in) --------------------------
-- Change these passwords or delete these accounts before going live.
do $$
declare
  r record;
  uid uuid;
begin
  for r in
    select * from (values
      ('admin@test.com',    'admin@123',    'admin',    'Platform Admin'),
      ('teacher@test.com',  'teacher@123',  'teacher',  'Test Teacher'),
      ('finance@test.com',  'finance@123',  'finance',  'Finance Officer'),
      ('academic@test.com', 'academic@123', 'academic', 'Academic Lead'),
      ('support@test.com',  'support@123',  'support',  'Support Agent')
    ) as t(email, pw, role, name)
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
    insert into public.staff (user_id, role) values (uid, r.role)
    on conflict (user_id) do update set role = excluded.role;
  end loop;
end $$;

-- Check: you should see 5 test accounts (+ yours if you added it before)
select u.email, s.role from public.staff s join auth.users u on u.id = s.user_id order by s.role;
