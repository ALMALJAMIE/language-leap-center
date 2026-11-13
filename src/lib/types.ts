export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type ProgramId = "GE" | "KIDS" | "CONV" | "BIZ" | "IELTS";

export type CourseType = "self" | "live" | "mixed";

export interface Word {
  en: string;
  /** Short, simple English definition */
  def: string;
  /** Optional Arabic translation (shown only when "Arabic help" is on) */
  ar: string;
  ex?: string;
  emoji?: string;
}

export interface Sentence {
  en: string;
  ar: string;
}

export interface GrammarTip {
  title: string;
  body: string;
  examples: Sentence[];
}

export interface DialogueLine {
  who: string;
  en: string;
  ar: string;
}

/** A lesson is written as a spec; the platform generates the exercises from it */
export interface LessonSpec {
  id: string;
  title: string;
  minutes: number;
  words: Word[];
  sentences: Sentence[];
  grammar?: GrammarTip;
  dialogue?: DialogueLine[];
}

export interface Module {
  title: string;
  lessons: LessonSpec[];
  /** Lessons announced in the syllabus but not written yet */
  upcoming?: string[];
}

export interface Course {
  slug: string;
  code: string;
  program: ProgramId;
  level: Level;
  title: string;
  description: string;
  outcomes: string[];
  skills: string[];
  hours: number;
  type: CourseType;
  /** USD, 0 = free */
  price: number;
  certificate: boolean;
  ageGroup?: string;
  cover: { from: string; to: string; icon: string };
  isNew?: boolean;
  modules: Module[];
  order: number;
}

/* ---------- Generated exercises ---------- */

export type Exercise =
  | { kind: "grammar"; tip: GrammarTip }
  | { kind: "newWord"; word: Word }
  | { kind: "choiceMeaning"; word: Word; answer: string; options: Word[] }
  | { kind: "choiceWord"; word: Word; answer: string; options: string[] }
  | { kind: "listen"; audio: string; answer: string; options: string[] }
  | { kind: "match"; pairs: Word[] }
  | { kind: "build"; sentence: Sentence; answer: string; bank: string[] }
  | { kind: "fill"; before: string; after: string; sentence: Sentence; answer: string; options: string[] }
  | { kind: "dictation"; word: Word; answer: string }
  | { kind: "speak"; sentence: Sentence }
  | { kind: "dialogue"; lines: DialogueLine[] };
