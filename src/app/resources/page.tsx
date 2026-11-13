"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Search } from "lucide-react";
import { courseLessons, courses } from "@/data/courses";
import { AccountShell } from "@/components/account/AccountShell";
import { SpeakBtn } from "@/components/lesson/Exercises";
import { ArHint } from "@/components/ArabicToggle";
import { useMounted, useProgress } from "@/lib/store";

type Tab = "words" | "grammar";

export default function Resources() {
  const mounted = useMounted();
  const cards = useProgress((s) => s.cards);
  const [tab, setTab] = useState<Tab>("words");
  const [q, setQ] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  const words = useMemo(
    () =>
      courses.flatMap((c) =>
        courseLessons(c).flatMap((l) => l.words.map((w) => ({ w, course: c.title, lesson: l.title }))),
      ),
    [],
  );
  const grammar = useMemo(
    () => courses.flatMap((c) => courseLessons(c).filter((l) => l.grammar).map((l) => ({ g: l.grammar!, course: c.title, level: c.level, lesson: l.title }))),
    [],
  );

  const s = q.trim().toLowerCase();
  const wordList = words.filter((x) => (!onlyMine || (mounted && cards[x.w.en.toLowerCase()])) && (!s || `${x.w.en} ${x.w.def}`.toLowerCase().includes(s)));
  const grammarList = grammar.filter((x) => !s || `${x.g.title} ${x.g.body}`.toLowerCase().includes(s));

  return (
    <AccountShell title="Resources" subtitle="Every word and grammar tip from the courses, in one place">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2 rounded-xl bg-slate-100 p-1">
          {(["words", "grammar"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === t ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}>
              {t === "words" ? `Word Bank (${words.length})` : `Grammar Library (${grammar.length})`}
            </button>
          ))}
        </div>
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-brand-400" />
        </div>
      </div>

      {tab === "words" ? (
        <>
          <label className="mb-4 flex w-fit cursor-pointer items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="h-4 w-4 accent-brand-600" />
            Only words I&apos;ve learned
          </label>
          <div className="grid gap-3 md:grid-cols-2">
            {wordList.map(({ w, course, lesson }) => {
              const learned = mounted && !!cards[w.en.toLowerCase()];
              return (
                <div key={course + w.en} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="text-3xl">{w.emoji ?? "📝"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-brand-800">{w.en}</span>
                      {learned && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">LEARNED</span>}
                    </div>
                    <div className="text-sm text-slate-600">{w.def}</div>
                    <ArHint className="block text-left text-sm text-gold-600">{w.ar}</ArHint>
                    <div className="mt-1 truncate text-xs text-slate-400">{course} · {lesson}</div>
                  </div>
                  <SpeakBtn text={w.en} size="sm" />
                </div>
              );
            })}
          </div>
          {wordList.length === 0 && <p className="py-10 text-center text-slate-500">No words found.</p>}
        </>
      ) : (
        <div className="space-y-4">
          {grammarList.map(({ g, course, level, lesson }) => (
            <details key={course + lesson} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-brand-200">
              <summary className="flex cursor-pointer list-none items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-gold-50 text-gold-600"><BookOpenText className="h-4 w-4" /></span>
                <span className="flex-1">
                  <span className="block font-bold">{g.title}</span>
                  <span className="block text-xs text-slate-500">{level} · {course} · {lesson}</span>
                </span>
                <span className="text-slate-400 transition group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-4 leading-7 text-slate-700">{g.body}</p>
              <div className="mt-4 space-y-2">
                {g.examples.map((e) => (
                  <div key={e.en} className="flex items-center gap-3 rounded-xl bg-mist p-3">
                    <SpeakBtn text={e.en} size="sm" />
                    <span className="font-semibold text-brand-800">{e.en}</span>
                  </div>
                ))}
              </div>
            </details>
          ))}
        </div>
      )}
    </AccountShell>
  );
}
