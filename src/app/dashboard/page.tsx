"use client";

import Link from "next/link";
import { roleInfo, useRole, type Role } from "@/lib/roles";
import { ArrowRight, Award, BarChart3, Brain, ClipboardCheck, ClipboardList, Compass, Flame, GraduationCap, Play, Rocket, ShieldCheck, Target, X, Zap } from "lucide-react";
import { courses, levels } from "@/data/courses";
import { CourseCover } from "@/components/CourseCard";
import { courseProgress, startedCourses } from "@/lib/account";
import { displayName, useAuth } from "@/lib/auth";
import { dueCards, todayKey, useMounted, useProgress } from "@/lib/store";
import { usePortalPrefs } from "@/lib/ui";
import { courseHref, lessonHref } from "@/data/courses";

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export default function LearnerDashboard() {
  const mounted = useMounted();
  const p = useProgress();
  const role = useRole((s) => s.role);
  const user = useAuth((s) => s.user);
  const { dismissed, dismiss } = usePortalPrefs();

  if (!mounted) return <div className="min-h-[60vh]" />;

  const name = displayName(user) || p.name;
  const started = startedCourses(p.completed).map((c) => ({ c, pr: courseProgress(c, p.completed) }));
  const current = started.find((x) => x.pr.next);
  const due = dueCards(p.cards).length;
  const today = p.xpByDay[todayKey()] ?? 0;
  const certs = courses.filter((c) => courseProgress(c, p.completed).certified).length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-8">
      {/* Greeting */}
      <div className="relative overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50/80 to-white px-8 py-9">
        <span className="pointer-events-none absolute -right-6 -top-10 select-none text-[10rem] font-black leading-none text-brand-100/60">C</span>
        <span className="pointer-events-none absolute bottom-2 right-40 select-none text-6xl font-black text-gold-100">L</span>
        <h1 className="relative text-3xl font-extrabold text-ink sm:text-4xl">
          {greeting()}
          {name ? `, ${name}` : ""}! 👋
        </h1>
        <p className="relative mt-2 text-lg text-slate-500">Ready to learn some English today?</p>
      </div>

      {role && <StaffBanner role={role} />}

      {/* Find your level */}
      {!p.placement && !dismissed.includes("level") && (
        <div className="flex items-start gap-4 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold-100 text-gold-600"><Compass className="h-5 w-5" /></span>
          <div className="flex-1">
            <div className="font-bold">Find the right level for you</div>
            <p className="text-sm text-slate-600">New to English? We recommend starting with the free A1 course. Already know some? Browse the levels to find where you fit.</p>
          </div>
          <Link href="/levels/" className="hidden shrink-0 rounded-xl bg-gold-500 px-4 py-2 text-sm font-bold text-white hover:bg-gold-600 sm:block">Browse levels</Link>
          <button onClick={() => dismiss("level")} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
      )}

      {/* 1-on-1 lessons */}
      {!dismissed.includes("private") && (
        <div className="flex items-start gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-5 sm:items-center">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-100 text-brand-700"><GraduationCap className="h-5 w-5" /></span>
          <div className="flex-1">
            <div className="font-bold">Practise 1-on-1 with a teacher</div>
            <p className="text-sm text-slate-600">Book a private live lesson of 30, 60 or 90 minutes. No course needed.</p>
          </div>
          <Link href="/private-lessons/" className="hidden shrink-0 rounded-xl bg-brand-900 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800 sm:block">Book a lesson</Link>
          <button onClick={() => dismiss("private")} aria-label="Dismiss" className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
      )}

      {/* Hero: get started or continue */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-950 px-8 py-12 text-center text-white">
        <span className="pointer-events-none absolute -bottom-8 left-6 select-none text-[9rem] font-black leading-none text-white/5">LLC</span>
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full border-[36px] border-gold-400/10" />
        {current ? (
          <div className="relative">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10"><Play className="h-7 w-7 fill-white" /></div>
            <div className="mt-5 text-xs font-bold uppercase tracking-widest text-gold-300">Continue learning</div>
            <h2 className="mt-2 text-3xl font-extrabold">{current.pr.next!.title}</h2>
            <p className="mt-2 text-brand-200">{current.c.title}</p>
            <div className="mx-auto mt-5 flex max-w-xs items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/15">
                <div className="h-full rounded-full bg-gold-400" style={{ width: `${current.pr.pct * 100}%` }} />
              </div>
              <span className="text-sm text-brand-200">{current.pr.done}/{current.pr.total}</span>
            </div>
            <Link href={lessonHref(current.c.slug, current.pr.next!.id)} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-ink shadow-lg hover:bg-gold-50">
              <Play className="h-5 w-5 fill-ink" /> Continue lesson
            </Link>
          </div>
        ) : (
          <div className="relative">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-white/10"><Rocket className="h-7 w-7" /></div>
            <h2 className="mt-5 text-3xl font-extrabold">{started.length ? "Ready for your next leap?" : "Let's get started!"}</h2>
            <p className="mx-auto mt-3 max-w-md text-brand-200">
              {started.length
                ? "You've finished every published lesson in your courses. Pick a new course to keep going."
                : "Pick your first course or take a quick test to find the perfect level for you. Your English adventure begins here."}
            </p>
            <Link href="/courses/" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-bold text-ink shadow-lg hover:bg-gold-50">
              <Compass className="h-5 w-5" /> Browse Courses
            </Link>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { href: "/courses/", label: "Browse Courses", icon: Compass, c: "bg-gold-50 text-gold-600" },
          { href: "/progress/", label: "My Progress", icon: BarChart3, c: "bg-emerald-50 text-emerald-600" },
          { href: "/review/", label: due ? `Daily Review (${due})` : "Daily Review", icon: Brain, c: "bg-sky-50 text-sky-600" },
          { href: "/assessments/", label: "Assessments", icon: ClipboardCheck, c: "bg-violet-50 text-violet-600" },
        ].map(({ href, label, icon: Icon, c }) => (
          <Link key={href} href={href} className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md">
            <span className={`grid h-11 w-11 place-items-center rounded-xl ${c}`}><Icon className="h-5 w-5" /></span>
            <div className="mt-4 text-sm font-semibold">{label}</div>
          </Link>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icon: <Flame />, v: p.streak, l: "Day streak", c: "text-orange-500" },
          { icon: <Zap />, v: p.xp, l: "Total XP", c: "text-gold-500" },
          { icon: <Target />, v: `${today}/${p.dailyGoal}`, l: "Today's XP goal", c: "text-brand-600" },
          { icon: <Award />, v: certs, l: "Certificates", c: "text-emerald-600" },
        ].map((s) => (
          <div key={s.l} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <span className={s.c}>{s.icon}</span>
            <div>
              <div className="text-xl font-extrabold">{s.v}</div>
              <div className="text-xs text-slate-500">{s.l}</div>
            </div>
          </div>
        ))}
      </div>

      {/* My courses */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-bold">My courses</h2>
          <Link href="/my-courses/" className="flex items-center gap-1 text-sm font-bold text-brand-600">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {started.length === 0 ? (
          <div className="grid gap-4 sm:grid-cols-3">
            {courses.filter((c) => c.price === 0 || c.isNew).slice(0, 3).map((c) => (
              <Link key={c.slug} href={courseHref(c.slug)} className="overflow-hidden rounded-2xl border border-slate-100 transition hover:shadow-md">
                <CourseCover course={c} className="h-24" />
                <div className="p-3">
                  <div className="text-xs font-bold text-gold-600">{c.level} · {levels[c.level].name}</div>
                  <div className="mt-1 text-sm font-semibold">{c.title}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {started.map(({ c, pr }) => (
              <Link key={c.slug} href={pr.next ? lessonHref(c.slug, pr.next.id) : courseHref(c.slug)} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3 transition hover:bg-slate-50">
                <CourseCover course={c} className="h-14 w-20 shrink-0 rounded-xl" mini />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{c.title}</div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${pr.allPublishedDone ? "bg-emerald-500" : "bg-gold-400"}`} style={{ width: `${pr.pct * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-500">{Math.round(pr.pct * 100)}%</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Coming soon teaser */}
      <Link href="/coming-soon/?f=assignments" className="flex items-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-slate-500 hover:border-slate-400">
        <ClipboardList className="h-5 w-5" />
        <span className="flex-1 text-sm">Live classes, assignments and teacher messages are coming soon.</span>
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function StaffBanner({ role }: { role: Role }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-brand-900 to-brand-700 p-5 text-white">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/10"><ShieldCheck className="h-5 w-5 text-gold-300" /></span>
      <div className="flex-1">
        <div className="font-bold">You have a team account — {roleInfo[role].label}</div>
        <p className="text-sm text-brand-100">Your tools are in the Team Workspace.</p>
      </div>
      <Link href="/staff/" className="shrink-0 rounded-xl bg-gold-400 px-4 py-2 text-sm font-bold text-brand-950 hover:bg-gold-300">Open workspace</Link>
    </div>
  );
}
