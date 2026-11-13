import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Brain, Check, Ear, Flame, Mic, PenLine, Sparkles, Zap } from "lucide-react";
import mark from "@/assets/logo-mark-t.png";
import { courses, levels, programs, totals } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import { SpeakBtn } from "@/components/lesson/Exercises";
import type { Level } from "@/lib/types";

const faqs = [
  { q: "Do I need to know any English before I start?", a: "No. General English 1 is free and starts from zero. Beginners can switch on “Arabic help” at the top of the page to see translations." },
  { q: "How does smart review work?", a: "Every word you learn becomes a flashcard. The FSRS algorithm predicts when you are about to forget it and shows it to you just before that. You review less and remember more." },
  { q: "Can I practise speaking?", a: "Yes. Every lesson has a speaking exercise: say the sentence and the platform marks each word green or red. It works in Chrome, Edge and Safari." },
  { q: "Where is my progress saved?", a: "For now, on your device in your browser. User accounts and syncing across devices are coming in the next phase." },
  { q: "Do I get a certificate?", a: "Courses marked with a certificate award one when you complete all their lessons and tests." },
];

const method = [
  { icon: <Sparkles />, t: "Learn", d: "A few new words and a short grammar tip, each with audio and an example." },
  { icon: <Ear />, t: "Practise", d: "Listening, matching, building sentences and filling gaps — a new task every 30 seconds." },
  { icon: <Mic />, t: "Speak", d: "Say the sentences out loud and get instant word-by-word feedback." },
  { icon: <Brain />, t: "Review smartly", d: "FSRS brings words back right before you would forget them." },
];

export default function Home() {
  const t = totals();
  const featured = courses.filter((c) => ["general-english-1", "everyday-conversation", "kids-english-1"].includes(c.slug));

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
        <div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full border-[70px] border-brand-100/60" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full border-[40px] border-gold-200/50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <span className="h-2 w-2 rounded-full bg-gold-400" /> Learn English online
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.15] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              Your leap to
              <br />
              <span className="text-brand-600">fluent </span>
              <span className="text-gold-gradient">English</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Short lessons where you listen, speak and write. Interactive exercises that feel like a game. Smart review that keeps what you learn. From your first word to advanced level.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses/general-english-1/" className="btn-primary px-7 py-4 text-lg">Start for free</Link>
              <Link href="/placement/" className="rounded-2xl border-2 border-brand-200 bg-white px-7 py-3.5 text-lg font-bold text-brand-700 hover:border-brand-400">
                Find your level
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {["No sign-up needed", "Audio for every word", "Speaking practice", "Progress saved"].map((x) => (
                <li key={x} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> {x}</li>
              ))}
            </ul>
          </div>

          {/* Live lesson preview */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -top-6 left-2 z-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-left-6">
              <Flame className="h-6 w-6 text-orange-500" />
              <div><div className="text-lg font-extrabold leading-none">7</div><div className="text-[11px] text-slate-500">day streak</div></div>
            </div>
            <div className="absolute -bottom-5 right-2 z-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl sm:-right-5">
              <Zap className="h-6 w-6 text-gold-500" />
              <div><div className="text-lg font-extrabold leading-none">+25 XP</div><div className="text-[11px] text-slate-500">lesson complete</div></div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-brand-900/15 ring-1 ring-slate-100">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/5 rounded-full bg-gradient-to-r from-gold-300 to-gold-500" /></div>
                <span className="text-xs font-bold text-slate-400">6/10</span>
              </div>
              <div className="text-sm font-bold text-slate-500">What do you hear? Try it 👇</div>
              <div className="my-6 flex justify-center"><SpeakBtn text="Nice to meet you" size="lg" /></div>
              <div className="grid grid-cols-2 gap-3">
                {["Nice to meet you", "See you later", "Good morning", "Thank you"].map((o, i) => (
                  <div key={o} data-state={i === 0 ? "correct" : ""} className="tile p-3 text-center font-semibold">{o}</div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
                <span className="font-extrabold">Well done! 🎉</span>
                <span className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white">Continue</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mx-auto -mt-6 max-w-5xl px-6">
        <div className="brand-gradient grid grid-cols-2 gap-6 rounded-3xl px-8 py-7 text-center text-white shadow-xl sm:grid-cols-4">
          {[
            [t.courses, "courses"],
            [t.lessons, "interactive lessons"],
            [t.words, "words with audio"],
            ["A1 → C1", "complete path"],
          ].map(([n, l]) => (
            <div key={String(l)}>
              <div className="text-3xl font-extrabold text-gold-300">{n}</div>
              <div className="mt-1 text-sm text-brand-100">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Programs */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold">A program for every goal</h2>
          <p className="mt-3 text-slate-600">Starting from zero, preparing for work, or teaching your children</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(programs).map(([id, p]) => (
            <Link key={id} href={`/courses/?program=${id}`} className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg">
              <div className="text-4xl">{p.icon}</div>
              <h3 className="mt-4 font-bold group-hover:text-brand-600">{p.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Method */}
      <section id="method" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="font-bold text-gold-600">Our method</span>
            <h2 className="mt-2 text-3xl font-extrabold leading-snug">Four steps in every lesson, based on how people really learn languages</h2>
            <p className="mt-4 leading-8 text-slate-600">
              Each lesson takes 8 to 12 minutes. You learn a few words, then use them in different ways: hear them, choose them, build sentences, say them, and meet them in a real dialogue. Mistakes are not punished — they come back at the end of the lesson until you get them right.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Image src={mark} alt="" className="h-12 w-auto" />
              <span className="text-sm font-bold tracking-[0.2em] text-brand-700">LEARN · LEAP · LEAD</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {method.map((m, i) => (
              <div key={m.t} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6">
                <span className="absolute right-4 top-3 text-5xl font-black text-brand-50">{i + 1}</span>
                <div className={`relative grid h-12 w-12 place-items-center rounded-2xl ${i % 2 ? "bg-gold-100 text-gold-600" : "bg-brand-100 text-brand-600"}`}>{m.icon}</div>
                <h3 className="relative mt-4 text-lg font-bold">{m.t}</h3>
                <p className="relative mt-1 text-sm leading-6 text-slate-600">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Path */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="rounded-[2rem] bg-mist p-8 sm:p-12">
          <h2 className="text-center text-3xl font-extrabold">Your path from zero to fluency</h2>
          <p className="mt-3 text-center text-slate-600">The levels of the Common European Framework of Reference (CEFR)</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-5">
            {(Object.keys(levels) as Level[]).map((l, i) => (
              <Link key={l} href={`/courses/?level=${l}`} className="group relative rounded-2xl bg-white p-5 text-center shadow-sm transition hover:shadow-md">
                <div className="mx-auto mb-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-400" style={{ width: `${(i + 1) * 20}%` }} />
                </div>
                <div className="text-3xl font-extrabold text-brand-700 group-hover:text-gold-500">{l}</div>
                <div className="mt-1 font-semibold">{levels[l].name}</div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/placement/" className="btn-gold inline-flex items-center gap-2 px-6 py-3">
              Not sure where to start? Take the placement test <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured courses */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">Start with one of these courses</h2>
            <p className="mt-2 text-slate-600">Lessons ready now, with new ones added regularly</p>
          </div>
          <Link href="/courses/" className="hidden font-bold text-brand-600 sm:block">All courses →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </section>

      {/* Skills */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: <Ear />, t: "Listening", d: "Clear audio for every word and sentence, with a slow mode." },
            { i: <Mic />, t: "Speaking", d: "Voice recognition checks your pronunciation word by word." },
            { i: <PenLine />, t: "Writing", d: "Sentence building and dictation, with spelling feedback." },
            { i: <Sparkles />, t: "Vocabulary", d: "Carefully chosen words for each level, each in a real example." },
          ].map((s) => (
            <div key={s.t} className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-gold-300">{s.i}</div>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm leading-6 text-brand-100">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 pt-24">
        <h2 className="mb-8 text-center text-3xl font-extrabold">Frequently asked questions</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-brand-200 open:bg-brand-50/40">
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                {f.q}
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-7 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final call to action */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="brand-gradient relative overflow-hidden rounded-[2rem] px-8 py-14 text-center text-white">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border-[36px] border-white/5" />
          <div className="absolute -bottom-24 -left-10 h-64 w-64 rounded-full border-[36px] border-gold-400/20" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">Ready for your first leap?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-100">Ten minutes today is enough to begin. The first lesson is free and needs no sign-up.</p>
          <Link href="/courses/general-english-1/" className="btn-gold relative mt-8 inline-block px-8 py-4 text-lg">Start the first lesson</Link>
        </div>
      </section>
    </div>
  );
}
