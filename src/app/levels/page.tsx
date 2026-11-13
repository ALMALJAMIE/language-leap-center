"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, BookOpen, ChevronRight, Compass, Filter, GraduationCap, Layers, Lightbulb, LayoutGrid } from "lucide-react";
import { courseLessons, courses, levels, programs } from "@/data/courses";
import type { Course, Level, ProgramId } from "@/lib/types";

type Stage = "Foundation" | "Building" | "Confident" | "Fluent" | "Mastery";

const stageOf: Record<Level, Stage> = { A1: "Foundation", A2: "Building", B1: "Confident", B2: "Fluent", C1: "Mastery" };
const difficulty: Record<Level, number> = { A1: 1, A2: 3, B1: 5, B2: 7, C1: 9 };
const stageColor: Record<Stage, { dot: string; text: string; bg: string; bar: string; top: string }> = {
  Foundation: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", bar: "bg-emerald-500", top: "bg-emerald-500" },
  Building: { dot: "bg-sky-500", text: "text-sky-700", bg: "bg-sky-50", bar: "bg-sky-500", top: "bg-sky-500" },
  Confident: { dot: "bg-gold-400", text: "text-gold-700", bg: "bg-gold-50", bar: "bg-gold-400", top: "bg-gold-400" },
  Fluent: { dot: "bg-rose-500", text: "text-rose-700", bg: "bg-rose-50", bar: "bg-rose-500", top: "bg-rose-500" },
  Mastery: { dot: "bg-violet-500", text: "text-violet-700", bg: "bg-violet-50", bar: "bg-violet-500", top: "bg-violet-500" },
};
const levelOrder: Level[] = ["A1", "A2", "B1", "B2", "C1"];

interface SkillLevel {
  id: string;
  program: ProgramId;
  level: Level;
  title: string;
  topics: string;
  stage: Stage;
  difficulty: number;
  courses: Course[];
}

/** One "skill level" per program + CEFR level, built from the course catalog */
function buildLevels(): SkillLevel[] {
  const map = new Map<string, SkillLevel>();
  const progOrder = Object.keys(programs) as ProgramId[];
  [...courses]
    .sort((a, b) => progOrder.indexOf(a.program) - progOrder.indexOf(b.program) || levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level))
    .forEach((c) => {
      const id = `${c.program}-${c.level}`;
      const ex = map.get(id);
      if (ex) {
        ex.courses.push(c);
        return;
      }
      const lessonTitles = courseLessons(c).map((l) => l.title);
      const upcoming = c.modules.flatMap((m) => m.upcoming ?? []);
      const topics = [...lessonTitles, ...upcoming].slice(0, 8).join(" • ") || c.description;
      map.set(id, {
        id,
        program: c.program,
        level: c.level,
        title: `${c.program === "GE" ? "GE" : c.program}-${c.level} ${levels[c.level].name}`,
        topics,
        stage: stageOf[c.level],
        difficulty: c.program === "KIDS" ? 1 : difficulty[c.level] + (c.program === "IELTS" || c.program === "BIZ" ? 1 : 0),
        courses: [c],
      });
    });
  return [...map.values()];
}

export default function LevelsPage() {
  const all = useMemo(() => buildLevels(), []);
  const [prog, setProg] = useState<ProgramId | "all">("all");
  const list = prog === "all" ? all : all.filter((l) => l.program === prog);

  return (
    <div>
      <section className="relative overflow-hidden bg-gradient-to-b from-gold-50/60 via-white to-white">
        <div className="mx-auto max-w-6xl px-6 pb-12 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/" className="hover:text-ink">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses/" className="hover:text-ink">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-ink">Levels</span>
          </nav>

          <div className="mt-10 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-700" /> Skill progression
            </span>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-6xl">
              Find Your <span className="bg-gradient-to-r from-brand-700 via-brand-500 to-gold-500 bg-clip-text text-transparent">English Level</span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
              From your first words to professional fluency — every level is mapped to the CEFR standard, so you always know where you stand and what comes next.
            </p>
            <div className="mx-auto mt-8 inline-flex divide-x divide-slate-200 rounded-2xl border border-slate-200 bg-white text-left shadow-sm">
              <div className="px-6 py-3"><div className="text-2xl font-extrabold">{all.length}</div><div className="text-xs text-slate-500">Skill Levels</div></div>
              <div className="px-6 py-3"><div className="text-2xl font-extrabold">{courses.length}</div><div className="text-xs text-slate-500">Total Courses</div></div>
              <div className="px-6 py-3"><div className="text-2xl font-extrabold">A1–C1</div><div className="text-xs text-slate-500">CEFR Mapped</div></div>
            </div>
          </div>
        </div>
      </section>

      <div className="border-y border-slate-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500"><Filter className="h-3.5 w-3.5" /> Filter</span>
          <label className="relative">
            <select value={prog} onChange={(e) => setProg(e.target.value as ProgramId | "all")} className="appearance-none rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-9 text-sm font-medium outline-none">
              <option value="all">All Programs ({all.length})</option>
              {(Object.keys(programs) as ProgramId[]).map((p) => (
                <option key={p} value={p}>{programs[p].name} ({all.filter((l) => l.program === p).length})</option>
              ))}
            </select>
            <ChevronRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-400" />
          </label>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Journey */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between text-xs">
            <span className="font-bold uppercase tracking-wider text-slate-600">Your learning journey</span>
            <span className="text-slate-400">Start anywhere · Progress at your pace ↔</span>
          </div>
          <div className="no-scrollbar overflow-x-auto pb-2">
            <ol className="relative flex min-w-max gap-2">
              <span className="absolute left-8 right-8 top-5 h-0.5 bg-gradient-to-r from-emerald-300 via-gold-300 to-rose-300" />
              {list.map((l, i) => (
                <li key={l.id}>
                  <a href={`#${l.id}`} className="group relative flex w-24 flex-col items-center text-center">
                    <span className={`relative grid h-10 w-10 place-items-center rounded-full text-sm font-bold text-white shadow ring-4 ring-white transition group-hover:scale-110 ${stageColor[l.stage].dot}`}>
                      {i + 1}
                      <span className="absolute -bottom-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-white text-[9px] font-bold text-slate-600 shadow">{l.courses.length}</span>
                    </span>
                    <span className="mt-2 text-[11px] font-bold leading-tight text-ink">{l.title}</span>
                    <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-400">{l.stage}</span>
                  </a>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            {(Object.keys(stageColor) as Stage[]).map((s) => (
              <span key={s} className="flex items-center gap-1.5"><span className={`h-2 w-2 rounded-full ${stageColor[s].dot}`} /> {s}</span>
            ))}
          </div>
        </div>

        {/* Level cards */}
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l, i) => {
            const c = stageColor[l.stage];
            return (
              <div key={l.id} id={l.id} className="relative flex scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
                <span className={`h-1 ${c.top}`} />
                <Layers className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 text-slate-50" />
                <div className="relative flex-1 p-6">
                  <div className="flex items-start justify-between">
                    <span className={`flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${c.bg} ${c.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} /> {l.stage}
                    </span>
                    <span className={`grid h-10 w-10 place-items-center rounded-xl text-lg font-extrabold text-white shadow ${c.dot}`}>{i + 1}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-ink">{l.title}</h3>
                  <p className="text-xs font-semibold text-slate-400">{programs[l.program].icon} {programs[l.program].name}</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">{l.topics}</p>
                  <div className="mt-5">
                    <div className="flex justify-between text-[11px] font-bold uppercase tracking-wide text-slate-500">
                      <span>Difficulty</span>
                      <span className={c.text}>{l.difficulty}/10</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${c.bar}`} style={{ width: `${l.difficulty * 10}%` }} />
                    </div>
                  </div>
                </div>
                <div className="relative flex items-center justify-between border-t border-slate-100 px-6 py-3.5 text-sm">
                  <span className="flex items-center gap-1.5 text-slate-500"><BookOpen className="h-4 w-4" /> <b className="text-ink">{l.courses.length}</b> {l.courses.length === 1 ? "course" : "courses"}</span>
                  <Link href={`/courses/?program=${l.program}&level=${l.level}`} className={`flex items-center gap-1 font-bold ${c.text}`}>
                    Explore <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Placement CTA */}
        <div className="relative mx-auto mt-16 max-w-4xl overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#061a37_0%,#0a2852_55%,#845b13_100%)] p-8 text-white sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="max-w-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                <Lightbulb className="h-3.5 w-3.5 text-gold-300" /> Not sure yet?
              </span>
              <h2 className="mt-4 text-3xl font-extrabold">Take a quick placement quiz</h2>
              <p className="mt-2 text-brand-100">Answer a few questions and we&apos;ll recommend the level that matches your current skills — it takes less than 5 minutes.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/placement/" className="flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-ink hover:bg-gold-50"><Compass className="h-4 w-4" /> Start Placement</Link>
              <Link href="/courses/" className="flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3 font-bold hover:bg-white/10"><LayoutGrid className="h-4 w-4" /> Browse All</Link>
            </div>
          </div>
        </div>
      </div>

      {/* More ways */}
      <section className="-mb-24 bg-slate-50 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold">Explore more ways to learn</h2>
          <p className="mt-2 text-slate-500">Discover courses by program or practise with a teacher.</p>
          <div className="mt-8 grid gap-4 text-left sm:grid-cols-2">
            <Link href="/courses/" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-700"><LayoutGrid className="h-5 w-5" /></span>
              <span className="flex-1"><b className="block">Browse by Program</b><span className="text-sm text-slate-500">General, Kids, Conversation, Business, IELTS</span></span>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
            <Link href="/private-lessons/" className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold-50 text-gold-600"><GraduationCap className="h-5 w-5" /></span>
              <span className="flex-1"><b className="block">Private Lessons</b><span className="text-sm text-slate-500">Practise 1-on-1 with a teacher</span></span>
              <ArrowRight className="h-5 w-5 text-slate-400" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
