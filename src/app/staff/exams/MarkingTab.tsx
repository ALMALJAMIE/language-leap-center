"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardCheck, Loader2, RotateCcw, XCircle } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { attemptStatus, fmtScore, kindInfo, type Attempt, type ExamKind } from "@/lib/exams";
import { ErrorNote, fmtDate } from "@/components/staff/StaffShell";
import { Empty } from "@/components/teaching/ui";
import { courseTitle, inp, usePerms } from "./shared";

interface Row { attempt_id: number; exam_id: number; exam_title: string; exam_kind: ExamKind; course_slug: string | null; learner: string; email: string; submitted_at: string | null; status: Attempt["status"]; auto_score: number | null; score: number | null; total: number | null; result_level: string | null }

export function MarkingTab() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [status, setStatus] = useState<"submitted" | "all">("submitted");
  const [open, setOpen] = useState<Row | null>(null);
  const [err, setErr] = useState("");
  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("grading_queue", { p_status: status });
    setErr(rpcError(error));
    setRows((data as Row[]) ?? []);
  }, [status]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (open) return <Review row={open} onClose={() => { setOpen(null); load(); }} />;
  return (
    <div>
      <ErrorNote text={err} />
      <div className="mb-4 flex gap-2">
        {(["submitted", "all"] as const).map((s) => (
          <button key={s} onClick={() => setStatus(s)} className={`rounded-xl px-4 py-2 text-sm font-bold ${status === s ? "bg-brand-700 text-white" : "bg-slate-100 text-slate-600"}`}>{s === "submitted" ? "Waiting for marking" : "All results"}</button>
        ))}
      </div>
      {rows === null ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /> : rows.length === 0 ? (
        <Empty icon={ClipboardCheck} title={status === "submitted" ? "Nothing to mark" : "No results yet"} text="Exams with written answers appear here after learners submit them." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Exam</th><th className="px-4 py-3">Submitted</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.attempt_id} className="border-t border-slate-100">
                  <td className="px-4 py-3"><b>{r.learner}</b><div className="text-xs text-slate-500">{r.email}</div></td>
                  <td className="px-4 py-3"><span className={`mr-2 rounded-full px-2 py-0.5 text-xs font-bold ${kindInfo[r.exam_kind].cls}`}>{kindInfo[r.exam_kind].label}</span>{r.exam_title}<div className="text-xs text-slate-400">{courseTitle(r.course_slug)}</div></td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(r.submitted_at, true)}</td>
                  <td className="px-4 py-3 font-bold">{r.status === "graded" ? `${fmtScore(r.score)} / ${fmtScore(r.total)}` : r.status === "submitted" ? <span className="font-normal text-slate-500">auto {fmtScore(r.auto_score)} / {fmtScore(r.total)}</span> : "—"}{r.result_level && <span className="ml-2 rounded-lg bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{r.result_level}</span>}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${attemptStatus[r.status].cls}`}>{attemptStatus[r.status].label}</span></td>
                  <td className="px-4 py-3 text-right">{r.status !== "in_progress" && <button onClick={() => setOpen(r)} className="btn-primary px-3 py-1.5 text-xs">{r.status === "submitted" ? "Mark" : "Open"}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

interface RQ { id: number; kind: "mcq" | "written"; skill: string; prompt: string; options: string[]; answer: number | null; points: number; passage: string | null; rubric: string | null }

function Review({ row, onClose }: { row: Row; onClose: () => void }) {
  const p = usePerms();
  const [data, setData] = useState<{ attempt: Attempt; questions: RQ[] } | null>(null);
  const [marks, setMarks] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.rpc("attempt_review", { p_attempt: row.attempt_id }).then(({ data, error }) => {
      if (error) return setErr(rpcError(error));
      const d = data as { attempt: Attempt; questions: RQ[] };
      setData(d);
      setFeedback(d.attempt.feedback ?? "");
      setMarks(Object.fromEntries(d.questions.map((q) => [String(q.id), d.attempt.marks?.[q.id] !== undefined ? String(d.attempt.marks[q.id]) : ""])));
    });
  }, [row.attempt_id]);

  if (err && !data) return <ErrorNote text={err} />;
  if (!data) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const a = data.attempt;
  const total = data.questions.reduce((s, q) => s + (Number(marks[q.id]) || 0), 0);
  const missing = data.questions.filter((q) => q.kind === "written" && marks[q.id] === "").length;

  const save = async () => {
    if (missing) return setErr("Give points for every written answer.");
    setBusy(true);
    const m = Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, Number(v) || 0]));
    const { error } = await supabase.rpc("grade_attempt", { p_attempt: a.id, p_marks: m, p_feedback: feedback.trim() || null });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    onClose();
  };
  const reset = async () => {
    if (!confirm(`Delete ${row.learner}'s attempt so they can take “${row.exam_title}” again?`)) return;
    const { error } = await supabase.rpc("reset_attempt", { p_attempt: a.id });
    if (error) return setErr(rpcError(error));
    onClose();
  };

  return (
    <div className="space-y-5">
      <button onClick={onClose} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Back</button>
      <ErrorNote text={err} />
      <div className="flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200 bg-white p-5">
        <div className="flex-1"><div className="text-lg font-extrabold">{row.learner}</div><div className="text-sm text-slate-500">{row.exam_title} · submitted {fmtDate(a.submitted_at, true)}</div></div>
        <div className="text-right"><div className="text-3xl font-extrabold text-brand-700">{fmtScore(total)} <span className="text-base text-slate-400">/ {fmtScore(a.total)}</span></div>{a.result_level && <div className="text-sm font-bold">Level {a.result_level}</div>}</div>
      </div>
      <ol className="space-y-3">
        {data.questions.map((q, i) => {
          const given = a.answers?.[q.id];
          const right = q.kind === "mcq" && given !== undefined && Number(given) === q.answer;
          return (
            <li key={q.id} className="rounded-2xl border border-slate-200 bg-white p-4 text-sm">
              {q.passage && q.passage !== data.questions[i - 1]?.passage && <p className="mb-3 rounded-xl bg-mist p-3 text-slate-600">{q.passage}</p>}
              <div className="flex items-start gap-3">
                <span className="w-6 shrink-0 text-slate-400">{i + 1}.</span>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold">{q.prompt}</div>
                  {q.kind === "mcq" ? (
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {right ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span>Answer: <b>{given === undefined ? "—" : q.options[Number(given)]}</b></span>
                      {!right && <span className="text-emerald-700">· right: {q.options[q.answer ?? 0]}</span>}
                    </div>
                  ) : (
                    <>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-3">{(given as string) || <i className="text-slate-400">No answer</i>}</p>
                      {q.rubric && <p className="mt-2 text-xs text-slate-500"><b>Marking guide:</b> {q.rubric}</p>}
                    </>
                  )}
                </div>
                <label className="flex shrink-0 items-center gap-1 text-xs text-slate-500">
                  <input type="number" min={0} max={q.points} step={0.5} value={marks[q.id] ?? ""} disabled={!p.canMark} onChange={(e) => setMarks({ ...marks, [q.id]: e.target.value })}
                    className={`w-16 rounded-lg border px-2 py-1.5 text-right text-sm font-bold ${q.kind === "written" && marks[q.id] === "" ? "border-gold-400 bg-gold-50" : "border-slate-300"}`} />
                  / {fmtScore(q.points)}
                </label>
              </div>
            </li>
          );
        })}
      </ol>
      {p.canMark && (
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} rows={2} placeholder="Feedback for the learner (optional)" className={inp} />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button onClick={save} disabled={busy} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50">{busy ? "Saving…" : `Save marks · ${fmtScore(total)} / ${fmtScore(a.total)}`}</button>
            {missing > 0 && <span className="text-sm text-gold-700">{missing} written answer(s) still need points</span>}
            <button onClick={reset} className="ml-auto flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-red-600"><RotateCcw className="h-4 w-4" /> Let them retake</button>
          </div>
        </div>
      )}
    </div>
  );
}
