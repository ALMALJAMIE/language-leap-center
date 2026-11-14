"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, MessageCircleQuestion, Send } from "lucide-react";
import { supabase } from "@/lib/auth";
import { findLesson, getCourse } from "@/data/courses";
import { rpcError } from "@/lib/roles";
import { type Question } from "@/lib/teaching";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";
import { Empty, Tabs } from "@/components/teaching/ui";
import { lessonHref } from "@/data/courses";

type Tab = "open" | "answered";

export default function QuestionsPage() {
  return (
    <StaffShell page="/staff/questions/" title="Lesson Questions" subtitle="Questions learners ask inside the lessons. Shared answers help every learner who opens that lesson.">
      <Questions />
    </StaffShell>
  );
}

function Questions() {
  const [rows, setRows] = useState<Question[] | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("open");
  const load = useCallback(async () => {
    const { data, error } = await supabase.from("lesson_questions").select("*").order("created_at", { ascending: false }).limit(300);
    setErr(rpcError(error));
    setRows((data as Question[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (rows === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const open = rows.filter((q) => !q.answer).reverse();
  const answered = rows.filter((q) => q.answer);
  const list = tab === "open" ? open : answered;
  return (
    <>
      <ErrorNote text={err} />
      <Tabs value={tab} onChange={setTab} items={[{ id: "open", label: "Waiting for an answer", count: open.length }, { id: "answered", label: "Answered" }]} />
      {list.length === 0 ? (
        <Empty icon={MessageCircleQuestion} title={tab === "open" ? "No questions waiting" : "No answers yet"} text="Learners ask from the “?” button at the top of every lesson." />
      ) : (
        <div className="space-y-3">{list.map((q) => <Item key={q.id} q={q} onDone={load} />)}</div>
      )}
    </>
  );
}

function Item({ q, onDone }: { q: Question; onDone: () => void }) {
  const [text, setText] = useState(q.answer ?? "");
  const [shared, setShared] = useState(q.shared);
  const [edit, setEdit] = useState(!q.answer);
  const [err, setErr] = useState("");
  const found = findLesson(q.course_slug, q.lesson_id);
  const course = getCourse(q.course_slug);
  const send = async () => {
    if (text.trim().length < 2) return;
    const { error } = await supabase.rpc("answer_question", { p_id: q.id, p_answer: text, p_shared: shared });
    if (error) return setErr(rpcError(error));
    onDone();
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-brand-50 px-2.5 py-0.5 font-bold text-brand-700">{course?.code ?? q.course_slug}</span>
        <span className="font-semibold text-ink">{found?.lesson.title ?? q.lesson_id}</span>
        <Link href={lessonHref(q.course_slug, q.lesson_id)} target="_blank" className="flex items-center gap-1 text-brand-700 hover:underline">open lesson <ExternalLink className="h-3 w-3" /></Link>
        <span className="ml-auto">{q.student_name ?? "Learner"} · {fmtDate(q.created_at, true)}</span>
      </div>
      <p className="mt-3 font-semibold text-ink" dir="auto">{q.body}</p>
      {!edit && q.answer ? (
        <div className="mt-3 rounded-xl bg-emerald-50/70 p-3 text-sm">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-700">
            <span className="flex items-center gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> {q.answerer_name} · {q.shared ? "shared with all learners" : "only for this learner"}</span>
            <button onClick={() => setEdit(true)} className="text-slate-500 hover:text-ink">Edit</button>
          </div>
          <p className="mt-1 whitespace-pre-line text-slate-700" dir="auto">{q.answer}</p>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} placeholder="Write a clear, short answer with an example…" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500" dir="auto" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={shared} onChange={(e) => setShared(e.target.checked)} /> Show this answer to every learner of the lesson</label>
            <button onClick={send} className="btn-primary flex items-center gap-2 px-5 py-2 text-sm"><Send className="h-4 w-4" /> {q.answer ? "Update answer" : "Send answer"}</button>
          </div>
        </div>
      )}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
