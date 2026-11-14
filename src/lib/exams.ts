"use client";

import type { Level } from "./types";

export type ExamKind = "unit" | "final" | "placement" | "quiz";
export type Skill = "vocabulary" | "grammar" | "reading" | "listening" | "writing" | "speaking";

export interface Exam {
  id: number;
  course_slug: string | null;
  kind: ExamKind;
  unit_index: number | null;
  title: string;
  instructions: string | null;
  minutes: number;
  fee: number;
  published: boolean;
  created_at: string;
}

/** A question as the learner sees it (no answer) */
export interface PaperQuestion {
  id: number;
  kind: "mcq" | "written";
  skill: Skill;
  level: Level | null;
  prompt: string;
  options: string[];
  points: number;
  passage: string | null;
  audio_url: string | null;
  audio_text: string | null;
}

/** A question in the bank (team only) */
export interface BankQuestion extends PaperQuestion {
  course_slug: string | null;
  unit_index: number | null;
  answer: number | null;
  rubric: string | null;
  created_by: string | null;
  created_at: string;
}

export interface Attempt {
  id: number;
  exam_id: number;
  user_id: string;
  started_at: string;
  deadline: string;
  submitted_at: string | null;
  answers: Record<string, number | string>;
  marks: Record<string, number>;
  feedback: string | null;
  auto_score: number | null;
  score: number | null;
  total: number | null;
  result_level: Level | null;
  status: "in_progress" | "submitted" | "graded";
}

export const kindInfo: Record<ExamKind, { label: string; cls: string }> = {
  unit: { label: "Unit test", cls: "bg-sky-50 text-sky-700" },
  final: { label: "Final exam", cls: "bg-violet-50 text-violet-700" },
  placement: { label: "Placement", cls: "bg-rose-50 text-rose-700" },
  quiz: { label: "Quiz", cls: "bg-slate-100 text-slate-600" },
};

export const skills: Skill[] = ["vocabulary", "grammar", "reading", "listening", "writing", "speaking"];

export const attemptStatus: Record<Attempt["status"], { label: string; cls: string }> = {
  in_progress: { label: "In progress", cls: "bg-amber-50 text-amber-700" },
  submitted: { label: "Waiting for marking", cls: "bg-gold-50 text-gold-700" },
  graded: { label: "Marked", cls: "bg-emerald-50 text-emerald-700" },
};

export const fmtScore = (n: number | null | undefined) => (n === null || n === undefined ? "—" : Number(n) % 1 === 0 ? String(Number(n)) : Number(n).toFixed(1));
