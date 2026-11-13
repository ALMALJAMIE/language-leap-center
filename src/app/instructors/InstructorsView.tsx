"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck, BarChart3, CalendarPlus, ChevronDown, ChevronRight, GraduationCap, Heart, LayoutGrid,
  MessageCircleQuestion, Presentation, Search, SlidersHorizontal, Sparkles, Users, X,
} from "lucide-react";
import { programs } from "@/data/courses";
import type { Instructor } from "@/data/instructors";
import { loadTeachers, useTeacherList } from "@/lib/teaching";
import { InstructorCard } from "@/components/Instructors";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { site } from "@/lib/site";
import { useRole } from "@/lib/roles";
import type { ProgramId } from "@/lib/types";

const sorts = {
  rated: { label: "Top rated", fn: (a: Instructor, b: Instructor) => (b.rating ?? 0) - (a.rating ?? 0) || (b.reviews ?? 0) - (a.reviews ?? 0) },
  experience: { label: "Most experienced", fn: (a: Instructor, b: Instructor) => (b.experienceYears ?? 0) - (a.experienceYears ?? 0) },
  courses: { label: "Most courses", fn: (a: Instructor, b: Instructor) => (b.courses?.length ?? 0) - (a.courses?.length ?? 0) },
  price: { label: "Price: low to high", fn: (a: Instructor, b: Instructor) => (a.hourly ?? 9999) - (b.hourly ?? 9999) },
  name: { label: "Name (A–Z)", fn: (a: Instructor, b: Instructor) => a.name.localeCompare(b.name) },
} as const;
type SortId = keyof typeof sorts;

interface Filters {
  q: string;
  lang: string;
  spec: ProgramId | "all";
  sort: SortId;
}

export function InstructorsView() {
  const params = useSearchParams();
  return <View key={params.toString()} params={params} />;
}

function View({ params }: { params: URLSearchParams }) {
  const initSpec = params.get("specialty") as ProgramId | null;
  const start: Filters = {
    q: params.get("q") ?? "",
    lang: "all",
    spec: initSpec && initSpec in programs ? initSpec : "all",
    sort: "rated",
  };
  const [draft, setDraft] = useState<Filters>(start);
  const [applied, setApplied] = useState<Filters>(start);
  const instructors = useTeacherList((s) => s.list);
  const staff = !!useRole((s) => s.role);
  useEffect(() => {
    loadTeachers();
  }, []);
  const langs = useMemo(() => [...new Set(instructors.flatMap((i) => i.languages))].sort(), [instructors]);

  const list = useMemo(() => {
    const q = applied.q.trim().toLowerCase();
    return instructors
      .filter((t) => !q || `${t.name} ${t.title} ${t.bio}`.toLowerCase().includes(q))
      .filter((t) => applied.lang === "all" || t.languages.includes(applied.lang))
      .filter((t) => applied.spec === "all" || t.specialties.includes(applied.spec))
      .sort(sorts[applied.sort].fn);
  }, [applied, instructors]);

  const filtered = applied.q.trim() !== "" || applied.lang !== "all" || applied.spec !== "all";
  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    setApplied(draft);
  };
  const clear = () => {
    const blank: Filters = { q: "", lang: "all", spec: "all", sort: draft.sort };
    setDraft(blank);
    setApplied(blank);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-[linear-gradient(135deg,#fdf8ec_0%,#ffffff_45%,#eef4fd_100%)]">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-8">
          <nav className="flex items-center gap-1.5 text-sm text-slate-500">
            <Link href="/" className="hover:text-ink">Home</Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/courses/" className="hover:text-ink">Courses</Link>
            <ChevronRight className="h-4 w-4" />
            <span className="font-semibold text-ink">Instructors</span>
          </nav>
          <div className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-[linear-gradient(135deg,#0a2852,#0f4ca7_60%,#efb52a)] text-white shadow-lg">
            <Presentation className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">Meet Our Expert Instructors</h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            Learn with qualified English teachers who know how Arabic speakers learn. Our instructors plan every lesson around your goal — speaking with confidence, passing an exam, or using English at work.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            <span className="flex items-center gap-1.5"><Users className="h-4 w-4 text-gold-500" /> {instructors.length > 1 ? `${instructors.length} Expert Instructors` : "Qualified English Teachers"}</span>
            <span className="flex items-center gap-1.5"><CalendarPlus className="h-4 w-4 text-gold-500" /> Private 1-on-1 Lessons</span>
            <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-brand-700" /> Verified Profiles</span>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-slate-100 bg-white">
        <form onSubmit={apply} className="mx-auto max-w-6xl px-6 py-8">
          <div className="grid gap-4 md:grid-cols-[2fr_1.2fr_1fr_1fr]">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Search</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={draft.q}
                  onChange={(e) => setDraft({ ...draft, q: e.target.value })}
                  placeholder="Search by name, title, or bio"
                  className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                />
              </span>
            </label>
            <Select label="Language" value={draft.lang} onChange={(v) => setDraft({ ...draft, lang: v })}>
              <option value="all">All languages</option>
              {langs.map((l) => <option key={l} value={l}>{l}</option>)}
            </Select>
            <Select label="Specialty" value={draft.spec} onChange={(v) => setDraft({ ...draft, spec: v as ProgramId | "all" })}>
              <option value="all">All specialties</option>
              {(Object.keys(programs) as ProgramId[]).map((p) => <option key={p} value={p}>{programs[p].name}</option>)}
            </Select>
            <Select label="Sort by" value={draft.sort} onChange={(v) => setDraft({ ...draft, sort: v as SortId })}>
              {(Object.keys(sorts) as SortId[]).map((s) => <option key={s} value={s}>{sorts[s].label}</option>)}
            </Select>
          </div>
          <div className="mt-5 flex items-center gap-4">
            <button type="submit" className="flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#0a2852,#0f4ca7_55%,#efb52a)] px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110">
              <SlidersHorizontal className="h-4 w-4" /> Apply
            </button>
            {filtered && (
              <button type="button" onClick={clear} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-ink">
                <X className="h-4 w-4" /> Clear filters
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Results */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        {instructors.length === 0 ? (
          <ComingSoon />
        ) : list.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-200 p-12 text-center">
            <Search className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-bold">No instructors match these filters</p>
            <button onClick={clear} className="mt-4 rounded-xl border-2 border-slate-200 px-5 py-2 text-sm font-bold hover:border-brand-400">Clear filters</button>
          </div>
        ) : (
          <>
            <p className="mb-6 text-sm text-slate-500">Showing <b className="text-ink">{list.length}</b> {list.length === 1 ? "instructor" : "instructors"}</p>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((t) => <InstructorCard key={t.slug} t={t} />)}
            </div>
          </>
        )}
      </section>

      {/* Why */}
      <section className="bg-slate-50 py-16">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Why Learn with Our Instructors?</h2>
          <p className="mt-3 text-slate-500">Experienced teachers who care about your progress</p>
          <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: GraduationCap, bg: "bg-gold-500", t: "Fluent & Native Speakers", d: "Hear natural, real-world English with clear pronunciation" },
              { icon: BadgeCheck, bg: "bg-brand-900", t: "Qualified Teachers", d: "Trained in teaching English as a foreign language" },
              { icon: MessageCircleQuestion, bg: "bg-gold-400", t: "Personal Feedback", d: "Corrections on your speaking and writing, lesson by lesson" },
              { icon: Heart, bg: "bg-gold-600", t: "Passionate Educators", d: "Dedicated to your success and your learning journey" },
            ].map((f) => (
              <div key={f.t}>
                <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full text-white shadow ${f.bg}`}><f.icon className="h-7 w-7" /></span>
                <h3 className="mt-5 font-bold text-ink">{f.t}</h3>
                <p className="mx-auto mt-2 max-w-60 text-sm leading-6 text-slate-500">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Explore more */}
      <section hidden={staff} className="-mb-24 bg-brand-50/40 py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-extrabold text-ink sm:text-4xl">Explore More Learning Options</h2>
          <p className="mt-3 text-slate-500">Browse courses by program or difficulty level to find the perfect match</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/courses/" className="flex items-center gap-2 rounded-xl bg-[linear-gradient(90deg,#0a2852,#0f4ca7_55%,#efb52a)] px-6 py-3 font-bold text-white shadow-lg transition hover:brightness-110">
              <LayoutGrid className="h-4 w-4" /> Browse by Program
            </Link>
            <Link href="/levels/" className="flex items-center gap-2 rounded-xl border-2 border-brand-900 bg-white px-6 py-3 font-bold text-brand-900 transition hover:bg-brand-50">
              <BarChart3 className="h-4 w-4" /> Browse by Level
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <span className="relative block">
        <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full appearance-none rounded-lg border border-slate-300 bg-white py-2.5 pl-3 pr-9 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </span>
    </label>
  );
}

/** Shown until real teacher profiles are added to src/data/instructors.ts */
function ComingSoon() {
  const text = "Hello Language Leap Center! I'd like to book a private English lesson with one of your teachers.";
  return (
    <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <Sparkles className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-gold-50" />
      <div className="relative mx-auto max-w-xl">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-brand-50 text-brand-700"><Users className="h-8 w-8" /></span>
        <h2 className="mt-5 text-2xl font-extrabold text-ink">Instructor profiles are coming soon</h2>
        <p className="mt-3 leading-7 text-slate-600">
          We&apos;re adding our teachers&apos; profiles here. You can already book a private lesson — tell us your goal and level, and our team will match you with the right teacher.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/private-lessons/" className="flex items-center gap-2 rounded-xl bg-gold-500 px-6 py-3 font-bold text-brand-950 transition hover:bg-gold-400">
            <CalendarPlus className="h-4 w-4" /> Book a private lesson
          </Link>
          <a href={`${site.whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-bold text-white transition hover:bg-emerald-700">
            <WhatsAppIcon className="h-4 w-4" /> Ask on WhatsApp
          </a>
        </div>
        <p className="mt-6 text-sm text-slate-500">
          Are you an English teacher? <a href={`mailto:${site.email}?subject=${encodeURIComponent("Teaching at Language Leap Center")}`} className="font-semibold text-brand-700 hover:underline">Teach with us</a>
        </p>
      </div>
    </div>
  );
}
