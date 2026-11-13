"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CalendarDays, Check, ClipboardPlus, Inbox, Link2, Loader2, NotebookPen, X } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtTime, fmtWhen, loadMyTeacher, money, useMyTeacher, type PrivateLesson } from "@/lib/teaching";
import { ErrorNote, StaffShell } from "@/components/staff/StaffShell";
import { Empty, JoinButton, StatusBadge, Tabs, useNow } from "@/components/teaching/ui";

type Tab = "requests" | "upcoming" | "close" | "history";

export default function TeacherLessonsPage() {
  return (
    <StaffShell page="/staff/lessons/" title="Lessons" subtitle="Booking requests, your schedule and lesson notes">
      <Lessons />
    </StaffShell>
  );
}

function Lessons() {
  const user = useAuth((s) => s.user)!;
  const profile = useMyTeacher((s) => s.profile);
  const now = useNow();
  const [rows, setRows] = useState<PrivateLesson[] | null>(null);
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<Tab | null>(null);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("private_lessons").select("*").eq("teacher_id", user.id).order("starts_at");
    setErr(rpcError(error));
    setRows((data as PrivateLesson[]) ?? []);
  }, [user.id]);
  useEffect(() => {
    loadMyTeacher(user.id);
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load, user.id]);

  if (rows === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const ends = (l: PrivateLesson) => new Date(l.starts_at).getTime() + l.minutes * 60_000;
  const by: Record<Tab, PrivateLesson[]> = {
    requests: rows.filter((l) => l.status === "requested" && ends(l) > now),
    upcoming: rows.filter((l) => l.status === "confirmed" && ends(l) > now),
    close: rows.filter((l) => l.status === "confirmed" && ends(l) <= now),
    history: rows.filter((l) => !["requested", "confirmed"].includes(l.status) || (l.status === "requested" && ends(l) <= now)).reverse(),
  };
  const active: Tab = tab ?? (by.requests.length ? "requests" : by.close.length ? "close" : "upcoming");

  return (
    <>
      <ErrorNote text={err} />
      <Tabs value={active} onChange={setTab} items={[
        { id: "requests", label: "Requests", count: by.requests.length },
        { id: "upcoming", label: "Upcoming", count: by.upcoming.length },
        { id: "close", label: "To close", count: by.close.length },
        { id: "history", label: "History" },
      ]} />
      {by[active].length === 0 ? (
        <Empty
          icon={active === "requests" ? Inbox : CalendarDays}
          title={{ requests: "No new requests", upcoming: "No upcoming lessons", close: "All lessons are closed", history: "No past lessons yet" }[active]}
          text={active === "requests" ? "Learners book from the times you open in Availability." : undefined}
        >
          {active === "requests" && <Link href="/staff/availability/" className="btn-primary inline-block px-5 py-2.5 text-sm">Open my availability</Link>}
        </Empty>
      ) : (
        <div className="space-y-3">
          {by[active].map((l) => <Card key={l.id} l={l} now={now} defaultLink={profile?.meeting_link ?? ""} onChange={load} />)}
        </div>
      )}
    </>
  );
}

function Card({ l, now, defaultLink, onChange }: { l: PrivateLesson; now: number; defaultLink: string; onChange: () => void }) {
  const [link, setLink] = useState(l.meeting_link ?? defaultLink);
  const [editLink, setEditLink] = useState(false);
  const [closing, setClosing] = useState(false);
  const [notes, setNotes] = useState({ summary: l.summary ?? "", homework: l.homework ?? "", next: l.next_focus ?? "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const run = async (fn: () => PromiseLike<{ error: { message?: string } | null }>) => {
    setBusy(true);
    setErr("");
    const { error } = await fn();
    setBusy(false);
    if (error) return setErr(rpcError(error));
    onChange();
  };
  const start = new Date(l.starts_at).getTime();
  const done = l.status === "completed" || l.status === "no_show";

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-center leading-tight text-brand-800">
          <div><div className="text-[10px] font-bold uppercase">{new Date(l.starts_at).toLocaleDateString("en-GB", { month: "short" })}</div><div className="text-xl font-extrabold">{new Date(l.starts_at).getDate()}</div></div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><b>{l.student_name ?? "Learner"}</b><StatusBadge status={l.status} /></div>
          <div className="text-sm text-slate-500">{fmtWhen(l.starts_at)}–{fmtTime(new Date(start + l.minutes * 60_000))} · {l.minutes} min{done ? ` · you earn ${money(l.teacher_pay)}` : ""}</div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {l.status === "requested" && (
            <>
              <button disabled={busy} onClick={() => run(() => supabase.rpc("respond_private_lesson", { p_id: l.id, p_accept: true, p_link: link }))} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"><Check className="h-4 w-4" /> Accept</button>
              <button disabled={busy} onClick={() => confirm("Decline this request?") && run(() => supabase.rpc("respond_private_lesson", { p_id: l.id, p_accept: false }))} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:border-red-300 hover:text-red-600"><X className="h-4 w-4" /> Decline</button>
            </>
          )}
          {l.status === "confirmed" && start > now && (
            <>
              <JoinButton lesson={l} now={now} />
              <button onClick={() => setEditLink(!editLink)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-brand-400"><Link2 className="h-3.5 w-3.5" /> Link</button>
              {start - now > 24 * 3600_000 && <button onClick={() => confirm("Cancel this lesson? The learner will see it as cancelled.") && run(() => supabase.rpc("cancel_private_lesson", { p_id: l.id, p_reason: "Cancelled by teacher" }))} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600">Cancel</button>}
            </>
          )}
          {l.status === "confirmed" && start <= now && (
            <>
              <JoinButton lesson={l} now={now} />
              <button onClick={() => setClosing(!closing)} className="flex items-center gap-1.5 rounded-xl bg-brand-900 px-4 py-2 text-sm font-bold text-white hover:bg-brand-800"><NotebookPen className="h-4 w-4" /> Close lesson</button>
            </>
          )}
          {done && <button onClick={() => setClosing(!closing)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-brand-400"><NotebookPen className="h-3.5 w-3.5" /> Notes</button>}
          {(done || (l.status === "confirmed" && start <= now)) && (
            <Link href={`/staff/assignments/?student=${l.student_id}&lesson=${l.id}`} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-brand-400"><ClipboardPlus className="h-3.5 w-3.5" /> Assignment</Link>
          )}
        </div>
      </div>

      {l.student_note && <p className="mt-3 rounded-xl bg-gold-50/60 p-3 text-sm text-slate-700"><b className="text-gold-800">Learner&apos;s goal:</b> {l.student_note}</p>}
      {l.status === "requested" && (
        <label className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-slate-500">Lesson link:</span>
          <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://zoom.us/j/… or https://meet.google.com/…" className="min-w-64 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          {!defaultLink && <Link href="/staff/availability/" className="text-xs font-semibold text-brand-700 hover:underline">Save a default link</Link>}
        </label>
      )}
      {editLink && (
        <div className="mt-3 flex flex-wrap gap-2">
          <input value={link} onChange={(e) => setLink(e.target.value)} className="min-w-64 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500" />
          <button onClick={() => run(() => supabase.rpc("set_lesson_link", { p_id: l.id, p_link: link }))} className="btn-primary px-4 py-2 text-sm">Save link</button>
        </div>
      )}
      {closing && (
        <div className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4">
          <p className="text-sm font-semibold">Lesson notes <span className="font-normal text-slate-500">— the learner sees these in “My lessons”</span></p>
          <div className="grid gap-3 md:grid-cols-3">
            {([["summary", "What we covered"], ["homework", "Homework / practice"], ["next", "Focus for next time"]] as const).map(([k, label]) => (
              <label key={k} className="block"><span className="mb-1 block text-xs font-bold uppercase text-slate-500">{label}</span>
                <textarea rows={4} value={notes[k]} onChange={(e) => setNotes({ ...notes, [k]: e.target.value })} className="w-full rounded-xl border border-slate-300 p-2.5 text-sm outline-none focus:border-brand-500" />
              </label>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <button disabled={busy} onClick={() => run(() => supabase.rpc("finish_private_lesson", { p_id: l.id, p_status: "completed", p_summary: notes.summary, p_homework: notes.homework, p_next: notes.next }))} className="btn-primary px-5 py-2.5 text-sm">{done ? "Save notes" : "Lesson completed"}</button>
            {!done && <button disabled={busy} onClick={() => confirm("Mark that the learner did not attend?") && run(() => supabase.rpc("finish_private_lesson", { p_id: l.id, p_status: "no_show", p_summary: notes.summary, p_homework: notes.homework, p_next: notes.next }))} className="rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-600 hover:border-rose-300">Learner didn&apos;t attend</button>}
          </div>
        </div>
      )}
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
    </div>
  );
}
