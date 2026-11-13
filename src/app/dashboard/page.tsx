"use client";

import Link from "next/link";
import { Award, BookOpen, Brain, Flame, Lock, Target, Trophy, Zap } from "lucide-react";
import { courseLessons, courses, levels } from "@/data/courses";
import { CourseCover } from "@/components/CourseCard";
import { dueCards, todayKey, useMounted, useProgress } from "@/lib/store";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Dashboard() {
  const mounted = useMounted();
  const p = useProgress();
  if (!mounted) return <div className="min-h-[60vh]" />;

  const today = p.xpByDay[todayKey()] ?? 0;
  const goalPct = Math.min(1, today / p.dailyGoal);
  const doneLessons = Object.keys(p.completed).length;
  const words = Object.keys(p.cards).length;
  const due = dueCards(p.cards).length;

  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return { label: dayNames[d.getDay()], xp: p.xpByDay[todayKey(d)] ?? 0, today: i === 6 };
  });
  const maxXp = Math.max(p.dailyGoal, ...week.map((w) => w.xp));

  const inProgress = courses
    .map((c) => {
      const ls = courseLessons(c);
      const done = ls.filter((l) => p.completed[`${c.slug}/${l.id}`]).length;
      return { c, done, total: ls.length, next: ls.find((l) => !p.completed[`${c.slug}/${l.id}`]) };
    })
    .filter((x) => x.done > 0);

  const badges = [
    { icon: "🚀", name: "First leap", desc: "Finish your first lesson", ok: doneLessons >= 1 },
    { icon: "🔥", name: "On fire", desc: "Keep a 3-day streak", ok: p.bestStreak >= 3 },
    { icon: "📚", name: "Word collector", desc: "Collect 30 words", ok: words >= 30 },
    { icon: "⚡", name: "100 XP", desc: "Earn 100 XP", ok: p.xp >= 100 },
    { icon: "🏅", name: "Unit done", desc: "Finish 3 lessons", ok: doneLessons >= 3 },
    { icon: "👑", name: "Golden week", desc: "Keep a 7-day streak", ok: p.bestStreak >= 7 },
  ];

  const R = 54;
  const C = 2 * Math.PI * R;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">
            Hello{p.name ? `, ${p.name}` : ""} 👋
          </h1>
          <p className="mt-1 text-slate-500">Here is your English journey so far</p>
        </div>
        <input
          value={p.name}
          onChange={(e) => p.setName(e.target.value)}
          placeholder="Your name"
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-brand-400"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: <Flame />, v: p.streak, l: "Day streak", sub: `Best: ${p.bestStreak}`, c: "text-orange-500 bg-orange-50" },
          { icon: <Zap />, v: p.xp, l: "Total XP", sub: "All-time points", c: "text-gold-600 bg-gold-50" },
          { icon: <BookOpen />, v: doneLessons, l: "Lessons done", sub: `${words} words learned`, c: "text-brand-600 bg-brand-50" },
          { icon: <Brain />, v: due, l: "Cards to review", sub: due ? "Review them now" : "Nothing due", c: "text-emerald-600 bg-emerald-50", href: "/review/" },
        ].map((s) => {
          const inner = (
            <div className="flex items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
              <div className={`grid h-14 w-14 place-items-center rounded-2xl ${s.c}`}>{s.icon}</div>
              <div>
                <div className="text-3xl font-extrabold">{s.v}</div>
                <div className="text-sm font-semibold text-slate-700">{s.l}</div>
                <div className="text-xs text-slate-400">{s.sub}</div>
              </div>
            </div>
          );
          return s.href ? <Link key={s.l} href={s.href}>{inner}</Link> : <div key={s.l}>{inner}</div>;
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Daily goal */}
        <div className="rounded-3xl border border-slate-200 p-6">
          <h2 className="flex items-center gap-2 font-bold"><Target className="h-5 w-5 text-brand-600" /> Daily goal</h2>
          <div className="mt-4 flex items-center gap-6">
            <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
              <circle cx="65" cy="65" r={R} fill="none" stroke="#eef4fc" strokeWidth="12" />
              <circle cx="65" cy="65" r={R} fill="none" stroke="#efb52a" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - goalPct)} style={{ transition: "stroke-dashoffset .6s" }} />
            </svg>
            <div>
              <div className="text-3xl font-extrabold text-brand-800">{today}<span className="text-lg text-slate-400">/{p.dailyGoal}</span></div>
              <div className="text-sm text-slate-500">XP today</div>
              {goalPct >= 1 && <div className="mt-1 text-sm font-bold text-emerald-600">Goal reached! 🎯</div>}
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            {[{ n: 10, l: "Casual" }, { n: 30, l: "Regular" }, { n: 50, l: "Serious" }, { n: 80, l: "Intense" }].map((g) => (
              <button
                key={g.n}
                onClick={() => p.setGoal(g.n)}
                className={`flex-1 rounded-xl border-2 py-2 text-xs font-bold ${p.dailyGoal === g.n ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"}`}
              >
                {g.l}<div>{g.n} XP</div>
              </button>
            ))}
          </div>
        </div>

        {/* Week */}
        <div className="rounded-3xl border border-slate-200 p-6 lg:col-span-2">
          <h2 className="font-bold">This week</h2>
          <div className="mt-6 flex h-48 items-end gap-3">
            {week.map((d, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-xs font-bold text-slate-500">{d.xp || ""}</span>
                <div className="relative w-full flex-1">
                  <div
                    className={`absolute bottom-0 w-full rounded-t-xl ${d.today ? "gold-gradient" : "bg-brand-500"}`}
                    style={{ height: `${(d.xp / maxXp) * 100}%`, minHeight: d.xp ? 6 : 0 }}
                  />
                  <div className="absolute w-full border-t-2 border-dashed border-emerald-400/60" style={{ bottom: `${(p.dailyGoal / maxXp) * 100}%` }} />
                </div>
                <span className={`text-xs ${d.today ? "font-bold text-gold-600" : "text-slate-500"}`}>{d.label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-slate-400">Dashed line = your daily goal</p>
        </div>
      </div>

      {/* Courses */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-3xl border border-slate-200 p-6 lg:col-span-2">
          <h2 className="mb-5 font-bold">My courses</h2>
          {inProgress.length === 0 ? (
            <div className="rounded-2xl bg-mist p-8 text-center">
              <p className="text-slate-600">You haven&apos;t started a course yet.</p>
              <Link href={p.placement ? "/courses/" : "/placement/"} className="btn-primary mt-4 inline-block px-6 py-3">
                {p.placement ? "Browse courses" : "Find your level first"}
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {inProgress.map(({ c, done, total, next }) => (
                <div key={c.slug} className="flex items-center gap-4 rounded-2xl border border-slate-100 p-3">
                  <CourseCover course={c} className="h-20 w-28 shrink-0 rounded-xl" />
                  <div className="flex-1">
                    <div className="font-bold">{c.title}</div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full bg-gold-400" style={{ width: `${(done / total) * 100}%` }} />
                    </div>
                    <div className="mt-1 text-xs text-slate-500">{done} / {total} lessons</div>
                  </div>
                  {next ? (
                    <Link href={`/learn/${c.slug}/${next.id}/`} className="btn-primary px-4 py-2 text-sm">Continue</Link>
                  ) : (
                    <span className="flex items-center gap-1 text-sm font-bold text-emerald-600"><Trophy className="h-4 w-4" /> Completed</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-3xl border border-slate-200 p-6">
          <h2 className="mb-2 font-bold">Your level</h2>
          {p.placement ? (
            <div className="rounded-2xl bg-brand-50 p-5 text-center">
              <div className="text-5xl font-extrabold text-brand-700">{p.placement.level}</div>
              <div className="mt-1 font-semibold">{levels[p.placement.level].name}</div>
              <div className="text-xs text-slate-500">Test score: {p.placement.score}/{p.placement.total}</div>
              <Link href="/placement/" className="mt-3 inline-block text-sm font-bold text-brand-600">Retake the test</Link>
            </div>
          ) : (
            <Link href="/placement/" className="block rounded-2xl bg-gold-50 p-5 text-center font-bold text-gold-700">Take the placement test →</Link>
          )}

          <h2 className="mb-3 mt-6 flex items-center gap-2 font-bold"><Award className="h-5 w-5 text-gold-500" /> Badges</h2>
          <div className="grid grid-cols-3 gap-2">
            {badges.map((b) => (
              <div key={b.name} title={b.desc} className={`rounded-2xl p-3 text-center ${b.ok ? "bg-gold-50" : "bg-slate-50 opacity-50 grayscale"}`}>
                <div className="text-2xl">{b.ok ? b.icon : <Lock className="mx-auto h-6 w-6 text-slate-400" />}</div>
                <div className="mt-1 text-[11px] font-bold">{b.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-10 text-center">
        <button
          onClick={() => confirm("This will delete all progress saved on this device. Are you sure?") && p.reset()}
          className="text-xs text-slate-400 hover:text-red-500"
        >
          Reset progress
        </button>
      </div>
    </div>
  );
}
