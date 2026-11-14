"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";
import { findLesson } from "@/data/courses";
import { useCatalog } from "@/lib/catalog";
import { LessonGate } from "./LessonGate";

/** Opens a lesson from the live catalog, so edits made in the Course Builder show up */
export function LessonRoute({ courseSlug, lessonId }: { courseSlug: string; lessonId: string }) {
  const loaded = useCatalog((s) => s.loaded);
  const f = findLesson(courseSlug, lessonId);
  if (!f)
    return loaded ? (
      <div className="grid min-h-screen place-items-center px-6 text-center">
        <div>
          <h1 className="text-2xl font-extrabold">Lesson not found</h1>
          <p className="mt-2 text-slate-500">This lesson doesn&apos;t exist or isn&apos;t published yet.</p>
          <Link href="/courses/" className="btn-primary mt-6 inline-block px-6 py-3">Browse courses</Link>
        </div>
      </div>
    ) : (
      <div className="grid min-h-screen place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>
    );
  return <LessonGate key={`${courseSlug}/${lessonId}`} course={f.course} lesson={f.lesson} nextId={f.next?.id} />;
}
