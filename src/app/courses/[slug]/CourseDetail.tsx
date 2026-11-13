"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, Award, BarChart3, LayoutGrid, ShoppingCart, BookOpen, Calendar, Check, ChevronDown, ChevronRight, Clock, GraduationCap, Headphones, Heart, Link2, Lock, Mic,
  PenLine, Play, PlayCircle, Sparkles, Star, Target, Users, BadgeCheck,
} from "lucide-react";
import mark from "@/assets/logo-mark-t.png";
import { courseLessons, courses, courseTypes, formatPrice, getCourse, isAvailable, lessonCount, levels, programs } from "@/data/courses";
import { CourseCard, CourseCover } from "@/components/CourseCard";
import { FacebookIcon, WhatsAppIcon } from "@/components/BrandIcons";
import { useMounted, useProgress } from "@/lib/store";
import { siteUrl } from "@/lib/auth";
import { payments } from "@/lib/site";
import { useCourseAccess } from "@/lib/enrollments";
import type { Course, Level } from "@/lib/types";

const skillIcon: Record<string, React.ReactNode> = {
  Listening: <Headphones className="h-4 w-4" />,
  Speaking: <Mic className="h-4 w-4" />,
  Pronunciation: <Mic className="h-4 w-4" />,
  Writing: <PenLine className="h-4 w-4" />,
  Reading: <BookOpen className="h-4 w-4" />,
  Vocabulary: <Sparkles className="h-4 w-4" />,
  Grammar: <Target className="h-4 w-4" />,
};

const audienceByLevel: Record<Level, string[]> = {
  A1: ["Complete beginners with little or no English", "Arabic speakers who want a clear, step-by-step start", "Adults who want to handle simple everyday situations"],
  A2: ["Learners who finished A1 or know basic English", "People living or travelling abroad who need everyday English", "Learners who understand simple English but find it hard to speak"],
  B1: ["Learners who can handle daily situations and want more confidence", "Students and professionals preparing for work or study in English"],
  B2: ["Learners who want fluency in discussion and writing", "Candidates preparing for IELTS or university study"],
  C1: ["Advanced learners who want precision and a richer style", "Professionals and academics who write and present in English"],
};
const audienceFor = (c: Course) =>
  c.program === "KIDS" ? [`Children ${c.ageGroup?.replace("Ages ", "aged ") ?? ""} starting English`, "Parents who want a safe, playful English routine for their child"] : audienceByLevel[c.level];

const updated = new Date().toLocaleDateString("en-GB", { month: "short", year: "numeric" });

type Tab = "overview" | "curriculum" | "instructor" | "reviews";

export function CourseDetail({ slug }: { slug: string }) {
  const course = getCourse(slug)!;
  const mounted = useMounted();
  const { completed, wishlist, toggleWish } = useProgress();
  const [tab, setTab] = useState<Tab>("overview");
  const [more, setMore] = useState(false);
  const [copied, setCopied] = useState(false);

  const lessons = courseLessons(course);
  const isDone = (id: string) => mounted && !!completed[`${slug}/${id}`];
  const nextLesson = lessons.find((l) => !isDone(l.id)) ?? lessons[0];
  const doneCount = lessons.filter((l) => isDone(l.id)).length;
  const available = isAvailable(course);
  const access = useCourseAccess(course);
  const locked = access !== "open";
  const totalWords = lessons.reduce((n, l) => n + l.words.length, 0);
  const upcoming = course.modules.reduce((n, m) => n + (m.upcoming?.length ?? 0), 0);
  const wished = mounted && wishlist.includes(slug);
  const related = courses.filter((c) => c.slug !== slug).sort((a, b) => Number(b.program === course.program) - Number(a.program === course.program) || a.order - b.order).slice(0, 6);
  const url = mounted ? siteUrl(`/courses/${slug}/`) : "";
  const shareText = `${course.title} — Language Leap Center`;

  const longDescription = `${course.description} Each lesson is short and interactive: you learn a few words with audio and examples, practise them through listening, matching, sentence building and dictation, say them out loud with instant feedback, and finish with a real dialogue. Words you learn go into your spaced-review deck so you keep them for the long term.`;

  let globalIndex = 0;

  const tabs: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "curriculum", label: "Curriculum" },
    { id: "instructor", label: "Instructor" },
    { id: "reviews", label: "Reviews (0)" },
  ];

  return (
    <div className="-mb-24 bg-slate-50/50 pb-20">
      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
          <Link href="/courses/" className="hover:text-ink">Courses</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/courses/?program=${course.program}`} className="hover:text-ink">{programs[course.program].name}</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-ink">{course.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          {/* Main column */}
          <div className="min-w-0">
            {/* Hero card */}
            <div className="relative overflow-hidden rounded-3xl bg-brand-950 p-7 text-white sm:p-9">
              <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full border-[30px] border-white/5" />
              <div className="relative flex flex-wrap gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 rounded-md bg-brand-500 px-2.5 py-1">{programs[course.program].icon} {programs[course.program].name}</span>
                <span className="rounded-md bg-brand-600 px-2.5 py-1">{course.code} · {levels[course.level].name}</span>
                {course.certificate && <span className="flex items-center gap-1 rounded-md bg-gold-400 px-2.5 py-1 text-brand-950"><Award className="h-3.5 w-3.5" /> Certificate</span>}
                <span className="flex items-center gap-1 rounded-md bg-gold-600 px-2.5 py-1"><PlayCircle className="h-3.5 w-3.5" /> {courseTypes[course.type]}</span>
                {course.ageGroup && <span className="rounded-md bg-white/15 px-2.5 py-1">{course.ageGroup}</span>}
              </div>
              <h1 className="relative mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">{course.title}</h1>
              <p className={`relative mt-4 text-lg leading-8 text-brand-100 ${more ? "" : "line-clamp-3"}`}>{more ? longDescription : course.description}</p>
              <button onClick={() => setMore(!more)} className="relative mt-3 flex items-center gap-1 text-sm font-bold underline underline-offset-4">
                {more ? "Show less" : "Show more"} <ChevronDown className={`h-4 w-4 transition ${more ? "rotate-180" : ""}`} />
              </button>
            </div>

            {/* Tabs */}
            <div className="no-scrollbar mt-6 flex gap-1 overflow-x-auto border-b border-slate-200">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`-mb-px shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition ${tab === t.id ? "border-brand-700 text-brand-800" : "border-transparent text-slate-500 hover:text-ink"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="mt-8">
              {tab === "overview" && (
                <div className="space-y-10">
                  <section>
                    <h2 className="mb-5 text-2xl font-bold">What you&apos;ll learn</h2>
                    <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                      {course.outcomes.map((o) => (
                        <li key={o} className="flex gap-3 text-slate-700"><Check className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" /> {o}</li>
                      ))}
                    </ul>
                    <div className="mt-6 flex flex-wrap gap-2">
                      {course.skills.map((s) => (
                        <span key={s} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">{skillIcon[s]} {s}</span>
                      ))}
                    </div>
                  </section>

                  <section>
                    <h2 className="mb-3 text-2xl font-bold">Description</h2>
                    <p className="leading-7 text-slate-700">{longDescription}</p>
                  </section>

                  <section>
                    <h2 className="mb-3 text-2xl font-bold">Who this course is for</h2>
                    <ul className="list-disc space-y-1.5 pl-5 text-slate-700">
                      {audienceFor(course).map((a) => <li key={a}>{a}</li>)}
                    </ul>
                  </section>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-200 pt-5 text-sm text-slate-600">
                    <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.hours}h total</span>
                    <span className="flex items-center gap-1.5"><PlayCircle className="h-4 w-4" /> {lessonCount(course)} lessons</span>
                    {totalWords > 0 && <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> {totalWords} words & phrases</span>}
                    <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Updated {updated}</span>
                  </div>

                  <InstructorCard />
                </div>
              )}

              {tab === "curriculum" && (
                <div className="space-y-5">
                  <p className="text-slate-600">
                    {lessons.length} lessons ready{upcoming ? ` · ${upcoming} more being prepared` : ""} · about {lessons.reduce((n, l) => n + l.minutes, 0)} minutes of practice
                  </p>
                  {course.modules.map((m, mi) => (
                    <div key={mi} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                      <div className="flex items-center justify-between bg-mist px-6 py-4">
                        <div>
                          <span className="text-xs font-bold uppercase tracking-wide text-gold-600">Unit {mi + 1}</span>
                          <h3 className="font-bold">{m.title}</h3>
                        </div>
                        <span className="text-sm text-slate-500">{m.lessons.length + (m.upcoming?.length ?? 0)} lessons</span>
                      </div>
                      <ul className="divide-y divide-slate-100">
                        {m.lessons.map((l) => {
                          globalIndex++;
                          const done = isDone(l.id);
                          return (
                            <li key={l.id}>
                              <Link href={locked ? `/checkout/?course=${slug}` : `/learn/${slug}/${l.id}/`} className="flex items-center gap-4 px-6 py-4 transition hover:bg-brand-50/50">
                                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? "bg-emerald-500 text-white" : "bg-brand-100 text-brand-700"}`}>
                                  {done ? <Check className="h-5 w-5" /> : globalIndex}
                                </span>
                                <div className="flex-1 font-semibold">{l.title}</div>
                                <span className="hidden text-xs text-slate-500 sm:block">{l.words.length} words · {l.minutes} min</span>
                                {locked ? <Lock className="h-4 w-4 text-slate-400" /> : <Play className="h-4 w-4 text-brand-500" />}
                              </Link>
                            </li>
                          );
                        })}
                        {m.upcoming?.map((u) => (
                          <li key={u} className="flex items-center gap-4 px-6 py-4 text-slate-400">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-slate-100"><Lock className="h-4 w-4" /></span>
                            <span className="flex-1">{u}</span>
                            <span className="text-xs">Coming soon</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {tab === "instructor" && (
                <div className="space-y-5">
                  <InstructorCard />
                  <p className="leading-7 text-slate-700">
                    Our courses are written by the Language Leap Center teaching team for Arabic-speaking learners. Lessons explain only what you need, use real everyday English, and give you plenty of listening and speaking practice. Need a person? Book a private lesson or message us on WhatsApp.
                  </p>
                  <Link href={`/instructors/?specialty=${course.program}`} className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 text-sm"><GraduationCap className="h-4 w-4" /> Book a private lesson</Link>
                </div>
              )}

              {tab === "reviews" && (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
                  <div className="flex justify-center gap-1 text-slate-300">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-6 w-6" />)}</div>
                  <h3 className="mt-4 text-lg font-bold">No reviews yet</h3>
                  <p className="mt-1 text-slate-500">This course is new. Reviews from learners will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <CourseCover course={course} className="h-44" />
              <div className="space-y-4 p-5">
                <div className="rounded-2xl border-2 border-brand-300 bg-brand-50/40 p-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 rounded-md bg-white px-2 py-1 text-xs font-bold text-brand-700 shadow-sm"><PlayCircle className="h-3.5 w-3.5" /> {courseTypes[course.type]}</span>
                    <span className={`text-2xl font-extrabold ${course.price === 0 ? "text-emerald-600" : "text-ink"}`}>{formatPrice(course.price)}</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    {course.price === 0 ? "Free forever — no card needed" : `One-time payment · ${payments.accessMonths} months access`}
                  </p>
                </div>

                {available ? (
                  <>
                    {doneCount > 0 && (
                      <div>
                        <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gold-400" style={{ width: `${(doneCount / lessons.length) * 100}%` }} /></div>
                        <p className="mt-1 text-xs text-slate-500">{doneCount} of {lessons.length} lessons completed</p>
                      </div>
                    )}
                    {course.price > 0 && access === "open" && (
                      <p className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-sm font-bold text-emerald-700"><Check className="h-4 w-4" /> You&apos;re enrolled</p>
                    )}
                    {locked && (
                      <Link href={`/checkout/?course=${slug}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-950 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-brand-800">
                        <ShoppingCart className="h-5 w-5" /> Enroll Now — {formatPrice(course.price)}
                      </Link>
                    )}
                    {!locked && (
                      <Link href={`/learn/${slug}/${nextLesson.id}/`} className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-base">
                        <Play className="h-5 w-5 fill-white" />
                        {doneCount === 0 ? "Start Learning" : doneCount === lessons.length ? "Review the course" : "Continue Learning"}
                      </Link>
                    )}
                    {locked && <p className="text-center text-xs text-slate-500">Lessons open as soon as your enrollment is confirmed.</p>}
                  </>
                ) : (
                  <div className="rounded-2xl bg-mist p-4 text-center text-sm text-slate-600">
                    This course is being prepared. Save it to your wishlist and start with A1 for free.
                    <Link href="/courses/general-english-1/" className="btn-gold mt-3 block py-2.5">Start A1 for free</Link>
                  </div>
                )}

                <Link href={`/instructors/?specialty=${course.program}`} className="block rounded-2xl border border-gold-200 bg-gold-50/60 p-4 transition hover:border-gold-300">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-gold-700"><GraduationCap className="h-4 w-4" /> Add live 1-on-1 lessons</div>
                  <p className="mt-1 text-xs text-slate-600">Practise this course with a teacher — 30, 60 or 90 minutes.</p>
                </Link>

                <button onClick={() => toggleWish(slug)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 font-semibold transition hover:border-red-300">
                  <Heart className={`h-4 w-4 ${wished ? "fill-red-500 text-red-500" : ""}`} /> {wished ? "In your Wishlist" : "Add to Wishlist"}
                </button>

                <div className="grid grid-cols-2 gap-3 rounded-2xl bg-mist p-4 text-sm text-slate-600">
                  <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {course.hours}h total</span>
                  <span className="flex items-center gap-2"><PlayCircle className="h-4 w-4" /> {lessonCount(course)} lessons</span>
                  <span className="flex items-center gap-2"><BarChart3 className="h-4 w-4" /> {course.level} {levels[course.level].name}</span>
                  <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> {totalWords || "—"} words</span>
                </div>

                <div>
                  <h4 className="mb-2 font-bold">This course includes:</h4>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {[
                      `${lessons.length} interactive lessons with audio`,
                      "Speaking practice with voice recognition",
                      "Grammar tips and real dialogues",
                      "Spaced review of every word",
                      ...(course.certificate ? ["Certificate of completion"] : []),
                    ].map((x) => <li key={x} className="flex gap-2"><Check className="h-4 w-4 shrink-0 text-brand-700" /> {x}</li>)}
                  </ul>
                </div>

                <div>
                  <h4 className="mb-2 font-bold">Share this course:</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-white">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg bg-[#1877F2] py-2"><FacebookIcon className="h-4 w-4" /> Facebook</a>
                    <a href={`https://x.com/intent/post?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg bg-black py-2">𝕏 Post</a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg bg-[#0A66C2] py-2">in LinkedIn</a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2"><WhatsAppIcon className="h-4 w-4" /> WhatsApp</a>
                  </div>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-200"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied ? "Link copied" : "Copy Link"}
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5">
              <h4 className="mb-3 font-bold">Course Stats</h4>
              <dl className="space-y-2.5 text-sm">
                {[
                  ["Lessons ready", lessons.length],
                  ["Coming soon", upcoming],
                  ["Words & phrases", totalWords],
                  ["Level", `${course.level} · ${levels[course.level].name}`],
                  ["Last updated", updated],
                  ["Language", "English"],
                ].map(([k, v]) => (
                  <div key={String(k)} className="flex justify-between gap-3"><dt className="text-slate-500">{k}</dt><dd className="font-semibold">{v}</dd></div>
                ))}
              </dl>
            </div>

            {course.certificate && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-100"><Award className="h-7 w-7 text-gold-500" /></div>
                <h4 className="mt-3 font-bold">Earn a Certificate</h4>
                <p className="mt-1 text-sm text-slate-500">Complete this course to earn an official Language Leap Center certificate of completion.</p>
              </div>
            )}
          </aside>
        </div>

        {/* Related */}
        <section className="mt-20">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-extrabold">Learners also viewed</h2>
            <p className="mt-2 text-slate-500">Discover more courses that complement your learning journey</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((c) => <CourseCard key={c.slug} course={c} />)}
          </div>
          <div className="mt-10 text-center">
            <Link href={`/courses/?program=${course.program}`} className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-300 bg-white px-6 py-3 font-bold text-ink transition hover:border-brand-400">
              <LayoutGrid className="h-4 w-4" /> View More {programs[course.program].name} Courses <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function InstructorCard() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-white ring-2 ring-gold-300">
        <Image src={mark} alt="" className="h-9 w-auto" />
      </span>
      <div>
        <div className="flex items-center gap-1.5 font-semibold">
          Lead Instructor: Language Leap Center Teaching Team <BadgeCheck className="h-4 w-4 text-brand-600" />
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-slate-500">
          <span className="flex items-center gap-1"><Users className="h-4 w-4" /> English teachers for Arabic speakers</span>
        </div>
      </div>
    </div>
  );
}
