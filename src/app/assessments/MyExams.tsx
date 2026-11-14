"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FileCheck2, Play } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { getCourse } from "@/data/courses";
import { useEnrollments } from "@/lib/enrollments";
import { attemptStatus, fmtScore, kindInfo, type Attempt, type Exam } from "@/lib/exams";

/** Unit tests and final exams of the learner's courses */
export function MyExams() {
  const user = useAuth((s) => s.user);
  const slugs = useEnrollments((s) => s.slugs);
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("exams").select("*").neq("kind", "placement").order("course_slug").order("unit_index", { nullsFirst: false }).order("id"),
      supabase.from("exam_attempts").select("*").eq("user_id", user.id),
    ]).then(([e, a]) => {
      setExams((e.data as Exam[]) ?? []);
      setAttempts((a.data as Attempt[]) ?? []);
    });
  }, [user]);

  const mine = exams.filter((e) => e.course_slug && slugs.includes(e.course_slug));
  const taken = exams.filter((e) => attempts.some((a) => a.exam_id === e.id) && !mine.includes(e));
  const list = [...mine, ...taken];
  if (!list.length) return null;

  return (
    <section className="mb-8">
      <h2 className="mb-3 flex items-center gap-2 font-bold"><FileCheck2 className="h-5 w-5 text-brand-600" /> Course exams</h2>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-3xl border border-slate-200 bg-white">
        {list.map((e) => {
          const a = attempts.find((x) => x.exam_id === e.id);
          const k = kindInfo[e.kind];
          return (
            <li key={e.id} className="flex flex-wrap items-center gap-4 px-6 py-4">
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${k.cls}`}>{k.label}</span>
              <div className="min-w-0 flex-1">
                <div className="font-semibold">{e.title}</div>
                <div className="text-xs text-slate-500">{getCourse(e.course_slug ?? "")?.title ?? e.course_slug} · {e.minutes} min</div>
              </div>
              {a ? (
                a.status === "in_progress" ? (
                  <Link href={`/exam/?id=${e.id}`} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"><Play className="h-4 w-4" /> Continue</Link>
                ) : a.status === "graded" ? (
                  <span className="text-right"><b className="text-lg">{fmtScore(a.score)} / {fmtScore(a.total)}</b>{a.feedback && <span className="block max-w-xs text-xs text-slate-500">“{a.feedback}”</span>}</span>
                ) : (
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${attemptStatus[a.status].cls}`}>{attemptStatus[a.status].label}</span>
                )
              ) : e.published ? (
                <Link href={`/exam/?id=${e.id}`} className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"><Play className="h-4 w-4" /> Start</Link>
              ) : (
                <span className="text-xs text-slate-400">Opens in class</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
