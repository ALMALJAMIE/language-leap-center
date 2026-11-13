"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import { CheckCircle2, Flame, Target, Timer, X, XCircle, Zap } from "lucide-react";
import type { Course, Exercise, LessonSpec } from "@/lib/types";
import { courseLessons } from "@/data/courses";
import { generateExercises, isGraded } from "@/lib/generate";
import { useProgress } from "@/lib/store";
import { useRole } from "@/lib/roles";
import { LessonQuestions } from "./LessonQuestions";
import { useVoicesReady } from "@/lib/speech";
import {
  BuildEx, ChoiceMeaningEx, ChoiceWordEx, DialogueEx, DictationEx, FillEx, GrammarEx, ListenEx, MatchEx, NewWordEx, SpeakEx,
  type Status, type Verdict,
} from "./Exercises";

/* Short feedback sounds without audio files */
function tone(ok: boolean) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const notes = ok ? [660, 880] : [300, 220];
    notes.forEach((f, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = ok ? "sine" : "triangle";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, ctx.currentTime + i * 0.11);
      g.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + i * 0.11 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.11 + 0.18);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.11);
      o.stop(ctx.currentTime + i * 0.11 + 0.2);
    });
    setTimeout(() => ctx.close(), 600);
  } catch {}
}

const praise = ["Well done!", "Excellent!", "Great job!", "Correct!", "Keep it up!"];

export function LessonPlayer({ course, lesson, nextId }: { course: Course; lesson: LessonSpec; nextId?: string }) {
  useVoicesReady();
  const completeLesson = useProgress((s) => s.completeLesson);
  const role = useRole((s) => s.role);
  const pool = useMemo(() => courseLessons(course).flatMap((l) => l.words), [course]);
  const base = useMemo(() => generateExercises(lesson, pool), [lesson, pool]);

  const [queue, setQueue] = useState<Exercise[]>(base);
  const [idx, setIdx] = useState(0);
  const [status, setStatus] = useState<Status>("answering");
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [canCheck, setCanCheck] = useState(false);
  const [graded, setGraded] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState<null | { xp: number; accuracy: number; secs: number }>(null);
  const [confirmExit, setConfirmExit] = useState(false);
  const checker = useRef<(() => Verdict) | null>(null);
  const startedAt = useRef(Date.now());

  const ex = queue[idx];
  const gradedTotal = base.filter(isGraded).length;
  const progress = Math.min(1, idx / queue.length);

  const setChecker = useCallback((fn: (() => Verdict) | null) => {
    checker.current = fn;
    setCanCheck(!!fn);
  }, []);

  const judge = useCallback(
    (v: Verdict) => {
      setVerdict(v);
      setStatus(v.correct ? "correct" : "wrong");
      tone(v.correct);
      setGraded((g) => g + 1);
      if (v.correct) setCombo((c) => c + 1);
      else {
        setCombo(0);
        setMistakes((m) => m + 1);
        setQueue((q) => [...q, q[idx]]); // a missed exercise comes back at the end
      }
    },
    [idx],
  );

  const finish = useCallback(() => {
    const accuracy = gradedTotal === 0 ? 1 : Math.max(0, (graded - mistakes) / graded);
    const xp = 10 + Math.round(accuracy * 10) + (mistakes === 0 ? 5 : 0);
    if (!useRole.getState().role) completeLesson(course.slug, lesson.id, xp, accuracy, lesson.words); // team previews don't count as study
    setFinished({ xp, accuracy, secs: Math.round((Date.now() - startedAt.current) / 1000) });
    const end = Date.now() + 900;
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 60, origin: { x: 0 }, colors: ["#0f4ca7", "#efb52a", "#ffffff"] });
      confetti({ particleCount: 4, angle: 120, spread: 60, origin: { x: 1 }, colors: ["#0f4ca7", "#efb52a", "#ffffff"] });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, [gradedTotal, graded, mistakes, completeLesson, course.slug, lesson]);

  const next = useCallback(() => {
    if (idx + 1 >= queue.length) return finish();
    setIdx(idx + 1);
    setStatus("answering");
    setVerdict(null);
    setChecker(null);
  }, [idx, queue.length, finish, setChecker]);

  const primary = useCallback(() => {
    if (!ex) return;
    if (status !== "answering" || !isGraded(ex)) return next();
    if (checker.current) judge(checker.current());
  }, [ex, status, next, judge]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !finished) {
        if (status === "answering" && ex && isGraded(ex) && !canCheck) return;
        e.preventDefault();
        primary();
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [primary, status, ex, canCheck, finished]);

  if (finished) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-brand-50 to-white px-6 text-center">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-7xl">
          🏆
        </motion.div>
        <h1 className="mt-6 text-3xl font-extrabold text-brand-800">Lesson complete!</h1>
        <p className="mt-2 text-slate-600">
          {course.title} · {lesson.title}
        </p>
        <div className="mt-8 grid w-full max-w-md grid-cols-3 gap-3">
          <div className="overflow-hidden rounded-2xl border-2 border-gold-400">
            <div className="bg-gold-400 py-1 text-xs font-bold text-brand-900">XP earned</div>
            <div className="flex items-center justify-center gap-1 py-3 text-2xl font-extrabold text-gold-600"><Zap className="h-5 w-5" />{finished.xp}</div>
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-emerald-500">
            <div className="bg-emerald-500 py-1 text-xs font-bold text-white">Accuracy</div>
            <div className="flex items-center justify-center gap-1 py-3 text-2xl font-extrabold text-emerald-600"><Target className="h-5 w-5" />{Math.round(finished.accuracy * 100)}%</div>
          </div>
          <div className="overflow-hidden rounded-2xl border-2 border-brand-500">
            <div className="bg-brand-500 py-1 text-xs font-bold text-white">Time</div>
            <div className="flex items-center justify-center gap-1 py-3 text-2xl font-extrabold text-brand-600"><Timer className="h-5 w-5" />{Math.floor(finished.secs / 60)}:{String(finished.secs % 60).padStart(2, "0")}</div>
          </div>
        </div>
        <p className="mt-6 max-w-md text-sm text-slate-500">
          {lesson.words.length} words were added to your review deck. They will come back just before you forget them.
        </p>
        <div className="mt-8 flex w-full max-w-md flex-col gap-3">
          {nextId ? (
            <Link href={`/learn/${course.slug}/${nextId}/`} className="btn-primary py-3.5 text-lg">Next lesson</Link>
          ) : (
            <Link href={`/courses/${course.slug}/`} className="btn-primary py-3.5 text-lg">Back to course</Link>
          )}
          {role ? <Link href="/staff/" className="btn-gold py-3">Back to workspace</Link> : <Link href="/review/" className="btn-gold py-3">Review words now</Link>}
          <LessonQuestions course={course.slug} lesson={lesson.id} title={lesson.title} variant="button" />
          <Link href={`/courses/${course.slug}/`} className="py-2 font-bold text-slate-500">Course content</Link>
        </div>
      </div>
    );
  }

  const graded_ = ex && isGraded(ex);
  const btnLabel = status !== "answering" ? "Continue" : graded_ ? "Check" : ex?.kind === "dialogue" ? "Finish lesson" : "Continue";

  const renderEx = () => {
    const common = { status, setChecker, complete: judge };
    switch (ex.kind) {
      case "grammar": return <GrammarEx ex={ex} {...common} />;
      case "newWord": return <NewWordEx ex={ex} {...common} />;
      case "choiceMeaning": return <ChoiceMeaningEx ex={ex} {...common} />;
      case "choiceWord": return <ChoiceWordEx ex={ex} {...common} />;
      case "listen": return <ListenEx ex={ex} {...common} />;
      case "match": return <MatchEx ex={ex} {...common} />;
      case "build": return <BuildEx ex={ex} {...common} />;
      case "fill": return <FillEx ex={ex} {...common} />;
      case "dictation": return <DictationEx ex={ex} {...common} />;
      case "speak": return <SpeakEx ex={ex} {...common} />;
      case "dialogue": return <DialogueEx ex={ex} {...common} />;
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4 px-5 pt-6">
        <button onClick={() => setConfirmExit(true)} aria-label="Exit" className="text-slate-400 hover:text-slate-600">
          <X className="h-7 w-7" />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-slate-100">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500"
            animate={{ width: `${progress * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>
        <AnimatePresence>
          {combo >= 3 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="flex items-center gap-1 font-extrabold text-orange-500">
              <Flame className="h-5 w-5" /> {combo}
            </motion.span>
          )}
        </AnimatePresence>
        <LessonQuestions course={course.slug} lesson={lesson.id} title={lesson.title} />
      </div>

      {/* Exercise */}
      <div className="mx-auto w-full max-w-2xl flex-1 px-5 pb-48 pt-10">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }}>
            {renderEx()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom check bar */}
      <div
        className={`fixed inset-x-0 bottom-0 border-t-2 transition-colors ${
          status === "correct" ? "border-emerald-200 bg-emerald-50" : status === "wrong" ? "border-red-200 bg-red-50" : "border-slate-100 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[3rem]">
            {status === "correct" && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-start gap-3 text-emerald-700">
                <CheckCircle2 className="h-10 w-10 shrink-0" />
                <div>
                  <div className="text-xl font-extrabold">{praise[idx % praise.length]}</div>
                  {verdict?.note && <div className="text-sm">{verdict.note} {verdict.solution && <b>{verdict.solution}</b>}</div>}
                </div>
              </motion.div>
            )}
            {status === "wrong" && (
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-start gap-3 text-red-600">
                <XCircle className="h-10 w-10 shrink-0" />
                <div>
                  <div className="text-xl font-extrabold">Correct answer:</div>
                  <div className="text-lg">{verdict?.solution}</div>
                  {verdict?.note && <div className="text-sm opacity-80">{verdict.note}</div>}
                </div>
              </motion.div>
            )}
          </div>
          <button
            onClick={primary}
            disabled={status === "answering" && graded_ && !canCheck}
            className={`min-w-[180px] px-8 py-3.5 text-lg ${
              status === "wrong" ? "rounded-2xl bg-red-500 font-bold text-white shadow-[0_4px_0_#b4232a]" : status === "correct" ? "rounded-2xl bg-emerald-500 font-bold text-white shadow-[0_4px_0_#157a43]" : "btn-primary"
            }`}
          >
            {btnLabel}
          </button>
        </div>
      </div>

      {confirmExit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 px-6" onClick={() => setConfirmExit(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-7 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="text-5xl">🥺</div>
            <h3 className="mt-3 text-xl font-bold">Leave the lesson?</h3>
            <p className="mt-2 text-slate-500">Your progress in this lesson will not be saved.</p>
            <button onClick={() => setConfirmExit(false)} className="btn-primary mt-6 w-full py-3">Keep learning</button>
            <Link href={`/courses/${course.slug}/`} className="mt-3 block py-2 font-bold text-red-500">Leave</Link>
          </div>
        </div>
      )}
    </div>
  );
}
