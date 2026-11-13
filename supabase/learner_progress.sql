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

-- ============ Live chat with the support team. Run once. ============
create table if not exists public.staff (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.staff enable row level security;
create policy "Staff can see themselves" on public.staff for select using (auth.uid() = user_id);
grant select on public.staff to authenticated;

create or replace function public.is_staff() returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null default 'Support request',
  visitor_name text,
  visitor_email text,
  status text not null default 'open',
  last_message text,
  last_from_staff boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
alter table public.conversations enable row level security;
create policy "Read own or staff" on public.conversations for select using (user_id = auth.uid() or public.is_staff());
create policy "Start own conversation" on public.conversations for insert with check (user_id = auth.uid());
create policy "Update own or staff" on public.conversations for update using (user_id = auth.uid() or public.is_staff());
grant select, insert, update on public.conversations to authenticated;

create table if not exists public.messages (
  id bigint generated always as identity primary key,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  from_staff boolean not null default false,
  body text not null check (char_length(body) between 1 and 4000),
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
create policy "Read messages of own or staff" on public.messages for select using (
  exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.is_staff()))
);
create policy "Send in own or staff" on public.messages for insert with check (
  sender_id = auth.uid() and from_staff = public.is_staff()
  and exists (select 1 from public.conversations c where c.id = conversation_id and (c.user_id = auth.uid() or public.is_staff()))
);
grant select, insert on public.messages to authenticated;

create or replace function public.touch_conversation() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  update public.conversations
     set last_message = left(new.body, 140), last_from_staff = new.from_staff, updated_at = new.created_at,
         status = case when new.from_staff then status else 'open' end
   where id = new.conversation_id;
  return new;
end $$;
drop trigger if exists on_message_sent on public.messages;
create trigger on_message_sent after insert on public.messages for each row execute function public.touch_conversation();

alter publication supabase_realtime add table public.messages, public.conversations;
