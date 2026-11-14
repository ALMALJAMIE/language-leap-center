"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { skills, type BankQuestion, type Skill } from "@/lib/exams";
import { ErrorNote } from "@/components/staff/StaffShell";
import { Empty } from "@/components/teaching/ui";
import { CourseSelect, UnitSelect, courseTitle, inp, unitTitle, usePerms } from "./shared";
import { QLine } from "./ExamsTab";

export function BankTab() {
  const p = usePerms();
  const uid = useAuth((s) => s.user?.id);
  const [rows, setRows] = useState<BankQuestion[] | null>(null);
  const [course, setCourse] = useState("");
  const [unit, setUnit] = useState("");
  const [skill, setSkill] = useState("");
  const [search, setSearch] = useState("");
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState<BankQuestion | "new" | null>(null);

  const load = useCallback(async () => {
    let q = supabase.from("question_bank").select("*").order("course_slug", { nullsFirst: true }).order("unit_index").order("id").limit(1000);
    if (course === "-") q = q.is("course_slug", null);
    else if (course) q = q.eq("course_slug", course);
    const { data, error } = await q;
    setErr(rpcError(error));
    setRows((data as BankQuestion[]) ?? []);
  }, [course]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (rows === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const list = rows.filter((q) => (unit === "" || String(q.unit_index) === unit) && (!skill || q.skill === skill) && (!search || q.prompt.toLowerCase().includes(search.toLowerCase())));
  const mayEdit = (q: BankQuestion) => p.academic || (p.teacher && q.created_by === uid);
  const del = async (q: BankQuestion) => {
    if (!confirm("Delete this question? It is also removed from every exam that uses it.")) return;
    const { error } = await supabase.from("question_bank").delete().eq("id", q.id);
    if (error) return setErr(rpcError(error));
    load();
  };

  return (
    <div>
      <ErrorNote text={err} />
      <div className="mb-5 grid gap-3 md:grid-cols-[1fr_1fr_160px_1fr_auto]">
        <CourseSelect value={course} onChange={(v) => { setCourse(v); setUnit(""); }} />
        <UnitSelect slug={course} value={unit} onChange={setUnit} any="All units" />
        <select value={skill} onChange={(e) => setSkill(e.target.value)} className={inp}><option value="">All skills</option>{skills.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}</select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…" className={inp} />
        {p.canWriteBank && <button onClick={() => setEdit("new")} className="btn-primary flex items-center justify-center gap-2 px-4 py-2.5 text-sm"><Plus className="h-4 w-4" /> Question</button>}
      </div>
      {edit && <QuestionForm q={edit === "new" ? null : edit} course={course} unit={unit} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); load(); }} />}
      {list.length === 0 ? (
        <Empty icon={Database} title="No questions here" text="Add multiple-choice questions (marked automatically) or written questions (marked by the teacher)." />
      ) : (
        <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
          {list.map((q) => (
            <li key={q.id} className="flex items-start gap-3 px-5 py-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="mb-1 text-xs text-slate-400">{courseTitle(q.course_slug)}{q.course_slug && ` · ${unitTitle(q.course_slug, q.unit_index)}`}</div>
                <QLine q={q} />
              </div>
              {mayEdit(q) && (
                <span className="flex shrink-0 gap-1">
                  <button onClick={() => setEdit(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-brand-50 hover:text-brand-700" aria-label="Edit"><Pencil className="h-4 w-4" /></button>
                  <button onClick={() => del(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-slate-400">{list.length} question(s)</p>
    </div>
  );
}

function QuestionForm({ q, course, unit, onClose, onSaved }: { q: BankQuestion | null; course: string; unit: string; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    course: q ? q.course_slug ?? "-" : course || "-", unit: q ? (q.unit_index === null ? "" : String(q.unit_index)) : unit,
    level: q?.level ?? "A1", skill: (q?.skill ?? "grammar") as Skill, kind: q?.kind ?? "mcq", prompt: q?.prompt ?? "",
    options: q?.options?.length ? [...q.options, "", "", "", ""].slice(0, 4) : ["", "", "", ""], answer: q?.answer ?? 0, points: String(q?.points ?? 1),
    passage: q?.passage ?? "", audio_url: q?.audio_url ?? "", audio_text: q?.audio_text ?? "", rubric: q?.rubric ?? "",
  });
  const [err, setErr] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const opts = f.options.map((o) => o.trim()).filter(Boolean);
    if (!f.prompt.trim()) return setErr("Write the question.");
    if (f.kind === "mcq" && (opts.length < 2 || !f.options[f.answer]?.trim())) return setErr("Write at least two options and mark the right one.");
    const answer = f.kind === "mcq" ? opts.indexOf(f.options[f.answer].trim()) : null;
    const row = {
      course_slug: f.course === "-" ? null : f.course, unit_index: f.course !== "-" && f.unit !== "" ? Number(f.unit) : null,
      level: f.level, skill: f.skill, kind: f.kind, prompt: f.prompt.trim(), options: f.kind === "mcq" ? opts : [], answer,
      points: Math.max(0.5, Number(f.points) || 1), passage: f.passage.trim() || null, audio_url: f.audio_url.trim() || null,
      audio_text: f.audio_text.trim() || null, rubric: f.rubric.trim() || null,
    };
    const { error } = q ? await supabase.from("question_bank").update(row).eq("id", q.id) : await supabase.from("question_bank").insert(row);
    if (error) return setErr(rpcError(error));
    onSaved();
  };
  return (
    <form onSubmit={save} className="mb-6 space-y-3 rounded-3xl border border-brand-200 bg-brand-50/40 p-6">
      <div className="flex items-center"><h3 className="flex-1 font-bold">{q ? "Edit question" : "New question"}</h3><button type="button" onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-white" aria-label="Close"><X className="h-5 w-5" /></button></div>
      <div className="grid gap-3 md:grid-cols-5">
        <CourseSelect value={f.course} onChange={(v) => setF({ ...f, course: v, unit: "" })} all={false} />
        <UnitSelect slug={f.course} value={f.unit} onChange={(v) => setF({ ...f, unit: v })} />
        <select value={f.level} onChange={(e) => setF({ ...f, level: e.target.value as BankQuestion["level"] & string })} className={inp}>{["A1", "A2", "B1", "B2", "C1"].map((l) => <option key={l}>{l}</option>)}</select>
        <select value={f.skill} onChange={(e) => setF({ ...f, skill: e.target.value as Skill })} className={inp}>{skills.map((s) => <option key={s} value={s}>{s}</option>)}</select>
        <select value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as "mcq" | "written" })} className={inp}><option value="mcq">Multiple choice (auto)</option><option value="written">Written (teacher marks)</option></select>
      </div>
      <textarea value={f.prompt} onChange={(e) => setF({ ...f, prompt: e.target.value })} rows={2} placeholder="The question, e.g. She ___ a teacher." className={inp} />
      {f.kind === "mcq" ? (
        <div className="grid gap-2 md:grid-cols-2">
          {f.options.map((o, k) => (
            <label key={k} className="flex items-center gap-2">
              <input type="radio" name="answer" checked={f.answer === k} onChange={() => setF({ ...f, answer: k })} title="Right answer" />
              <input value={o} onChange={(e) => { const op = [...f.options]; op[k] = e.target.value; setF({ ...f, options: op }); }} placeholder={`Option ${"ABCD"[k]}`} className={inp} />
            </label>
          ))}
          <p className="text-xs text-slate-500 md:col-span-2">Tick the circle next to the right answer.</p>
        </div>
      ) : (
        <textarea value={f.rubric} onChange={(e) => setF({ ...f, rubric: e.target.value })} rows={2} placeholder="Marking guide for the teacher (what earns the points)" className={inp} />
      )}
      <div className="grid gap-3 md:grid-cols-[120px_1fr_1fr]">
        <label className="text-xs font-semibold text-slate-500">Points<input type="number" min={0.5} step={0.5} value={f.points} onChange={(e) => setF({ ...f, points: e.target.value })} className={`${inp} mt-1`} /></label>
        <label className="text-xs font-semibold text-slate-500">Listening audio link (mp3)<input value={f.audio_url} onChange={(e) => setF({ ...f, audio_url: e.target.value })} placeholder="https://…" className={`${inp} mt-1`} /></label>
        <label className="text-xs font-semibold text-slate-500">…or text the computer reads aloud<input value={f.audio_text} onChange={(e) => setF({ ...f, audio_text: e.target.value })} className={`${inp} mt-1`} /></label>
      </div>
      <textarea value={f.passage} onChange={(e) => setF({ ...f, passage: e.target.value })} rows={2} placeholder="Reading text shown above the question (optional)" className={inp} />
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button className="btn-primary px-6 py-2.5 text-sm">Save question</button>
    </form>
  );
}
