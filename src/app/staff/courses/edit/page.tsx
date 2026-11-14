"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import {
  ArrowDown, ArrowLeft, ArrowUp, BookOpen, CheckCircle2, ChevronDown, ExternalLink, FileText, Link2, Loader2, Lock, Music, Plus, Save, Trash2, Upload, Video,
} from "lucide-react";
import { supabase } from "@/lib/auth";
import { builtInCourses, courseTypes, lessonHref, levels, programs } from "@/data/courses";
import { loadCatalog, rowToCourse, type CourseRow } from "@/lib/catalog";
import { rpcError, useRole } from "@/lib/roles";
import type { Course, CourseType, LessonSpec, Level, Module, ProgramId } from "@/lib/types";
import { ErrorNote, StaffShell } from "@/components/staff/StaffShell";
import { Tabs } from "@/components/teaching/ui";

export default function CourseEditorPage() {
  return (
    <StaffShell page="/staff/courses/edit/" title="Course Builder" wide>
      <Suspense><Loader /></Suspense>
    </StaffShell>
  );
}

const blank = (): Course => ({
  slug: "", code: "", program: "GE", level: "A1", title: "", description: "", outcomes: [], skills: ["Listening", "Speaking", "Vocabulary", "Grammar"],
  hours: 10, type: "self", price: 0, certificate: true, cover: { from: "#1f66c8", to: "#0b326d", icon: "📘" }, modules: [{ title: "Unit 1", lessons: [] }], order: 50,
});
const clone = <T,>(x: T): T => JSON.parse(JSON.stringify(x));

function Loader() {
  const params = useSearchParams();
  const slug = params.get("c");
  const [state, setState] = useState<{ course: Course; published: boolean; saved: boolean } | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    let live = true;
    (async () => {
      if (!slug) return setState({ course: blank(), published: false, saved: false });
      const { data, error } = await supabase.from("courses").select("slug,data,price,published,updated_at").eq("slug", slug).maybeSingle();
      if (!live) return;
      if (error) setErr(/does not exist|schema cache/i.test(error.message) ? "Run supabase/content.sql in the Supabase SQL Editor first." : rpcError(error));
      if (data) return setState({ course: rowToCourse(data as CourseRow), published: (data as CourseRow).published, saved: true });
      const b = builtInCourses.find((c) => c.slug === slug);
      if (b) return setState({ course: clone(b), published: true, saved: false });
      setErr("Course not found.");
    })();
    return () => {
      live = false;
    };
  }, [slug]);

  if (err && !state) return <div className="mx-auto max-w-3xl px-6 py-10"><ErrorNote text={err} /><Link href="/staff/courses/" className="text-sm font-semibold text-brand-700">← All courses</Link></div>;
  if (!state) return <div className="py-20"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>;
  return <Editor key={slug ?? "new"} initial={state} isBuiltIn={!!slug && builtInCourses.some((c) => c.slug === slug)} loadErr={err} />;
}

const inp = "w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500 disabled:bg-slate-50 disabled:text-slate-500";
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
const newId = (slug: string) => `${slug || "lesson"}-${Math.random().toString(36).slice(2, 7)}`;

function Editor({ initial, isBuiltIn, loadErr }: { initial: { course: Course; published: boolean; saved: boolean }; isBuiltIn: boolean; loadErr: string }) {
  const router = useRouter();
  const role = useRole((s) => s.role);
  const canContent = role === "admin" || role === "academic";
  const canPrice = role === "admin" || role === "finance";
  const [c, setC] = useState<Course>(initial.course);
  const [published, setPublished] = useState(initial.published);
  const [saved, setSaved] = useState(initial.saved);
  const [tab, setTab] = useState<"details" | "content" | "materials">("details");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState(loadErr);
  const [dirty, setDirty] = useState(false);
  const isNew = !saved && !isBuiltIn;

  const set = (patch: Partial<Course>) => {
    setC((x) => ({ ...x, ...patch }));
    setDirty(true);
    setMsg("");
  };
  const setModules = (modules: Module[]) => set({ modules });

  const problems = (): string[] => {
    const p: string[] = [];
    if (!c.title.trim()) p.push("The course needs a title.");
    if (!/^[a-z0-9][a-z0-9-]{2,59}$/.test(c.slug) || c.slug === "view") p.push("The web address (slug) must be 3–60 lowercase letters, numbers or dashes.");
    c.modules.forEach((m, mi) => m.lessons.forEach((l, li) => {
      if (!l.title.trim()) p.push(`Unit ${mi + 1}, lesson ${li + 1} has no title.`);
      if (l.words.some((w) => !w.en.trim() || !w.def.trim())) p.push(`“${l.title || `Lesson ${li + 1}`}”: every word needs the word and its meaning.`);
    }));
    return p;
  };

  const save = async (publish: boolean) => {
    const p = problems();
    if (p.length) return setErr(p.join(" "));
    setBusy(true);
    setErr("");
    const { slug, price, ...data } = c;
    const row = { slug, data, price, published: publish };
    const { error } = await supabase.from("courses").upsert(row, { onConflict: "slug" });
    setBusy(false);
    if (error) return setErr(/duplicate|unique/i.test(error.message) ? "Another course already uses this web address." : rpcError(error));
    setSaved(true);
    setPublished(publish);
    setDirty(false);
    setMsg(publish ? "Saved and published. Learners see the new version now." : "Saved as a draft. Learners don't see it yet.");
    loadCatalog(true);
    if (isNew) router.replace(`/staff/courses/edit/?c=${slug}`);
  };

  const lessons = c.modules.flatMap((m) => m.lessons);
  const firstLesson = lessons[0];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <Link href="/staff/courses/" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> All courses</Link>
      <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `linear-gradient(135deg, ${c.cover.from}, ${c.cover.to})` }}>{c.cover.icon}</span>
          <div>
            <h1 className="text-2xl font-extrabold">{c.title || "New course"}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
              {published && saved ? <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-bold text-emerald-700">Live</span> : saved ? <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-bold text-amber-700">Draft</span> : isBuiltIn ? <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-600">Built-in — not edited yet</span> : <span className="rounded-full bg-slate-100 px-2.5 py-0.5 font-bold text-slate-600">Not saved</span>}
              <span className="text-slate-500">{lessons.length} lessons · {c.modules.length} units</span>
              {dirty && <span className="font-semibold text-amber-600">Unsaved changes</span>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {firstLesson && saved && <Link href={lessonHref(c.slug, firstLesson.id)} target="_blank" className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:border-brand-400">Preview <ExternalLink className="h-3.5 w-3.5" /></Link>}
          {canContent && <button disabled={busy} onClick={() => save(false)} className="flex items-center gap-1.5 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold hover:border-brand-400 disabled:opacity-50"><Save className="h-4 w-4" /> Save draft</button>}
          <button disabled={busy} onClick={() => save(canContent ? true : published)} className="btn-primary flex items-center gap-1.5 px-5 py-2.5 text-sm disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} {canContent ? "Save & publish" : "Save price"}
          </button>
        </div>
      </div>
      {msg && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}
      {err && <div className="mt-4"><ErrorNote text={err} /></div>}

      <div className="mt-6">
        <Tabs value={tab} onChange={setTab} items={[{ id: "details", label: "Details" }, { id: "content", label: "Units & lessons", count: lessons.length }, { id: "materials", label: "Materials" }]} />
      </div>

      {tab === "details" && <Details c={c} set={set} isNew={isNew} canContent={canContent} canPrice={canPrice} />}
      {tab === "content" && <Content c={c} setModules={setModules} disabled={!canContent} />}
      {tab === "materials" && (saved ? <Materials c={c} canEdit={canContent} /> : <p className="rounded-2xl bg-slate-50 p-6 text-sm text-slate-600">Save the course first, then add its materials (curriculum PDF, audio, links).</p>)}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Field({ label, children, hint, wide }: { label: string; children: React.ReactNode; hint?: string; wide?: boolean }) {
  return (
    <label className={`block ${wide ? "sm:col-span-2" : ""}`}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
    </label>
  );
}

function Details({ c, set, isNew, canContent, canPrice }: { c: Course; set: (p: Partial<Course>) => void; isNew: boolean; canContent: boolean; canPrice: boolean }) {
  const d = !canContent;
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <section className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        <Field label="Title" wide><input disabled={d} value={c.title} onChange={(e) => set({ title: e.target.value, ...(isNew ? { slug: slugify(e.target.value) } : {}) })} className={inp} placeholder="General English 6 — Proficiency" /></Field>
        <Field label="Web address (slug)" hint={isNew ? "Used in the course link. It can't change after the first save." : "Fixed after the first save."}><input disabled={!isNew || d} value={c.slug} onChange={(e) => set({ slug: slugify(e.target.value) })} className={inp} /></Field>
        <Field label="Code"><input disabled={d} value={c.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} className={inp} placeholder="GE-C2" /></Field>
        <Field label="Program"><select disabled={d} value={c.program} onChange={(e) => set({ program: e.target.value as ProgramId })} className={inp}>{(Object.keys(programs) as ProgramId[]).map((p) => <option key={p} value={p}>{programs[p].name}</option>)}</select></Field>
        <Field label="Level"><select disabled={d} value={c.level} onChange={(e) => set({ level: e.target.value as Level })} className={inp}>{(Object.keys(levels) as Level[]).map((l) => <option key={l} value={l}>{l} — {levels[l].name}</option>)}</select></Field>
        <Field label="Course type" hint="Self-paced courses have no attendance or grades. Live classes are set up later in Terms & Classes."><select disabled={d} value={c.type} onChange={(e) => set({ type: e.target.value as CourseType })} className={inp}>{(Object.keys(courseTypes) as CourseType[]).map((t) => <option key={t} value={t}>{courseTypes[t]}</option>)}</select></Field>
        <Field label="Study hours"><input disabled={d} type="number" min={1} value={c.hours} onChange={(e) => set({ hours: Number(e.target.value) || 0 })} className={inp} /></Field>
        <Field label="Description" wide><textarea disabled={d} rows={3} value={c.description} onChange={(e) => set({ description: e.target.value })} className={inp} /></Field>
        <Field label="What learners will be able to do (one per line)" wide><textarea disabled={d} rows={4} value={c.outcomes.join("\n")} onChange={(e) => set({ outcomes: e.target.value.split("\n") })} className={inp} /></Field>
        <Field label="Skills (comma separated)" wide><input disabled={d} value={c.skills.join(", ")} onChange={(e) => set({ skills: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} className={inp} /></Field>
        <Field label="Age group (optional)"><input disabled={d} value={c.ageGroup ?? ""} onChange={(e) => set({ ageGroup: e.target.value || undefined })} className={inp} placeholder="Ages 7–12" /></Field>
        <Field label="Order in the catalog"><input disabled={d} type="number" value={c.order} onChange={(e) => set({ order: Number(e.target.value) || 0 })} className={inp} /></Field>
        <div className="flex flex-wrap gap-5 sm:col-span-2">
          <label className="flex items-center gap-2 text-sm"><input disabled={d} type="checkbox" checked={c.certificate} onChange={(e) => set({ certificate: e.target.checked })} /> Certificate on completion</label>
          <label className="flex items-center gap-2 text-sm"><input disabled={d} type="checkbox" checked={!!c.isNew} onChange={(e) => set({ isNew: e.target.checked })} /> Show the “New” badge</label>
        </div>
      </section>
      <aside className="space-y-4">
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="font-bold">Cover</h3>
          <div className="mt-3 grid h-28 place-items-center rounded-2xl text-5xl" style={{ background: `linear-gradient(135deg, ${c.cover.from}, ${c.cover.to})` }}>{c.cover.icon}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <label>Icon<input disabled={d} value={c.cover.icon} onChange={(e) => set({ cover: { ...c.cover, icon: e.target.value.slice(0, 4) } })} className={`${inp} mt-1 text-center text-lg`} /></label>
            <label>From<input disabled={d} type="color" value={c.cover.from} onChange={(e) => set({ cover: { ...c.cover, from: e.target.value } })} className="mt-1 h-10 w-full rounded-lg" /></label>
            <label>To<input disabled={d} type="color" value={c.cover.to} onChange={(e) => set({ cover: { ...c.cover, to: e.target.value } })} className="mt-1 h-10 w-full rounded-lg" /></label>
          </div>
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white p-5">
          <h3 className="flex items-center gap-2 font-bold">{!canPrice && <Lock className="h-4 w-4 text-slate-400" />} Price (USD)</h3>
          <input type="number" min={0} step={1} disabled={!canPrice} value={c.price} onChange={(e) => set({ price: Number(e.target.value) || 0 })} className={`${inp} mt-3 text-lg font-bold`} />
          <p className="mt-2 text-xs text-slate-500">0 = free. {canPrice ? "Paid courses stay locked until the learner pays." : "Set by finance."}</p>
        </section>
      </aside>
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Content({ c, setModules, disabled }: { c: Course; setModules: (m: Module[]) => void; disabled: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const mods = c.modules;
  const upd = (mi: number, m: Partial<Module>) => setModules(mods.map((x, i) => (i === mi ? { ...x, ...m } : x)));
  const move = <T,>(arr: T[], i: number, d: number) => {
    const a = [...arr];
    const j = i + d;
    if (j < 0 || j >= a.length) return a;
    [a[i], a[j]] = [a[j], a[i]];
    return a;
  };
  const addLesson = (mi: number) => {
    const l: LessonSpec = { id: newId(c.slug), title: "", minutes: 10, words: [], sentences: [] };
    upd(mi, { lessons: [...mods[mi].lessons, l] });
    setOpen(l.id);
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-slate-500">Write each lesson&apos;s words, sentences, grammar tip and dialogue. The platform builds the exercises from them: listening, matching, sentence building, dictation and speaking.</p>
      {mods.map((m, mi) => (
        <section key={mi} className="rounded-3xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 text-sm font-bold text-brand-700">{mi + 1}</span>
            <input disabled={disabled} value={m.title} onChange={(e) => upd(mi, { title: e.target.value })} className={`${inp} max-w-md font-semibold`} placeholder="Unit title" />
            <span className="text-xs text-slate-500">{m.lessons.length} lessons</span>
            {!disabled && (
              <span className="ml-auto flex gap-1">
                <button onClick={() => setModules(move(mods, mi, -1))} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Move unit up"><ArrowUp className="h-4 w-4" /></button>
                <button onClick={() => setModules(move(mods, mi, 1))} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Move unit down"><ArrowDown className="h-4 w-4" /></button>
                <button onClick={() => confirm(`Delete “${m.title}” and its ${m.lessons.length} lessons?`) && setModules(mods.filter((_, i) => i !== mi))} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete unit"><Trash2 className="h-4 w-4" /></button>
              </span>
            )}
          </div>
          <ul className="divide-y divide-slate-100">
            {m.lessons.map((l, li) => (
              <li key={l.id}>
                <div className="flex items-center gap-3 px-4 py-3">
                  <button onClick={() => setOpen(open === l.id ? null : l.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition ${open === l.id ? "rotate-180" : ""}`} />
                    <span className="min-w-0"><b className="block truncate">{l.title || <span className="text-amber-600">Untitled lesson</span>}</b><span className="text-xs text-slate-500">{l.words.length} words · {l.sentences.length} sentences{l.grammar ? " · grammar" : ""}{l.dialogue?.length ? " · dialogue" : ""} · {l.minutes} min</span></span>
                  </button>
                  {l.words.length > 0 && l.words.length < 4 && <span className="text-xs font-semibold text-amber-600">Add at least 4 words</span>}
                  {!disabled && (
                    <span className="flex gap-1">
                      <button onClick={() => upd(mi, { lessons: move(m.lessons, li, -1) })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Move up"><ArrowUp className="h-4 w-4" /></button>
                      <button onClick={() => upd(mi, { lessons: move(m.lessons, li, 1) })} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100" aria-label="Move down"><ArrowDown className="h-4 w-4" /></button>
                      <button onClick={() => confirm(`Delete “${l.title || "this lesson"}”?`) && upd(mi, { lessons: m.lessons.filter((x) => x.id !== l.id) })} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete lesson"><Trash2 className="h-4 w-4" /></button>
                    </span>
                  )}
                </div>
                {open === l.id && <LessonEditor l={l} disabled={disabled} onChange={(nl) => upd(mi, { lessons: m.lessons.map((x) => (x.id === l.id ? nl : x)) })} />}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 p-4">
            {!disabled && <button onClick={() => addLesson(mi)} className="flex items-center gap-1.5 rounded-xl bg-brand-50 px-4 py-2 text-sm font-bold text-brand-700 hover:bg-brand-100"><Plus className="h-4 w-4" /> Add lesson</button>}
            <label className="flex min-w-64 flex-1 items-center gap-2 text-xs text-slate-500">
              Coming soon (one title per line):
              <textarea disabled={disabled} rows={1} value={(m.upcoming ?? []).join("\n")} onChange={(e) => upd(mi, { upcoming: e.target.value.split("\n").filter((x, i, a) => x.trim() || i < a.length - 1) })} className={`${inp} flex-1`} />
            </label>
          </div>
        </section>
      ))}
      {!disabled && <button onClick={() => setModules([...mods, { title: `Unit ${mods.length + 1}`, lessons: [] }])} className="flex items-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 px-5 py-3 text-sm font-bold text-slate-600 hover:border-brand-400"><Plus className="h-4 w-4" /> Add unit</button>}
    </div>
  );
}

function Rows<T extends Record<string, string | undefined>>({ title, rows, cols, make, onChange, disabled, hint }: {
  title: string; rows: T[]; cols: { key: keyof T & string; label: string; w?: string; dir?: "rtl" }[]; make: () => T; onChange: (r: T[]) => void; disabled: boolean; hint?: string;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-sm font-bold">{title} <span className="font-normal text-slate-400">({rows.length})</span></h4>
        {!disabled && <button onClick={() => onChange([...rows, make()])} className="flex items-center gap-1 text-xs font-bold text-brand-700"><Plus className="h-3.5 w-3.5" /> Add</button>}
      </div>
      {hint && <p className="mb-2 text-xs text-slate-500">{hint}</p>}
      {rows.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr>{cols.map((c) => <th key={c.key} className={`px-1 pb-1 text-left text-xs font-semibold text-slate-500 ${c.w ?? ""}`}>{c.label}</th>)}<th /></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {cols.map((c) => (
                    <td key={c.key} className="p-1">
                      <input disabled={disabled} dir={c.dir} value={r[c.key] ?? ""} onChange={(e) => onChange(rows.map((x, j) => (j === i ? { ...x, [c.key]: e.target.value } : x)))} className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-500" />
                    </td>
                  ))}
                  <td className="w-8 p-1">{!disabled && <button onClick={() => onChange(rows.filter((_, j) => j !== i))} className="rounded p-1 text-slate-300 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function LessonEditor({ l, onChange, disabled }: { l: LessonSpec; onChange: (l: LessonSpec) => void; disabled: boolean }) {
  const set = (p: Partial<LessonSpec>) => onChange({ ...l, ...p });
  const g = l.grammar;
  return (
    <div className="space-y-6 bg-slate-50/70 px-4 pb-6 pt-2 sm:px-10">
      <div className="grid gap-3 sm:grid-cols-[1fr_140px]">
        <Field label="Lesson title"><input disabled={disabled} value={l.title} onChange={(e) => set({ title: e.target.value })} className={inp} /></Field>
        <Field label="Minutes"><input disabled={disabled} type="number" min={1} value={l.minutes} onChange={(e) => set({ minutes: Number(e.target.value) || 1 })} className={inp} /></Field>
      </div>
      <Rows title="Words" disabled={disabled} rows={l.words.map((w) => ({ ...w }))} hint="At least 4 words, so the platform can build choice and matching exercises."
        cols={[{ key: "emoji", label: "Emoji", w: "w-16" }, { key: "en", label: "Word", w: "w-40" }, { key: "def", label: "Meaning (simple English)" }, { key: "ar", label: "Arabic", w: "w-40", dir: "rtl" }, { key: "ex", label: "Example sentence" }]}
        make={() => ({ en: "", def: "", ar: "", ex: "", emoji: "" })}
        onChange={(rows) => set({ words: rows.map((r) => ({ en: r.en ?? "", def: r.def ?? "", ar: r.ar ?? "", ...(r.ex ? { ex: r.ex } : {}), ...(r.emoji ? { emoji: r.emoji } : {}) })) })} />
      <Rows title="Sentences" disabled={disabled} rows={l.sentences.map((s) => ({ ...s }))} hint="Used for sentence building, fill-in and speaking practice."
        cols={[{ key: "en", label: "English" }, { key: "ar", label: "Arabic", dir: "rtl" }]}
        make={() => ({ en: "", ar: "" })} onChange={(rows) => set({ sentences: rows.map((r) => ({ en: r.en ?? "", ar: r.ar ?? "" })) })} />
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        <label className="flex items-center gap-2 text-sm font-bold"><input disabled={disabled} type="checkbox" checked={!!g} onChange={(e) => set({ grammar: e.target.checked ? { title: "", body: "", examples: [] } : undefined })} /> Grammar tip</label>
        {g && (
          <>
            <input disabled={disabled} value={g.title} onChange={(e) => set({ grammar: { ...g, title: e.target.value } })} className={inp} placeholder="Title, e.g. “I am / You are”" />
            <textarea disabled={disabled} rows={3} value={g.body} onChange={(e) => set({ grammar: { ...g, body: e.target.value } })} className={inp} placeholder="Short explanation" />
            <Rows title="Examples" disabled={disabled} rows={g.examples.map((s) => ({ ...s }))} cols={[{ key: "en", label: "English" }, { key: "ar", label: "Arabic", dir: "rtl" }]}
              make={() => ({ en: "", ar: "" })} onChange={(rows) => set({ grammar: { ...g, examples: rows.map((r) => ({ en: r.en ?? "", ar: r.ar ?? "" })) } })} />
          </>
        )}
      </div>
      <Rows title="Dialogue" disabled={disabled} rows={(l.dialogue ?? []).map((d) => ({ ...d }))} hint="Optional. A short conversation learners listen to at the end."
        cols={[{ key: "who", label: "Speaker", w: "w-28" }, { key: "en", label: "English" }, { key: "ar", label: "Arabic", dir: "rtl" }]}
        make={() => ({ who: "A", en: "", ar: "" })} onChange={(rows) => set({ dialogue: rows.length ? rows.map((r) => ({ who: r.who ?? "", en: r.en ?? "", ar: r.ar ?? "" })) : undefined })} />
    </div>
  );
}

/* ---------------------------------------------------------------- */

interface Material { id: number; course_slug: string; unit_index: number | null; lesson_id: string | null; title: string; kind: string; url: string | null; path: string | null }
const kindIcon: Record<string, typeof FileText> = { pdf: FileText, audio: Music, video: Video, link: Link2, file: FileText };

function Materials({ c, canEdit }: { c: Course; canEdit: boolean }) {
  const [rows, setRows] = useState<Material[] | null>(null);
  const [f, setF] = useState({ title: "", kind: "pdf", scope: "course", url: "" });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("course_materials").select("*").eq("course_slug", c.slug).order("sort").order("id");
    setErr(rpcError(error));
    setRows((data as Material[]) ?? []);
  }, [c.slug]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file && !f.url.trim()) return setErr("Choose a file or paste a link.");
    setBusy(true);
    setErr("");
    let path: string | null = null;
    if (file) {
      path = `${c.slug}/${Date.now()}-${file.name.replace(/[^\w.-]+/g, "_")}`;
      const up = await supabase.storage.from("materials").upload(path, file, { contentType: file.type || undefined });
      if (up.error) {
        setBusy(false);
        return setErr(up.error.message);
      }
    }
    const [scope, idx] = f.scope.split(":");
    const { error } = await supabase.from("course_materials").insert({
      course_slug: c.slug, title: f.title.trim() || file?.name || "Material", kind: f.kind,
      unit_index: scope === "unit" ? Number(idx) : null, lesson_id: scope === "lesson" ? idx : null,
      url: path ? null : f.url.trim(), path, sort: rows?.length ?? 0,
    });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    setF({ title: "", kind: "pdf", scope: "course", url: "" });
    setFile(null);
    load();
  };
  const remove = async (m: Material) => {
    if (!confirm(`Delete “${m.title}”?`)) return;
    if (m.path) await supabase.storage.from("materials").remove([m.path]);
    await supabase.from("course_materials").delete().eq("id", m.id);
    load();
  };
  const open = async (m: Material) => {
    if (m.url) return window.open(m.url, "_blank", "noopener");
    const { data } = await supabase.storage.from("materials").createSignedUrl(m.path!, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };
  const scopeLabel = (m: Material) => m.lesson_id ? `Lesson: ${c.modules.flatMap((x) => x.lessons).find((l) => l.id === m.lesson_id)?.title ?? m.lesson_id}` : m.unit_index !== null ? `Unit ${m.unit_index + 1}: ${c.modules[m.unit_index]?.title ?? ""}` : "Whole course";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-3xl border border-slate-200 bg-white">
        <h3 className="border-b border-slate-100 px-5 py-4 font-bold">Materials learners can open</h3>
        {err && <div className="px-5 pt-4"><ErrorNote text={err} /></div>}
        {rows === null ? <Loader2 className="mx-auto my-8 h-6 w-6 animate-spin text-slate-300" /> : rows.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">No materials yet. Add the course book (PDF), audio files or useful links.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((m) => {
              const Icon = kindIcon[m.kind] ?? FileText;
              return (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-50"><Icon className="h-5 w-5 text-brand-600" /></span>
                  <button onClick={() => open(m)} className="min-w-0 flex-1 text-left"><b className="block truncate hover:text-brand-700">{m.title}</b><span className="text-xs text-slate-500">{scopeLabel(m)}</span></button>
                  {canEdit && <button onClick={() => remove(m)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      {canEdit && (
        <form onSubmit={add} className="space-y-3 rounded-3xl border border-slate-200 bg-white p-5 lg:self-start">
          <h3 className="flex items-center gap-2 font-bold"><Upload className="h-4 w-4 text-brand-600" /> Add material</h3>
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title, e.g. Course book — Unit 1" className={inp} />
          <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })} className={inp}>
            <option value="pdf">PDF</option><option value="audio">Audio</option><option value="video">Video</option><option value="link">Link</option><option value="file">Other file</option>
          </select>
          <select value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })} className={inp}>
            <option value="course">Whole course</option>
            {c.modules.map((m, i) => <option key={`u${i}`} value={`unit:${i}`}>Unit {i + 1}: {m.title}</option>)}
            {c.modules.flatMap((m) => m.lessons).map((l) => <option key={l.id} value={`lesson:${l.id}`}>Lesson: {l.title}</option>)}
          </select>
          <label className="block rounded-xl border-2 border-dashed border-slate-200 p-3 text-center text-sm text-slate-500 hover:border-brand-300">
            {file ? <b className="text-ink">{file.name}</b> : "Choose a file (PDF, audio, video)"}
            <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </label>
          <div className="text-center text-xs text-slate-400">or</div>
          <input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="https://… (YouTube, Google Drive, website)" className={inp} />
          <button disabled={busy} className="btn-primary flex w-full items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BookOpen className="h-4 w-4" />} Add</button>
        </form>
      )}
    </div>
  );
}
