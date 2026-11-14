-- ============================================================
-- Language Leap Center — Question bank & exams
-- Unit tests, final exams and the paid placement test.
-- Multiple-choice answers are marked automatically; written answers
-- are marked by the teacher or the academic.
-- Run in Supabase → SQL Editor (New query → paste → Run). Safe to run again.
-- Needs: roles.sql, content.sql
-- ============================================================

-- 1) Question bank --------------------------------------------------------------
create table if not exists public.question_bank (
  id bigint generated always as identity primary key,
  course_slug text,                      -- null = general (e.g. placement)
  unit_index int,                        -- 0-based unit, null = whole course
  level text check (level in ('A1', 'A2', 'B1', 'B2', 'C1')),
  skill text not null default 'grammar' check (skill in ('vocabulary', 'grammar', 'reading', 'listening', 'writing', 'speaking')),
  kind text not null default 'mcq' check (kind in ('mcq', 'written')),
  prompt text not null,
  options jsonb not null default '[]'::jsonb,   -- mcq: ["a","b","c","d"]
  answer int,                                    -- mcq: index of the right option
  points numeric(5,2) not null default 1,
  passage text,                                  -- reading text shown above the question
  audio_url text,                                -- mp3 for listening
  audio_text text,                               -- or text read aloud by the browser
  rubric text,                                   -- written: what the marker looks for
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  check (kind = 'written' or (jsonb_array_length(options) >= 2 and answer is not null))
);
create index if not exists question_bank_course on public.question_bank (course_slug, unit_index);
alter table public.question_bank enable row level security;
drop policy if exists "Team reads questions" on public.question_bank;
create policy "Team reads questions" on public.question_bank for select using (public.has_role('academic', 'teacher', 'supervisor'));
drop policy if exists "Team adds questions" on public.question_bank;
create policy "Team adds questions" on public.question_bank for insert with check (public.has_role('academic', 'teacher'));
drop policy if exists "Academic or author edits questions" on public.question_bank;
create policy "Academic or author edits questions" on public.question_bank for update
  using (public.has_role('academic') or (created_by = auth.uid() and public.has_role('teacher')));
drop policy if exists "Academic or author deletes questions" on public.question_bank;
create policy "Academic or author deletes questions" on public.question_bank for delete
  using (public.has_role('academic') or (created_by = auth.uid() and public.has_role('teacher')));
grant select, insert, update, delete on public.question_bank to authenticated;

-- 2) Exams ---------------------------------------------------------------------
create table if not exists public.exams (
  id bigint generated always as identity primary key,
  course_slug text,                      -- null for the placement test
  kind text not null check (kind in ('unit', 'final', 'placement', 'quiz')),
  unit_index int,
  title text not null,
  instructions text,
  minutes int not null default 30 check (minutes between 5 and 240),
  fee numeric(8,2) not null default 0,   -- placement test fee (finance)
  published boolean not null default false,  -- true = open for learners
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);
alter table public.exams enable row level security;
drop policy if exists "Read open exams or team" on public.exams;
create policy "Read open exams or team" on public.exams for select
  using (published or public.has_role('academic', 'teacher', 'supervisor', 'finance'));
drop policy if exists "Academic manages exams" on public.exams;
create policy "Academic manages exams" on public.exams for all using (public.has_role('academic', 'finance')) with check (public.has_role('academic', 'finance'));
grant select on public.exams to anon, authenticated;
grant insert, update, delete on public.exams to authenticated;

-- finance sets the fee; the academic sets everything else
create or replace function public.protect_exam_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then return new; end if;   -- SQL editor / seed files
  if tg_op = 'UPDATE' then
    if not public.has_role('finance') then new.fee := old.fee; end if;
    if not public.has_role('academic') then
      new.title := old.title; new.instructions := old.instructions; new.minutes := old.minutes;
      new.kind := old.kind; new.course_slug := old.course_slug; new.unit_index := old.unit_index;
      new.published := old.published;
    end if;
  elsif not public.has_role('academic') then
    raise exception 'Only the academic team creates exams.';
  end if;
  return new;
end $$;
drop trigger if exists exams_protect on public.exams;
create trigger exams_protect before insert or update on public.exams
  for each row execute function public.protect_exam_fields();

create table if not exists public.exam_questions (
  exam_id bigint not null references public.exams(id) on delete cascade,
  question_id bigint not null references public.question_bank(id) on delete cascade,
  sort int not null default 0,
  points numeric(5,2),                   -- null = the question's own points
  primary key (exam_id, question_id)
);
alter table public.exam_questions enable row level security;
drop policy if exists "Team reads exam questions" on public.exam_questions;
create policy "Team reads exam questions" on public.exam_questions for select using (public.has_role('academic', 'teacher', 'supervisor'));
drop policy if exists "Academic builds exams" on public.exam_questions;
create policy "Academic builds exams" on public.exam_questions for all using (public.has_role('academic')) with check (public.has_role('academic'));
grant select, insert, update, delete on public.exam_questions to authenticated;

-- teachers open / close a unit test or final exam for their class on the day
create or replace function public.set_exam_open(p_exam bigint, p_open boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('academic', 'teacher') then raise exception 'Not allowed.'; end if;
  if exists (select 1 from public.exams where id = p_exam and kind = 'placement') and not public.has_role('academic') then
    raise exception 'Only the academic team opens the placement test.';
  end if;
  update public.exams set published = p_open where id = p_exam;
  return 'ok';
end $$;

-- 3) Placement test fee -------------------------------------------------------------
create table if not exists public.placement_tickets (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  exam_id bigint not null references public.exams(id) on delete cascade,
  amount numeric(8,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'paid', 'used')),
  paid_by uuid references auth.users(id) on delete set null,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.placement_tickets enable row level security;
drop policy if exists "Own tickets or finance" on public.placement_tickets;
create policy "Own tickets or finance" on public.placement_tickets for select
  using (user_id = auth.uid() or public.has_role('finance', 'academic'));
grant select on public.placement_tickets to authenticated;

-- learner: "I want to take the placement test" (pay, then finance confirms)
create or replace function public.request_placement(p_exam bigint)
returns bigint language plpgsql security definer set search_path = public as $$
declare e public.exams; t bigint;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into e from public.exams where id = p_exam and kind = 'placement' and published;
  if not found then raise exception 'The placement test is not open right now.'; end if;
  select id into t from public.placement_tickets where user_id = auth.uid() and exam_id = p_exam and status in ('pending', 'paid');
  if t is not null then return t; end if;
  insert into public.placement_tickets (user_id, exam_id, amount, status, paid_at)
  values (auth.uid(), p_exam, e.fee, case when e.fee = 0 then 'paid' else 'pending' end, case when e.fee = 0 then now() end)
  returning id into t;
  return t;
end $$;

create or replace function public.mark_placement_paid(p_id bigint, p_paid boolean)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Only finance can do this.'; end if;
  update public.placement_tickets
     set status = case when p_paid then 'paid' else 'pending' end,
         paid_by = case when p_paid then auth.uid() end,
         paid_at = case when p_paid then now() end
   where id = p_id and status <> 'used';
  return 'ok';
end $$;

-- 4) Attempts ------------------------------------------------------------------------
create table if not exists public.exam_attempts (
  id bigint generated always as identity primary key,
  exam_id bigint not null references public.exams(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  ticket_id bigint references public.placement_tickets(id) on delete set null,
  started_at timestamptz not null default now(),
  deadline timestamptz not null,
  submitted_at timestamptz,
  answers jsonb not null default '{}'::jsonb,     -- { "<question id>": 2 | "text" }
  marks jsonb not null default '{}'::jsonb,       -- { "<question id>": points } (auto + manual)
  feedback text,
  auto_score numeric(6,2),
  score numeric(6,2),                             -- final score after manual marking
  total numeric(6,2),
  result_level text,                              -- placement only
  status text not null default 'in_progress' check (status in ('in_progress', 'submitted', 'graded')),
  graded_by uuid references auth.users(id) on delete set null,
  graded_at timestamptz
);
create index if not exists exam_attempts_user on public.exam_attempts (user_id, exam_id);
alter table public.exam_attempts enable row level security;
drop policy if exists "Own attempts or team" on public.exam_attempts;
create policy "Own attempts or team" on public.exam_attempts for select
  using (user_id = auth.uid() or public.has_role('academic', 'teacher', 'supervisor'));
grant select on public.exam_attempts to authenticated;

-- questions of an exam WITHOUT the answers (what the learner sees)
create or replace function public.exam_paper(p_exam bigint)
returns table (id bigint, kind text, skill text, level text, prompt text, options jsonb, points numeric,
               passage text, audio_url text, audio_text text, sort int)
language sql security definer stable set search_path = public as $$
  select q.id, q.kind, q.skill, q.level, q.prompt, q.options, coalesce(eq.points, q.points),
         q.passage, q.audio_url, q.audio_text, eq.sort
  from public.exam_questions eq join public.question_bank q on q.id = eq.question_id
  where eq.exam_id = p_exam
  order by eq.sort, q.id;
$$;
revoke execute on function public.exam_paper(bigint) from public, anon, authenticated;

-- start (or continue) an exam; returns the attempt and the paper
create or replace function public.start_exam(p_exam bigint)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e public.exams; a public.exam_attempts; t bigint;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  select * into e from public.exams where id = p_exam;
  if not found or not e.published then raise exception 'This exam is not open right now.'; end if;

  -- an attempt that is still running
  select * into a from public.exam_attempts where exam_id = p_exam and user_id = auth.uid() and status = 'in_progress' order by id desc limit 1;
  if found and a.deadline + interval '2 minutes' < now() then
    perform public.finish_attempt(a.id);
    a := null;
  end if;

  if a.id is null then
    if e.kind = 'placement' then
      select id into t from public.placement_tickets where user_id = auth.uid() and exam_id = p_exam and status = 'paid' order by id limit 1;
      if t is null then raise exception 'Please pay the placement test fee first.'; end if;
      update public.placement_tickets set status = 'used' where id = t;
    else
      if exists (select 1 from public.exam_attempts where exam_id = p_exam and user_id = auth.uid()) then
        raise exception 'You have already taken this exam.';
      end if;
      if e.course_slug is not null and not exists (select 1 from public.enrollments where user_id = auth.uid() and course_slug = e.course_slug)
         and not public.has_role('academic', 'teacher', 'supervisor') then
        raise exception 'This exam is for learners enrolled in the course.';
      end if;
    end if;
    insert into public.exam_attempts (exam_id, user_id, ticket_id, deadline, total)
    values (p_exam, auth.uid(), t, now() + make_interval(mins => e.minutes),
            (select coalesce(sum(coalesce(eq.points, q.points)), 0) from public.exam_questions eq join public.question_bank q on q.id = eq.question_id where eq.exam_id = p_exam))
    returning * into a;
  end if;

  return jsonb_build_object(
    'attempt', a.id, 'deadline', a.deadline, 'answers', a.answers, 'title', e.title, 'instructions', e.instructions, 'kind', e.kind,
    'questions', (select coalesce(jsonb_agg(to_jsonb(p)), '[]'::jsonb) from public.exam_paper(p_exam) p));
end $$;

-- save answers while the learner works (also lets them continue after a reload)
create or replace function public.save_answers(p_attempt bigint, p_answers jsonb)
returns text language plpgsql security definer set search_path = public as $$
begin
  update public.exam_attempts set answers = coalesce(p_answers, '{}'::jsonb)
   where id = p_attempt and user_id = auth.uid() and status = 'in_progress' and deadline + interval '2 minutes' > now();
  return 'ok';
end $$;

-- mark multiple-choice answers; written answers wait for the teacher
create or replace function public.finish_attempt(p_attempt bigint)
returns public.exam_attempts language plpgsql security definer set search_path = public as $$
declare a public.exam_attempts; e public.exams; r record; m jsonb := '{}'::jsonb; auto numeric := 0; has_written boolean := false;
        lv text; best text := 'A1'; ok int; n int; stop boolean := false;
begin
  select * into a from public.exam_attempts where id = p_attempt;
  select * into e from public.exams where id = a.exam_id;
  for r in select q.id, q.kind, q.answer, coalesce(eq.points, q.points) pts
           from public.exam_questions eq join public.question_bank q on q.id = eq.question_id where eq.exam_id = a.exam_id loop
    if r.kind = 'written' then
      has_written := true;
    else
      if (a.answers ->> r.id::text) is not null and (a.answers ->> r.id::text) ~ '^\d+$' and (a.answers ->> r.id::text)::int = r.answer then
        m := m || jsonb_build_object(r.id::text, r.pts); auto := auto + r.pts;
      else
        m := m || jsonb_build_object(r.id::text, 0);
      end if;
    end if;
  end loop;

  if e.kind = 'placement' then
    -- the highest level where the learner got at least 60% (levels in order, stop at the first miss)
    foreach lv in array array['A1', 'A2', 'B1', 'B2', 'C1'] loop
      exit when stop;
      select count(*) filter (where (a.answers ->> q.id::text) ~ '^\d+$' and (a.answers ->> q.id::text)::int = q.answer), count(*)
        into ok, n
        from public.exam_questions eq join public.question_bank q on q.id = eq.question_id
       where eq.exam_id = a.exam_id and q.level = lv and q.kind = 'mcq';
      if n > 0 and ok >= ceil(n * 0.6) then best := lv; else stop := true; end if;
    end loop;
  end if;

  update public.exam_attempts
     set marks = m, auto_score = auto, submitted_at = now(),
         status = case when has_written then 'submitted' else 'graded' end,
         score = case when has_written then null else auto end,
         graded_at = case when has_written then null else now() end,
         result_level = case when e.kind = 'placement' then best end
   where id = p_attempt
   returning * into a;
  return a;
end $$;
revoke execute on function public.finish_attempt(bigint) from public, anon, authenticated;

create or replace function public.submit_exam(p_attempt bigint, p_answers jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare a public.exam_attempts;
begin
  select * into a from public.exam_attempts where id = p_attempt and user_id = auth.uid();
  if not found then raise exception 'Attempt not found.'; end if;
  if a.status <> 'in_progress' then
    return jsonb_build_object('status', a.status, 'score', a.score, 'auto_score', a.auto_score, 'total', a.total, 'level', a.result_level);
  end if;
  if a.deadline + interval '2 minutes' > now() and p_answers is not null then
    update public.exam_attempts set answers = p_answers where id = p_attempt;
  end if;
  a := public.finish_attempt(p_attempt);
  return jsonb_build_object('status', a.status, 'score', a.score, 'auto_score', a.auto_score, 'total', a.total, 'level', a.result_level);
end $$;

-- 5) Marking (teacher / academic) ----------------------------------------------------------
create or replace function public.grading_queue(p_status text default 'submitted')
returns table (attempt_id bigint, exam_id bigint, exam_title text, exam_kind text, course_slug text, learner text, email text,
               submitted_at timestamptz, status text, auto_score numeric, score numeric, total numeric, result_level text)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.has_role('academic', 'teacher', 'supervisor') then raise exception 'Not allowed'; end if;
  return query
  select a.id, e.id, e.title, e.kind, e.course_slug,
         coalesce(nullif(trim(concat(p.data->>'firstName', ' ', p.data->>'lastName')), ''), u.raw_user_meta_data->>'full_name', u.email)::text,
         u.email::text, a.submitted_at, a.status, a.auto_score, a.score, a.total, a.result_level
  from public.exam_attempts a
  join public.exams e on e.id = a.exam_id
  join auth.users u on u.id = a.user_id
  left join public.learner_profiles p on p.user_id = a.user_id
  where (p_status = 'all' or a.status = p_status)
  order by a.submitted_at desc nulls last, a.id desc limit 300;
end $$;

-- one attempt with the questions, the right answers and the learner's answers
create or replace function public.attempt_review(p_attempt bigint)
returns jsonb language plpgsql security definer stable set search_path = public as $$
declare a public.exam_attempts;
begin
  select * into a from public.exam_attempts where id = p_attempt;
  if not found then raise exception 'Not found'; end if;
  if not (public.has_role('academic', 'teacher', 'supervisor') or (a.user_id = auth.uid() and a.status = 'graded')) then
    raise exception 'Not allowed';
  end if;
  return jsonb_build_object('attempt', to_jsonb(a), 'questions', (
    select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'kind', q.kind, 'skill', q.skill, 'prompt', q.prompt, 'options', q.options,
             'answer', q.answer, 'points', coalesce(eq.points, q.points), 'passage', q.passage, 'rubric', q.rubric) order by eq.sort, q.id), '[]'::jsonb)
    from public.exam_questions eq join public.question_bank q on q.id = eq.question_id where eq.exam_id = a.exam_id));
end $$;

-- the teacher gives points for written answers (and may correct any mark)
create or replace function public.grade_attempt(p_attempt bigint, p_marks jsonb, p_feedback text)
returns text language plpgsql security definer set search_path = public as $$
declare a public.exam_attempts; r record; m jsonb; total numeric := 0; v numeric;
begin
  if not public.has_role('academic', 'teacher') then raise exception 'Only teachers and the academic team mark exams.'; end if;
  select * into a from public.exam_attempts where id = p_attempt;
  if not found or a.status = 'in_progress' then raise exception 'This attempt is not submitted yet.'; end if;
  m := a.marks || coalesce(p_marks, '{}'::jsonb);
  for r in select q.id, coalesce(eq.points, q.points) pts
           from public.exam_questions eq join public.question_bank q on q.id = eq.question_id where eq.exam_id = a.exam_id loop
    v := coalesce((m ->> r.id::text)::numeric, 0);
    if v < 0 or v > r.pts then raise exception 'Points for a question must be between 0 and %.', r.pts; end if;
    total := total + v;
  end loop;
  update public.exam_attempts set marks = m, score = total, feedback = p_feedback, status = 'graded', graded_by = auth.uid(), graded_at = now()
   where id = p_attempt;
  return 'ok';
end $$;

-- let a learner take an exam again (e.g. technical problem)
create or replace function public.reset_attempt(p_attempt bigint)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('academic', 'teacher') then raise exception 'Not allowed.'; end if;
  delete from public.exam_attempts where id = p_attempt;
  return 'ok';
end $$;

-- finance: placement fees with the learner's name
create or replace function public.finance_placement()
returns table (id bigint, learner text, email text, amount numeric, status text, created_at timestamptz, paid_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.has_role('finance', 'academic') then raise exception 'Not allowed'; end if;
  return query
  select t.id, coalesce(nullif(trim(concat(p.data->>'firstName', ' ', p.data->>'lastName')), ''), u.raw_user_meta_data->>'full_name', u.email)::text,
         u.email::text, t.amount, t.status, t.created_at, t.paid_at
  from public.placement_tickets t join auth.users u on u.id = t.user_id
  left join public.learner_profiles p on p.user_id = t.user_id
  order by t.created_at desc limit 300;
end $$;

-- 6) Team-only course materials (teacher guide, answer keys, printable exams) --------------
alter table public.course_materials add column if not exists team_only boolean not null default false;
drop policy if exists "Signed-in read materials" on public.course_materials;
create policy "Signed-in read materials" on public.course_materials for select to authenticated
  using (not team_only or public.has_role('academic', 'teacher', 'supervisor'));
-- files of team-only materials are stored under team/… in the "materials" bucket
drop policy if exists "Signed-in read material files" on storage.objects;
create policy "Signed-in read material files" on storage.objects for select to authenticated
  using (bucket_id = 'materials' and (name not like 'team/%' or public.has_role('academic', 'teacher', 'supervisor')));

select 'exams ready' as status;
