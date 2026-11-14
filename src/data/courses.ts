import type { Course, CourseType, Level, Module, ProgramId } from "@/lib/types";
import { ge1Modules } from "./lessons/ge1";
import foundationsModules from "./lessons/foundations.json";
import { biz1Modules, conv1Modules, ge2Modules, ielts1Modules, kids1Modules } from "./lessons/others";

export const programs: Record<ProgramId, { name: string; desc: string; icon: string }> = {
  GE: { name: "General English", desc: "A step-by-step path from zero to C1, built on the CEFR.", icon: "🎯" },
  KIDS: { name: "English for Kids", desc: "Short lessons with pictures, sounds and games for ages 5–10.", icon: "🧸" },
  CONV: { name: "Everyday Conversation", desc: "Real situations: the café, the airport, the doctor, the phone.", icon: "💬" },
  BIZ: { name: "Business English", desc: "Emails, meetings and presentations at work.", icon: "💼" },
  IELTS: { name: "IELTS Preparation", desc: "Strategies and academic vocabulary for all four skills.", icon: "🎓" },
};

export const levels: Record<Level, { name: string }> = {
  A1: { name: "Beginner" },
  A2: { name: "Elementary" },
  B1: { name: "Intermediate" },
  B2: { name: "Upper-Intermediate" },
  C1: { name: "Advanced" },
};

export const courseTypes: Record<CourseType, string> = {
  self: "Self-paced",
  live: "Live classes",
  mixed: "Mixed mode",
};

const soon = (titles: string[]) => [{ title: "In preparation", lessons: [], upcoming: titles }];

export const courses: Course[] = [
  {
    slug: "general-english-1",
    code: "GE-A1",
    program: "GE",
    level: "A1",
    title: "General English 1 — Starter",
    description:
      "The starting point for complete beginners: greetings, introductions, family, numbers, jobs and daily life, in short sentences you hear, say and write.",
    outcomes: [
      "Introduce yourself and your family",
      "Use about 60 key words in correct sentences",
      "Understand and follow short, slow dialogues",
      "Order food and ask for directions",
    ],
    skills: ["Listening", "Speaking", "Vocabulary", "Grammar", "Writing"],
    hours: 24,
    type: "self",
    price: 0,
    certificate: true,
    cover: { from: "#1f66c8", to: "#0b326d", icon: "🚀" },
    modules: ge1Modules,
    order: 1,
  },
  {
    slug: "english-foundations-live",
    code: "GE-A1-LIVE",
    program: "GE",
    level: "A1",
    title: "English Foundations — Live Beginner (A1)",
    description:
      "An 80-hour live beginner course with a teacher: 20 class days of 4 hours (weekends and holidays excluded). Six units take you from spelling, numbers and time to describing people and places, daily routines, shopping, directions, health, plans and your first stories in the past. Mapped to the CEFR A1 level and the Cambridge A1 grammar and topic areas. Graded out of 100: final exam 40, unit tests 20, presentation 10, homework 10, attendance 10, participation 10. Pass mark 60 — the certificate is issued automatically.",
    outcomes: [
      "Spell names, say prices, dates and the time",
      "Describe people, your home and your daily routine",
      "Shop, order food, ask for and give directions",
      "Say what you can do, give simple advice and talk about plans",
      "Tell a short story about last weekend in the past simple",
      "Use about 110 new words in correct sentences",
    ],
    skills: ["Listening", "Speaking", "Reading", "Writing", "Grammar", "Vocabulary"],
    hours: 80,
    type: "live",
    price: 150,
    certificate: true,
    cover: { from: "#0f4ca7", to: "#efb52a", icon: "🎓" },
    isNew: true,
    modules: foundationsModules as Module[],
    order: 1.5,
  },
  {
    slug: "general-english-2",
    code: "GE-A2",
    program: "GE",
    level: "A2",
    title: "General English 2 — Elementary",
    description:
      "Talk about the past, go shopping, travel and visit the doctor. Move from single sentences to describing your own experiences.",
    outcomes: ["Tell simple stories in the past", "Handle shops and transport", "Compare things", "Write a short message"],
    skills: ["Listening", "Speaking", "Reading", "Grammar"],
    hours: 30,
    type: "self",
    price: 49,
    certificate: true,
    cover: { from: "#2a74d6", to: "#0c3d88", icon: "🧭" },
    modules: ge2Modules,
    order: 2,
  },
  {
    slug: "general-english-3",
    code: "GE-B1",
    program: "GE",
    level: "B1",
    title: "General English 3 — Intermediate",
    description:
      "Give opinions, tell stories and discuss work and society, using the present perfect and conditionals.",
    outcomes: ["Give and support your opinion", "Follow the main ideas in the news", "Use perfect tenses", "Write a connected paragraph"],
    skills: ["Speaking", "Reading", "Writing", "Grammar"],
    hours: 40,
    type: "mixed",
    price: 69,
    certificate: true,
    cover: { from: "#0f4ca7", to: "#061a37", icon: "🏔️" },
    modules: soon(["Opinions & debate", "Stories & events", "Work & the future", "Society & media"]),
    order: 3,
  },
  {
    slug: "general-english-4",
    code: "GE-B2",
    program: "GE",
    level: "B2",
    title: "General English 4 — Upper-Intermediate",
    description: "Greater fluency in discussion and writing, and confidence with authentic articles and podcasts.",
    outcomes: ["Take part in extended discussions", "Write a well-organized opinion essay", "Understand native speakers at natural speed"],
    skills: ["Speaking", "Listening", "Writing"],
    hours: 45,
    type: "mixed",
    price: 79,
    certificate: true,
    cover: { from: "#0c3d88", to: "#0a2852", icon: "🛫" },
    modules: soon(["Argument & persuasion", "Language in the media", "Idioms"]),
    order: 4,
  },
  {
    slug: "general-english-5",
    code: "GE-C1",
    program: "GE",
    level: "C1",
    title: "General English 5 — Advanced",
    description: "Precision and range: rich vocabulary, academic and professional writing, and subtle differences in meaning.",
    outcomes: ["Express yourself precisely and flexibly", "Write academic and professional texts", "Understand complex texts"],
    skills: ["Writing", "Reading", "Speaking"],
    hours: 50,
    type: "live",
    price: 99,
    certificate: true,
    cover: { from: "#0a2852", to: "#061a37", icon: "👑" },
    modules: soon(["Style & register", "Academic writing", "Public speaking"]),
    order: 5,
  },
  {
    slug: "kids-english-1",
    code: "KIDS-1",
    program: "KIDS",
    level: "A1",
    title: "Little Leapers 1",
    description: "A colorful start for children: colors, animals and numbers with pictures, sounds, matching and speaking games.",
    outcomes: ["Name colors and animals in English", "Say simple words with confidence", "Understand very short sentences"],
    skills: ["Listening", "Pronunciation", "Vocabulary"],
    hours: 12,
    type: "self",
    price: 0,
    certificate: false,
    ageGroup: "Ages 5–8",
    cover: { from: "#efb52a", to: "#ce961d", icon: "🦁" },
    modules: kids1Modules,
    isNew: true,
    order: 6,
  },
  {
    slug: "kids-english-2",
    code: "KIDS-2",
    program: "KIDS",
    level: "A1",
    title: "Little Leapers 2",
    description: "School, home, food and clothes, with short listening stories and songs.",
    outcomes: ["Describe home and school", "Build sentences of 3–4 words"],
    skills: ["Listening", "Pronunciation", "Reading"],
    hours: 14,
    type: "self",
    price: 29,
    certificate: false,
    ageGroup: "Ages 7–10",
    cover: { from: "#f3c74d", to: "#a97716", icon: "🎈" },
    modules: soon(["My school", "My home", "My clothes", "My favorite food"]),
    order: 7,
  },
  {
    slug: "everyday-conversation",
    code: "CONV-1",
    program: "CONV",
    level: "A2",
    title: "Everyday Conversation",
    description: "Ready-to-use phrases for the situations you meet every day when living or traveling abroad.",
    outcomes: ["Order politely in cafés and shops", "Get through the airport with confidence", "Ask questions and ask for help"],
    skills: ["Speaking", "Listening", "Pronunciation"],
    hours: 18,
    type: "self",
    price: 39,
    certificate: true,
    cover: { from: "#1f66c8", to: "#ce961d", icon: "☕" },
    modules: conv1Modules,
    isNew: true,
    order: 8,
  },
  {
    slug: "business-english",
    code: "BIZ-1",
    program: "BIZ",
    level: "B1",
    title: "Business English Essentials",
    description: "The language of the office: professional introductions, formal emails, meetings and presentations.",
    outcomes: ["Introduce yourself and your role", "Write a clear formal email", "Run a short meeting"],
    skills: ["Speaking", "Writing", "Vocabulary"],
    hours: 26,
    type: "mixed",
    price: 89,
    certificate: true,
    cover: { from: "#0b326d", to: "#845b13", icon: "📊" },
    modules: biz1Modules,
    order: 9,
  },
  {
    slug: "ielts-preparation",
    code: "IELTS-1",
    program: "IELTS",
    level: "B2",
    title: "IELTS Preparation",
    description: "Academic vocabulary and strategies for the four skills, with model answers for Writing and Speaking.",
    outcomes: ["Describe charts in Task 1", "Structure a Task 2 essay", "Manage your time in the exam"],
    skills: ["Writing", "Reading", "Listening", "Speaking"],
    hours: 36,
    type: "mixed",
    price: 119,
    certificate: true,
    cover: { from: "#0c3d88", to: "#efb52a", icon: "🏆" },
    modules: ielts1Modules,
    order: 10,
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);

/* ------------------------------------------------------------------ */
/* Courses edited in the Course Builder live in the database and replace */
/* or extend this list at runtime (src/lib/catalog.ts). Pages built at   */
/* deploy time exist only for these built-in courses and lessons; any    */
/* other course or lesson opens through the /view/ pages.                */

export const builtInCourses: Course[] = courses.map((c) => ({ ...c }));
const builtSlugs = new Set(courses.map((c) => c.slug));
const builtLessons = new Set(courses.flatMap((c) => c.modules.flatMap((m) => m.lessons.map((l) => `${c.slug}/${l.id}`))));

export const courseHref = (slug: string) => (builtSlugs.has(slug) ? `/courses/${slug}/` : `/courses/view/?c=${encodeURIComponent(slug)}`);
export const lessonHref = (slug: string, lessonId: string) =>
  builtLessons.has(`${slug}/${lessonId}`)
    ? `/learn/${slug}/${lessonId}/`
    : `/learn/view/?c=${encodeURIComponent(slug)}&l=${encodeURIComponent(lessonId)}`;

export const courseLessons = (c: Course) => c.modules.flatMap((m) => m.lessons);

export const lessonCount = (c: Course) =>
  c.modules.reduce((n, m) => n + m.lessons.length + (m.upcoming?.length ?? 0), 0);

export const isAvailable = (c: Course) => courseLessons(c).length > 0;

export const findLesson = (courseSlug: string, lessonId: string) => {
  const c = getCourse(courseSlug);
  if (!c) return undefined;
  const all = courseLessons(c);
  const i = all.findIndex((l) => l.id === lessonId);
  if (i < 0) return undefined;
  return { course: c, lesson: all[i], index: i, next: all[i + 1] };
};

export const totals = () => {
  const ls = courses.flatMap(courseLessons);
  return {
    courses: courses.length,
    lessons: ls.length,
    words: ls.reduce((n, l) => n + l.words.length, 0),
    programs: Object.keys(programs).length,
  };
};

export const formatPrice = (p: number) => (p === 0 ? "Free" : `$${p}`);
