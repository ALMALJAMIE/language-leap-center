"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BarChart3, ChevronLeft, ChevronRight, Layers, LayoutGrid, MessagesSquare, PlayCircle, Search, SlidersHorizontal, UserPlus, X, DollarSign, GraduationCap } from "lucide-react";
import { courseLessons, courses, courseTypes, levels, programs, totals } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import type { CourseType, Level, ProgramId } from "@/lib/types";
import { site } from "@/lib/site";

type Sort = "curated" | "newest" | "level" | "priceAsc" | "priceDesc" | "lessons" | "alpha";

const sorts: Record<Sort, string> = {
  curated: "Curated",
  newest: "Newest First",
  level: "Level: Beginner first",
  lessons: "Most Lessons Ready",
  priceAsc: "Price: Low to High",
  priceDesc: "Price: High to Low",
  alpha: "Alphabetical",
};

const levelOrder: Level[] = ["A1", "A2", "B1", "B2", "C1"];
const typeIcons: Record<CourseType, React.ReactNode> = {
  self: <PlayCircle className="h-4 w-4 text-gold-500" />,
  live: <GraduationCap className="h-4 w-4 text-red-500" />,
  mixed: <Layers className="h-4 w-4 text-brand-500" />,
};

function toggle<T>(list: T[], v: T) {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function FilterCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-4 flex items-center gap-2 font-bold text-ink">{icon} {title}</h4>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Check({ on, onChange, children }: { on: boolean; onChange: () => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] text-slate-700 hover:text-ink">
      <input type="checkbox" checked={on} onChange={onChange} className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-brand-700" />
      <span className="flex items-start gap-2">{children}</span>
    </label>
  );
}

function FilterChip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1.5 text-sm text-brand-800">
      {children}
      <button onClick={onRemove} aria-label="Remove filter" className="rounded-full p-0.5 hover:bg-brand-100"><X className="h-3.5 w-3.5" /></button>
    </span>
  );
}

export function Catalog() {
  const params = useSearchParams();
  const p0 = params.get("program") as ProgramId | null;
  const l0 = params.get("level") as Level | null;

  const [q, setQ] = useState(params.get("q") ?? "");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [progs, setProgs] = useState<ProgramId[]>(p0 && programs[p0] ? [p0] : []);
  const [lvls, setLvls] = useState<Level[]>(l0 && levels[l0] ? [l0] : []);
  const [types, setTypes] = useState<CourseType[]>([]);
  const [prices, setPrices] = useState<("free" | "paid")[]>([]);
  const [sort, setSort] = useState<Sort>("curated");
  const [perPage, setPerPage] = useState(12);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [browse, setBrowse] = useState<null | "programs" | "levels">(null);

  const list = useMemo(() => {
    const s = query.trim().toLowerCase();
    const r = courses.filter(
      (c) =>
        (!progs.length || progs.includes(c.program)) &&
        (!lvls.length || lvls.includes(c.level)) &&
        (!types.length || types.includes(c.type)) &&
        (!prices.length || prices.includes(c.price === 0 ? "free" : "paid")) &&
        (!s ||
          `${c.title} ${c.description} ${c.code} ${programs[c.program].name} ${courseLessons(c)
            .map((l) => `${l.title} ${l.words.map((w) => w.en).join(" ")}`)
            .join(" ")}`
            .toLowerCase()
            .includes(s)),
    );
    const by: Record<Sort, (a: (typeof r)[0], b: (typeof r)[0]) => number> = {
      curated: (a, b) => a.order - b.order,
      newest: (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.order - a.order,
      level: (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level) || a.order - b.order,
      lessons: (a, b) => courseLessons(b).length - courseLessons(a).length,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      alpha: (a, b) => a.title.localeCompare(b.title),
    };
    return [...r].sort(by[sort]);
  }, [query, progs, lvls, types, prices, sort]);

  const pages = Math.max(1, Math.ceil(list.length / perPage));
  const current = Math.min(page, pages);
  const shown = list.slice((current - 1) * perPage, current * perPage);
  const anyFilter = progs.length || lvls.length || types.length || prices.length || query;
  const t = totals();
  const reset = () => {
    setProgs([]); setLvls([]); setTypes([]); setPrices([]); setQ(""); setQuery(""); setPage(1);
  };
  const toResults = () => document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });

  const filters = (
    <div className="space-y-5">
      <FilterCard icon={<LayoutGrid className="h-4 w-4 text-brand-700" />} title="Programs">
        {(Object.keys(programs) as ProgramId[]).map((id) => (
          <Check key={id} on={progs.includes(id)} onChange={() => { setProgs((x) => toggle(x, id)); setPage(1); }}>
            <span>{programs[id].icon}</span>
            <span>{programs[id].name}</span>
          </Check>
        ))}
      </FilterCard>
      <FilterCard icon={<BarChart3 className="h-4 w-4 text-brand-700" />} title="Level (CEFR)">
        {levelOrder.map((l) => (
          <Check key={l} on={lvls.includes(l)} onChange={() => { setLvls((x) => toggle(x, l)); setPage(1); }}>
            <b className="w-7 text-brand-700">{l}</b> {levels[l].name}
          </Check>
        ))}
      </FilterCard>
      <FilterCard icon={<PlayCircle className="h-4 w-4 text-brand-700" />} title="Course Type">
        {(Object.keys(courseTypes) as CourseType[]).map((k) => (
          <Check key={k} on={types.includes(k)} onChange={() => { setTypes((x) => toggle(x, k)); setPage(1); }}>
            {typeIcons[k]} {courseTypes[k]}
          </Check>
        ))}
      </FilterCard>
      <FilterCard icon={<DollarSign className="h-4 w-4 text-gold-500" />} title="Price">
        <Check on={prices.includes("free")} onChange={() => { setPrices((x) => toggle(x, "free" as const)); setPage(1); }}>Free</Check>
        <Check on={prices.includes("paid")} onChange={() => { setPrices((x) => toggle(x, "paid" as const)); setPage(1); }}>Paid</Check>
      </FilterCard>
      {anyFilter ? (
        <button onClick={reset} className="w-full rounded-xl border-2 border-slate-200 py-2.5 text-sm font-bold text-slate-600 hover:border-brand-300">
          Clear all filters
        </button>
      ) : null}
    </div>
  );

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
        <div className="absolute -bottom-32 -right-10 h-80 w-80 rounded-full border-[40px] border-gold-400/10" />
        <div className="relative mx-auto max-w-4xl px-6 py-16 text-center">
          <h1 className="text-4xl font-extrabold sm:text-5xl">Discover English Courses</h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-brand-100">
            Learn English through interactive lessons, speaking practice and support from our teachers — with a clear path for every level and goal.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setQuery(q);
              setPage(1);
              toResults();
            }}
            className="mx-auto mt-8 flex max-w-xl overflow-hidden rounded-xl bg-white shadow-xl"
          >
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                if (!e.target.value) setQuery("");
              }}
              placeholder="Search courses, topics, words…"
              className="flex-1 px-5 py-4 text-ink outline-none"
            />
            <button aria-label="Search" className="grid w-16 place-items-center bg-gold-500 text-white hover:bg-gold-600">
              <Search className="h-5 w-5" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm">
            <span className="text-brand-200">Browse by:</span>
            {(["programs", "levels"] as const).map((b) => (
              <button
                key={b}
                onClick={() => setBrowse(browse === b ? null : b)}
                className={`flex items-center gap-1.5 rounded-full border px-4 py-1.5 transition ${browse === b ? "border-gold-400 bg-gold-400 text-brand-950" : "border-white/25 bg-white/5 hover:bg-white/10"}`}
              >
                {b === "programs" ? <LayoutGrid className="h-3.5 w-3.5" /> : <BarChart3 className="h-3.5 w-3.5" />}
                {b === "programs" ? "Programs" : "Levels"}
              </button>
            ))}
            <Link href="/private-lessons/" className="flex items-center gap-1.5 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 hover:bg-white/10">
              <GraduationCap className="h-3.5 w-3.5" /> Private Lessons
            </Link>
          </div>
          {browse && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {browse === "programs"
                ? (Object.keys(programs) as ProgramId[]).map((id) => (
                    <button key={id} onClick={() => { setProgs([id]); setPage(1); setBrowse(null); toResults(); }} className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                      {programs[id].icon} {programs[id].name}
                    </button>
                  ))
                : levelOrder.map((l) => (
                    <button key={l} onClick={() => { setLvls([l]); setPage(1); setBrowse(null); toResults(); }} className="rounded-xl bg-white/10 px-3 py-2 text-sm hover:bg-white/20">
                      <b>{l}</b> {levels[l].name}
                    </button>
                  ))}
            </div>
          )}

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [t.courses, "Courses"],
              [t.lessons, "Interactive Lessons"],
              [t.words, "Words with Audio"],
              ["A1–C1", "CEFR Levels"],
            ].map(([n, l]) => (
              <div key={String(l)}>
                <div className="text-3xl font-extrabold">{n}</div>
                <div className="text-sm text-brand-200">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Results */}
      <div id="results" className="mx-auto grid max-w-7xl scroll-mt-28 gap-8 px-6 py-12 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">{filters}</aside>

        <div>
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-ink">{query ? `Results for “${query}”` : "All Courses"}</h2>
              <p className="text-sm text-slate-500">{list.length} courses found</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <button onClick={() => setMobileFilters(true)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 lg:hidden">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </button>
              <label className="flex items-center gap-2 text-slate-500">
                Sort by:
                <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-ink outline-none">
                  {Object.entries(sorts).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-slate-500">
                Show:
                <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-ink outline-none">
                  {[6, 12, 24, 36].map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </label>
            </div>
          </div>

          {anyFilter ? (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              {progs.map((id) => <FilterChip key={id} onRemove={() => setProgs((x) => x.filter((y) => y !== id))}>{programs[id].name}</FilterChip>)}
              {lvls.map((l) => <FilterChip key={l} onRemove={() => setLvls((x) => x.filter((y) => y !== l))}>{l} {levels[l].name}</FilterChip>)}
              {types.map((k) => <FilterChip key={k} onRemove={() => setTypes((x) => x.filter((y) => y !== k))}>{courseTypes[k]}</FilterChip>)}
              {prices.map((k) => <FilterChip key={k} onRemove={() => setPrices((x) => x.filter((y) => y !== k))}>{k === "free" ? "Free" : "Paid"}</FilterChip>)}
              {query && <FilterChip onRemove={() => { setQ(""); setQuery(""); }}>“{query}”</FilterChip>}
              <button onClick={reset} className="text-sm font-bold text-brand-600">Clear all</button>
            </div>
          ) : null}

          {shown.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              No courses match your filters.
              <button onClick={reset} className="mx-auto mt-4 block font-bold text-brand-600">Clear all filters</button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {shown.map((c) => <CourseCard key={c.slug} course={c} />)}
            </div>
          )}

          {pages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button disabled={current === 1} onClick={() => setPage(current - 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 disabled:opacity-40" aria-label="Previous page"><ChevronLeft className="h-4 w-4" /></button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)} className={`h-10 w-10 rounded-xl text-sm font-bold ${n === current ? "bg-brand-800 text-white" : "border border-slate-200 text-slate-600 hover:border-brand-300"}`}>{n}</button>
              ))}
              <button disabled={current === pages} onClick={() => setPage(current + 1)} className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 disabled:opacity-40" aria-label="Next page"><ChevronRight className="h-4 w-4" /></button>
            </div>
          )}
        </div>
      </div>

      {/* Call to action */}
      <section className="-mb-24 bg-brand-50/60">
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h2 className="text-3xl font-extrabold text-ink">Ready to Start Your English Journey?</h2>
          <p className="mt-3 text-slate-600">Start today with a free course, short daily lessons and a team that answers your questions.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register/" className="flex items-center gap-2 rounded-xl bg-[linear-gradient(100deg,#0b326d_0%,#1f66c8_60%,#efb52a_100%)] px-6 py-3 font-bold text-white shadow-lg hover:brightness-110">
              <UserPlus className="h-5 w-5" /> Start for Free
            </Link>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-bold text-ink hover:border-brand-400">
              <MessagesSquare className="h-5 w-5" /> Talk to Our Team
            </a>
          </div>
        </div>
      </section>

      {mobileFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setMobileFilters(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-auto rounded-t-3xl bg-slate-50 p-5" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Filters</h3>
              <button onClick={() => setMobileFilters(false)} aria-label="Close"><X /></button>
            </div>
            {filters}
            <button onClick={() => setMobileFilters(false)} className="btn-primary mt-5 w-full py-3">Show {list.length} courses</button>
          </div>
        </div>
      )}
    </div>
  );
}
