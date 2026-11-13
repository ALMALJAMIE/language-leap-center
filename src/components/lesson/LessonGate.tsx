"use client";

import Link from "next/link";
import { Loader2, Lock, ShoppingCart, X } from "lucide-react";
import type { Course, LessonSpec } from "@/lib/types";
import { formatPrice } from "@/data/courses";
import { useCourseAccess } from "@/lib/enrollments";
import { useAuth } from "@/lib/auth";
import { LessonPlayer } from "./LessonPlayer";

/** Paid courses: the lesson only opens for enrolled learners */
export function LessonGate({ course, lesson, nextId }: { course: Course; lesson: LessonSpec; nextId?: string }) {
  const access = useCourseAccess(course);
  const { user, openModal } = useAuth();

  if (access === "open") return <LessonPlayer course={course} lesson={lesson} nextId={nextId} />;
  if (access === "checking")
    return (
      <div className="grid min-h-screen place-items-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </div>
    );

  return (
    <div className="relative grid min-h-screen place-items-center bg-gradient-to-b from-brand-50 to-white px-6">
      <Link href={`/courses/${course.slug}/`} aria-label="Close" className="absolute left-6 top-6 text-slate-400 hover:text-slate-600"><X className="h-7 w-7" /></Link>
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gold-50 text-gold-600"><Lock className="h-8 w-8" /></div>
        <h1 className="mt-5 text-2xl font-extrabold">This lesson is part of a paid course</h1>
        <p className="mt-2 text-slate-600">
          Enroll in <b>{course.title}</b> to unlock “{lesson.title}” and every other lesson in the course.
        </p>
        {user ? (
          <Link href={`/checkout/?course=${course.slug}`} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-brand-950 py-3.5 font-bold text-white hover:bg-brand-800">
            <ShoppingCart className="h-5 w-5" /> Enroll Now — {formatPrice(course.price)}
          </Link>
        ) : (
          <button onClick={() => openModal("signin")} className="btn-primary mt-6 w-full py-3.5">Sign in to enroll</button>
        )}
        <Link href="/courses/general-english-1/" className="mt-4 block text-sm font-bold text-brand-600">Or start the free A1 course</Link>
      </div>
    </div>
  );
}
