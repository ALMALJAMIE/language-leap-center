"use client";

import { AccountShell } from "@/components/account/AccountShell";
import { courses } from "@/data/courses";
import { courseProgress } from "@/lib/account";
import { todayKey, useMounted, useProgress } from "@/lib/store";

export default function Advanced() {
  const mounted = useMounted();
  const p = useProgress();
  if (!mounted) return <AccountShell title="Advanced view"><div className="min-h-[50vh]" /></AccountShell>;

  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return { d, xp: p.xpByDay[todayKey(d)] ?? 0 };
  });
  const max = Math.max(p.dailyGoal, ...days.map((d) => d.xp));
  const active = days.filter((d) => d.xp > 0).length;
  const total30 = days.reduce((s, d) => s + d.xp, 0);

  // Memory strength from the FSRS scheduler
  const cards = Object.values(p.cards);
  const buckets = [
    { l: "New", c: "bg-slate-300", n: cards.filter((x) => x.card.reps === 0).length },
    { l: "Learning", c: "bg-gold-400", n: cards.filter((x) => x.card.reps > 0 && x.card.stability < 7).length },
    { l: "Young (1–3 weeks)", c: "bg-brand-400", n: cards.filter((x) => x.card.reps > 0 && x.card.stability >= 7 && x.card.stability < 21).length },
    { l: "Mature (3+ weeks)", c: "bg-emerald-500", n: cards.filter((x) => x.card.reps > 0 && x.card.stability >= 21).length },
  ];
  const lapses = cards.reduce((s, x) => s + x.card.lapses, 0);

  const perCourse = courses.map((c) => ({ c, pr: courseProgress(c, p.completed) })).filter((x) => x.pr.done > 0);

  return (
    <AccountShell title="Advanced view" subtitle="Detailed analytics of your learning">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          [total30, "XP in the last 30 days"],
          [`${active}/30`, "active days"],
          [active ? Math.round(total30 / active) : 0, "average XP per active day"],
        ].map(([v, l]) => (
          <div key={String(l)} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="text-2xl font-extrabold text-brand-800">{v}</div>
            <div className="text-sm text-slate-500">{l}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">Daily XP — last 30 days</h2>
        <div className="mt-6 flex h-44 items-end gap-1">
          {days.map(({ d, xp }, i) => (
            <div key={i} className="group relative flex-1" style={{ height: "100%" }}>
              <div
                className={`absolute bottom-0 w-full rounded-t ${xp >= p.dailyGoal ? "bg-gold-400" : "bg-brand-400"}`}
                style={{ height: `${(xp / max) * 100}%`, minHeight: xp ? 3 : 0 }}
              />
              <div className="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-ink px-2 py-1 text-[11px] text-white group-hover:block">
                {d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}: {xp} XP
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>{days[0].d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
          <span>Today</span>
        </div>
        <p className="mt-3 text-xs text-slate-500">Gold bars = daily goal reached ({p.dailyGoal} XP)</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">Memory strength</h2>
          <p className="mt-1 text-sm text-slate-500">How well your {cards.length} words are stored, according to the FSRS algorithm.</p>
          {cards.length > 0 && (
            <div className="mt-5 flex h-4 overflow-hidden rounded-full">
              {buckets.map((b) => b.n > 0 && <div key={b.l} className={b.c} style={{ width: `${(b.n / cards.length) * 100}%` }} />)}
            </div>
          )}
          <ul className="mt-5 space-y-2.5 text-sm">
            {buckets.map((b) => (
              <li key={b.l} className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${b.c}`} />
                <span className="flex-1 text-slate-600">{b.l}</span>
                <b>{b.n}</b>
              </li>
            ))}
            <li className="flex items-center gap-3 border-t border-slate-100 pt-2.5">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="flex-1 text-slate-600">Times forgotten</span>
              <b>{lapses}</b>
            </li>
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">Accuracy by course</h2>
          {perCourse.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">Finish a lesson to see your accuracy.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {perCourse.map(({ c, pr }) => (
                <li key={c.slug}>
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold">{c.title}</span>
                    <span className="text-slate-500">{Math.round(pr.avgAccuracy * 100)}%</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pr.avgAccuracy * 100}%` }} />
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{pr.done} lessons completed</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AccountShell>
  );
}
