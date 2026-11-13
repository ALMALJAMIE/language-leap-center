"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Brain, RotateCcw } from "lucide-react";
import { dueCards, previewIntervals, Rating, useMounted, useProgress } from "@/lib/store";
import { SpeakBtn } from "@/components/lesson/Exercises";
import { ArHint } from "@/components/ArabicToggle";
import { speak } from "@/lib/speech";
import type { Grade } from "ts-fsrs";

const grades: { g: Grade; label: string; cls: string }[] = [
  { g: Rating.Again, label: "Again", cls: "bg-red-500 shadow-[0_4px_0_#b4232a]" },
  { g: Rating.Hard, label: "Hard", cls: "bg-orange-400 shadow-[0_4px_0_#c2410c]" },
  { g: Rating.Good, label: "Good", cls: "bg-emerald-500 shadow-[0_4px_0_#157a43]" },
  { g: Rating.Easy, label: "Easy", cls: "bg-brand-500 shadow-[0_4px_0_#0b326d]" },
];

export default function ReviewPage() {
  const mounted = useMounted();
  const { cards, review } = useProgress();
  const [flipped, setFlipped] = useState(false);
  const [doneNow, setDoneNow] = useState(0);
  const due = useMemo(() => (mounted ? dueCards(cards) : []), [cards, mounted]);
  const total = Object.keys(cards).length;

  if (!mounted) return <div className="min-h-[60vh]" />;

  const current = due[0];

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-100 text-brand-700"><Brain /></div>
        <div>
          <h1 className="text-2xl font-extrabold">Spaced review</h1>
          <p className="text-sm text-slate-500">The FSRS algorithm shows you each word just before you would forget it</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-2xl bg-mist p-4"><div className="text-2xl font-extrabold text-brand-700">{due.length}</div><div className="text-xs text-slate-500">Due now</div></div>
        <div className="rounded-2xl bg-mist p-4"><div className="text-2xl font-extrabold text-emerald-600">{doneNow}</div><div className="text-xs text-slate-500">Reviewed now</div></div>
        <div className="rounded-2xl bg-mist p-4"><div className="text-2xl font-extrabold text-gold-600">{total}</div><div className="text-xs text-slate-500">In your deck</div></div>
      </div>

      {total === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
          <div className="text-5xl">📭</div>
          <h2 className="mt-4 text-xl font-bold">No cards yet</h2>
          <p className="mt-2 text-slate-500">Finish your first lesson and its words will appear here automatically.</p>
          <Link href="/courses/general-english-1/" className="btn-primary mt-6 inline-block px-6 py-3">Start the first lesson</Link>
        </div>
      ) : !current ? (
        <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-white p-10 text-center">
          <div className="text-5xl">🎉</div>
          <h2 className="mt-4 text-xl font-bold">All caught up!</h2>
          <p className="mt-2 text-slate-500">Come back later, or start a new lesson.</p>
          <Link href="/courses/" className="btn-primary mt-6 inline-block px-6 py-3">Browse courses</Link>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.button
              key={current[0] + String(flipped)}
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.22 }}
              onClick={() => {
                if (!flipped) speak(current[1].word.en);
                setFlipped(true);
              }}
              className="relative block min-h-[300px] w-full overflow-hidden rounded-3xl border-2 border-brand-100 bg-gradient-to-br from-white to-brand-50 p-8 text-center shadow-sm"
            >
              <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full border-[16px] border-gold-200/40" />
              {current[1].word.emoji && <div className="text-5xl">{current[1].word.emoji}</div>}
              <div className="mt-4 text-2xl font-bold text-gold-600">{current[1].word.def}</div>
              <ArHint className="mt-1 block text-lg text-slate-500">{current[1].word.ar}</ArHint>
              {!flipped ? (
                <p className="mt-10 text-slate-400">Recall the word, then tap to reveal it</p>
              ) : (
                <div className="mt-6">
                  <div className="text-4xl font-extrabold text-brand-800">{current[1].word.en}</div>
                  {current[1].word.ex && <div className="mt-3 italic text-slate-600">{current[1].word.ex}</div>}
                </div>
              )}
            </motion.button>
          </AnimatePresence>

          {flipped ? (
            <div className="mt-6">
              <div className="mb-4 flex justify-center"><SpeakBtn text={current[1].word.en} /></div>
              <p className="mb-3 text-center text-sm text-slate-500">How well did you remember it?</p>
              <div className="grid grid-cols-4 gap-2">
                {grades.map(({ g, label, cls }) => {
                  const iv = previewIntervals(current[1]);
                  return (
                    <button
                      key={g}
                      onClick={() => {
                        review(current[0], g);
                        setFlipped(false);
                        setDoneNow((n) => n + 1);
                      }}
                      className={`${cls} rounded-2xl py-3 font-bold text-white transition active:translate-y-1 active:shadow-none`}
                    >
                      <div>{label}</div>
                      <div className="text-xs opacity-80">{iv[g]}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <button onClick={() => { speak(current[1].word.en); setFlipped(true); }} className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-3.5 text-lg">
              <RotateCcw className="h-5 w-5" /> Show answer
            </button>
          )}
        </>
      )}
    </div>
  );
}
