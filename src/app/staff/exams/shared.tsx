"use client";

import { courses } from "@/data/courses";
import { useRole } from "@/lib/roles";

export const inp = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500";

export const courseTitle = (slug: string | null) => (slug ? courses.find((c) => c.slug === slug)?.title ?? slug : "General (placement)");
export const unitTitle = (slug: string | null, i: number | null) => {
  if (i === null || i === undefined) return "Whole course";
  const m = courses.find((c) => c.slug === slug)?.modules[i];
  return m ? m.title : `Unit ${i + 1}`;
};

export function usePerms() {
  const role = useRole((s) => s.role);
  return {
    role,
    academic: role === "academic" || role === "admin",
    teacher: role === "teacher",
    canOpen: role === "academic" || role === "admin" || role === "teacher",
    canMark: role === "academic" || role === "admin" || role === "teacher",
    canWriteBank: role === "academic" || role === "admin" || role === "teacher",
  };
}

export function CourseSelect({ value, onChange, all = true, general = true }: { value: string; onChange: (v: string) => void; all?: boolean; general?: boolean }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inp}>
      {all && <option value="">All courses</option>}
      {general && <option value="-">General (placement)</option>}
      {courses.map((c) => <option key={c.slug} value={c.slug}>{c.title}</option>)}
    </select>
  );
}

export function UnitSelect({ slug, value, onChange, any = "Whole course" }: { slug: string; value: string; onChange: (v: string) => void; any?: string }) {
  const c = courses.find((x) => x.slug === slug);
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inp} disabled={!c}>
      <option value="">{any}</option>
      {c?.modules.map((m, i) => <option key={i} value={String(i)}>{m.title}</option>)}
    </select>
  );
}
