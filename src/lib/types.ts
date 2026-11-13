export type Level = "A1" | "A2" | "B1" | "B2" | "C1";

export type ProgramId = "GE" | "KIDS" | "CONV" | "BIZ" | "IELTS";

export type CourseType = "self" | "live" | "mixed";

export interface Word {
  en: string;
  ar: string;
  /** مثال قصير يوضح الاستعمال */
  ex?: string;
  /** رمز تعبيري يساعد على التذكر، مفيد للأطفال */
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

/** مواصفات الدرس: يكتبها المعلم، وتولّد المنصة منها التمارين تلقائيًا */
export interface LessonSpec {
  id: string;
  title: string;
  titleEn: string;
  minutes: number;
  words: Word[];
  sentences: Sentence[];
  grammar?: GrammarTip;
  dialogue?: DialogueLine[];
}

export interface Module {
  title: string;
  titleEn: string;
  lessons: LessonSpec[];
  /** دروس معلنة في الخطة ولم يُكتب محتواها بعد */
  upcoming?: string[];
}

export interface Course {
  slug: string;
  code: string;
  program: ProgramId;
  level: Level;
  title: string;
  titleEn: string;
  description: string;
  outcomes: string[];
  skills: string[];
  hours: number;
  type: CourseType;
  /** بالدولار، 0 = مجاني */
  price: number;
  certificate: boolean;
  ageGroup?: string;
  cover: { from: string; to: string; icon: string };
  isNew?: boolean;
  modules: Module[];
  order: number;
}

/* ---------- التمارين المولّدة ---------- */

export type Exercise =
  | { kind: "grammar"; tip: GrammarTip }
  | { kind: "newWord"; word: Word }
  | { kind: "choiceMeaning"; prompt: string; answer: string; options: string[] }
  | { kind: "choiceWord"; prompt: string; answer: string; options: string[] }
  | { kind: "listen"; audio: string; answer: string; options: string[] }
  | { kind: "match"; pairs: { en: string; ar: string }[] }
  | { kind: "build"; ar: string; answer: string; bank: string[] }
  | { kind: "fill"; before: string; after: string; ar: string; answer: string; options: string[] }
  | { kind: "type"; ar: string; answer: string }
  | { kind: "speak"; en: string; ar: string }
  | { kind: "dialogue"; lines: DialogueLine[] };
