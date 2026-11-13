import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { courseLessons, courses, findLesson } from "@/data/courses";
import { LessonPlayer } from "@/components/lesson/LessonPlayer";

export const dynamicParams = false;

export function generateStaticParams() {
  return courses.flatMap((c) => courseLessons(c).map((l) => ({ course: c.slug, lesson: l.id })));
}

type P = { params: Promise<{ course: string; lesson: string }> };

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { course, lesson } = await params;
  const f = findLesson(course, lesson);
  return { title: f ? `${f.lesson.title} — ${f.course.title}` : "Lesson" };
}

export default async function Page({ params }: P) {
  const { course, lesson } = await params;
  const f = findLesson(course, lesson);
  if (!f) notFound();
  return <LessonPlayer key={`${course}/${lesson}`} course={f.course} lesson={f.lesson} nextId={f.next?.id} />;
}
