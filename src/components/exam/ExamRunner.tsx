"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Headphones, Hourglass, Loader2, Send } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtScore, type PaperQuestion } from "@/lib/exams";
import type { Level } from "@/lib/types";
import { SpeakBtn } from "@/components/lesson/Exercises";

export interface ExamResult { status: "submitted" | "graded"; score: number | null; auto_score: number | null; total: number | null; level: Level | null }

interface Paper { attempt: number; deadline: string; answers: Record<string, number | string>; title: string; instructions: string | null; kind: string; questions: PaperQuestion[] }

/** Takes one exam: start (or continue), timer, autosave, submit. */
export function ExamRunner({ examId, onDone }: { examId: number; onDone: (r: ExamResult) => void }) {
  const [paper, setPaper] = useState<Paper | null>(null);
  const [answers, setAnswers] = useState<Record<string, number | string>>({});
  const [err, setErr] = useState("");
  const [left, setLeft] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const dirty = useRef(false);
  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    supabase.rpc("start_exam", { p_exam: examId }).then(({ data, error }) => {
      if (error) return setErr(rpcError(error));
      const p = data as Paper;
      setPaper(p);
      setAnswers(p.answers ?? {});
    });
  }, [examId]);

  const submit = useCallback(async () => {
    if (!paper || sending) return;
    setSending(true);
    const { data, error } = await supabase.rpc("submit_exam", { p_attempt: paper.attempt, p_answers: answersRef.current });
    setSending(false);
    if (error) return setErr(rpcError(error));
    onDone(data as ExamResult);
  }, [paper, sending, onDone]);

  // timer
  useEffect(() => {
    if (!paper) return;
    const tick = () => {
      const s = Math.max(0, Math.round((new Date(paper.deadline).getTime() - Date.now()) / 1000));
      setLeft(s);
      if (s === 0) submit();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [paper, submit]);

  // autosave every 15 s
  useEffect(() => {
    if (!paper) return;
    const t = setInterval(() => {
      if (!dirty.current) return;
      dirty.current = false;
      supabase.rpc("save_answers", { p_attempt: paper.attempt, p_answers: answersRef.current });
    }, 15000);
    return () => clearInterval(t);
  }, [paper]);

  const set = (id: number, v: number | string) => {
    dirty.current = true;
    setAnswers((a) => ({ ...a, [id]: v }));
  };

  if (err) return <div className="mx-auto max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-amber-800">{err}</div>;
  if (!paper) return <Loader2 className="mx-auto my-20 h-8 w-8 animate-spin text-slate-300" />;

  const qs = paper.questions;
  const done = qs.filter((q) => answers[q.id] !== undefined && answers[q.id] !== "").length;
  const mm = left === null ? "--" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;

  return (
    <div className="mx-auto max-w-3xl px-4 pb-24 pt-6">
      <div className="sticky top-16 z-20 -mx-4 mb-6 flex items-center gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{paper.title}</div>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${(done / Math.max(1, qs.length)) * 100}%` }} /></div>
        </div>
        <span className="text-sm font-semibold text-slate-500">{done}/{qs.length}</span>
        <span className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-extrabold ${left !== null && left < 120 ? "bg-red-50 text-red-600" : "bg-brand-50 text-brand-700"}`}><Clock className="h-4 w-4" /> {mm}</span>
      </div>
      {paper.instructions && <p className="mb-6 rounded-2xl bg-mist p-4 text-sm text-slate-600">{paper.instructions}</p>}

      <ol className="space-y-5">
        {qs.map((q, i) => {
          const prev = qs[i - 1];
          const showPassage = q.passage && q.passage !== prev?.passage;
          const showAudio = q.audio_url && q.audio_url !== prev?.audio_url;
          return (
            <li key={q.id}>
              {showPassage && <div className="mb-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-5 leading-7 text-slate-700">{q.passage}</div>}
              {showAudio && (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl bg-brand-50 p-4">
                  <Headphones className="h-5 w-5 text-brand-600" /><span className="text-sm font-semibold text-brand-700">Listen (you can play it two times)</span>
                  <audio controls preload="none" src={q.audio_url!} className="h-10 max-w-full flex-1" />
                </div>
              )}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-semibold leading-7">{q.prompt}</p>
                      <span className="shrink-0 text-xs text-slate-400">{fmtScore(q.points)} pt</span>
                    </div>
                    {q.audio_text && <div className="mt-2 flex items-center gap-2 text-sm text-brand-700"><SpeakBtn text={q.audio_text} size="sm" /> Listen</div>}
                    {q.kind === "mcq" ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {q.options.map((o, k) => (
                          <button key={k} type="button" onClick={() => set(q.id, k)} data-state={answers[q.id] === k ? "selected" : ""} className="tile px-4 py-2.5 text-left text-sm font-semibold">
                            <span className="mr-2 text-slate-400">{"ABCD"[k]}</span>{o}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <textarea value={(answers[q.id] as string) ?? ""} onChange={(e) => set(q.id, e.target.value)} rows={7} placeholder="Write your answer here…"
                        className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500" />
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-8 flex flex-col items-center gap-2">
        {done < qs.length && <p className="text-sm text-amber-700">{qs.length - done} question(s) not answered yet.</p>}
        <button onClick={() => { if (confirm("Submit your answers? You can't change them after this.")) submit(); }} disabled={sending} className="btn-primary flex items-center gap-2 px-10 py-3.5 disabled:opacity-50">
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />} Submit
        </button>
      </div>
    </div>
  );
}

/** Score card after submitting */
export function ExamScore({ r }: { r: ExamResult }) {
  if (r.status === "submitted")
    return (
      <div className="rounded-3xl border border-gold-200 bg-gold-50/60 p-6 text-center">
        <Hourglass className="mx-auto h-10 w-10 text-gold-600" />
        <h2 className="mt-3 text-xl font-extrabold">Submitted — waiting for your teacher</h2>
        <p className="mt-1 text-slate-600">Multiple-choice score so far: <b>{fmtScore(r.auto_score)}</b>. Your teacher marks the written part, then the final score appears in Assessments.</p>
      </div>
    );
  const pct = r.total ? Math.round((Number(r.score) / Number(r.total)) * 100) : 0;
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-6 text-center">
      <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600" />
      <h2 className="mt-3 text-3xl font-extrabold">{fmtScore(r.score)} / {fmtScore(r.total)}</h2>
      <p className="mt-1 text-slate-600">{pct}% correct</p>
    </div>
  );
}
