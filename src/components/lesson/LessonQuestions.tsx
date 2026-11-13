"use client";

import { useCallback, useEffect, useState } from "react";
import { CircleHelp, Loader2, MessageCircleQuestion, Send, X } from "lucide-react";
import { displayName, supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import type { Question } from "@/lib/teaching";

/** "Ask a teacher" — questions about one lesson, with answers shared with every learner */
export function LessonQuestions({ course, lesson, title, variant = "icon" }: { course: string; lesson: string; title: string; variant?: "icon" | "button" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {variant === "icon" ? (
        <button onClick={() => setOpen(true)} aria-label="Questions about this lesson" title="Ask a teacher" className="grid h-9 w-9 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-brand-600">
          <CircleHelp className="h-6 w-6" />
        </button>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center justify-center gap-2 py-2 font-bold text-brand-700">
          <MessageCircleQuestion className="h-5 w-5" /> Ask a teacher about this lesson
        </button>
      )}
      {open && <Drawer course={course} lesson={lesson} title={title} onClose={() => setOpen(false)} />}
    </>
  );
}

function Drawer({ course, lesson, title, onClose }: { course: string; lesson: string; title: string; onClose: () => void }) {
  const { user, openModal } = useAuth();
  const [rows, setRows] = useState<Question[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("lesson_questions").select("*").eq("course_slug", course).eq("lesson_id", lesson).order("created_at", { ascending: false });
    setErr(rpcError(error));
    setRows((data as Question[]) ?? []);
  }, [course, lesson]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || text.trim().length < 3) return;
    setBusy(true);
    const { error } = await supabase.from("lesson_questions").insert({
      course_slug: course, lesson_id: lesson, student_id: user.id, student_name: displayName(user).split(" ")[0], body: text.trim(),
    });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    setText("");
    load();
  };

  const mine = (rows ?? []).filter((q) => q.student_id === user?.id);
  const others = (rows ?? []).filter((q) => q.student_id !== user?.id && q.answer);

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-black/30" onClick={onClose}>
      <aside className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gold-600">Ask a teacher</div>
            <h2 className="mt-0.5 font-bold">{title}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {err && <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{err}</p>}
          {rows === null && <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />}
          {mine.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Your questions</h3>
              <div className="space-y-3">{mine.map((q) => <QA key={q.id} q={q} own />)}</div>
            </section>
          )}
          {others.length > 0 && (
            <section>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Answered for other learners</h3>
              <div className="space-y-3">{others.map((q) => <QA key={q.id} q={q} />)}</div>
            </section>
          )}
          {rows !== null && rows.length === 0 && (
            <div className="py-8 text-center text-sm text-slate-500">
              <MessageCircleQuestion className="mx-auto h-10 w-10 text-slate-300" />
              <p className="mt-2">Something not clear in this lesson? Ask — a teacher will answer you here.</p>
            </div>
          )}
        </div>

        <form onSubmit={ask} className="border-t border-slate-100 p-4">
          {user ? (
            <>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={2000} placeholder="Type your question in English or Arabic…" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500" />
              <button disabled={busy || text.trim().length < 3} className="btn-primary mt-2 flex w-full items-center justify-center gap-2 py-2.5 text-sm disabled:opacity-50">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send question
              </button>
            </>
          ) : (
            <button type="button" onClick={() => openModal("signin")} className="btn-primary w-full py-2.5 text-sm">Sign in to ask a question</button>
          )}
        </form>
      </aside>
    </div>
  );
}

function QA({ q, own }: { q: Question; own?: boolean }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-sm font-semibold text-ink"><span className="text-slate-400">{own ? "You" : q.student_name ?? "Learner"}:</span> <span dir="auto">{q.body}</span></p>
      {q.answer ? (
        <div className="mt-3 rounded-xl bg-emerald-50/70 p-3 text-sm">
          <div className="text-xs font-bold text-emerald-700">{q.answerer_name ?? "LLC Teacher"} answered</div>
          <p className="mt-1 whitespace-pre-line text-slate-700" dir="auto">{q.answer}</p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-amber-600">Waiting for a teacher&apos;s answer…</p>
      )}
    </div>
  );
}
