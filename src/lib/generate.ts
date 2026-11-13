import type { Exercise, LessonSpec, Word } from "./types";

/** مولّد أرقام عشوائية ثابت البذرة حتى يبقى ترتيب الدرس نفسه بين الزيارات */
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

/** تقطيع الجملة إلى كلمات لبنك الكلمات */
export const tokenize = (s: string) =>
  s
    .replace(/[.,!?]/g, "")
    .split(/\s+/)
    .filter(Boolean);

/** توحيد النص للمقارنة: حروف صغيرة وحذف الترقيم والمسافات الزائدة */
export const normalize = (s: string) =>
  s
    .toLowerCase()
    .replace(/[’']/g, "'")
    .replace(/[.,!?;:"]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/** نسبة التشابه بين جملتين على مستوى الكلمات (لتقييم النطق) */
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
 * يحوّل مواصفات الدرس إلى سلسلة تمارين متدرجة:
 * قاعدة ← كلمة جديدة ← اختبار فوري ← استماع ← توصيل ← بناء جملة ← فراغ ← كتابة ← نطق ← حوار
 */
export function generateExercises(lesson: LessonSpec, distractorPool: Word[] = []): Exercise[] {
  const r = rng(lesson.id);
  const words = lesson.words;
  const pool = [...words, ...distractorPool.filter((w) => !words.some((x) => x.en === w.en))];
  const out: Exercise[] = [];

  if (lesson.grammar) out.push({ kind: "grammar", tip: lesson.grammar });

  // تقديم الكلمات على دفعات من اثنتين، يتبع كل دفعة تمرين تثبيت
  for (let i = 0; i < words.length; i += 2) {
    const batch = words.slice(i, i + 2);
    batch.forEach((w) => out.push({ kind: "newWord", word: w }));
    batch.forEach((w, k) => {
      const others = pickOthers(pool, w, 3, r);
      if ((i / 2 + k) % 2 === 0) {
        out.push({
          kind: "choiceMeaning",
          prompt: w.en,
          answer: w.ar,
          options: shuffle([w.ar, ...others.map((o) => o.ar)], r),
        });
      } else {
        out.push({
          kind: "listen",
          audio: w.en,
          answer: w.en,
          options: shuffle([w.en, ...others.map((o) => o.en)], r),
        });
      }
    });
  }

  // توصيل الأزواج
  out.push({ kind: "match", pairs: shuffle(words, r).slice(0, 5).map((w) => ({ en: w.en, ar: w.ar })) });

  // اختيار الكلمة الإنجليزية لمعنى عربي
  const w2 = shuffle(words, r)[0];
  out.push({
    kind: "choiceWord",
    prompt: w2.ar,
    answer: w2.en,
    options: shuffle([w2.en, ...pickOthers(pool, w2, 3, r).map((o) => o.en)], r),
  });

  // بناء الجمل وملء الفراغ
  const extraTokens = shuffle(
    pool.flatMap((w) => tokenize(w.en)),
    r,
  );
  lesson.sentences.forEach((s, idx) => {
    if (idx % 2 === 0) {
      const toks = tokenize(s.en);
      const distract = extraTokens.filter((t) => !toks.map((x) => x.toLowerCase()).includes(t.toLowerCase())).slice(0, 3);
      out.push({ kind: "build", ar: s.ar, answer: s.en, bank: shuffle([...toks, ...distract], r) });
    } else {
      const target = words.find((w) => new RegExp(`\\b${w.en}\\b`, "i").test(s.en));
      if (target) {
        const m = s.en.match(new RegExp(`\\b${target.en}\\b`, "i"))!;
        const pos = m.index!;
        out.push({
          kind: "fill",
          before: s.en.slice(0, pos),
          after: s.en.slice(pos + m[0].length),
          ar: s.ar,
          answer: m[0],
          options: shuffle([m[0], ...pickOthers(pool, target, 2, r).map((o) => o.en)], r),
        });
      } else {
        const toks = tokenize(s.en);
        out.push({ kind: "build", ar: s.ar, answer: s.en, bank: shuffle([...toks, ...extraTokens.slice(0, 2)], r) });
      }
    }
  });

  // كتابة كلمة من الذاكرة
  const w3 = shuffle(words, r).find((w) => w.en.length <= 12) ?? words[0];
  out.push({ kind: "type", ar: w3.ar, answer: w3.en });

  // النطق
  const speakS = lesson.sentences[0];
  out.push({ kind: "speak", en: speakS.en, ar: speakS.ar });

  if (lesson.dialogue?.length) out.push({ kind: "dialogue", lines: lesson.dialogue });

  return out;
}

/** هل يحتاج التمرين إلى إجابة تُصحَّح؟ */
export const isGraded = (e: Exercise) => !["grammar", "newWord", "dialogue"].includes(e.kind);
