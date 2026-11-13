"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { ClipboardCheck, ClipboardList, Loader2, Mic, PenLine, Plus, Trash2 } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtWhen, type Assignment } from "@/lib/teaching";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";
import { Empty, Tabs } from "@/components/teaching/ui";
import { Recording } from "@/components/teaching/Recorder";

type Tab = "grade" | "waiting" | "graded";
interface Student { student_id: string; name: string }

export default function TeacherAssignmentsPage() {
  return (
    <StaffShell page="/staff/assignments/" title="Assignments & Grading" subtitle="Give writing and speaking tasks, then grade the answers">
      <Suspense><View /></Suspense>
    </StaffShell>
  );
}

function View() {
  const params = useSearchParams();
  const user = useAuth((s) => s.user)!;
  const [rows, setRows] = useState<Assignment[] | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab | null>(null);
  const [showNew, setShowNew] = useState(!!params.get("student"));

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("assignments").select("*").eq("teacher_id", user.id).order("created_at", { ascending: false });
    setErr(rpcError(error));
    setRows((data as Assignment[]) ?? []);
  }, [user.id]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    supabase.rpc("teacher_students").then(({ data }) => setStudents((data as Student[]) ?? []));
    return () => clearTimeout(t);
  }, [load]);

  if (rows === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const by = { grade: rows.filter((a) => a.status === "submitted"), waiting: rows.filter((a) => a.status === "assigned"), graded: rows.filter((a) => a.status === "graded") };
  const active: Tab = tab ?? (by.grade.length ? "grade" : "waiting");
  const nameOf = (id: string) => students.find((s) => s.student_id === id)?.name ?? "Learner";

  return (
    <>
      <ErrorNote text={err} />
      <div className="mb-6">
        {showNew ? (
          <NewForm students={students} initialStudent={params.get("student")} lesson={params.get("lesson")} onClose={() => setShowNew(false)} onSaved={() => { setShowNew(false); load(); setTab("waiting"); }} />
        ) : (
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"><Plus className="h-4 w-4" /> New assignment</button>
        )}
      </div>
      <Tabs value={active} onChange={setTab} items={[
        { id: "grade", label: "To grade", count: by.grade.length },
        { id: "waiting", label: "Waiting for learner", count: by.waiting.length },
        { id: "graded", label: "Graded" },
      ]} />
      {by[active].length === 0 ? (
        <Empty icon={active === "grade" ? ClipboardCheck : ClipboardList} title={{ grade: "Nothing to grade", waiting: "No open assignments", graded: "Nothing graded yet" }[active]} />
      ) : (
        <div className="space-y-3">{by[active].map((a) => <Item key={a.id} a={a} student={nameOf(a.student_id)} onChange={load} />)}</div>
      )}
    </>
  );
}

function NewForm({ students, initialStudent, lesson, onClose, onSaved }: { students: Student[]; initialStudent: string | null; lesson: string | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ student: initialStudent ?? "", title: "", instructions: "", kind: "writing", due: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const student = f.student || students[0]?.student_id || "";
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return setErr("You don't have students yet.");
    setBusy(true);
    const { error } = await supabase.rpc("create_assignment", {
      p_student: student, p_title: f.title, p_instructions: f.instructions, p_kind: f.kind,
      p_due: f.due ? new Date(f.due).toISOString() : null, p_lesson: lesson,
    });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    onSaved();
  };
  const cls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500";
  return (
    <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="font-bold">New assignment</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Learner</span>
          <select value={student} onChange={(e) => setF({ ...f, student: e.target.value })} className={`${cls} bg-white`}>
            {students.length === 0 && <option value="">No students yet</option>}
            {students.map((s) => <option key={s.student_id} value={s.student_id}>{s.name}</option>)}
          </select>
        </label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Type</span>
          <div className="grid grid-cols-3 gap-2">
            {[["writing", "Writing", PenLine], ["speaking", "Speaking", Mic], ["both", "Both", ClipboardList]].map(([k, l, I]) => {
              const Icon = I as typeof Mic;
              return <button type="button" key={k as string} onClick={() => setF({ ...f, kind: k as string })} className={`flex items-center justify-center gap-1.5 rounded-xl border-2 py-2 text-sm font-semibold ${f.kind === k ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200"}`}><Icon className="h-4 w-4" /> {l as string}</button>;
            })}
          </div>
        </label>
        <label className="block md:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Title</span><input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Describe your daily routine" className={cls} /></label>
        <label className="block md:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Instructions</span><textarea rows={4} value={f.instructions} onChange={(e) => setF({ ...f, instructions: e.target.value })} placeholder="Write 8–10 sentences using the present simple. Then record yourself reading it aloud." className={cls} /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold">Due (optional)</span><input type="datetime-local" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} className={cls} /></label>
      </div>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      <div className="mt-5 flex gap-3">
        <button disabled={busy} className="btn-primary px-6 py-2.5 text-sm">{busy ? "Sending…" : "Give assignment"}</button>
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
      </div>
    </form>
  );
}

function Item({ a, student, onChange }: { a: Assignment; student: string; onChange: () => void }) {
  const [open, setOpen] = useState(a.status === "submitted");
  const [grade, setGrade] = useState(a.grade ?? 80);
  const [feedback, setFeedback] = useState(a.feedback ?? "");
  const [err, setErr] = useState("");
  const gradeIt = async () => {
    const { error } = await supabase.rpc("grade_assignment", { p_id: a.id, p_grade: grade, p_feedback: feedback });
    if (error) return setErr(rpcError(error));
    onChange();
  };
  const remove = async () => {
    if (!confirm("Delete this assignment?")) return;
    const { error } = await supabase.rpc("delete_assignment", { p_id: a.id });
    if (error) return setErr(rpcError(error));
    onChange();
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-3 p-5 text-left">
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${a.kind === "speaking" ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"}`}>{a.kind === "speaking" ? <Mic className="h-5 w-5" /> : <PenLine className="h-5 w-5" />}</span>
        <span className="min-w-0 flex-1"><b className="block">{a.title}</b><span className="text-xs text-slate-500">{student} · given {fmtDate(a.created_at)}{a.due_at ? ` · due ${fmtWhen(a.due_at)}` : ""}</span></span>
        {a.status === "graded" && <span className="rounded-xl bg-emerald-50 px-3 py-1 font-extrabold text-emerald-700">{a.grade}/100</span>}
        {a.status === "submitted" && <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">Answer received {a.submitted_at ? fmtDate(a.submitted_at) : ""}</span>}
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 p-5">
          {a.instructions && <p className="whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{a.instructions}</p>}
          {a.status === "assigned" ? (
            <div className="flex items-center justify-between text-sm text-slate-500">
              Waiting for {student} to answer.
              <button onClick={remove} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /> Delete</button>
            </div>
          ) : (
            <>
              {a.answer_text && <div><div className="text-xs font-bold uppercase text-slate-500">Answer</div><p className="mt-1 whitespace-pre-line rounded-xl border border-slate-200 p-4 text-sm leading-6" dir="auto">{a.answer_text}</p></div>}
              {a.answer_audio && <div><div className="mb-1 text-xs font-bold uppercase text-slate-500">Voice answer</div><Recording path={a.answer_audio} /></div>}
              <div className="grid gap-4 rounded-2xl bg-slate-50 p-4 md:grid-cols-[200px_1fr]">
                <label className="block">
                  <span className="text-xs font-bold uppercase text-slate-500">Grade</span>
                  <div className="mt-1 text-3xl font-extrabold text-brand-800">{grade}<span className="text-sm text-slate-400">/100</span></div>
                  <input type="range" min={0} max={100} step={5} value={grade} onChange={(e) => setGrade(Number(e.target.value))} className="mt-2 w-full accent-brand-600" />
                </label>
                <label className="block">
                  <span className="text-xs font-bold uppercase text-slate-500">Feedback for the learner</span>
                  <textarea rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well, the main mistakes with corrections, and one thing to practise." className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500" />
                </label>
              </div>
              <button onClick={gradeIt} className="btn-primary px-6 py-2.5 text-sm">{a.status === "graded" ? "Update grade" : "Send grade & feedback"}</button>
            </>
          )}
          {err && <p className="text-sm text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}
