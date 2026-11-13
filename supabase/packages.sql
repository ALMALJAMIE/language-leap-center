-- ============================================================
-- Language Leap Center — lesson packages (buy hours with a discount)
-- Run in Supabase → SQL Editor AFTER teaching.sql. Safe to run again.
-- Discounts: 1 h = 0%, 3 h = 4%, 5 h = 6%, 10 h = 10%. Hours are valid 30 days.
-- ============================================================

create table if not exists public.lesson_packages (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  teacher_id uuid not null references public.teachers(user_id) on delete cascade,
  hours int not null check (hours in (1, 3, 5, 10)),
  price numeric(8,2) not null,
  paid boolean not null default false,
  valid_until timestamptz not null,
  created_at timestamptz not null default now()
);
alter table public.lesson_packages enable row level security;
drop policy if exists "See own packages" on public.lesson_packages;
create policy "See own packages" on public.lesson_packages for select
  using (student_id = auth.uid() or teacher_id = auth.uid() or public.has_role('finance', 'support'));
grant select on public.lesson_packages to authenticated;

alter table public.private_lessons add column if not exists package_id uuid references public.lesson_packages(id) on delete set null;

create or replace function public.package_discount(p_hours int) returns numeric
language sql immutable as $$
  select case p_hours when 3 then 0.04 when 5 then 0.06 when 10 then 0.10 else 0 end;
$$;

-- minutes still free in a package (cancelled / declined lessons give their minutes back)
create or replace function public.package_minutes_left(p_package uuid) returns int
language sql security definer stable set search_path = public as $$
  select p.hours * 60 - coalesce((select sum(l.minutes) from public.private_lessons l
                                  where l.package_id = p.id and l.status in ('requested', 'confirmed', 'completed', 'no_show')), 0)::int
  from public.lesson_packages p where p.id = p_package;
$$;

create or replace function public.my_packages()
returns table (id uuid, teacher_id uuid, hours int, price numeric, paid boolean, valid_until timestamptz, created_at timestamptz, minutes_left int)
language sql security definer stable set search_path = public as $$
  select p.id, p.teacher_id, p.hours, p.price, p.paid, p.valid_until, p.created_at, public.package_minutes_left(p.id)
  from public.lesson_packages p where p.student_id = auth.uid()
  order by p.created_at desc;
$$;

-- booking now knows how the learner pays:
--   'single'  → pay for this lesson only
--   'package' → buy a package of p_hours and take this lesson from it
--   'use'     → take this lesson from an existing package (p_package)
drop function if exists public.book_private_lesson(uuid, timestamptz, int, text);
create or replace function public.book_private_lesson(
  p_teacher uuid, p_start timestamptz, p_minutes int, p_note text default null,
  p_pay text default 'single', p_hours int default null, p_package uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  t public.teachers;
  m int := extract(hour from p_start at time zone 'UTC')::int * 60 + extract(minute from p_start at time zone 'UTC')::int;
  pkg uuid;
  lesson_price numeric := 0;
  new_id uuid;
begin
  if auth.uid() is null or coalesce((select is_anonymous from auth.users where id = auth.uid()), false) then
    raise exception 'Please sign in to book a lesson.';
  end if;
  select * into t from public.teachers where user_id = p_teacher and published;
  if t.user_id is null then raise exception 'This teacher is not taking bookings.'; end if;
  if p_teacher = auth.uid() then raise exception 'You cannot book yourself.'; end if;
  if p_minutes not in (30, 60, 90) then raise exception 'Choose 30, 60 or 90 minutes.'; end if;
  if p_start < now() + interval '6 hours' then raise exception 'Please book at least 6 hours ahead.'; end if;
  if p_start > now() + interval '60 days' then raise exception 'You can book up to 60 days ahead.'; end if;
  if m % 30 <> 0 then raise exception 'Lessons start on the hour or half hour.'; end if;
  if exists (
    select 1 from generate_series(0, p_minutes - 30, 30) k
    where not exists (
      select 1 from public.availability a
      where a.teacher_id = p_teacher
        and a.weekday = extract(dow from (p_start + make_interval(mins => k)) at time zone 'UTC')::int
        and a.start_min <= extract(hour from (p_start + make_interval(mins => k)) at time zone 'UTC')::int * 60
                           + extract(minute from (p_start + make_interval(mins => k)) at time zone 'UTC')::int
        and a.end_min >= extract(hour from (p_start + make_interval(mins => k)) at time zone 'UTC')::int * 60
                         + extract(minute from (p_start + make_interval(mins => k)) at time zone 'UTC')::int + 30)) then
    raise exception 'The teacher is not available at this time.';
  end if;
  if exists (select 1 from public.private_lessons l
             where l.teacher_id = p_teacher and l.status in ('requested', 'confirmed')
               and tstzrange(l.starts_at, l.starts_at + make_interval(mins => l.minutes))
                   && tstzrange(p_start, p_start + make_interval(mins => p_minutes))) then
    raise exception 'This time was just taken. Please pick another.';
  end if;

  if p_pay = 'package' then
    if p_hours not in (1, 3, 5, 10) then raise exception 'Choose a package of 1, 3, 5 or 10 hours.'; end if;
    if p_hours * 60 < p_minutes then raise exception 'This package is shorter than the lesson.'; end if;
    insert into public.lesson_packages (student_id, teacher_id, hours, price, valid_until)
    values (auth.uid(), p_teacher, p_hours, round(t.lesson_price * p_hours * (1 - public.package_discount(p_hours)), 2), now() + interval '30 days')
    returning id into pkg;
  elsif p_pay = 'use' then
    select p.id into pkg from public.lesson_packages p
     where p.id = p_package and p.student_id = auth.uid() and p.teacher_id = p_teacher and p.valid_until >= p_start;
    if pkg is null then raise exception 'This package cannot be used for this lesson.'; end if;
    if public.package_minutes_left(pkg) < p_minutes then raise exception 'Not enough hours left in your package.'; end if;
  else
    lesson_price := round(t.lesson_price * p_minutes / 60.0, 2);
  end if;

  insert into public.private_lessons (teacher_id, student_id, student_name, starts_at, minutes, student_note, price, package_id)
  values (p_teacher, auth.uid(),
          (select coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) from auth.users where id = auth.uid()),
          p_start, p_minutes, nullif(trim(p_note), ''), lesson_price, pkg)
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.mark_package_paid(p_id uuid, p_paid boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Only finance can do this.'; end if;
  update public.lesson_packages set paid = p_paid where id = p_id;
  update public.private_lessons set paid = p_paid where package_id = p_id;
  return 'ok';
end $$;

-- for finance: every package with the learner's name
create or replace function public.finance_packages()
returns table (id uuid, student text, teacher_id uuid, hours int, price numeric, paid boolean, valid_until timestamptz, created_at timestamptz, minutes_left int)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Not allowed'; end if;
  return query
  select p.id, coalesce(u.raw_user_meta_data->>'full_name', u.email)::text, p.teacher_id, p.hours, p.price, p.paid, p.valid_until, p.created_at,
         public.package_minutes_left(p.id)
  from public.lesson_packages p join auth.users u on u.id = p.student_id
  order by p.created_at desc limit 300;
end $$;

select 'packages ready' as status;
