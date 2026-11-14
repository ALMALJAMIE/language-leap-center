"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Headphones, Loader2, Printer, XCircle } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtScore, skills, type Attempt } from "@/lib/exams";
import { levels } from "@/data/courses";
import type { Level } from "@/lib/types";

export interface ReviewQuestion {
  id: number; kind: "mcq" | "written"; skill: string; level: Level | null; prompt: string; options: string[]; answer: number | null;
  points: number; passage: string | null; rubric: string | null; audio_text?: string | null; audio_url?: string | null;
}

const LEVELS: Level[] = ["A1", "A2", "B1", "B2", "C1"];

/** points earned per question: marks if the exam was marked, else the auto check */
const earned = (q: ReviewQuestion, a: Attempt) =>
  a.marks?.[q.id] !== undefined ? Number(a.marks[q.id]) : q.kind === "mcq" && a.answers?.[q.id] !== undefined && Number(a.answers[q.id]) === q.answer ? Number(q.points) : 0;

function Bars({ title, note, rows, threshold }: { title: string; note?: string; rows: { label: string; sub?: string; got: number; of: number; tag?: string }[]; threshold?: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <h4 className="font-bold">{title}</h4>
      {note && <p className="mt-0.5 text-xs text-slate-500">{note}</p>}
      <ul className="mt-4 space-y-3">
        {rows.map((r) => {
          const pct = r.of ? Math.round((r.got / r.of) * 100) : 0;
          return (
            <li key={r.label} className="grid grid-cols-[72px_1fr_88px] items-center gap-3 text-sm" title={`${r.label}: ${fmtScore(r.got)} of ${fmtScore(r.of)} (${pct}%)`}>
              <span className="font-semibold capitalize">{r.label}{r.sub && <span className="block text-[11px] font-normal text-slate-400">{r.sub}</span>}</span>
              <span className="relative h-3.5 rounded-full bg-slate-100">
                <span className="absolute inset-y-0 left-0 rounded-full bg-[#0f4ca7]" style={{ width: `${Math.max(pct, r.got > 0 ? 3 : 0)}%` }} />
                {threshold !== undefined && <span className="absolute -inset-y-1 border-l-2 border-dashed border-slate-400" style={{ left: `${threshold}%` }} />}
              </span>
              <span className="text-right tabular-nums text-slate-700"><b>{pct}%</b> <span className="text-xs text-slate-400">{fmtScore(r.got)}/{fmtScore(r.of)}</span>{r.tag && <span className="block text-[11px] font-bold text-emerald-700">{r.tag}</span>}</span>
            </li>
          );
        })}
      </ul>
      {threshold !== undefined && <p className="mt-3 flex items-center gap-2 text-xs text-slate-500"><span className="inline-block h-3 border-l-2 border-dashed border-slate-400" /> {threshold}% needed to pass a level</p>}
    </div>
  );
}

/** Charts: score by level (placement) and by skill */
export function ExamAnalysis({ questions, attempt, placement }: { questions: ReviewQuestion[]; attempt: Attempt; placement?: boolean }) {
  const byLevel = LEVELS.map((lv) => {
    const qs = questions.filter((q) => q.level === lv && q.kind === "mcq");
    return { label: lv, sub: levels[lv].name, got: qs.reduce((s, q) => s + earned(q, attempt), 0), of: qs.reduce((s, q) => s + Number(q.points), 0) };
  }).filter((r) => r.of > 0);
  const firstMiss = byLevel.findIndex((r) => r.got / r.of < 0.6);
  const levelRows = byLevel.map((r, i) => ({ ...r, tag: firstMiss === -1 || i < firstMiss ? "passed" : undefined }));
  const bySkill = skills.map((sk) => {
    const qs = questions.filter((q) => q.skill === sk);
    return { label: sk, got: qs.reduce((s, q) => s + earned(q, attempt), 0), of: qs.reduce((s, q) => s + Number(q.points), 0) };
  }).filter((r) => r.of > 0);
  const strong = [...bySkill].sort((a, b) => b.got / b.of - a.got / a.of);
  return (
    <div className="space-y-4">
      <div className={`grid gap-4 ${placement && levelRows.length > 1 ? "lg:grid-cols-2" : ""}`}>
        {placement && levelRows.length > 1 && <Bars title="Score by level" note="Levels are checked in order; the learner is placed at the last level passed." rows={levelRows} threshold={60} />}
        {bySkill.length > 0 && <Bars title="Score by skill" rows={bySkill} />}
      </div>
      {strong.length > 1 && (
        <p className="rounded-2xl bg-mist p-4 text-sm text-slate-700">
          Strongest: <b className="capitalize">{strong[0].label}</b> ({Math.round((strong[0].got / strong[0].of) * 100)}%) · Needs work: <b className="capitalize">{strong.at(-1)!.label}</b> ({Math.round((strong.at(-1)!.got / strong.at(-1)!.of) * 100)}%)
        </p>
      )}
    </div>
  );
}

/** Full read-only report of one attempt: every question, the learner's answer, the right answer, and charts */
export function AttemptReport({ attemptId, learner, email, onClose }: { attemptId: number; learner: string; email?: string; onClose: () => void }) {
  const [data, setData] = useState<{ attempt: Attempt; questions: ReviewQuestion[] } | null>(null);
  const [err, setErr] = useState("");
  useEffect(() => {
    supabase.rpc("attempt_review", { p_attempt: attemptId }).then(({ data, error }) => {
      if (error) return setErr(rpcError(error));
      setData(data as { attempt: Attempt; questions: ReviewQuestion[] });
    });
  }, [attemptId]);

  if (err) return <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{err}</p>;
  if (!data) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const { attempt: a, questions } = data;
  const placement = questions.some((q) => q.level && q.level !== "A1");
  const total = Number(a.total ?? questions.reduce((s, q) => s + Number(q.points), 0));
  const score = a.score ?? questions.reduce((s, q) => s + earned(q, a), 0);
  const right = questions.filter((q) => q.kind === "mcq" && earned(q, a) > 0).length;
  const mins = a.submitted_at ? Math.max(1, Math.round((new Date(a.submitted_at).getTime() - new Date(a.started_at).getTime()) / 60000)) : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 print:hidden">
        <button onClick={onClose} className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-brand-700"><ArrowLeft className="h-4 w-4" /> Back</button>
        <button onClick={() => window.print()} className="ml-auto flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"><Printer className="h-4 w-4" /> Print</button>
      </div>

      <div className="grid gap-4 rounded-3xl border border-slate-200 bg-white p-6 sm:grid-cols-[1fr_auto]">
        <div>
          <div className="text-xl font-extrabold">{learner}</div>
          {email && <div className="text-sm text-slate-500">{email}</div>}
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1">{right} of {questions.filter((q) => q.kind === "mcq").length} correct</span>
            {mins && <span className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1"><Clock className="h-3.5 w-3.5" /> {mins} min</span>}
            {a.submitted_at && <span className="rounded-full bg-slate-100 px-3 py-1">{new Date(a.submitted_at).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>}
          </div>
        </div>
        <div className="flex items-center gap-5 sm:justify-end">
          <div className="text-right"><div className="text-4xl font-extrabold text-brand-700">{fmtScore(score)}<span className="text-lg text-slate-400"> / {fmtScore(total)}</span></div><div className="text-sm text-slate-500">{total ? Math.round((Number(score) / total) * 100) : 0}%</div></div>
          {a.result_level && <div className="grid h-20 w-20 place-items-center rounded-full brand-gradient text-center"><span className="text-2xl font-extrabold text-gold-300">{a.result_level}</span></div>}
        </div>
      </div>

      <ExamAnalysis questions={questions} attempt={a} placement={placement} />

      <div>
        <h3 className="mb-3 font-bold">All questions</h3>
        <ol className="space-y-3">
          {questions.map((q, i) => {
            const given = a.answers?.[q.id];
            const ok = earned(q, a) >= Number(q.points) && Number(q.points) > 0;
            return (
              <li key={q.id} className={`rounded-2xl border bg-white p-4 text-sm ${ok ? "border-slate-200" : "border-red-200"}`}>
                {q.passage && q.passage !== questions[i - 1]?.passage && <p className="mb-3 rounded-xl bg-mist p-3 text-slate-600">{q.passage}</p>}
                <div className="flex items-start gap-3">
                  {q.kind === "mcq" ? (ok ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" /> : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />) : <span className="w-5 shrink-0 text-slate-400">{i + 1}.</span>}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-semibold"><span className="text-slate-400">{i + 1}.</span> {q.prompt}</p>
                      <span className="flex shrink-0 gap-1.5 text-[11px] font-bold">
                        {q.level && <span className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-700">{q.level}</span>}
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 capitalize text-slate-600">{q.skill}</span>
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600">{fmtScore(earned(q, a))}/{fmtScore(q.points)}</span>
                      </span>
                    </div>
                    {q.audio_text && <p className="mt-1 flex items-start gap-1.5 text-xs italic text-slate-500"><Headphones className="mt-0.5 h-3.5 w-3.5 shrink-0" /> “{q.audio_text}”</p>}
                    {q.kind === "mcq" ? (
                      <div className="mt-2 grid gap-1.5 sm:grid-cols-2">
                        {q.options.map((o, k) => {
                          const isRight = k === q.answer, picked = given !== undefined && Number(given) === k;
                          return (
                            <div key={k} className={`rounded-lg border px-3 py-1.5 ${isRight ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-800" : picked ? "border-red-300 bg-red-50 text-red-700 line-through" : "border-slate-100 text-slate-500"}`}>
                              <span className="mr-1.5 text-xs opacity-60">{"ABCD"[k]}</span>{o}{picked && <span className="ml-1.5 text-xs no-underline">← chosen</span>}
                            </div>
                          );
                        })}
                        {given === undefined && <p className="text-xs font-semibold text-amber-700 sm:col-span-2">Not answered</p>}
                      </div>
                    ) : (
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-slate-50 p-3">{(given as string) || <i className="text-slate-400">No answer</i>}</p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
      {a.feedback && <p className="rounded-2xl bg-mist p-4 text-sm"><b>Teacher feedback:</b> {a.feedback}</p>}
    </div>
  );
}
