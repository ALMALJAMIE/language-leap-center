"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Pencil, Plus } from "lucide-react";
import { supabase } from "@/lib/auth";
import { builtInCourses, courseLessons, formatPrice, lessonCount, lessonHref, programs } from "@/data/courses";
import { rowToCourse, type CourseRow } from "@/lib/catalog";
import { rpcError, useRole } from "@/lib/roles";
import type { Course } from "@/lib/types";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";

export default function CoursesAdminPage() {
  const role = useRole((s) => s.role);
  return (
    <StaffShell
      page="/staff/courses/"
      title="Course Builder"
      subtitle="Every course on the platform: its units, lessons, materials, price and status."
      actions={role !== "finance" ? <Link href="/staff/courses/edit/?new=1" className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"><Plus className="h-4 w-4" /> New course</Link> : undefined}
    >
      <CoursesTable />
    </StaffShell>
  );
}

type Status = "builtin" | "draft" | "published";
interface Item { course: Course; status: Status; updated?: string; edited: boolean }

function CoursesTable() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [paid, setPaid] = useState<Record<string, number>>({});
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const [{ data, error }, e] = await Promise.all([
      supabase.from("courses").select("slug,data,price,published,updated_at"),
      supabase.rpc("staff_list_enrollments"),
    ]);
    setErr(error && !/does not exist|schema cache/i.test(error.message) ? rpcError(error) : error ? "The Course Builder needs supabase/content.sql — run it in the Supabase SQL Editor." : "");
    const rows = (data as CourseRow[]) ?? [];
    const list: Item[] = builtInCourses.map((c) => ({ course: c, status: "builtin" as Status, edited: false }));
    for (const r of rows) {
      const it: Item = { course: rowToCourse(r), status: r.published ? "published" : "draft", updated: r.updated_at, edited: true };
      const i = list.findIndex((x) => x.course.slug === r.slug);
      if (i >= 0) list[i] = it;
      else list.push(it);
    }
    setItems(list.sort((a, b) => a.course.order - b.course.order));
    const m: Record<string, number> = {};
    for (const x of (e.data as { course_slug: string }[] | null) ?? []) m[x.course_slug] = (m[x.course_slug] ?? 0) + 1;
    setPaid(m);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (!items) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const ready = items.reduce((n, x) => n + courseLessons(x.course).length, 0);
  const planned = items.reduce((n, x) => n + lessonCount(x.course), 0);

  return (
    <>
      <ErrorNote text={err} />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          { l: "Courses", v: items.length },
          { l: "Published or built-in", v: items.filter((x) => x.status !== "draft").length },
          { l: "Lessons published", v: ready },
          { l: "Lessons in preparation", v: planned - ready },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="text-sm text-slate-500">{s.l}</div><div className="mt-1 text-3xl font-extrabold">{s.v}</div></div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Course</th><th className="px-4 py-3">Program</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Lessons</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Paid learners</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {items.map(({ course: c, status, updated, edited }) => {
              const done = courseLessons(c).length;
              const total = lessonCount(c);
              const first = courseLessons(c)[0];
              return (
                <tr key={c.slug} className="border-t border-slate-100">
                  <td className="px-4 py-3"><div className="font-semibold">{c.cover.icon} {c.title}</div><div className="text-xs text-slate-500">{c.code} · {c.level}{updated ? ` · edited ${fmtDate(updated)}` : ""}</div></td>
                  <td className="px-4 py-3 text-slate-600">{programs[c.program]?.name ?? c.program}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(c.price)}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold">{done} / {total}</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${total ? (done / total) * 100 : 0}%` }} /></div>
                  </td>
                  <td className="px-4 py-3">
                    {status === "draft" ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700">Draft</span>
                      : <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">Live</span>}
                    {!edited && <span className="ml-1.5 text-xs text-slate-400">built-in</span>}
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{c.price === 0 ? <span className="font-normal text-slate-400">Free</span> : paid[c.slug] ?? 0}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/staff/courses/edit/?c=${c.slug}`} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-brand-400"><Pencil className="h-3 w-3" /> Edit</Link>
                      {first && <Link href={lessonHref(c.slug, first.id)} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold hover:border-brand-400">Preview <ExternalLink className="h-3 w-3" /></Link>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-slate-500">“Built-in” courses come with the site. The first time you save one in the builder, your version replaces it.</p>
    </>
  );
}
