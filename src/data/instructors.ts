import type { ProgramId } from "@/lib/types";

/**
 * Teachers shown on /instructors/.
 *
 * Add one object per real teacher. Put the photo in public/instructors/
 * (for example public/instructors/sara.jpg) and write photo: "/instructors/sara.jpg".
 * Leave out any number you don't have (rating, students…) — the card hides it.
 */
export interface Instructor {
  slug: string; // short id used in the link, e.g. "sara-ahmed"
  name: string;
  title: string; // one line, e.g. "CELTA-certified English teacher | 8 years experience"
  bio: string;
  photo?: string;
  country?: string;
  languages: string[]; // languages the teacher speaks, e.g. ["English", "Arabic"]
  specialties: ProgramId[]; // GE | KIDS | CONV | BIZ | IELTS
  qualifications?: string[]; // e.g. ["CELTA", "MA TESOL"]
  experienceYears?: number;
  courses?: string[]; // slugs of LLC courses this teacher leads
  students?: number;
  rating?: number; // 0–5, only from real learner reviews
  reviews?: number;
  hourly?: number; // USD per hour for private lessons
  packagesFrom?: number; // USD per hour inside a lesson package
  privateLessons: boolean; // show the "Book a private lesson" button
  verified?: boolean;
}

export const instructors: Instructor[] = [];

export const languageOptions = (): string[] =>
  [...new Set(instructors.flatMap((i) => i.languages))].sort();

export const getInstructor = (slug: string) => instructors.find((i) => i.slug === slug);
