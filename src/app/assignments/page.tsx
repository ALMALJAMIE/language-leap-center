"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, ClipboardList, Loader2, Mic, PenLine, Send } from "lucide-react";
import { AccountShell, SignInPrompt } from "@/components/account/AccountShell";
import { Recorder, Recording } from "@/components/teaching/Recorder";
import { Empty, Tabs } from "@/components/teaching/ui";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { useMounted } from "@/lib/store";
import { fmtWhen, loadTeachers, useTeacherList, type Assignment } from "@/lib/teaching";

type Tab = "todo" | "submitted" | "graded";

export default function AssignmentsPage() {
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const teachers = useTeacherList((s) => s.list);
  const [rows, setRows] = useState<Assignment[] | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab>("todo");

  const load = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase.from("assignments").select("*").eq("student_id", user.id).order("created_at", { ascending: false });
    setErr(rpcError(error));
    setRows((data as Assignment[]) ?? []);
  }, [user]);
  useEffect(() => {
    loadTeachers();
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const body = () => {
    if (!mounted || !ready) return null;
    if (!user) return <SignInPrompt text="Sign in to see the assignments from your teacher." />;
    if (rows === null) return <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>;
    const by = { todo: rows.filter((a) => a.status === "assigned"), submitted: rows.filter((a) => a.status === "submitted"), graded: rows.filter((a) => a.status === "graded") };
    const teacherName = (id: string) => teachers.find((t) => t.id === id)?.name ?? "Your teacher";
    return (
      <>
        {err && <p className="mb-4 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{err}</p>}
        <Tabs value={tab} onChange={setTab} items={[
          { id: "todo", label: "To do", count: by.todo.length },
          { id: "submitted", label: "Waiting for feedback", count: by.submitted.length },
          { id: "graded", label: "Graded", count: by.graded.length },
        ]} />
        {by[tab].length === 0 ? (
          <Empty icon={ClipboardList} title={tab === "todo" ? "Nothing to do right now" : tab === "submitted" ? "No answers waiting" : "No graded work yet"} text="Your teacher gives assignments after private lessons — writing tasks and speaking recordings." />
        ) : (
          <div className="space-y-4">{by[tab].map((a) => <Card key={a.id} a={a} teacher={teacherName(a.teacher_id)} onDone={load} userId={user.id} />)}</div>
        )}
      </>
    );
  };

  return <AccountShell title="Assignments" subtitle="Homework from your teacher, with grades and feedback">{body()}</AccountShell>;
}

function Card({ a, teacher, onDone, userId }: { a: Assignment; teacher: string; onDone: () => void; userId: string }) {
  const [open, setOpen] = useState(a.status === "assigned");
  const [text, setText] = useState(a.answer_text ?? "");
  const [audio, setAudio] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const needText = a.kind !== "speaking";
  const needVoice = a.kind !== "writing";
  const late = a.due_at && a.status === "assigned" && new Date(a.due_at) < new Date();

  const submit = async () => {
    if (needText && a.kind === "writing" && !text.trim()) return setErr("Write your answer first.");
    if (a.kind === "speaking" && !audio && !a.answer_audio) return setErr("Record your answer first.");
    setBusy(true);
    setErr("");
    let path = "";
    if (audio) {
      path = `${userId}/${a.id}.webm`;
      const up = await supabase.storage.from("recordings").upload(path, audio, { upsert: true, contentType: audio.type || "audio/webm" });
      if (up.error) {
        setBusy(false);
        return setErr(up.error.message);
      }
    }
    const { error } = await supabase.rpc("submit_assignment", { p_id: a.id, p_text: text, p_audio: path });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    onDone();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white">
      <button onClick={() => setOpen(!open)} className="flex w-full flex-wrap items-center gap-3 p-5 text-left">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${a.kind === "speaking" ? "bg-rose-50 text-rose-600" : "bg-orange-50 text-orange-600"}`}>{a.kind === "speaking" ? <Mic className="h-5 w-5" /> : <PenLine className="h-5 w-5" />}</span>
        <span className="min-w-0 flex-1">
          <b className="block">{a.title}</b>
          <span className="text-xs text-slate-500">From {teacher} · {a.kind === "both" ? "Writing + speaking" : a.kind === "speaking" ? "Speaking" : "Writing"}</span>
        </span>
        {a.status === "graded" ? (
          <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-lg font-extrabold text-emerald-700">{a.grade}<span className="text-xs font-semibold">/100</span></span>
        ) : a.due_at ? (
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${late ? "text-red-600" : "text-slate-500"}`}><CalendarClock className="h-4 w-4" /> Due {fmtWhen(a.due_at)}</span>
        ) : null}
      </button>
      {open && (
        <div className="space-y-4 border-t border-slate-100 p-5">
          {a.instructions && <p className="whitespace-pre-line rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-700">{a.instructions}</p>}
          {a.status === "graded" ? (
            <>
              {a.answer_text && <div><div className="text-xs font-bold uppercase text-slate-500">Your answer</div><p className="mt-1 whitespace-pre-line text-sm">{a.answer_text}</p></div>}
              {a.answer_audio && <Recording path={a.answer_audio} />}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-800"><CheckCircle2 className="h-4 w-4" /> Feedback from {teacher}</div>
                <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{a.feedback ?? "Well done!"}</p>
              </div>
            </>
          ) : (
            <>
              {needText && <textarea value={text} onChange={(e) => setText(e.target.value)} rows={6} placeholder="Write your answer here…" className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500" />}
              {needVoice && (
                <div className="space-y-2">
                  {a.answer_audio && !audio && <div className="text-xs text-slate-500">Your current recording: <Recording path={a.answer_audio} /></div>}
                  <Recorder onReady={setAudio} />
                </div>
              )}
              {err && <p className="text-sm text-red-600">{err}</p>}
              <button onClick={submit} disabled={busy} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm disabled:opacity-60">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {a.status === "submitted" ? "Update my answer" : "Send to teacher"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
