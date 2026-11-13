"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpenText, Languages, Mic, MicOff, Play, Snail, Volume2 } from "lucide-react";
import type { Exercise, Word } from "@/lib/types";
import { normalize, similarity, tokenize } from "@/lib/generate";
import { speak, useSpeechRecognition } from "@/lib/speech";

export type Verdict = { correct: boolean; solution?: string; note?: string };
export type Status = "answering" | "correct" | "wrong";

export interface ExProps<K extends Exercise["kind"]> {
  ex: Extract<Exercise, { kind: K }>;
  status: Status;
  /** يسجّل دالة التصحيح ويحدد هل زر «تحقق» مفعّل */
  setChecker: (fn: (() => Verdict) | null) => void;
  /** لتمارين تكتمل ذاتيًا مثل التوصيل */
  complete: (v: Verdict) => void;
}

/* ---------- أدوات مشتركة ---------- */

export function SpeakBtn({ text, size = "md", autoPlay = false }: { text: string; size?: "sm" | "md" | "lg"; autoPlay?: boolean }) {
  const [playing, setPlaying] = useState(false);
  const play = (slow = false) => {
    setPlaying(true);
    speak(text, { slow, onEnd: () => setPlaying(false) });
  };
  useEffect(() => {
    if (autoPlay) {
      const t = setTimeout(() => play(), 250);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, autoPlay]);

  const dim = size === "lg" ? "h-20 w-20" : size === "md" ? "h-12 w-12" : "h-8 w-8";
  const icon = size === "lg" ? "h-9 w-9" : size === "md" ? "h-6 w-6" : "h-4 w-4";
  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => play()}
        aria-label="استمع"
        className={`${dim} grid shrink-0 place-items-center rounded-2xl bg-brand-500 text-white shadow-[0_4px_0_#0b326d] transition active:translate-y-[3px] active:shadow-none ${playing ? "animate-pulse" : ""}`}
      >
        <Volume2 className={icon} />
      </button>
      {size !== "sm" && (
        <button
          type="button"
          onClick={() => play(true)}
          aria-label="استمع ببطء"
          title="ببطء"
          className={`${size === "lg" ? "h-14 w-14" : "h-10 w-10"} grid shrink-0 place-items-center rounded-2xl bg-brand-100 text-brand-700 transition hover:bg-brand-200`}
        >
          <Snail className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} />
        </button>
      )}
    </span>
  );
}

function Title({ children, sub }: { children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="mb-7">
      <h2 className="text-2xl font-extrabold text-ink">{children}</h2>
      {sub && <div className="mt-1 text-slate-500">{sub}</div>}
    </div>
  );
}

function useKeyOptions(n: number, onPick: (i: number) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const h = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      const k = parseInt(e.key, 10);
      if (k >= 1 && k <= n) onPick(k - 1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [n, onPick, enabled]);
}

function Options({
  options,
  answer,
  status,
  setChecker,
  english,
}: {
  options: string[];
  answer: string;
  status: Status;
  setChecker: ExProps<"listen">["setChecker"];
  english: boolean;
}) {
  const [sel, setSel] = useState<number | null>(null);
  useEffect(() => {
    setChecker(sel === null ? null : () => ({ correct: options[sel] === answer, solution: answer }));
  }, [sel, options, answer, setChecker]);
  useKeyOptions(options.length, (i) => status === "answering" && setSel(i), status === "answering");

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((o, i) => {
        let state = sel === i ? "selected" : "";
        if (status !== "answering") {
          if (o === answer) state = "correct";
          else if (sel === i) state = "wrong";
        }
        return (
          <button
            key={o + i}
            data-state={state}
            disabled={status !== "answering"}
            onClick={() => {
              setSel(i);
              if (english) speak(o);
            }}
            className="tile flex items-center gap-3 p-4 text-right text-lg font-semibold disabled:opacity-100"
          >
            <span className="en grid h-7 w-7 shrink-0 place-items-center rounded-lg border-2 border-current/20 text-sm text-slate-400">
              {i + 1}
            </span>
            <span className={english ? "en flex-1 text-left" : "flex-1"}>{o}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------- التمارين ---------- */

export function GrammarEx({ ex }: ExProps<"grammar">) {
  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gold-100 px-3 py-1 text-sm font-bold text-gold-700">
        <BookOpenText className="h-4 w-4" /> قاعدة الدرس
      </div>
      <Title>{ex.tip.title}</Title>
      <p className="text-lg leading-9 text-slate-700">{ex.tip.body}</p>
      <div className="mt-7 space-y-3">
        {ex.tip.examples.map((e) => (
          <div key={e.en} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-mist p-4">
            <SpeakBtn text={e.en} size="sm" />
            <div className="flex-1">
              <div className="en text-left text-lg font-semibold text-brand-800">{e.en}</div>
              <div className="text-sm text-slate-500">{e.ar}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function NewWordEx({ ex }: ExProps<"newWord">) {
  const w: Word = ex.word;
  return (
    <div>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-sm font-bold text-brand-700">
        ✨ كلمة جديدة
      </div>
      <motion.div
        initial={{ rotateY: -15, opacity: 0, y: 10 }}
        animate={{ rotateY: 0, opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border-2 border-brand-100 bg-gradient-to-br from-white to-brand-50 p-8 text-center"
      >
        <div className="absolute -left-10 -top-10 h-32 w-32 rounded-full border-[14px] border-gold-200/50" />
        {w.emoji && <div className="mb-3 text-6xl">{w.emoji}</div>}
        <div className="en text-4xl font-extrabold text-brand-800 sm:text-5xl">{w.en}</div>
        <div className="mt-3 text-2xl font-semibold text-gold-600">{w.ar}</div>
        <div className="mt-6 flex justify-center">
          <SpeakBtn text={w.en} autoPlay />
        </div>
        {w.ex && (
          <div className="mt-7 flex items-center justify-center gap-3 rounded-2xl bg-white/80 p-4">
            <SpeakBtn text={w.ex} size="sm" />
            <span className="en text-lg text-slate-700">{w.ex}</span>
          </div>
        )}
      </motion.div>
    </div>
  );
}

export function ChoiceMeaningEx(p: ExProps<"choiceMeaning">) {
  return (
    <div>
      <Title>ما معنى هذه الكلمة؟</Title>
      <div className="mb-8 flex items-center gap-4">
        <SpeakBtn text={p.ex.prompt} size="sm" autoPlay />
        <span className="en text-3xl font-extrabold text-brand-800">{p.ex.prompt}</span>
      </div>
      <Options options={p.ex.options} answer={p.ex.answer} status={p.status} setChecker={p.setChecker} english={false} />
    </div>
  );
}

export function ChoiceWordEx(p: ExProps<"choiceWord">) {
  return (
    <div>
      <Title>اختر الترجمة الإنجليزية الصحيحة</Title>
      <div className="mb-8 rounded-2xl bg-gold-50 px-5 py-4 text-2xl font-bold text-gold-700">«{p.ex.prompt}»</div>
      <Options options={p.ex.options} answer={p.ex.answer} status={p.status} setChecker={p.setChecker} english />
    </div>
  );
}

export function ListenEx(p: ExProps<"listen">) {
  return (
    <div>
      <Title sub="اضغط على السلحفاة للاستماع ببطء">ماذا تسمع؟</Title>
      <div className="mb-8 flex justify-center">
        <SpeakBtn text={p.ex.audio} size="lg" autoPlay />
      </div>
      <Options options={p.ex.options} answer={p.ex.answer} status={p.status} setChecker={p.setChecker} english={false} />
    </div>
  );
}

export function MatchEx({ ex, complete, status }: ExProps<"match">) {
  const left = useMemo(() => ex.pairs.map((p) => p.en), [ex]);
  const right = useMemo(() => [...ex.pairs].sort((a, b) => a.ar.localeCompare(b.ar, "ar")).map((p) => p.ar), [ex]);
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const misses = useRef(0);

  const tryPair = (l: string | null, r: string | null) => {
    if (!l || !r) {
      setSelL(l);
      setSelR(r);
      return;
    }
    const ok = ex.pairs.some((p) => p.en === l && p.ar === r);
    if (ok) {
      const nd = [...done, l];
      setDone(nd);
      if (nd.length === ex.pairs.length)
        complete({ correct: misses.current <= 1, note: misses.current > 1 ? "أكملت التوصيل مع بعض الأخطاء" : undefined });
    } else {
      misses.current++;
      setWrong(l + r);
      setTimeout(() => setWrong(null), 400);
    }
    setSelL(null);
    setSelR(null);
  };

  const matchedAr = (ar: string) => ex.pairs.some((p) => p.ar === ar && done.includes(p.en));

  return (
    <div>
      <Title>صِل كل كلمة بمعناها</Title>
      <div className="grid grid-cols-2 gap-3" dir="ltr">
        <div className="space-y-3">
          {left.map((en) => (
            <button
              key={en}
              disabled={done.includes(en) || status !== "answering"}
              data-state={done.includes(en) ? "correct" : selL === en ? "selected" : ""}
              onClick={() => {
                tryPair(en, selR);
                speak(en);
              }}
              className={`tile en block w-full p-4 text-lg font-semibold ${wrong?.startsWith(en) ? "shake" : ""} ${done.includes(en) ? "opacity-40" : ""}`}
            >
              {en}
            </button>
          ))}
        </div>
        <div className="space-y-3" dir="rtl">
          {right.map((ar) => (
            <button
              key={ar}
              disabled={matchedAr(ar) || status !== "answering"}
              data-state={matchedAr(ar) ? "correct" : selR === ar ? "selected" : ""}
              onClick={() => tryPair(selL, ar)}
              className={`tile block w-full p-4 text-lg font-semibold ${wrong?.endsWith(ar) ? "shake" : ""} ${matchedAr(ar) ? "opacity-40" : ""}`}
            >
              {ar}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export function BuildEx({ ex, status, setChecker }: ExProps<"build">) {
  const tokens = useMemo(() => ex.bank.map((t, i) => ({ id: i, t })), [ex]);
  const [picked, setPicked] = useState<number[]>([]);
  useEffect(() => {
    setChecker(
      picked.length === 0
        ? null
        : () => {
            const built = picked.map((i) => tokens[i].t).join(" ");
            return { correct: normalize(built) === normalize(tokenize(ex.answer).join(" ")), solution: ex.answer };
          },
    );
  }, [picked, tokens, ex, setChecker]);

  return (
    <div>
      <Title>رتّب الكلمات لتكوين الجملة</Title>
      <div className="mb-6 rounded-2xl bg-gold-50 px-5 py-4 text-xl font-bold text-gold-700">«{ex.ar}»</div>
      <div dir="ltr" className="mb-6 flex min-h-[124px] flex-wrap content-start gap-2 border-y-2 border-slate-200 py-4" style={{ backgroundImage: "linear-gradient(transparent 58px, #e3e8f1 58px, #e3e8f1 60px, transparent 60px)", backgroundSize: "100% 62px" }}>
        <AnimatePresence>
          {picked.map((i) => (
            <motion.button
              layout
              layoutId={`tok-${i}`}
              key={i}
              disabled={status !== "answering"}
              onClick={() => setPicked(picked.filter((x) => x !== i))}
              className="tile en px-4 py-2.5 text-lg font-semibold"
            >
              {tokens[i].t}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
      <div dir="ltr" className="flex flex-wrap justify-center gap-2">
        {tokens.map(({ id, t }) =>
          picked.includes(id) ? (
            <span key={id} className="en rounded-2xl bg-slate-100 px-4 py-2.5 text-lg text-transparent">
              {t}
            </span>
          ) : (
            <motion.button
              layout
              layoutId={`tok-${id}`}
              key={id}
              disabled={status !== "answering"}
              onClick={() => {
                setPicked([...picked, id]);
                speak(t);
              }}
              className="tile en px-4 py-2.5 text-lg font-semibold"
            >
              {t}
            </motion.button>
          ),
        )}
      </div>
    </div>
  );
}

export function FillEx({ ex, status, setChecker }: ExProps<"fill">) {
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    setChecker(sel === null ? null : () => ({ correct: sel === ex.answer, solution: ex.before + ex.answer + ex.after }));
  }, [sel, ex, setChecker]);
  useKeyOptions(ex.options.length, (i) => status === "answering" && setSel(ex.options[i]), status === "answering");

  const blankState = status === "answering" ? "border-brand-400 text-brand-700" : status === "correct" ? "border-emerald-500 text-emerald-700" : "border-red-500 text-red-600";
  return (
    <div>
      <Title>أكمل الجملة</Title>
      <p className="mb-2 text-slate-500">{ex.ar}</p>
      <div className="en mb-10 rounded-2xl border-2 border-slate-200 p-6 text-center text-2xl font-semibold leading-relaxed text-ink sm:text-3xl">
        {ex.before}
        <span className={`mx-1 inline-block min-w-[110px] border-b-4 px-2 ${blankState}`}>{sel ?? " "}</span>
        {ex.after}
      </div>
      <div dir="ltr" className="flex flex-wrap justify-center gap-3">
        {ex.options.map((o, i) => (
          <button
            key={o}
            disabled={status !== "answering"}
            data-state={sel === o ? (status === "answering" ? "selected" : status === "correct" ? "correct" : "wrong") : ""}
            onClick={() => setSel(o)}
            className="tile en px-6 py-3 text-xl font-semibold disabled:opacity-100"
          >
            <span className="mr-2 text-sm text-slate-400">{i + 1}</span>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function charDistance(a: string, b: string) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return dp[a.length][b.length];
}

export function TypeEx({ ex, status, setChecker }: ExProps<"type">) {
  const [val, setVal] = useState("");
  useEffect(() => {
    setChecker(
      val.trim() === ""
        ? null
        : () => {
            const a = normalize(val);
            const b = normalize(ex.answer);
            if (a === b) return { correct: true };
            if (b.length > 4 && charDistance(a, b) === 1) return { correct: true, solution: ex.answer, note: "انتبه للإملاء الصحيح:" };
            return { correct: false, solution: ex.answer };
          },
    );
  }, [val, ex, setChecker]);

  return (
    <div>
      <Title>اكتب بالإنجليزية</Title>
      <div className="mb-8 rounded-2xl bg-gold-50 px-5 py-4 text-2xl font-bold text-gold-700">«{ex.ar}»</div>
      <input
        autoFocus
        dir="ltr"
        value={val}
        disabled={status !== "answering"}
        onChange={(e) => setVal(e.target.value)}
        autoComplete="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Type in English…"
        className="en w-full rounded-2xl border-2 border-slate-200 bg-mist px-5 py-4 text-2xl font-semibold outline-none focus:border-brand-400 focus:bg-white"
      />
    </div>
  );
}

export function SpeakEx({ ex, status, setChecker, complete }: ExProps<"speak">) {
  const { supported, listening, transcript, error, start, stop } = useSpeechRecognition();
  const score = transcript ? similarity(transcript, ex.en) : 0;

  useEffect(() => {
    setChecker(
      !transcript || listening
        ? null
        : () => ({
            correct: score >= 0.7,
            solution: ex.en,
            note: `نسبة التطابق ${Math.round(score * 100)}%`,
          }),
    );
  }, [transcript, listening, score, ex, setChecker]);

  const words = ex.en.split(" ");
  const heard = new Set(transcript ? transcript.toLowerCase().replace(/[.,!?]/g, "").split(/\s+/) : []);

  return (
    <div>
      <Title sub="استمع أولًا، ثم اضغط على الميكروفون وانطق الجملة">انطق هذه الجملة</Title>
      <div className="mb-8 flex items-center gap-4 rounded-2xl border-2 border-slate-200 p-5">
        <SpeakBtn text={ex.en} autoPlay />
        <div className="flex-1">
          <div className="en text-left text-2xl font-semibold">
            {words.map((w, i) => {
              const clean = w.toLowerCase().replace(/[.,!?]/g, "");
              return (
                <span key={i} className={transcript ? (heard.has(clean) ? "text-emerald-600" : "text-red-500") : "text-ink"}>
                  {w}{" "}
                </span>
              );
            })}
          </div>
          <div className="mt-1 text-sm text-slate-500">{ex.ar}</div>
        </div>
      </div>

      {supported ? (
        <div className="flex flex-col items-center gap-4">
          <button
            disabled={status !== "answering"}
            onClick={listening ? stop : start}
            className={`relative grid h-24 w-24 place-items-center rounded-full text-white transition ${
              listening ? "bg-red-500 shadow-[0_0_0_10px_rgba(239,68,68,0.2)]" : "bg-brand-600 shadow-[0_5px_0_#0a2852] active:translate-y-1 active:shadow-none"
            }`}
          >
            {listening && <span className="absolute inset-0 animate-ping rounded-full bg-red-400/40" />}
            {listening ? <MicOff className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
          </button>
          <p className="text-sm text-slate-500">{listening ? "أستمع إليك… اضغط للإيقاف" : transcript ? "يمكنك المحاولة مرة أخرى" : "اضغط للتحدث"}</p>
          {transcript && (
            <div className="w-full rounded-2xl bg-mist p-4 text-center">
              <div className="text-xs text-slate-500">سمعتُ:</div>
              <div className="en text-lg font-semibold">{transcript}</div>
            </div>
          )}
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      ) : (
        <div className="rounded-2xl bg-gold-50 p-5 text-center text-gold-700">
          متصفحك لا يدعم التعرف على الصوت. يعمل هذا التمرين في Chrome و Edge و Safari.
        </div>
      )}
      {status === "answering" && (
        <button onClick={() => complete({ correct: true, note: "تخطيت تمرين النطق" })} className="mx-auto mt-6 block text-sm font-bold text-slate-400 hover:text-slate-600">
          لا أستطيع التحدث الآن
        </button>
      )}
    </div>
  );
}

export function DialogueEx({ ex }: ExProps<"dialogue">) {
  const [shown, setShown] = useState(1);
  const [showAr, setShowAr] = useState(true);
  const [playingAll, setPlayingAll] = useState(false);
  const speakers = useMemo(() => Array.from(new Set(ex.lines.map((l) => l.who))), [ex]);

  const playFrom = (i: number) => {
    if (i >= ex.lines.length) {
      setPlayingAll(false);
      return;
    }
    setShown((s) => Math.max(s, i + 1));
    speak(ex.lines[i].en, { onEnd: () => setTimeout(() => playFrom(i + 1), 350) });
  };

  return (
    <div>
      <Title sub="استمع إلى الحوار كاملًا ولاحظ كيف تُستعمل الكلمات">حوار الدرس</Title>
      <div className="mb-5 flex flex-wrap gap-2">
        <button
          onClick={() => {
            setPlayingAll(true);
            playFrom(0);
          }}
          disabled={playingAll}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-2 font-bold text-white disabled:opacity-60"
        >
          <Play className="h-4 w-4 fill-white" /> استمع للحوار كاملًا
        </button>
        <button onClick={() => setShowAr(!showAr)} className="flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 font-bold text-slate-600">
          <Languages className="h-4 w-4" /> {showAr ? "إخفاء الترجمة" : "إظهار الترجمة"}
        </button>
      </div>
      <div className="space-y-3" dir="ltr">
        <AnimatePresence>
          {ex.lines.slice(0, shown).map((l, i) => {
            const right = speakers.indexOf(l.who) % 2 === 1;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex items-end gap-2 ${right ? "flex-row-reverse" : ""}`}
              >
                <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${right ? "bg-gold-400 text-brand-900" : "bg-brand-600 text-white"}`}>
                  {l.who[0]}
                </div>
                <button
                  onClick={() => speak(l.en)}
                  className={`max-w-[80%] rounded-2xl px-4 py-3 text-left ${right ? "rounded-br-sm bg-gold-50" : "rounded-bl-sm bg-brand-50"}`}
                >
                  <div className="en text-xs font-bold text-slate-400">{l.who}</div>
                  <div className="en text-lg font-medium text-ink">{l.en}</div>
                  {showAr && (
                    <div className="mt-0.5 text-right text-sm text-slate-500" dir="rtl">
                      {l.ar}
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      {shown < ex.lines.length && !playingAll && (
        <button
          onClick={() => {
            speak(ex.lines[shown].en);
            setShown(shown + 1);
          }}
          className="mx-auto mt-5 block rounded-xl border-2 border-dashed border-brand-200 px-5 py-2 font-bold text-brand-600"
        >
          السطر التالي ↓
        </button>
      )}
    </div>
  );
}
