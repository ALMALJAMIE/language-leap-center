"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtScore, kindInfo, type BankQuestion, type Exam, type ExamKind } from "@/lib/exams";
import { ErrorNote } from "@/components/staff/StaffShell";
import { Empty } from "@/components/teaching/ui";
import { CourseSelect, UnitSelect, courseTitle, inp, unitTitle, usePerms } from "./shared";
import { FileCheck2 } from "lucide-react";

interface EQ { exam_id: number; question_id: number; sort: number; points: number | null; question_bank: { points: number } | null }

export function ExamsTab() {
  const p = usePerms();
  const [exams, setExams] = useState<Exam[] | null>(null);
  const [eq, setEq] = useState<EQ[]>([]);
  const [course, setCourse] = useState("");
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState<Exam | "new" | null>(null);

  const load = useCallback(async () => {
    const [e, q] = await Promise.all([
      supabase.from("exams").select("*").order("course_slug", { nullsFirst: true }).order("kind").order("unit_index").order("id"),
      supabase.from("exam_questions").select("exam_id,question_id,sort,points,question_bank(points)"),
    ]);
    setErr(rpcError(e.error ?? q.error));
    setExams((e.data as Exam[]) ?? []);
    setEq((q.data as unknown as EQ[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (edit) return <ExamEditor exam={edit === "new" ? null : edit} onClose={() => { setEdit(null); load(); }} />;
  if (exams === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;

  const list = exams.filter((e) => !course || (course === "-" ? !e.course_slug : e.course_slug === course));
  const stats = (id: number) => {
    const rows = eq.filter((r) => r.exam_id === id);
    return { n: rows.length, pts: rows.reduce((s, r) => s + Number(r.points ?? r.question_bank?.points ?? 0), 0) };
  };
  const toggle = async (e: Exam) => {
    const { error } = await supabase.rpc("set_exam_open", { p_exam: e.id, p_open: !e.published });
    if (error) return setErr(rpcError(error));
    load();
  };

  return (
    <div>
      <ErrorNote text={err} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="w-72"><CourseSelect value={course} onChange={setCourse} /></div>
        {p.academic && <button onClick={() => setEdit("new")} className="btn-primary ml-auto flex items-center gap-2 px-4 py-2.5 text-sm"><Plus className="h-4 w-4" /> New exam</button>}
      </div>
      {list.length === 0 ? (
        <Empty icon={FileCheck2} title="No exams yet" text="Create an exam, then add questions to it from the question bank." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Questions</th><th className="px-4 py-3">Time</th><th className="px-4 py-3">Open for learners</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {list.map((e) => {
                const s = stats(e.id);
                return (
                  <tr key={e.id} className="border-t border-slate-100">
                    <td className="px-4 py-3"><span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-bold ${kindInfo[e.kind].cls}`}>{kindInfo[e.kind].label}</span><b>{e.title}</b></td>
                    <td className="px-4 py-3 text-slate-600">{courseTitle(e.course_slug)}{e.unit_index !== null && <span className="block text-xs text-slate-400">{unitTitle(e.course_slug, e.unit_index)}</span>}</td>
                    <td className="px-4 py-3">{s.n} <span className="text-xs text-slate-400">· {fmtScore(s.pts)} pts</span></td>
                    <td className="px-4 py-3">{e.minutes} min{e.kind === "placement" && <span className="block text-xs text-slate-400">Fee ${Number(e.fee)}</span>}</td>
                    <td className="px-4 py-3">
                      <button disabled={!p.canOpen || (e.kind === "placement" && !p.academic)} onClick={() => toggle(e)} className={`h-6 w-11 rounded-full p-0.5 transition disabled:opacity-50 ${e.published ? "bg-emerald-500" : "bg-slate-200"}`} aria-pressed={e.published} aria-label="Open">
                        <span className={`block h-5 w-5 rounded-full bg-white shadow transition ${e.published ? "translate-x-5" : ""}`} />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setEdit(e)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-brand-700 hover:bg-brand-50"><Pencil className="h-3.5 w-3.5" /> {p.academic ? "Edit" : "View"}</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="mt-4 text-xs text-slate-500">Teachers switch a unit test or final exam on in class and off when time is up. Each learner can take an exam once; to allow a retake, use “Let them retake” in Marking.</p>
    </div>
  );
}

function ExamEditor({ exam, onClose }: { exam: Exam | null; onClose: () => void }) {
  const p = usePerms();
  const ro = !p.academic;
  const [f, setF] = useState({
    title: exam?.title ?? "", kind: (exam?.kind ?? "unit") as ExamKind, course: exam ? exam.course_slug ?? "-" : "",
    unit: exam?.unit_index !== null && exam?.unit_index !== undefined ? String(exam.unit_index) : "", minutes: String(exam?.minutes ?? 30), instructions: exam?.instructions ?? "",
  });
  const [id, setId] = useState<number | null>(exam?.id ?? null);
  const [inExam, setInExam] = useState<(BankQuestion & { sort: number })[]>([]);
  const [bank, setBank] = useState<BankQuestion[]>([]);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState("");

  const loadQ = useCallback(async () => {
    if (!id) return;
    const { data: rows } = await supabase.from("exam_questions").select("question_id,sort").eq("exam_id", id).order("sort");
    const ids = (rows ?? []).map((r) => r.question_id as number);
    const slug = f.course && f.course !== "-" ? f.course : null;
    let bq = supabase.from("question_bank").select("*").order("unit_index").order("id").limit(500);
    bq = slug ? bq.eq("course_slug", slug) : bq.is("course_slug", null);
    const [{ data: qs }, { data: b }] = await Promise.all([
      ids.length ? supabase.from("question_bank").select("*").in("id", ids) : Promise.resolve({ data: [] as BankQuestion[] }),
      bq,
    ]);
    const sortOf = new Map((rows ?? []).map((r) => [r.question_id as number, r.sort as number]));
    setInExam(((qs as BankQuestion[]) ?? []).map((q) => ({ ...q, sort: sortOf.get(q.id) ?? 0 })).sort((a, b) => a.sort - b.sort));
    setBank(((b as BankQuestion[]) ?? []).filter((q) => !ids.includes(q.id)));
  }, [id, f.course]);
  useEffect(() => {
    const t = setTimeout(loadQ, 0);
    return () => clearTimeout(t);
  }, [loadQ]);

  const save = async () => {
    setErr(""); setSaved("");
    if (!f.title.trim()) return setErr("Write a title.");
    const row = {
      title: f.title.trim(), kind: f.kind, course_slug: f.kind === "placement" || f.course === "-" || !f.course ? null : f.course,
      unit_index: f.kind === "unit" && f.unit !== "" ? Number(f.unit) : null, minutes: Math.max(5, Math.min(240, Number(f.minutes) || 30)), instructions: f.instructions.trim() || null,
    };
    if (id) {
      const { error } = await supabase.from("exams").update(row).eq("id", id);
      if (error) return setErr(rpcError(error));
    } else {
      const { data, error } = await supabase.from("exams").insert(row).select("id").single();
      if (error) return setErr(rpcError(error));
      setId(data.id as number);
    }
    setSaved("Saved.");
  };
  const add = async (q: BankQuestion) => {
    const { error } = await supabase.from("exam_questions").insert({ exam_id: id, question_id: q.id, sort: (inExam.at(-1)?.sort ?? -1) + 1 });
    if (error) return setErr(rpcError(error));
    loadQ();
  };
  const remove = async (q: BankQuestion) => {
    await supabase.from("exam_questions").delete().eq("exam_id", id!).eq("question_id", q.id);
    loadQ();
  };
  const del = async () => {
    if (!id || !confirm("Delete this exam and every learner attempt in it?")) return;
    const { error } = await supabase.from("exams").delete().eq("id", id);
    if (error) return setErr(rpcError(error));
    onClose();
  };
  const total = inExam.reduce((s, q) => s + Number(q.points), 0);
  const [unitFilter, setUnitFilter] = useState("");
  const shown = bank.filter((q) => unitFilter === "" || String(q.unit_index) === unitFilter);

  return (
    <div className="space-y-6">
      <button onClick={onClose} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> All exams</button>
      <ErrorNote text={err} />
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-bold">{id ? "Exam details" : "New exam"}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <label className="text-xs font-semibold text-slate-500">Title<input disabled={ro} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} className={`${inp} mt-1`} /></label>
          <label className="text-xs font-semibold text-slate-500">Type
            <select disabled={ro} value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value as ExamKind })} className={`${inp} mt-1`}>
              <option value="unit">Unit test</option><option value="final">Final exam</option><option value="quiz">Quiz</option><option value="placement">Placement test</option>
            </select>
          </label>
          {f.kind !== "placement" && <label className="text-xs font-semibold text-slate-500">Course<div className="mt-1"><CourseSelect value={f.course} onChange={(v) => setF({ ...f, course: v, unit: "" })} all={false} general={false} /></div></label>}
          {f.kind === "unit" && <label className="text-xs font-semibold text-slate-500">Unit<div className="mt-1"><UnitSelect slug={f.course} value={f.unit} onChange={(v) => setF({ ...f, unit: v })} /></div></label>}
          <label className="text-xs font-semibold text-slate-500">Time (minutes)<input disabled={ro} type="number" min={5} max={240} value={f.minutes} onChange={(e) => setF({ ...f, minutes: e.target.value })} className={`${inp} mt-1`} /></label>
          <label className="text-xs font-semibold text-slate-500 md:col-span-2">Instructions for learners<textarea disabled={ro} rows={2} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} className={`${inp} mt-1`} /></label>
        </div>
        {f.kind === "placement" && <p className="mt-3 text-xs text-slate-500">The placement test fee is set by finance in “Placement Tests”.</p>}
        {!ro && (
          <div className="mt-4 flex items-center gap-3">
            <button onClick={save} className="btn-primary px-6 py-2.5 text-sm">{id ? "Save" : "Create exam"}</button>
            {saved && <span className="text-sm font-semibold text-emerald-600">{saved}</span>}
            {id && <button onClick={del} className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-red-600"><Trash2 className="h-4 w-4" /> Delete exam</button>}
          </div>
        )}
      </section>

      {id && (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-200 bg-white">
            <h3 className="border-b border-slate-100 px-5 py-4 font-bold">In this exam · {inExam.length} questions · {fmtScore(total)} points</h3>
            {inExam.length === 0 ? <p className="p-5 text-sm text-slate-500">Add questions from the bank.</p> : (
              <ol className="divide-y divide-slate-100">
                {inExam.map((q, i) => (
                  <li key={q.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                    <span className="w-6 shrink-0 text-slate-400">{i + 1}.</span>
                    <QLine q={q} />
                    {!ro && <button onClick={() => remove(q)} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>}
                  </li>
                ))}
              </ol>
            )}
          </section>
          {!ro && (
            <section className="rounded-3xl border border-slate-200 bg-white">
              <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-3">
                <h3 className="flex-1 font-bold">Question bank</h3>
                {f.course && f.course !== "-" && <div className="w-48"><UnitSelect slug={f.course} value={unitFilter} onChange={setUnitFilter} any="All units" /></div>}
              </div>
              {shown.length === 0 ? <p className="p-5 text-sm text-slate-500">No more questions for this course. Add new ones in the Question bank tab.</p> : (
                <ul className="max-h-[560px] divide-y divide-slate-100 overflow-y-auto">
                  {shown.map((q) => (
                    <li key={q.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                      <QLine q={q} />
                      <button onClick={() => add(q)} className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-700 hover:bg-brand-100">Add</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export function QLine({ q }: { q: BankQuestion }) {
  return (
    <div className="min-w-0 flex-1">
      <div className="font-semibold">{q.prompt}</div>
      <div className="mt-0.5 text-xs text-slate-500">
        <span className="capitalize">{q.skill}</span>{q.level && ` · ${q.level}`} · {fmtScore(q.points)} pt
        {q.kind === "mcq" ? <> · answer: <b className="text-emerald-700">{q.options[q.answer ?? 0]}</b></> : " · written (teacher marks)"}
      </div>
    </div>
  );
}
