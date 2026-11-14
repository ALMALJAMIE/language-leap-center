-- ============================================================
-- Language Leap Center — course content in the database (Course Builder)
-- + the Academic Supervisor role.
-- Run in Supabase → SQL Editor (New query → paste → Run). Safe to run again.
-- ============================================================

-- 1) New role: academic supervisor -----------------------------------------
alter table public.staff drop constraint if exists staff_role_check;
alter table public.staff add constraint staff_role_check
  check (role in ('admin', 'teacher', 'finance', 'academic', 'support', 'supervisor'));

-- 2) Courses -------------------------------------------------------------------
-- One row per course. `data` holds the whole course: details, units and lessons
-- (the same shape the site already uses). A row with the slug of a built-in
-- course replaces it on the site.
create table if not exists public.courses (
  slug text primary key check (slug ~ '^[a-z0-9][a-z0-9-]{2,59}$'),
  data jsonb not null,
  price numeric(8,2) not null default 0,        -- set by finance (or admin)
  published boolean not null default false,     -- false = draft, hidden from learners
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid() references auth.users(id) on delete set null
);
alter table public.courses enable row level security;
drop policy if exists "Read published or team" on public.courses;
create policy "Read published or team" on public.courses for select
  using (published or public.has_role('academic', 'finance', 'support', 'teacher', 'supervisor'));
drop policy if exists "Academic writes courses" on public.courses;
create policy "Academic writes courses" on public.courses for insert with check (public.has_role('academic', 'finance'));
drop policy if exists "Academic edits courses" on public.courses;
create policy "Academic edits courses" on public.courses for update using (public.has_role('academic', 'finance'));
drop policy if exists "Academic deletes courses" on public.courses;
create policy "Academic deletes courses" on public.courses for delete using (public.has_role('academic'));
grant select on public.courses to anon, authenticated;
grant insert, update, delete on public.courses to authenticated;

-- finance sets the price; the academic edits the content
create or replace function public.protect_course_fields() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'UPDATE' then
    if not public.has_role('finance') then new.price := old.price; end if;
    if not public.has_role('academic') then
      new.data := old.data;
      new.published := old.published;
    end if;
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end $$;
drop trigger if exists courses_protect on public.courses;
create trigger courses_protect before insert or update on public.courses
  for each row execute function public.protect_course_fields();

-- 3) Course materials (curriculum PDF, audio, video, links) -----------------------
create table if not exists public.course_materials (
  id bigint generated always as identity primary key,
  course_slug text not null,
  unit_index int,             -- null = whole course
  lesson_id text,             -- null = not tied to one lesson
  title text not null check (char_length(title) between 2 and 160),
  kind text not null default 'pdf' check (kind in ('pdf', 'audio', 'video', 'link', 'file')),
  url text,                   -- external link
  path text,                  -- file in the "materials" storage bucket
  sort int not null default 0,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  check (url is not null or path is not null)
);
create index if not exists course_materials_course on public.course_materials (course_slug);
alter table public.course_materials enable row level security;
drop policy if exists "Signed-in read materials" on public.course_materials;
create policy "Signed-in read materials" on public.course_materials for select to authenticated using (true);
drop policy if exists "Academic manages materials" on public.course_materials;
create policy "Academic manages materials" on public.course_materials for all
  using (public.has_role('academic')) with check (public.has_role('academic'));
grant select, insert, update, delete on public.course_materials to authenticated;

insert into storage.buckets (id, name, public) values ('materials', 'materials', false)
on conflict (id) do nothing;
drop policy if exists "Signed-in read material files" on storage.objects;
create policy "Signed-in read material files" on storage.objects for select to authenticated
  using (bucket_id = 'materials');
drop policy if exists "Academic uploads material files" on storage.objects;
create policy "Academic uploads material files" on storage.objects for insert to authenticated
  with check (bucket_id = 'materials' and public.has_role('academic'));
drop policy if exists "Academic deletes material files" on storage.objects;
create policy "Academic deletes material files" on storage.objects for delete to authenticated
  using (bucket_id = 'materials' and public.has_role('academic'));

select 'content ready' as status;
