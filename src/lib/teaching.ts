"use client";

import { create } from "zustand";
import { supabase } from "./auth";
import { instructors as staticInstructors, type Instructor } from "@/data/instructors";
import { programs } from "@/data/courses";
import type { ProgramId } from "./types";

/* ------------------------------------------------------------------ */
/* Types (match supabase/teaching.sql)                                 */

export interface TeacherRow {
  user_id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  photo: string | null;
  country: string | null;
  languages: string[];
  specialties: string[];
  qualifications: string[];
  experience_years: number | null;
  meeting_provider: "zoom" | "meet" | "other";
  meeting_link: string | null;
  lesson_price: number;
  hourly_pay: number;
  published: boolean;
}

export type LessonStatus = "requested" | "confirmed" | "declined" | "cancelled" | "completed" | "no_show";
export interface PrivateLesson {
  id: string;
  teacher_id: string;
  student_id: string;
  student_name: string | null;
  starts_at: string;
  minutes: number;
  status: LessonStatus;
  student_note: string | null;
  meeting_link: string | null;
  price: number;
  teacher_pay: number;
  paid: boolean;
  summary: string | null;
  homework: string | null;
  next_focus: string | null;
  cancel_reason: string | null;
  package_id?: string | null;
  created_at: string;
}

/** Hour packages (same discounts as supabase/packages.sql) */
export const packageTiers = [
  { hours: 1, off: 0 },
  { hours: 3, off: 0.04 },
  { hours: 5, off: 0.06, popular: true },
  { hours: 10, off: 0.1 },
] as const;
export const packagePrice = (hourly: number, hours: number) => {
  const off = packageTiers.find((t) => t.hours === hours)?.off ?? 0;
  return Math.round(hourly * hours * (1 - off) * 100) / 100;
};
export const PACKAGE_DAYS = 30;

export interface LessonPackage {
  id: string;
  teacher_id: string;
  hours: number;
  price: number;
  paid: boolean;
  valid_until: string;
  created_at: string;
  minutes_left: number;
}
export const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);

export interface Assignment {
  id: string;
  teacher_id: string;
  student_id: string;
  lesson_id: string | null;
  title: string;
  instructions: string;
  kind: "writing" | "speaking" | "both";
  due_at: string | null;
  status: "assigned" | "submitted" | "graded";
  answer_text: string | null;
  answer_audio: string | null;
  submitted_at: string | null;
  grade: number | null;
  feedback: string | null;
  graded_at: string | null;
  created_at: string;
}

export interface Question {
  id: number;
  course_slug: string;
  lesson_id: string;
  student_id: string;
  student_name: string | null;
  body: string;
  answer: string | null;
  answerer_name: string | null;
  answered_at: string | null;
  shared: boolean;
  created_at: string;
}

export interface Slot {
  weekday: number;
  start_min: number;
  end_min: number;
}

export const statusInfo: Record<LessonStatus, { label: string; cls: string }> = {
  requested: { label: "Waiting for teacher", cls: "bg-amber-50 text-amber-700" },
  confirmed: { label: "Confirmed", cls: "bg-emerald-50 text-emerald-700" },
  declined: { label: "Declined", cls: "bg-slate-100 text-slate-500" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500" },
  completed: { label: "Completed", cls: "bg-brand-50 text-brand-700" },
  no_show: { label: "Missed", cls: "bg-rose-50 text-rose-700" },
};

export const providerName = { zoom: "Zoom", meet: "Google Meet", other: "Video link" } as const;

/* ------------------------------------------------------------------ */
/* Public teacher list (Instructors page + booking)                    */

export interface BookableInstructor extends Instructor {
  id?: string; // user id when the teacher comes from the database
  lessonsTaught?: number;
  hasSlots?: boolean;
}

interface PublicRow {
  user_id: string; slug: string; name: string; title: string; bio: string; photo: string | null; country: string | null;
  languages: string[]; specialties: string[]; qualifications: string[]; experience_years: number | null; lesson_price: number;
  rating: number | null; reviews: number; lessons: number; students: number; has_slots: boolean;
}

const fromRow = (r: PublicRow): BookableInstructor => ({
  id: r.user_id,
  slug: r.slug,
  name: r.name,
  title: r.title,
  bio: r.bio,
  photo: r.photo ?? undefined,
  country: r.country ?? undefined,
  languages: r.languages ?? [],
  specialties: (r.specialties ?? []).filter((s): s is ProgramId => s in programs),
  qualifications: r.qualifications ?? [],
  experienceYears: r.experience_years ?? undefined,
  students: r.students || undefined,
  lessonsTaught: r.lessons,
  rating: r.rating ? Number(r.rating) : undefined,
  reviews: r.reviews || undefined,
  hourly: Number(r.lesson_price) || undefined,
  privateLessons: true,
  verified: true,
  hasSlots: r.has_slots,
});

interface TeacherListState {
  list: BookableInstructor[];
  loaded: boolean;
}
export const useTeacherList = create<TeacherListState>()(() => ({ list: staticInstructors, loaded: false }));

let loading: Promise<void> | null = null;
/** Loads published teachers once (falls back to the static list if the database isn't ready) */
export function loadTeachers(force = false) {
  if (loading && !force) return loading;
  loading = (async () => {
    // never leave the page waiting: give up after 8 seconds and show what we have
    const timeout = new Promise<{ data: null; error: { message: string } }>((r) => setTimeout(() => r({ data: null, error: { message: "timeout" } }), 8000));
    const { data, error } = await Promise.race([supabase.rpc("list_teachers"), timeout]);
    const db = error ? [] : ((data as PublicRow[]) ?? []).map(fromRow);
    const slugs = new Set(db.map((t) => t.slug));
    useTeacherList.setState({ list: [...db, ...staticInstructors.filter((s) => !slugs.has(s.slug))], loaded: true });
  })();
  return loading;
}

/* ------------------------------------------------------------------ */
/* Time helpers — availability is stored in UTC, shown in local time   */

const REF = { y: 2025, m: 0, d: 5 }; // Sunday 5 Jan 2025 — any Sunday works
export const CELLS = 48; // half-hours per day

/** local "weekday-cell" keys → UTC rows */
export function cellsToSlots(cells: Set<string>): Slot[] {
  const utc = new Map<number, number[]>();
  for (const key of cells) {
    const [d, c] = key.split("-").map(Number);
    const dt = new Date(REF.y, REF.m, REF.d + d, 0, c * 30);
    const ud = dt.getUTCDay();
    const uc = Math.floor((dt.getUTCHours() * 60 + dt.getUTCMinutes()) / 30);
    if (!utc.has(ud)) utc.set(ud, []);
    utc.get(ud)!.push(uc);
  }
  const out: Slot[] = [];
  for (const [weekday, list] of utc) {
    list.sort((a, b) => a - b);
    let start = list[0];
    let prev = list[0];
    for (const c of [...list.slice(1), -1]) {
      if (c === prev + 1) {
        prev = c;
        continue;
      }
      out.push({ weekday, start_min: start * 30, end_min: (prev + 1) * 30 });
      start = prev = c;
    }
  }
  return out;
}

/** UTC rows → local "weekday-cell" keys */
export function slotsToCells(slots: Slot[]): Set<string> {
  const cells = new Set<string>();
  for (const s of slots)
    for (let m = s.start_min; m < s.end_min; m += 30) {
      const dt = new Date(Date.UTC(REF.y, REF.m, REF.d + s.weekday, 0, m));
      cells.add(`${dt.getDay()}-${Math.floor((dt.getHours() * 60 + dt.getMinutes()) / 30)}`);
    }
  return cells;
}

/** Start times a learner can book in the next `days` days */
export function freeStarts(slots: Slot[], busy: { starts_at: string; minutes: number }[], minutes: number, days = 21): Date[] {
  const step = 30 * 60_000;
  const first = Math.ceil((Date.now() + 6 * 3600_000) / step) * step;
  const last = Date.now() + days * 86400_000;
  const taken = busy.map((b) => [new Date(b.starts_at).getTime(), new Date(b.starts_at).getTime() + b.minutes * 60_000]);
  const out: Date[] = [];
  for (let t = first; t <= last; t += step) {
    const dt = new Date(t);
    // every half hour of the lesson must be inside an open slot (lessons may cross midnight UTC)
    let free = true;
    for (let k = 0; k < minutes && free; k += 30) {
      const c = new Date(t + k * 60_000);
      const wd = c.getUTCDay();
      const m = c.getUTCHours() * 60 + c.getUTCMinutes();
      free = slots.some((s) => s.weekday === wd && s.start_min <= m && s.end_min >= m + 30);
    }
    if (!free) continue;
    const end = t + minutes * 60_000;
    if (taken.some(([a, b]) => t < b && end > a)) continue;
    out.push(dt);
  }
  return out;
}

export const timeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "your time zone";
  }
};

export const fmtDay = (d: Date | string) =>
  new Date(d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
export const fmtTime = (d: Date | string) =>
  new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
export const fmtWhen = (d: string) => `${fmtDay(d)} · ${fmtTime(d)}`;
export const cellLabel = (c: number) => `${String(Math.floor(c / 2)).padStart(2, "0")}:${c % 2 ? "30" : "00"}`;

/** Can the lesson be joined now? (15 minutes before until 15 minutes after the end) */
export function joinWindow(l: Pick<PrivateLesson, "starts_at" | "minutes" | "status">, now = Date.now()) {
  const start = new Date(l.starts_at).getTime();
  const end = start + l.minutes * 60_000;
  if (l.status !== "confirmed") return "none" as const;
  if (now < start - 15 * 60_000) return "early" as const;
  if (now > end + 15 * 60_000) return "over" as const;
  return "open" as const;
}

export const money = (n: number | string | null | undefined) =>
  `$${Number(n ?? 0).toLocaleString("en-US", { minimumFractionDigits: Number(n ?? 0) % 1 ? 2 : 0, maximumFractionDigits: 2 })}`;

export const slugify = (s: string) =>
  s.toLowerCase().replace(/^(mr|mrs|ms|dr|prof|teacher)\.?\s+/i, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "teacher";

/* ------------------------------------------------------------------ */
/* The signed-in teacher's own profile                                 */

interface MyTeacherState {
  profile: TeacherRow | null;
  loaded: boolean;
  error: string;
}
export const useMyTeacher = create<MyTeacherState>()(() => ({ profile: null, loaded: false, error: "" }));

export async function loadMyTeacher(userId: string) {
  const { data, error } = await supabase.from("teachers").select("*").eq("user_id", userId).maybeSingle();
  useMyTeacher.setState({ profile: (data as TeacherRow) ?? null, loaded: true, error: error?.message ?? "" });
}
