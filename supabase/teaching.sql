-- ============================================================
-- Language Leap Center — teaching system
-- (teacher profiles, availability, private lessons, notes, reviews,
--  assignments with voice answers, lesson questions, earnings & payouts)
-- Run ONCE in Supabase → SQL Editor, AFTER roles.sql. Safe to run again.
-- ============================================================

-- 1) Teacher profiles ----------------------------------------------------
create table if not exists public.teachers (
  user_id uuid primary key references auth.users(id) on delete cascade,
  slug text unique not null,
  name text not null,
  title text not null default '',
  bio text not null default '',
  photo text,
  country text,
  languages text[] not null default '{English}',
  specialties text[] not null default '{}',
  qualifications text[] not null default '{}',
  experience_years int,
  meeting_provider text not null default 'zoom' check (meeting_provider in ('zoom', 'meet', 'other')),
  meeting_link text,
  lesson_price numeric(8,2) not null default 15,  -- learner pays per hour   (set by finance/admin)
  hourly_pay numeric(8,2) not null default 10,    -- teacher earns per hour  (set by finance/admin)
  published boolean not null default false,       -- shown on the public Instructors page
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.teachers enable row level security;
drop policy if exists "Teacher reads own, team reads all" on public.teachers;
create policy "Teacher reads own, team reads all" on public.teachers
  for select using (user_id = auth.uid() or public.has_role('finance', 'academic', 'support'));
drop policy if exists "Teacher creates own profile" on public.teachers;
create policy "Teacher creates own profile" on public.teachers
  for insert with check ((user_id = auth.uid() and public.has_role('teacher')) or public.has_role('finance', 'academic'));
drop policy if exists "Teacher edits own profile" on public.teachers;
create policy "Teacher edits own profile" on public.teachers
  for update using (user_id = auth.uid() or public.has_role('finance', 'academic'));
grant select, insert, update on public.teachers to authenticated;

-- prices and publishing can only be changed by finance (or admin)
create or replace function public.protect_teacher_money() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('finance') then
    if tg_op = 'INSERT' then
      new.lesson_price := 15; new.hourly_pay := 10;
      if not public.has_role('academic') then new.published := false; end if;
    else
      new.lesson_price := old.lesson_price; new.hourly_pay := old.hourly_pay;
      if not public.has_role('academic') then new.published := old.published; end if;
    end if;
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists teachers_protect on public.teachers;
create trigger teachers_protect before insert or update on public.teachers
  for each row execute function public.protect_teacher_money();

-- 2) Weekly availability (stored in UTC) ----------------------------------
create table if not exists public.availability (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references public.teachers(user_id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),   -- 0 = Sunday (UTC)
  start_min int not null check (start_min between 0 and 1439),
  end_min int not null check (end_min > start_min and end_min <= 1440)
);
alter table public.availability enable row level security;
drop policy if exists "Anyone signed in reads availability" on public.availability;
create policy "Anyone signed in reads availability" on public.availability for select using (true);
grant select on public.availability to anon, authenticated;

create or replace function public.set_availability(p_slots jsonb) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not exists (select 1 from public.teachers where user_id = auth.uid()) then
    raise exception 'Create your teacher profile first.';
  end if;
  delete from public.availability where teacher_id = auth.uid();
  insert into public.availability (teacher_id, weekday, start_min, end_min)
  select auth.uid(), (s->>'weekday')::smallint, (s->>'start_min')::int, (s->>'end_min')::int
  from jsonb_array_elements(coalesce(p_slots, '[]'::jsonb)) s;
  get diagnostics n = row_count;
  return n;
end $$;

-- 3) Private lessons --------------------------------------------------------
create table if not exists public.private_lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.teachers(user_id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text,
  starts_at timestamptz not null,
  minutes int not null check (minutes in (30, 60, 90)),
  status text not null default 'requested'
    check (status in ('requested', 'confirmed', 'declined', 'cancelled', 'completed', 'no_show')),
  student_note text,
  meeting_link text,
  price numeric(8,2) not null default 0,
  teacher_pay numeric(8,2) not null default 0,
  paid boolean not null default false,
  summary text, homework text, next_focus text,
  cancel_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists private_lessons_teacher on public.private_lessons (teacher_id, starts_at);
create index if not exists private_lessons_student on public.private_lessons (student_id, starts_at);
alter table public.private_lessons enable row level security;
drop policy if exists "See own lessons" on public.private_lessons;
create policy "See own lessons" on public.private_lessons for select
  using (student_id = auth.uid() or teacher_id = auth.uid() or public.has_role('finance', 'support', 'academic'));
grant select on public.private_lessons to authenticated;

-- times a teacher is already booked (no names, for the booking calendar)
create or replace function public.teacher_busy(p_teacher uuid)
returns table (starts_at timestamptz, minutes int)
language sql security definer stable set search_path = public as $$
  select l.starts_at, l.minutes from public.private_lessons l
  where l.teacher_id = p_teacher and l.status in ('requested', 'confirmed') and l.starts_at > now() - interval '2 hours';
$$;

create or replace function public.book_private_lesson(p_teacher uuid, p_start timestamptz, p_minutes int, p_note text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  t public.teachers;
  m int := extract(hour from p_start at time zone 'UTC')::int * 60 + extract(minute from p_start at time zone 'UTC')::int;
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
  -- every half hour of the lesson must be inside an open slot (a lesson may cross midnight UTC)
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
  insert into public.private_lessons (teacher_id, student_id, student_name, starts_at, minutes, student_note, price)
  values (p_teacher, auth.uid(),
          (select coalesce(raw_user_meta_data->>'full_name', split_part(email, '@', 1)) from auth.users where id = auth.uid()),
          p_start, p_minutes, nullif(trim(p_note), ''), round(t.lesson_price * p_minutes / 60.0, 2))
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.respond_private_lesson(p_id uuid, p_accept boolean, p_link text default null)
returns text language plpgsql security definer set search_path = public as $$
declare l public.private_lessons;
begin
  select * into l from public.private_lessons where id = p_id;
  if l.id is null or l.teacher_id <> auth.uid() then raise exception 'Not your lesson.'; end if;
  if l.status <> 'requested' then raise exception 'This request was already answered.'; end if;
  update public.private_lessons
     set status = case when p_accept then 'confirmed' else 'declined' end,
         meeting_link = case when p_accept then coalesce(nullif(trim(p_link), ''), (select meeting_link from public.teachers where user_id = l.teacher_id)) end,
         updated_at = now()
   where id = p_id;
  return 'ok';
end $$;

create or replace function public.set_lesson_link(p_id uuid, p_link text)
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.private_lessons set meeting_link = nullif(trim(p_link), ''), updated_at = now()
   where id = p_id and (teacher_id = auth.uid() or public.has_role('support')) and status = 'confirmed';
  if not found then raise exception 'Not allowed.'; end if;
  return 'ok';
end $$;

create or replace function public.cancel_private_lesson(p_id uuid, p_reason text default null)
returns text language plpgsql security definer set search_path = public as $$
declare l public.private_lessons;
begin
  select * into l from public.private_lessons where id = p_id;
  if l.id is null or not (l.student_id = auth.uid() or l.teacher_id = auth.uid() or public.has_role('support')) then
    raise exception 'Not allowed.';
  end if;
  if l.status not in ('requested', 'confirmed') then raise exception 'This lesson cannot be cancelled.'; end if;
  if l.status = 'confirmed' and l.starts_at < now() + interval '24 hours' and not public.has_role('support') then
    raise exception 'Confirmed lessons can only be cancelled more than 24 hours before they start. Please contact support.';
  end if;
  update public.private_lessons set status = 'cancelled', cancel_reason = nullif(trim(p_reason), ''), updated_at = now() where id = p_id;
  return 'ok';
end $$;

-- teacher closes the lesson: completed / student did not come → teacher is paid by duration
create or replace function public.finish_private_lesson(p_id uuid, p_status text, p_summary text, p_homework text, p_next text)
returns text language plpgsql security definer set search_path = public as $$
declare l public.private_lessons;
begin
  select * into l from public.private_lessons where id = p_id;
  if l.id is null or l.teacher_id <> auth.uid() then raise exception 'Not your lesson.'; end if;
  if l.status not in ('confirmed', 'completed', 'no_show') then raise exception 'Only confirmed lessons can be closed.'; end if;
  if l.starts_at > now() then raise exception 'You can close the lesson after it starts.'; end if;
  if p_status not in ('completed', 'no_show') then raise exception 'Unknown status.'; end if;
  update public.private_lessons
     set status = p_status,
         teacher_pay = round((select hourly_pay from public.teachers where user_id = l.teacher_id) * l.minutes / 60.0, 2),
         summary = nullif(trim(p_summary), ''), homework = nullif(trim(p_homework), ''), next_focus = nullif(trim(p_next), ''),
         updated_at = now()
   where id = p_id;
  return 'ok';
end $$;

create or replace function public.mark_lesson_paid(p_id uuid, p_paid boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Only finance can do this.'; end if;
  update public.private_lessons set paid = p_paid, updated_at = now() where id = p_id;
  return 'ok';
end $$;

-- 4) Reviews of teachers ------------------------------------------------------
create table if not exists public.teacher_reviews (
  lesson_id uuid primary key references public.private_lessons(id) on delete cascade,
  teacher_id uuid not null references public.teachers(user_id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now()
);
alter table public.teacher_reviews enable row level security;
drop policy if exists "See own reviews" on public.teacher_reviews;
create policy "See own reviews" on public.teacher_reviews for select
  using (student_id = auth.uid() or teacher_id = auth.uid() or public.has_role('academic', 'support'));
grant select on public.teacher_reviews to authenticated;

create or replace function public.review_lesson(p_lesson uuid, p_rating int, p_comment text default null)
returns text language plpgsql security definer set search_path = public as $$
declare l public.private_lessons;
begin
  select * into l from public.private_lessons where id = p_lesson;
  if l.id is null or l.student_id <> auth.uid() then raise exception 'Not your lesson.'; end if;
  if l.status <> 'completed' then raise exception 'You can rate a lesson after it is completed.'; end if;
  insert into public.teacher_reviews (lesson_id, teacher_id, student_id, rating, comment)
  values (p_lesson, l.teacher_id, auth.uid(), p_rating, nullif(trim(p_comment), ''))
  on conflict (lesson_id) do update set rating = excluded.rating, comment = excluded.comment, created_at = now();
  return 'ok';
end $$;

-- 5) Public list of teachers (Instructors page) -------------------------------
create or replace function public.list_teachers()
returns table (user_id uuid, slug text, name text, title text, bio text, photo text, country text,
               languages text[], specialties text[], qualifications text[], experience_years int,
               lesson_price numeric, rating numeric, reviews int, lessons int, students int, has_slots boolean)
language sql security definer stable set search_path = public as $$
  select t.user_id, t.slug, t.name, t.title, t.bio, t.photo, t.country, t.languages, t.specialties, t.qualifications,
         t.experience_years, t.lesson_price,
         (select round(avg(r.rating)::numeric, 1) from public.teacher_reviews r where r.teacher_id = t.user_id),
         (select count(*)::int from public.teacher_reviews r where r.teacher_id = t.user_id),
         (select count(*)::int from public.private_lessons l where l.teacher_id = t.user_id and l.status = 'completed'),
         (select count(distinct l.student_id)::int from public.private_lessons l where l.teacher_id = t.user_id and l.status = 'completed'),
         exists (select 1 from public.availability a where a.teacher_id = t.user_id)
  from public.teachers t where t.published
  order by t.created_at;
$$;
grant execute on function public.list_teachers() to anon, authenticated;

create or replace function public.teacher_public_reviews(p_teacher uuid)
returns table (rating smallint, comment text, first_name text, created_at timestamptz)
language sql security definer stable set search_path = public as $$
  select r.rating, r.comment, split_part(coalesce(u.raw_user_meta_data->>'full_name', 'Learner'), ' ', 1), r.created_at
  from public.teacher_reviews r join auth.users u on u.id = r.student_id
  where r.teacher_id = p_teacher and r.comment is not null
  order by r.created_at desc limit 20;
$$;
grant execute on function public.teacher_public_reviews(uuid) to anon, authenticated;

-- 6) Students of a teacher, with their learning progress -----------------------
create or replace function public.teacher_students()
returns table (student_id uuid, name text, email text, lessons int, next_lesson timestamptz, last_lesson timestamptz,
               open_assignments int, xp int, streak int, completed_lessons int, last_active text)
language plpgsql security definer stable set search_path = public as $$
#variable_conflict use_column
begin
  if not public.has_role('teacher') then raise exception 'Not allowed'; end if;
  return query
  with mine as (
    select distinct l.student_id from public.private_lessons l
    where l.teacher_id = auth.uid() and l.status in ('confirmed', 'completed', 'no_show')
  )
  select u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))::text, u.email::text,
         (select count(*)::int from public.private_lessons l where l.teacher_id = auth.uid() and l.student_id = u.id and l.status = 'completed'),
         (select min(l.starts_at) from public.private_lessons l where l.teacher_id = auth.uid() and l.student_id = u.id and l.status = 'confirmed' and l.starts_at > now()),
         (select max(l.starts_at) from public.private_lessons l where l.teacher_id = auth.uid() and l.student_id = u.id and l.status = 'completed'),
         (select count(*)::int from public.assignments a where a.teacher_id = auth.uid() and a.student_id = u.id and a.status <> 'graded'),
         coalesce((p.data->>'xp')::int, 0), coalesce((p.data->>'streak')::int, 0),
         coalesce((select count(*)::int from jsonb_object_keys(coalesce(p.data->'completed', '{}'::jsonb))), 0),
         (p.data->>'lastActive')::text
  from mine join auth.users u on u.id = mine.student_id
  left join public.learner_progress p on p.user_id = u.id
  order by 5 nulls last, 6 desc nulls last;
end $$;

-- 7) Assignments (writing and/or voice) ----------------------------------------
create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.private_lessons(id) on delete set null,
  title text not null check (char_length(title) between 2 and 160),
  instructions text not null default '',
  kind text not null default 'writing' check (kind in ('writing', 'speaking', 'both')),
  due_at timestamptz,
  status text not null default 'assigned' check (status in ('assigned', 'submitted', 'graded')),
  answer_text text,
  answer_audio text,
  submitted_at timestamptz,
  grade int check (grade between 0 and 100),
  feedback text,
  graded_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.assignments enable row level security;
drop policy if exists "See own assignments" on public.assignments;
create policy "See own assignments" on public.assignments for select
  using (teacher_id = auth.uid() or student_id = auth.uid() or public.has_role('academic', 'support'));
grant select on public.assignments to authenticated;

create or replace function public.create_assignment(p_student uuid, p_title text, p_instructions text, p_kind text, p_due timestamptz, p_lesson uuid default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare new_id uuid;
begin
  if not public.has_role('teacher') then raise exception 'Only teachers can give assignments.'; end if;
  if not exists (select 1 from public.private_lessons l where l.teacher_id = auth.uid() and l.student_id = p_student
                 and l.status in ('confirmed', 'completed', 'no_show')) and not public.has_role('academic') then
    raise exception 'You can only give assignments to your own students.';
  end if;
  insert into public.assignments (teacher_id, student_id, lesson_id, title, instructions, kind, due_at)
  values (auth.uid(), p_student, p_lesson, trim(p_title), coalesce(p_instructions, ''), p_kind, p_due)
  returning id into new_id;
  return new_id;
end $$;

create or replace function public.delete_assignment(p_id uuid) returns text
language plpgsql security definer set search_path = public as $$
begin
  delete from public.assignments where id = p_id and teacher_id = auth.uid() and status = 'assigned';
  if not found then raise exception 'Only assignments without an answer can be deleted.'; end if;
  return 'ok';
end $$;

create or replace function public.submit_assignment(p_id uuid, p_text text, p_audio text)
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.assignments
     set answer_text = nullif(trim(p_text), ''), answer_audio = coalesce(nullif(p_audio, ''), answer_audio),
         status = 'submitted', submitted_at = now()
   where id = p_id and student_id = auth.uid() and status <> 'graded';
  if not found then raise exception 'This assignment can no longer be changed.'; end if;
  return 'ok';
end $$;

create or replace function public.grade_assignment(p_id uuid, p_grade int, p_feedback text)
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.assignments
     set grade = p_grade, feedback = nullif(trim(p_feedback), ''), status = 'graded', graded_at = now()
   where id = p_id and (teacher_id = auth.uid() or public.has_role('academic')) and status in ('submitted', 'graded');
  if not found then raise exception 'Not allowed, or nothing submitted yet.'; end if;
  return 'ok';
end $$;

-- private storage for voice answers: recordings/<student id>/<assignment id>.webm
insert into storage.buckets (id, name, public) values ('recordings', 'recordings', false)
on conflict (id) do nothing;
drop policy if exists "Learners upload own recordings" on storage.objects;
create policy "Learners upload own recordings" on storage.objects for insert to authenticated
  with check (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Learners replace own recordings" on storage.objects;
create policy "Learners replace own recordings" on storage.objects for update to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Read recordings" on storage.objects;
create policy "Read recordings" on storage.objects for select to authenticated
  using (bucket_id = 'recordings' and (
    (storage.foldername(name))[1] = auth.uid()::text
    or exists (select 1 from public.assignments a where a.answer_audio = name and a.teacher_id = auth.uid())
    or public.has_role('academic')));

-- 8) Questions on lessons ------------------------------------------------------
create table if not exists public.lesson_questions (
  id bigint generated always as identity primary key,
  course_slug text not null,
  lesson_id text not null,
  student_id uuid not null references auth.users(id) on delete cascade,
  student_name text,
  body text not null check (char_length(body) between 3 and 2000),
  answer text,
  answered_by uuid references auth.users(id) on delete set null,
  answerer_name text,
  answered_at timestamptz,
  shared boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists lesson_questions_lesson on public.lesson_questions (course_slug, lesson_id);
alter table public.lesson_questions enable row level security;
drop policy if exists "Read questions" on public.lesson_questions;
create policy "Read questions" on public.lesson_questions for select using (
  student_id = auth.uid() or (answer is not null and shared) or public.has_role('teacher', 'academic'));
drop policy if exists "Ask questions" on public.lesson_questions;
create policy "Ask questions" on public.lesson_questions for insert
  with check (student_id = auth.uid() and answer is null);
grant select, insert on public.lesson_questions to authenticated;

create or replace function public.answer_question(p_id bigint, p_answer text, p_shared boolean default true)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('teacher', 'academic') then raise exception 'Only teachers can answer.'; end if;
  update public.lesson_questions
     set answer = nullif(trim(p_answer), ''), shared = p_shared, answered_by = auth.uid(), answered_at = now(),
         answerer_name = (select coalesce(raw_user_meta_data->>'full_name', 'LLC Teacher') from auth.users where id = auth.uid())
   where id = p_id;
  return 'ok';
end $$;

-- 9) Earnings and payouts ------------------------------------------------------
create table if not exists public.teacher_payouts (
  id bigint generated always as identity primary key,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(10,2) not null check (amount > 0),
  method text,
  reference text,
  note text,
  paid_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users(id) on delete set null
);
alter table public.teacher_payouts enable row level security;
drop policy if exists "See own payouts" on public.teacher_payouts;
create policy "See own payouts" on public.teacher_payouts for select using (teacher_id = auth.uid() or public.has_role('finance'));
drop policy if exists "Finance records payouts" on public.teacher_payouts;
create policy "Finance records payouts" on public.teacher_payouts for insert with check (public.has_role('finance'));
drop policy if exists "Finance deletes payouts" on public.teacher_payouts;
create policy "Finance deletes payouts" on public.teacher_payouts for delete using (public.has_role('finance'));
grant select, insert, delete on public.teacher_payouts to authenticated;

create or replace function public.teacher_balances()
returns table (teacher_id uuid, name text, email text, hourly_pay numeric, lessons int, minutes int, earned numeric, paid numeric, balance numeric)
language plpgsql security definer stable set search_path = public as $$
#variable_conflict use_column
begin
  if not public.has_role('finance') and not exists (select 1 from public.teachers where user_id = auth.uid()) then
    raise exception 'Not allowed';
  end if;
  return query
  select t.user_id, t.name, u.email::text, t.hourly_pay,
         coalesce(e.n, 0), coalesce(e.mins, 0), coalesce(e.earned, 0), coalesce(p.paid, 0),
         coalesce(e.earned, 0) - coalesce(p.paid, 0)
  from public.teachers t
  join auth.users u on u.id = t.user_id
  left join (select l.teacher_id, count(*)::int n, sum(l.minutes)::int mins, sum(l.teacher_pay) earned
             from public.private_lessons l where l.status in ('completed', 'no_show') group by l.teacher_id) e on e.teacher_id = t.user_id
  left join (select x.teacher_id, sum(x.amount) paid from public.teacher_payouts x group by x.teacher_id) p on p.teacher_id = t.user_id
  where public.has_role('finance') or t.user_id = auth.uid()
  order by 9 desc;
end $$;

-- teacher accounts (role = teacher) and whether they have a profile yet
create or replace function public.teacher_accounts()
returns table (user_id uuid, email text, full_name text, has_profile boolean)
language sql security definer stable set search_path = public as $$
  select s.user_id, u.email::text, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1))::text,
         exists (select 1 from public.teachers t where t.user_id = s.user_id)
  from public.staff s join auth.users u on u.id = s.user_id
  where s.role = 'teacher' and public.has_role('finance', 'academic')
  order by u.created_at;
$$;

-- Check
select 'teaching tables ready' as status;
