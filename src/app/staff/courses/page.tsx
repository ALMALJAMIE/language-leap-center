"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import { supabase } from "@/lib/auth";
import { courseLessons, courses, formatPrice, lessonCount, programs } from "@/data/courses";
import { StaffShell } from "@/components/staff/StaffShell";

export default function CoursesAdminPage() {
  return (
    <StaffShell page="/staff/courses/" title="Courses & Lessons" subtitle="Every course on the platform, its lessons and who has paid access.">
      <CoursesTable />
    </StaffShell>
  );
}

function CoursesTable() {
  const [paidCount, setPaidCount] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    supabase.rpc("staff_list_enrollments").then(({ data }) => {
      const m: Record<string, number> = {};
      for (const r of (data as { course_slug: string }[] | null) ?? []) m[r.course_slug] = (m[r.course_slug] ?? 0) + 1;
      setPaidCount(m);
    });
  }, []);

  const all = [...courses].sort((a, b) => a.order - b.order);
  const ready = all.reduce((n, c) => n + courseLessons(c).length, 0);
  const planned = all.reduce((n, c) => n + lessonCount(c), 0);

  return (
    <>
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { l: "Courses", v: all.length },
          { l: "Lessons published", v: ready },
          { l: "Lessons in preparation", v: planned - ready },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{s.l}</div><div className="mt-1 text-3xl font-extrabold">{s.v}</div></div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Program</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Lessons</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Paid learners</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {all.map((c) => {
              const done = courseLessons(c).length;
              const total = lessonCount(c);
              const first = courseLessons(c)[0];
              return (
                <tr key={c.slug} className="border-t border-slate-100">
                  <td className="px-4 py-3"><div className="font-semibold">{c.cover.icon} {c.title}</div><div className="text-xs text-slate-500">{c.code} · {c.level}</div></td>
                  <td className="px-4 py-3 text-slate-600">{programs[c.program].name}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(c.price)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{done} / {total}</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
                  </td>
                  <td className="px-4 py-3">
                    {done === 0 ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">In preparation</span>
                      : done < total ? <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700">Partly published</span>
                      : <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Published</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{c.price === 0 ? <span className="font-normal text-slate-400">Free</span> : paidCount ? paidCount[c.slug] ?? 0 : "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/courses/${c.slug}/`} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-brand-400">Page</Link>
                      {first && <Link href={`/learn/${c.slug}/${first.id}/`} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-brand-400">Preview <ExternalLink className="h-3 w-3" /></Link>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-400">Lesson content is edited in the project files for now (src/data/lessons). An editor will come here later.</p>
    </>
  );
}
