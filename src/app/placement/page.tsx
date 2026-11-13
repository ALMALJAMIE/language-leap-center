"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ClipboardCheck, Headphones } from "lucide-react";
import type { Level } from "@/lib/types";
import { courses, levels } from "@/data/courses";
import { useProgress } from "@/lib/store";
import { SpeakBtn } from "@/components/lesson/Exercises";

type Q = { level: Level; q: string; options: string[]; answer: number; audio?: string; hint?: string };

const questions: Q[] = [
  { level: "A1", q: "She ___ a teacher.", options: ["am", "is", "are", "be"], answer: 1 },
  { level: "A1", q: "What is the meaning of “Thank you”?", options: ["من فضلك", "شكرًا لك", "مع السلامة", "مرحبًا"], answer: 1 },
  { level: "A1", q: "Listen and choose what you hear.", options: ["Good evening", "Good morning", "Goodbye", "Good night"], answer: 1, audio: "Good morning" },
  { level: "A2", q: "Yesterday I ___ to the market.", options: ["go", "goes", "went", "going"], answer: 2 },
  { level: "A2", q: "This bag is ___ than that one.", options: ["cheap", "cheaper", "cheapest", "more cheap"], answer: 1 },
  { level: "A2", q: "Listen: what time is the flight?", options: ["At seven", "At eleven", "At nine", "At five"], answer: 2, audio: "Excuse me, the flight to Kuala Lumpur leaves at nine o'clock." },
  { level: "B1", q: "I have lived here ___ 2019.", options: ["for", "since", "from", "at"], answer: 1 },
  { level: "B1", q: "If it rains tomorrow, we ___ at home.", options: ["stay", "stayed", "will stay", "would stay"], answer: 2 },
  { level: "B1", q: "“I can't make it to the meeting.” This means the speaker…", options: ["will build something", "cannot attend", "is late", "forgot the meeting"], answer: 1 },
  { level: "B2", q: "By the time we arrived, the film ___.", options: ["already started", "has already started", "had already started", "was starting already"], answer: 2 },
  { level: "B2", q: "Choose the closest meaning to “reluctant”.", options: ["eager", "unwilling", "confident", "careless"], answer: 1 },
  { level: "B2", q: "Listen and choose the speaker's opinion.", options: ["Remote work should end", "Remote work has clear benefits but needs limits", "Offices are always better", "Nobody likes remote work"], answer: 1, audio: "While working from home certainly saves time and money, I think companies need clear boundaries, otherwise people never really switch off." },
  { level: "C1", q: "Had I known about the delay, I ___ a later train.", options: ["would take", "will have taken", "would have taken", "had taken"], answer: 2 },
  { level: "C1", q: "The proposal was met with ___ criticism from all sides.", options: ["widespread", "wide-spreading", "spread-wide", "widely"], answer: 0 },
  { level: "C1", q: "Which sentence is the most formal?", options: ["We need to sort this out ASAP.", "Let's fix this quickly.", "We would appreciate your prompt attention to this matter.", "Can you deal with this soon?"], answer: 2 },
];

const order: Level[] = ["A1", "A2", "B1", "B2", "C1"];

function computeLevel(ans: (number | null)[]): Level {
  let lvl: Level = "A1";
  for (const l of order) {
    const qs = questions.map((q, i) => ({ q, i })).filter((x) => x.q.level === l);
    const ok = qs.filter((x) => ans[x.i] === x.q.answer).length;
    if (ok >= 2) lvl = l;
    else break;
  }
  return lvl;
}

export default function Placement() {
  const setPlacement = useProgress((s) => s.setPlacement);
  const [stage, setStage] = useState<"intro" | "test" | "result">("intro");
  const [i, setI] = useState(0);
  const [ans, setAns] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [result, setResult] = useState<{ level: Level; score: number } | null>(null);

  const choose = (k: number) => {
    const a = [...ans];
    a[i] = k;
    setAns(a);
    setTimeout(() => {
      if (i + 1 < questions.length) setI(i + 1);
      else {
        const score = a.filter((x, j) => x === questions[j].answer).length;
        const level = computeLevel(a);
        setPlacement(level, score, questions.length);
        setResult({ level, score });
        setStage("result");
      }
    }, 220);
  };

  if (stage === "intro")
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-100 text-brand-700"><ClipboardCheck className="h-10 w-10" /></div>
        <h1 className="mt-6 text-3xl font-extrabold">اختبار تحديد المستوى</h1>
        <p className="mt-4 leading-8 text-slate-600">
          {questions.length} سؤالًا في القواعد والمفردات والاستماع، تتدرج من المبتدئ (A1) إلى المتقدم (C1). يستغرق نحو 5 دقائق. لا تخمّن: إن لم تعرف الإجابة فاختر أقرب ما تراه، فالهدف أن نضعك في الدورة المناسبة.
        </p>
        <div className="mt-8 flex justify-center gap-2">
          {order.map((l) => (
            <span key={l} className="en rounded-xl bg-mist px-3 py-2 text-sm font-bold text-brand-700">{l}</span>
          ))}
        </div>
        <button onClick={() => setStage("test")} className="btn-primary mt-10 px-10 py-4 text-lg">ابدأ الاختبار</button>
      </div>
    );

  if (stage === "result" && result) {
    const rec = courses.find((c) => c.program === "GE" && c.level === result.level) ?? courses[0];
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-36 w-36 place-items-center rounded-full brand-gradient shadow-2xl shadow-brand-900/30">
          <span className="en text-5xl font-extrabold text-gold-300">{result.level}</span>
        </motion.div>
        <h1 className="mt-6 text-3xl font-extrabold">مستواك: {levels[result.level].name}</h1>
        <p className="en mt-1 text-slate-500">{levels[result.level].desc}</p>
        <p className="mt-4 text-slate-600">أجبت إجابة صحيحة عن {result.score} من {questions.length} سؤالًا.</p>
        <div className="mt-8 rounded-3xl border border-slate-200 p-6 text-right">
          <div className="text-sm font-bold text-gold-600">الدورة المقترحة لك</div>
          <div className="mt-1 text-xl font-bold">{rec.title}</div>
          <p className="mt-2 text-sm text-slate-600">{rec.description}</p>
          <Link href={`/courses/${rec.slug}/`} className="btn-primary mt-5 inline-block px-6 py-3">اذهب إلى الدورة</Link>
        </div>
        <button onClick={() => { setStage("intro"); setI(0); setAns(Array(questions.length).fill(null)); }} className="mt-6 text-sm font-bold text-slate-500">
          أعد الاختبار
        </button>
      </div>
    );
  }

  const q = questions[i];
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-4">
        <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gold-400 transition-all" style={{ width: `${(i / questions.length) * 100}%` }} />
        </div>
        <span className="en text-sm font-bold text-slate-500">{i + 1}/{questions.length}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
          {q.audio && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl bg-brand-50 p-4">
              <Headphones className="h-5 w-5 text-brand-600" />
              <span className="flex-1 text-sm text-brand-700">سؤال استماع</span>
              <SpeakBtn text={q.audio} autoPlay />
            </div>
          )}
          <h2 className="en mb-8 text-left text-2xl font-bold">{q.q}</h2>
          <div className="grid gap-3">
            {q.options.map((o, k) => (
              <button
                key={o}
                onClick={() => choose(k)}
                data-state={ans[i] === k ? "selected" : ""}
                className={`tile p-4 text-lg font-semibold ${/[؀-ۿ]/.test(o) ? "text-right" : "en text-left"}`}
              >
                {o}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {i > 0 && (
        <button onClick={() => setI(i - 1)} className="mt-6 text-sm font-bold text-slate-400">→ السؤال السابق</button>
      )}
    </div>
  );
}
