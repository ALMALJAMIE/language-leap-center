-- ============================================================
-- Language Leap Center — course enrollment requests + payment receipts
-- A learner asks to join a paid course and uploads the receipt; finance
-- sees the request and opens the course with one click (no typing emails).
-- The placement test fee uses the same receipt upload.
-- Run in Supabase → SQL Editor (New query → paste → Run). Safe to run again.
-- Needs: roles.sql, exams.sql
-- ============================================================

-- 1) Receipts (private files: the learner who uploaded them + finance) -------------------
insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false)
on conflict (id) do nothing;
drop policy if exists "Learner uploads own receipt" on storage.objects;
create policy "Learner uploads own receipt" on storage.objects for insert to authenticated
  with check (bucket_id = 'receipts' and (storage.foldername(name))[1] = auth.uid()::text);
drop policy if exists "Owner or finance reads receipts" on storage.objects;
create policy "Owner or finance reads receipts" on storage.objects for select to authenticated
  using (bucket_id = 'receipts' and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role('finance')));

-- 2) Course requests ------------------------------------------------------------------------
create table if not exists public.enrollment_requests (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  course_slug text not null,
  amount numeric(8,2) not null default 0,
  details jsonb not null default '{}'::jsonb,     -- add-ons, coupon
  receipt_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  decision_note text,
  decided_by uuid references auth.users(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists enrollment_requests_status on public.enrollment_requests (status, created_at desc);
alter table public.enrollment_requests enable row level security;
drop policy if exists "Own requests or finance" on public.enrollment_requests;
create policy "Own requests or finance" on public.enrollment_requests for select
  using (user_id = auth.uid() or public.has_role('finance'));
grant select on public.enrollment_requests to authenticated;

alter table public.placement_tickets add column if not exists receipt_path text;

-- learner: "I want this course" (one open request per course; sending again updates it)
create or replace function public.request_enrollment(p_slug text, p_amount numeric, p_details jsonb default '{}'::jsonb)
returns bigint language plpgsql security definer set search_path = public as $$
declare r bigint;
begin
  if auth.uid() is null then raise exception 'Please sign in first.'; end if;
  if exists (select 1 from public.enrollments where user_id = auth.uid() and course_slug = p_slug) then
    raise exception 'You are already enrolled in this course.';
  end if;
  select id into r from public.enrollment_requests where user_id = auth.uid() and course_slug = p_slug and status = 'pending';
  if r is not null then
    update public.enrollment_requests set amount = coalesce(p_amount, 0), details = coalesce(p_details, '{}'::jsonb) where id = r;
    return r;
  end if;
  insert into public.enrollment_requests (user_id, course_slug, amount, details)
  values (auth.uid(), p_slug, coalesce(p_amount, 0), coalesce(p_details, '{}'::jsonb)) returning id into r;
  return r;
end $$;

-- learner: attach the uploaded receipt to a course request or a placement booking
create or replace function public.attach_receipt(p_kind text, p_id bigint, p_path text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if p_path is null or split_part(p_path, '/', 1) <> auth.uid()::text then raise exception 'Invalid file.'; end if;
  if p_kind = 'course' then
    update public.enrollment_requests set receipt_path = p_path where id = p_id and user_id = auth.uid() and status = 'pending';
  elsif p_kind = 'placement' then
    update public.placement_tickets set receipt_path = p_path where id = p_id and user_id = auth.uid() and status = 'pending';
  else
    raise exception 'Unknown request.';
  end if;
  return 'ok';
end $$;

-- finance: every request with the learner's name
create or replace function public.finance_enrollment_requests()
returns table (id bigint, learner text, email text, course_slug text, amount numeric, details jsonb, receipt_path text,
               status text, decision_note text, created_at timestamptz, decided_at timestamptz)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Not allowed'; end if;
  return query
  select r.id, coalesce(nullif(trim(concat(p.data->>'firstName', ' ', p.data->>'lastName')), ''), u.raw_user_meta_data->>'full_name', u.email)::text,
         u.email::text, r.course_slug, r.amount, r.details, r.receipt_path, r.status, r.decision_note, r.created_at, r.decided_at
  from public.enrollment_requests r join auth.users u on u.id = r.user_id
  left join public.learner_profiles p on p.user_id = r.user_id
  order by (r.status = 'pending') desc, r.created_at desc limit 300;
end $$;

-- finance: "Add to course" — opens the course and closes the request
create or replace function public.approve_enrollment(p_id bigint)
returns text language plpgsql security definer set search_path = public as $$
declare r public.enrollment_requests;
begin
  if not public.has_role('finance') then raise exception 'Only finance or admin can open courses.'; end if;
  select * into r from public.enrollment_requests where id = p_id;
  if not found then raise exception 'Request not found.'; end if;
  insert into public.enrollments (user_id, course_slug, note, granted_by)
  values (r.user_id, r.course_slug, concat('Paid $', r.amount, ' · request #', r.id), auth.uid())
  on conflict (user_id, course_slug) do update set note = excluded.note, granted_by = excluded.granted_by;
  update public.enrollment_requests set status = 'approved', decided_by = auth.uid(), decided_at = now() where id = p_id;
  return 'approved';
end $$;

create or replace function public.reject_enrollment(p_id bigint, p_note text)
returns text language plpgsql security definer set search_path = public as $$
begin
  if not public.has_role('finance') then raise exception 'Only finance or admin can do this.'; end if;
  update public.enrollment_requests set status = 'rejected', decision_note = nullif(trim(p_note), ''), decided_by = auth.uid(), decided_at = now()
   where id = p_id and status = 'pending';
  return 'rejected';
end $$;

-- placement fee list now also returns the receipt
drop function if exists public.finance_placement();
create or replace function public.finance_placement()
returns table (id bigint, learner text, email text, amount numeric, status text, created_at timestamptz, paid_at timestamptz, receipt_path text)
language plpgsql security definer stable set search_path = public as $$
begin
  if not public.has_role('finance', 'academic') then raise exception 'Not allowed'; end if;
  return query
  select t.id, coalesce(nullif(trim(concat(p.data->>'firstName', ' ', p.data->>'lastName')), ''), u.raw_user_meta_data->>'full_name', u.email)::text,
         u.email::text, t.amount, t.status, t.created_at, t.paid_at, t.receipt_path
  from public.placement_tickets t join auth.users u on u.id = t.user_id
  left join public.learner_profiles p on p.user_id = t.user_id
  order by t.created_at desc limit 300;
end $$;

-- 3) Exam review: include each question's level (for the placement report) ------------------
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
    select coalesce(jsonb_agg(jsonb_build_object('id', q.id, 'kind', q.kind, 'skill', q.skill, 'level', q.level, 'prompt', q.prompt, 'options', q.options,
             'answer', q.answer, 'points', coalesce(eq.points, q.points), 'passage', q.passage, 'rubric', q.rubric,
             'audio_text', q.audio_text, 'audio_url', q.audio_url) order by eq.sort, q.id), '[]'::jsonb)
    from public.exam_questions eq join public.question_bank q on q.id = eq.question_id where eq.exam_id = a.exam_id));
end $$;

select 'requests ready' as status;
