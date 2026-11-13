"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CalendarClock, CalendarDays, CheckCircle2, Circle, ClipboardCheck, Inbox, Loader2, MessageCircleQuestion, Wallet } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { fmtTime, fmtWhen, loadMyTeacher, money, useMyTeacher, type PrivateLesson } from "@/lib/teaching";
import { JoinButton, useNow } from "@/components/teaching/ui";

export function TeacherHome() {
  const user = useAuth((s) => s.user)!;
  const { profile, loaded } = useMyTeacher();
  const now = useNow();
  const [lessons, setLessons] = useState<PrivateLesson[] | null>(null);
  const [toGrade, setToGrade] = useState(0);
  const [questions, setQuestions] = useState(0);
  const [balance, setBalance] = useState(0);
  const [hasSlots, setHasSlots] = useState(false);

  useEffect(() => {
    loadMyTeacher(user.id);
    Promise.all([
      supabase.from("private_lessons").select("*").eq("teacher_id", user.id).in("status", ["requested", "confirmed"]).order("starts_at"),
      supabase.from("assignments").select("id", { count: "exact", head: true }).eq("teacher_id", user.id).eq("status", "submitted"),
      supabase.from("lesson_questions").select("id", { count: "exact", head: true }).is("answer", null),
      supabase.rpc("teacher_balances"),
      supabase.from("availability").select("id", { count: "exact", head: true }).eq("teacher_id", user.id),
    ]).then(([l, a, q, b, av]) => {
      setLessons((l.data as PrivateLesson[]) ?? []);
      setToGrade(a.count ?? 0);
      setQuestions(q.count ?? 0);
      setBalance(Number(((b.data as { teacher_id: string; balance: number }[]) ?? []).find((x) => x.teacher_id === user.id)?.balance ?? 0));
      setHasSlots((av.count ?? 0) > 0);
    });
  }, [user.id]);

  if (!lessons || !loaded) return <div className="py-10"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>;

  const ends = (l: PrivateLesson) => new Date(l.starts_at).getTime() + l.minutes * 60_000;
  const requests = lessons.filter((l) => l.status === "requested" && ends(l) > now);
  const upcoming = lessons.filter((l) => l.status === "confirmed" && ends(l) > now);
  const toClose = lessons.filter((l) => l.status === "confirmed" && ends(l) <= now);
  const today = upcoming.filter((l) => new Date(l.starts_at).toDateString() === new Date(now).toDateString());

  const steps = [
    { done: !!profile, label: "Create your public profile", href: "/staff/my-profile/" },
    { done: !!profile?.meeting_link, label: "Add your Zoom or Google Meet link", href: "/staff/availability/" },
    { done: hasSlots, label: "Open your weekly hours", href: "/staff/availability/" },
    { done: !!profile?.published, label: "Get published by the team", href: "/staff/my-profile/" },
  ];
  const ready = steps.every((s) => s.done);

  const cards = [
    { l: "New requests", v: requests.length, icon: Inbox, href: "/staff/lessons/", c: "text-amber-600 bg-amber-50" },
    { l: "Lessons today", v: today.length, icon: CalendarDays, href: "/staff/lessons/", c: "text-emerald-600 bg-emerald-50" },
    { l: "Lessons to close", v: toClose.length, icon: CalendarClock, href: "/staff/lessons/", c: "text-brand-700 bg-brand-50" },
    { l: "Answers to grade", v: toGrade, icon: ClipboardCheck, href: "/staff/assignments/", c: "text-orange-600 bg-orange-50" },
    { l: "Questions waiting", v: questions, icon: MessageCircleQuestion, href: "/staff/questions/", c: "text-cyan-700 bg-cyan-50" },
    { l: "Balance due to you", v: money(balance), icon: Wallet, href: "/staff/earnings/", c: "text-gold-700 bg-gold-50" },
  ];

  return (
    <div className="mt-6 space-y-8">
      {!ready && (
        <section className="rounded-3xl border border-brand-200 bg-brand-50/50 p-6">
          <h2 className="font-bold">Get ready to teach</h2>
          <ol className="mt-3 grid gap-2 sm:grid-cols-2">
            {steps.map((s) => (
              <li key={s.label}>
                <Link href={s.href} className={`flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-sm ${s.done ? "text-slate-400 line-through" : "font-semibold text-ink hover:shadow"}`}>
                  {s.done ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Circle className="h-5 w-5 text-slate-300" />} {s.label}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.l} href={c.href} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${c.c}`}><c.icon className="h-6 w-6" /></span>
            <span><span className="block text-2xl font-extrabold text-ink">{c.v}</span><span className="text-sm text-slate-500">{c.l}</span></span>
          </Link>
        ))}
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-bold">Next lessons</h2><Link href="/staff/lessons/" className="text-sm font-semibold text-brand-700 hover:underline">All lessons</Link></div>
        {upcoming.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">No confirmed lessons coming up.</p>
        ) : (
          <div className="space-y-2">
            {upcoming.slice(0, 5).map((l) => (
              <div key={l.id} className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                <span className="w-40 text-sm font-bold">{fmtWhen(l.starts_at)}<span className="block text-xs font-normal text-slate-500">until {fmtTime(new Date(ends(l)))}</span></span>
                <span className="flex-1 text-sm"><b>{l.student_name ?? "Learner"}</b>{l.student_note && <span className="line-clamp-1 text-slate-500">{l.student_note}</span>}</span>
                <JoinButton lesson={l} now={now} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
