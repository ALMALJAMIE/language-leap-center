"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BookOpenCheck, ChevronDown, ClipboardPlus, Flame, Loader2, Users, Zap } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtWhen, type Assignment, type PrivateLesson } from "@/lib/teaching";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";
import { Empty, StatusBadge } from "@/components/teaching/ui";

interface Student {
  student_id: string; name: string; email: string; lessons: number; next_lesson: string | null; last_lesson: string | null;
  open_assignments: number; xp: number; streak: number; completed_lessons: number; last_active: string | null;
}

export default function StudentsPage() {
  return (
    <StaffShell page="/staff/students/" title="My Students" subtitle="Learners you teach, their progress on the platform and your notes">
      <Students />
    </StaffShell>
  );
}

function Students() {
  const [rows, setRows] = useState<Student[] | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  useEffect(() => {
    supabase.rpc("teacher_students").then(({ data, error }) => {
      setErr(rpcError(error));
      setRows((data as Student[]) ?? []);
    });
  }, []);

  if (rows === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  return (
    <>
      <ErrorNote text={err} />
      {rows.length === 0 ? (
        <Empty icon={Users} title="No students yet" text="Learners appear here after you confirm their first lesson." />
      ) : (
        <div className="space-y-3">
          {rows.map((s) => (
            <div key={s.student_id} className="rounded-2xl border border-slate-200 bg-white">
              <button onClick={() => setOpen(open === s.student_id ? null : s.student_id)} className="flex w-full flex-wrap items-center gap-4 p-5 text-left">
                <span className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white">{s.name.slice(0, 1).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <b className="block">{s.name}</b>
                  <span className="text-xs text-slate-500">{s.email}</span>
                </span>
                <span className="grid grid-cols-4 gap-5 text-center text-xs text-slate-500">
                  <span><b className="block text-base text-ink">{s.lessons}</b>with you</span>
                  <span><b className="flex items-center justify-center gap-0.5 text-base text-ink"><BookOpenCheck className="h-4 w-4 text-emerald-500" />{s.completed_lessons}</b>course lessons</span>
                  <span><b className="flex items-center justify-center gap-0.5 text-base text-ink"><Zap className="h-4 w-4 text-gold-500" />{s.xp}</b>XP</span>
                  <span><b className="flex items-center justify-center gap-0.5 text-base text-ink"><Flame className="h-4 w-4 text-orange-500" />{s.streak}</b>streak</span>
                </span>
                <span className="w-44 text-right text-xs text-slate-500">
                  {s.next_lesson ? <>Next: <b className="text-ink">{fmtWhen(s.next_lesson)}</b></> : "No lesson booked"}
                  {s.open_assignments > 0 && <span className="mt-1 block font-semibold text-orange-600">{s.open_assignments} open assignment{s.open_assignments > 1 ? "s" : ""}</span>}
                </span>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition ${open === s.student_id ? "rotate-180" : ""}`} />
              </button>
              {open === s.student_id && <Detail s={s} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

function Detail({ s }: { s: Student }) {
  const [lessons, setLessons] = useState<PrivateLesson[] | null>(null);
  const [tasks, setTasks] = useState<Assignment[]>([]);
  const load = useCallback(async () => {
    const [l, a] = await Promise.all([
      supabase.from("private_lessons").select("*").eq("student_id", s.student_id).order("starts_at", { ascending: false }),
      supabase.from("assignments").select("*").eq("student_id", s.student_id).order("created_at", { ascending: false }),
    ]);
    setLessons((l.data as PrivateLesson[]) ?? []);
    setTasks((a.data as Assignment[]) ?? []);
  }, [s.student_id]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (!lessons) return <div className="border-t border-slate-100 p-5"><Loader2 className="mx-auto h-5 w-5 animate-spin text-slate-300" /></div>;
  return (
    <div className="grid gap-6 border-t border-slate-100 p-5 lg:grid-cols-2">
      <section>
        <h3 className="mb-3 text-sm font-bold">Lesson history & notes</h3>
        <div className="space-y-2">
          {lessons.filter((l) => l.status !== "declined").map((l) => (
            <div key={l.id} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3 text-sm">
              <div className="flex flex-wrap items-center gap-2"><b>{fmtWhen(l.starts_at)}</b><span className="text-slate-500">· {l.minutes} min</span><StatusBadge status={l.status} /></div>
              {l.summary && <p className="mt-1.5 text-slate-700"><span className="text-xs font-bold uppercase text-slate-400">Covered:</span> {l.summary}</p>}
              {l.next_focus && <p className="mt-1 text-slate-700"><span className="text-xs font-bold uppercase text-slate-400">Next:</span> {l.next_focus}</p>}
            </div>
          ))}
        </div>
      </section>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold">Assignments</h3>
          <Link href={`/staff/assignments/?student=${s.student_id}`} className="flex items-center gap-1.5 text-xs font-bold text-brand-700 hover:underline"><ClipboardPlus className="h-3.5 w-3.5" /> New assignment</Link>
        </div>
        {tasks.length === 0 ? <p className="text-sm text-slate-500">No assignments yet.</p> : (
          <ul className="space-y-2">
            {tasks.map((a) => (
              <li key={a.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 p-3 text-sm">
                <span><b>{a.title}</b><span className="block text-xs text-slate-500">Given {fmtDate(a.created_at)}</span></span>
                <span className="text-xs font-bold">{a.status === "graded" ? <span className="text-emerald-600">{a.grade}/100</span> : a.status === "submitted" ? <span className="text-orange-600">To grade</span> : <span className="text-slate-400">Waiting</span>}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-slate-500">Last studied on the platform: {s.last_active ? fmtDate(s.last_active) : "—"}</p>
      </section>
    </div>
  );
}
