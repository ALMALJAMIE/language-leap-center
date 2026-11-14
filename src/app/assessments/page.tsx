"use client";

import Link from "next/link";
import { ClipboardCheck, Play, RotateCcw } from "lucide-react";
import { courseLessons, courses, levels } from "@/data/courses";
import { AccountShell } from "@/components/account/AccountShell";
import { useMounted, useProgress } from "@/lib/store";
import { lessonHref } from "@/data/courses";
import { MyExams } from "./MyExams";

export default function Assessments() {
  const mounted = useMounted();
  const { placement, completed } = useProgress();
  if (!mounted) return <AccountShell title="Assessments & Quizzes"><div className="min-h-[50vh]" /></AccountShell>;

  const results = courses.flatMap((c) =>
    courseLessons(c)
      .filter((l) => completed[`${c.slug}/${l.id}`])
      .map((l) => ({ c, l, r: completed[`${c.slug}/${l.id}`] })),
  ).sort((a, b) => b.r.at.localeCompare(a.r.at));

  const grade = (a: number) => (a >= 0.9 ? ["Excellent", "bg-emerald-50 text-emerald-700"] : a >= 0.75 ? ["Good", "bg-brand-50 text-brand-700"] : ["Keep practising", "bg-gold-50 text-gold-700"]);

  return (
    <AccountShell title="Assessments & Quizzes" subtitle="Your placement test, course exams and lesson quiz scores">
      <div className="mb-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-50 text-violet-600"><ClipboardCheck className="h-5 w-5" /></span>
            <div>
              <div className="font-bold">Placement test</div>
              <div className="text-sm text-slate-500">30 questions · A1 to C1 · plus a short speaking test</div>
            </div>
          </div>
          {placement ? (
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-mist p-4">
              <div>
                <div className="text-3xl font-extrabold text-brand-700">{placement.level}</div>
                <div className="text-sm text-slate-500">{levels[placement.level].name} · {placement.score}/{placement.total} correct</div>
              </div>
              <Link href="/placement/" className="flex items-center gap-1.5 text-sm font-bold text-brand-600"><RotateCcw className="h-4 w-4" /> Details</Link>
            </div>
          ) : (
            <Link href="/placement/" className="btn-primary mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm"><Play className="h-4 w-4" /> Book the test</Link>
          )}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="font-bold">Lesson quizzes</div>
          <p className="mt-1 text-sm text-slate-500">Every lesson ends with graded exercises. Your best score is kept.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-mist p-4">
              <div className="text-2xl font-extrabold">{results.length}</div>
              <div className="text-xs text-slate-500">quizzes taken</div>
            </div>
            <div className="rounded-2xl bg-mist p-4">
              <div className="text-2xl font-extrabold">{results.length ? Math.round((results.reduce((s, x) => s + x.r.accuracy, 0) / results.length) * 100) : 0}%</div>
              <div className="text-xs text-slate-500">average score</div>
            </div>
          </div>
        </div>
      </div>

      <MyExams />

      <h2 className="mb-3 font-bold">Lesson quizzes</h2>
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 border-b border-slate-100 px-6 py-3 text-xs font-bold uppercase tracking-wide text-slate-400">
          <span>Lesson</span>
          <span>Score</span>
          <span className="w-16 text-right">Retry</span>
        </div>
        {results.length === 0 ? (
          <p className="p-8 text-center text-slate-500">Finish a lesson to see your first quiz score here.</p>
        ) : (
          results.map(({ c, l, r }) => {
            const [label, cls] = grade(r.accuracy);
            return (
              <div key={c.slug + l.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-50 px-6 py-3.5">
                <div className="min-w-0">
                  <div className="truncate font-semibold">{l.title}</div>
                  <div className="truncate text-xs text-slate-500">{c.title} · {new Date(r.at).toLocaleDateString("en-GB")}</div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${cls}`}>{Math.round(r.accuracy * 100)}% · {label}</span>
                <Link href={lessonHref(c.slug, l.id)} className="w-16 text-right text-sm font-bold text-brand-600">Retry</Link>
              </div>
            );
          })
        )}
      </div>
    </AccountShell>
  );
}
