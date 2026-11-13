import type { Course } from "./types";
import { courseLessons, courses } from "@/data/courses";

type Completed = Record<string, { accuracy: number; xp: number; at: string }>;

export function courseProgress(c: Course, completed: Completed) {
  const lessons = courseLessons(c);
  const doneLessons = lessons.filter((l) => completed[`${c.slug}/${l.id}`]);
  const upcoming = c.modules.reduce((n, m) => n + (m.upcoming?.length ?? 0), 0);
  const total = lessons.length;
  const done = doneLessons.length;
  const allPublishedDone = total > 0 && done === total;
  const finishedAt = allPublishedDone ? doneLessons.map((l) => completed[`${c.slug}/${l.id}`].at).sort().at(-1)! : null;
  const avgAccuracy = done ? doneLessons.reduce((s, l) => s + completed[`${c.slug}/${l.id}`].accuracy, 0) / done : 0;
  return {
    lessons,
    total,
    done,
    upcoming,
    pct: total ? done / total : 0,
    next: lessons.find((l) => !completed[`${c.slug}/${l.id}`]),
    /** every published lesson is done */
    allPublishedDone,
    /** the whole course is done (nothing left to publish) and it awards a certificate */
    certified: c.certificate && allPublishedDone && upcoming === 0,
    finishedAt,
    avgAccuracy,
  };
}

export const startedCourses = (completed: Completed) =>
  courses.filter((c) => courseLessons(c).some((l) => completed[`${c.slug}/${l.id}`]));

/** Short verification code printed on each certificate */
export function certificateId(userKey: string, slug: string) {
  let h = 2166136261;
  for (const ch of `${userKey}|${slug}`) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return `LLC-${slug.split("-").map((w) => w[0]).join("").toUpperCase()}-${(h >>> 0).toString(36).toUpperCase().padStart(7, "0")}`;
}
