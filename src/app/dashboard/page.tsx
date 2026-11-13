"use client";

import Link from "next/link";
import { ArrowRight, Award, Brain, ClipboardCheck, Flame, Play, Target, Zap } from "lucide-react";
import { courses, levels } from "@/data/courses";
import { CourseCover } from "@/components/CourseCard";
import { AccountShell } from "@/components/account/AccountShell";
import { courseProgress, startedCourses } from "@/lib/account";
import { displayName, useAuth } from "@/lib/auth";
import { dueCards, todayKey, useMounted, useProgress } from "@/lib/store";

export default function LearnerDashboard() {
  const mounted = useMounted();
  const p = useProgress();
  const user = useAuth((s) => s.user);
  const name = displayName(user);

  if (!mounted) return <AccountShell title="Learner Dashboard"><div className="min-h-[50vh]" /></AccountShell>;

  const started = startedCourses(p.completed);
  const current = started.map((c) => ({ c, ...courseProgress(c, p.completed) })).find((x) => x.next);
  const due = dueCards(p.cards).length;
  const today = p.xpByDay[todayKey()] ?? 0;
  const certs = courses.filter((c) => courseProgress(c, p.completed).certified).length;
  const suggested = courses.find((c) => c.program === "GE" && c.level === (p.placement?.level ?? "A1")) ?? courses[0];

  return (
    <AccountShell title={`Welcome back${name ? `, ${name.split(" ")[0]}` : ""} 👋`} subtitle="Pick up where you left off">
      {/* Continue learning */}
      <div className="brand-gradient relative overflow-hidden rounded-3xl p-6 text-white sm:p-8">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[30px] border-white/5" />
        <div className="absolute -bottom-20 right-24 h-40 w-40 rounded-full border-[22px] border-gold-400/20" />
        {current ? (
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gold-300">Continue learning</div>
              <h2 className="mt-2 text-2xl font-extrabold">{current.next!.title}</h2>
              <p className="mt-1 text-brand-100">{current.c.title}</p>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 w-48 overflow-hidden rounded-full bg-white/20">
                  <div className="h-full rounded-full bg-gold-400" style={{ width: `${current.pct * 100}%` }} />
                </div>
                <span className="text-sm text-brand-100">{current.done}/{current.total} lessons</span>
              </div>
            </div>
            <Link href={`/learn/${current.c.slug}/${current.next!.id}/`} className="btn-gold flex items-center gap-2 px-6 py-3.5">
              <Play className="h-5 w-5 fill-brand-900" /> Continue
            </Link>
          </div>
        ) : (
          <div className="relative flex flex-wrap items-center justify-between gap-6">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-gold-300">{started.length ? "Great work!" : "Get started"}</div>
              <h2 className="mt-2 text-2xl font-extrabold">{started.length ? "You've finished all published lessons" : "Start your first lesson"}</h2>
              <p className="mt-1 text-brand-100">Suggested for you: {suggested.title}</p>
            </div>
            <Link href={`/courses/${suggested.slug}/`} className="btn-gold flex items-center gap-2 px-6 py-3.5">
              Open course <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { icon: <Flame />, v: p.streak, l: "Day streak", c: "text-orange-500 bg-orange-50", href: "/progress/" },
          { icon: <Zap />, v: p.xp, l: "Total XP", c: "text-gold-600 bg-gold-50", href: "/progress/" },
          { icon: <Target />, v: `${today}/${p.dailyGoal}`, l: "Today's goal", c: "text-brand-600 bg-brand-50", href: "/progress/" },
          { icon: <Award />, v: certs, l: "Certificates", c: "text-emerald-600 bg-emerald-50", href: "/certificates/" },
        ].map((s) => (
          <Link key={s.l} href={s.href} className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.c}`}>{s.icon}</div>
            <div>
              <div className="text-2xl font-extrabold">{s.v}</div>
              <div className="text-sm text-slate-500">{s.l}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* My courses preview */}
        <div className="rounded-3xl border border-slate-200 p-6 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold">My courses</h2>
            <Link href="/my-courses/" className="text-sm font-bold text-brand-600">View all →</Link>
          </div>
          {started.length === 0 ? (
            <p className="rounded-2xl bg-mist p-6 text-center text-slate-500">Courses you start will appear here.</p>
          ) : (
            <div className="space-y-3">
              {started.slice(0, 3).map((c) => {
                const pr = courseProgress(c, p.completed);
                return (
                  <Link key={c.slug} href={`/courses/${c.slug}/`} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50">
                    <CourseCover course={c} className="h-16 w-24 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold">{c.title}</div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gold-400" style={{ width: `${pr.pct * 100}%` }} />
                      </div>
                    </div>
                    <span className="text-sm font-bold text-slate-500">{Math.round(pr.pct * 100)}%</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Side tasks */}
        <div className="space-y-4">
          <Link href="/review/" className="flex items-center gap-4 rounded-3xl border border-slate-200 p-5 transition hover:shadow-md">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><Brain /></div>
            <div className="flex-1">
              <div className="font-bold">Review words</div>
              <div className="text-sm text-slate-500">{due ? `${due} cards are due now` : "Nothing due — well done"}</div>
            </div>
            {due > 0 && <span className="rounded-full bg-gold-400 px-2.5 py-1 text-xs font-bold text-brand-900">{due}</span>}
          </Link>
          <Link href="/placement/" className="flex items-center gap-4 rounded-3xl border border-slate-200 p-5 transition hover:shadow-md">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-50 text-gold-600"><ClipboardCheck /></div>
            <div className="flex-1">
              <div className="font-bold">{p.placement ? `Your level: ${p.placement.level}` : "Find your level"}</div>
              <div className="text-sm text-slate-500">{p.placement ? levels[p.placement.level].name : "15-question placement test"}</div>
            </div>
          </Link>
        </div>
      </div>
    </AccountShell>
  );
}
