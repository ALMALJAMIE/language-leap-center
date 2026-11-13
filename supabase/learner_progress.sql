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
