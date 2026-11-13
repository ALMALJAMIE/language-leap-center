import type { Exercise, LessonSpec, Word } from "./types";

/** Seeded RNG so a lesson keeps the same order between visits */
function rng(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], r: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickOthers<T>(pool: T[], exclude: T, n: number, r: () => number): T[] {
  return shuffle(
    pool.filter((x) => x !== exclude),
    r,
  ).slice(0, n);
}

/** Split a sentence into word-bank tokens */
export const tokenize = (s: string) =>
  s
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);

/** Normalize for comparison: lowercase, no punctuation, single spaces */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** Word-level similarity between two sentences (for pronunciation scoring) */
export function similarity(a: string, b: string): number {
  const x = normalize(a).split(" ");
  const y = normalize(b).split(" ");
  const dp: number[][] = Array.from({ length: x.length + 1 }, (_, i) =>
    Array.from({ length: y.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= x.length; i++)
    for (let j = 1; j <= y.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (x[i - 1] === y[j - 1] ? 0 : 1));
  return Math.max(0, 1 - dp[x.length][y.length] / Math.max(x.length, y.length));
}

/**
 * Turns a lesson spec into a graded sequence:
 * grammar → new words → quick checks → listening → matching → sentence building → gap fill → dictation → speaking → dialogue
 */
export function generateExercises(lesson: LessonSpec, distractorPool: Word[] = []): Exercise[] {
  const r = rng(lesson.id);
  const words = lesson.words;
  const pool = [...words, ...distractorPool.filter((w) => !words.some((x) => x.en === w.en))];
  const out: Exercise[] = [];

  if (lesson.grammar) out.push({ kind: "grammar", tip: lesson.grammar });

  // Introduce words two at a time, each followed by a quick check
  for (let i = 0; i < words.length; i += 2) {
    const batch = words.slice(i, i + 2);
    batch.forEach((w) => out.push({ kind: "newWord", word: w }));
    batch.forEach((w, k) => {
      const others = pickOthers(pool, w, 3, r);
      if ((i / 2 + k) % 2 === 0) {
        out.push({ kind: "choiceMeaning", word: w, answer: w.en, options: shuffle([w, ...others], r) });
      } else {
        out.push({ kind: "listen", audio: w.en, answer: w.en, options: shuffle([w.en, ...others.map((o) => o.en)], r) });
      }
    });
  }

  out.push({ kind: "match", pairs: shuffle(words, r).slice(0, 5) });

  const w2 = shuffle(words, r)[0];
  out.push({ kind: "choiceWord", word: w2, answer: w2.en, options: shuffle([w2.en, ...pickOthers(pool, w2, 3, r).map((o) => o.en)], r) });

  const extraTokens = shuffle(pool.flatMap((w) => tokenize(w.en)), r);
  lesson.sentences.forEach((s, idx) => {
    const toks = tokenize(s.en);
    const build = () => {
      const distract = extraTokens.filter((t) => !toks.map((x) => x.toLowerCase()).includes(t.toLowerCase())).slice(0, 3);
      out.push({ kind: "build", sentence: s, answer: s.en, bank: shuffle([...toks, ...distract], r) });
    };
    if (idx % 2 === 0) return build();
    const target = words.find((w) => new RegExp(`\\b${w.en}\\b`, "i").test(s.en));
    if (!target) return build();
    const m = s.en.match(new RegExp(`\\b${target.en}\\b`, "i"))!;
    out.push({
      kind: "fill",
      before: s.en.slice(0, m.index!),
      after: s.en.slice(m.index! + m[0].length),
      sentence: s,
      answer: m[0],
      options: shuffle([m[0], ...pickOthers(pool, target, 2, r).map((o) => o.en)], r),
    });
  });

  const w3 = shuffle(words, r).find((w) => w.en.length <= 12) ?? words[0];
  out.push({ kind: "dictation", word: w3, answer: w3.en });

  out.push({ kind: "speak", sentence: lesson.sentences[0] });

  if (lesson.dialogue?.length) out.push({ kind: "dialogue", lines: lesson.dialogue });

  return out;
}

/** Does this exercise need an answer to be checked? */
export const isGraded = (e: Exercise) => !["grammar", "newWord", "dialogue"].includes(e.kind);
