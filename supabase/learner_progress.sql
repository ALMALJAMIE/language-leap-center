-- Run once in Supabase → SQL Editor. Stores each learner's progress with their account.
create table if not exists public.learner_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.learner_progress enable row level security;

create policy "Learners read their own progress" on public.learner_progress
  for select using (auth.uid() = user_id);
create policy "Learners create their own progress" on public.learner_progress
  for insert with check (auth.uid() = user_id);
create policy "Learners update their own progress" on public.learner_progress
  for update using (auth.uid() = user_id);

grant select, insert, update on public.learner_progress to authenticated;

-- Profiles (Complete Your Profile page). Run once.
create table if not exists public.learner_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  avatar text,
  updated_at timestamptz not null default now()
);
alter table public.learner_profiles enable row level security;
create policy "Learners read their own profile" on public.learner_profiles for select using (auth.uid() = user_id);
create policy "Learners create their own profile" on public.learner_profiles for insert with check (auth.uid() = user_id);
create policy "Learners update their own profile" on public.learner_profiles for update using (auth.uid() = user_id);
grant select, insert, update on public.learner_profiles to authenticated;

-- Paid-course enrollments. Run once.
-- Learners can only READ their own rows. The center adds a row (Table Editor) after payment.
create table if not exists public.enrollments (
  user_id uuid not null references auth.users(id) on delete cascade,
  course_slug text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, course_slug)
);
alter table public.enrollments enable row level security;
create policy "Learners read their own enrollments" on public.enrollments for select using (auth.uid() = user_id);
grant select on public.enrollments to authenticated;
