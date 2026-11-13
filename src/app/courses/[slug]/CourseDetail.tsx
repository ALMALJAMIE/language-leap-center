"use client";

import Link from "next/link";
import { Award, BookOpen, Check, ChevronLeft, Clock, Headphones, Lock, Mic, PenLine, Play, Sparkles, Target } from "lucide-react";
import { courseLessons, courseTypes, formatPrice, getCourse, isAvailable, lessonCount, levels, programs } from "@/data/courses";
import { CourseCover } from "@/components/CourseCard";
import { useMounted, useProgress } from "@/lib/store";

const skillIcon: Record<string, React.ReactNode> = {
  استماع: <Headphones className="h-4 w-4" />,
  محادثة: <Mic className="h-4 w-4" />,
  نطق: <Mic className="h-4 w-4" />,
  كتابة: <PenLine className="h-4 w-4" />,
  قراءة: <BookOpen className="h-4 w-4" />,
  مفردات: <Sparkles className="h-4 w-4" />,
  قواعد: <Target className="h-4 w-4" />,
};

export function CourseDetail({ slug }: { slug: string }) {
  const course = getCourse(slug)!;
  const mounted = useMounted();
  const { completed } = useProgress();
  const lessons = courseLessons(course);
  const isDone = (id: string) => mounted && !!completed[`${slug}/${id}`];
  const nextLesson = lessons.find((l) => !isDone(l.id)) ?? lessons[0];
  const doneCount = lessons.filter((l) => isDone(l.id)).length;
  const available = isAvailable(course);
  const totalWords = lessons.reduce((n, l) => n + l.words.length, 0);

  let globalIndex = 0;

  return (
    <div>
      <section className="brand-gradient relative overflow-hidden">
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full border-[44px] border-white/5" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
          <div className="text-white">
            <nav className="mb-5 flex items-center gap-1 text-sm text-brand-200">
              <Link href="/courses/" className="hover:text-white">الدورات</Link>
              <ChevronLeft className="h-4 w-4" />
              <span>{programs[course.program].name}</span>
            </nav>
            <div className="mb-4 flex flex-wrap gap-2 text-xs font-bold">
              <span className="en rounded-full bg-gold-400 px-3 py-1 text-brand-900">{course.level} · {levels[course.level].desc}</span>
              <span className="rounded-full bg-white/15 px-3 py-1">{courseTypes[course.type]}</span>
              {course.ageGroup && <span className="rounded-full bg-white/15 px-3 py-1">{course.ageGroup}</span>}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight sm:text-4xl">{course.title}</h1>
            <p className="en mt-1 text-right text-brand-200" dir="ltr">{course.titleEn}</p>
            <p className="mt-5 max-w-2xl leading-8 text-brand-100">{course.description}</p>
            <div className="mt-6 flex flex-wrap gap-5 text-sm text-brand-100">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-gold-300" /> {course.hours} ساعة</span>
              <span className="flex items-center gap-1.5"><BookOpen className="h-4 w-4 text-gold-300" /> {lessonCount(course)} درسًا</span>
              {totalWords > 0 && <span className="flex items-center gap-1.5"><Sparkles className="h-4 w-4 text-gold-300" /> {totalWords} كلمة وعبارة</span>}
              {course.certificate && <span className="flex items-center gap-1.5"><Award className="h-4 w-4 text-gold-300" /> شهادة إتمام</span>}
            </div>
            <p className="mt-4 text-sm text-brand-200">المحاضر: فريق Language Leap Center</p>
          </div>

          {/* بطاقة الاشتراك */}
          <div className="overflow-hidden rounded-3xl bg-white text-ink shadow-2xl lg:sticky lg:top-24 lg:self-start">
            <CourseCover course={course} className="h-44" />
            <div className="p-6">
              <div className={`text-3xl font-extrabold ${course.price === 0 ? "text-emerald-600" : "text-brand-700"}`}>
                {formatPrice(course.price)}
              </div>
              {available ? (
                <>
                  {doneCount > 0 && (
                    <div className="mt-4">
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gold-400" style={{ width: `${(doneCount / lessons.length) * 100}%` }} />
                      </div>
                      <p className="mt-1.5 text-sm text-slate-500">أنجزت {doneCount} من {lessons.length} دروس متاحة</p>
                    </div>
                  )}
                  <Link
                    href={`/learn/${slug}/${nextLesson.id}/`}
                    className="btn-primary mt-5 flex w-full items-center justify-center gap-2 py-3.5 text-lg"
                  >
                    <Play className="h-5 w-5 fill-white" />
                    {doneCount === 0 ? "ابدأ الدرس الأول" : doneCount === lessons.length ? "أعد الدرس الأول" : "تابع من حيث توقفت"}
                  </Link>
                  {course.price > 0 && (
                    <p className="mt-3 text-center text-xs text-slate-500">الدروس المنشورة متاحة للتجربة مجانًا الآن</p>
                  )}
                </>
              ) : (
                <div className="mt-5 rounded-2xl bg-mist p-4 text-center text-sm text-slate-600">
                  هذه الدورة قيد الإعداد. ابدأ الآن بالدورة المجانية وسنُعلمك عند إطلاقها.
                  <Link href="/courses/general-english-1/" className="btn-gold mt-3 block py-2.5">ابدأ بالمستوى A1 مجانًا</Link>
                </div>
              )}
              <ul className="mt-6 space-y-2.5 text-sm text-slate-600">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> نطق صوتي لكل كلمة وجملة</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> تمارين نطق بالتعرف على الصوت</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> مراجعة ذكية بخوارزمية FSRS</li>
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> تعلّم بالسرعة التي تناسبك</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 lg:grid-cols-[1fr_380px]">
        <div className="space-y-10">
          <section className="rounded-3xl border border-slate-200 p-7">
            <h2 className="mb-5 text-xl font-bold">ماذا ستتعلم؟</h2>
            <ul className="grid gap-3 sm:grid-cols-2">
              {course.outcomes.map((o) => (
                <li key={o} className="flex gap-2.5 text-slate-700">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold-100 text-gold-600">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                  {o}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              {course.skills.map((s) => (
                <span key={s} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700">
                  {skillIcon[s]} {s}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-5 text-xl font-bold">محتوى الدورة</h2>
            <div className="space-y-5">
              {course.modules.map((m, mi) => (
                <div key={mi} className="overflow-hidden rounded-3xl border border-slate-200">
                  <div className="flex items-center justify-between bg-mist px-6 py-4">
                    <div>
                      <span className="text-xs font-bold text-gold-600">الوحدة {mi + 1}</span>
                      <h3 className="font-bold">{m.title}</h3>
                      <p className="en text-right text-xs text-slate-400" dir="ltr">{m.titleEn}</p>
                    </div>
                    <span className="text-sm text-slate-500">{m.lessons.length + (m.upcoming?.length ?? 0)} دروس</span>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {m.lessons.map((l) => {
                      globalIndex++;
                      const done = isDone(l.id);
                      return (
                        <li key={l.id}>
                          <Link href={`/learn/${slug}/${l.id}/`} className="flex items-center gap-4 px-6 py-4 transition hover:bg-brand-50/50">
                            <span
                              className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-bold ${
                                done ? "bg-emerald-500 text-white" : "bg-brand-100 text-brand-700"
                              }`}
                            >
                              {done ? <Check className="h-5 w-5" /> : globalIndex}
                            </span>
                            <div className="flex-1">
                              <div className="font-semibold">{l.title}</div>
                              <div className="en text-right text-xs text-slate-400" dir="ltr">{l.titleEn}</div>
                            </div>
                            <span className="hidden text-xs text-slate-500 sm:block">{l.words.length} كلمات · {l.minutes} د</span>
                            <Play className="h-4 w-4 text-brand-500" />
                          </Link>
                        </li>
                      );
                    })}
                    {m.upcoming?.map((u) => (
                      <li key={u} className="flex items-center gap-4 px-6 py-4 text-slate-400">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-100">
                          <Lock className="h-4 w-4" />
                        </span>
                        <span className="flex-1">{u}</span>
                        <span className="text-xs">قريبًا</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <div className="rounded-3xl border border-gold-200 bg-gold-50 p-6">
            <h3 className="font-bold text-gold-700">كيف يسير الدرس؟</h3>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              {[
                "قاعدة مختصرة بالعربية",
                "كلمات جديدة بالصوت والمثال",
                "استماع واختيار وتوصيل",
                "بناء جمل وملء فراغات",
                "نطق بصوتك وتقييم فوري",
                "حوار واقعي يجمع ما تعلمت",
              ].map((s, i) => (
                <li key={s} className="flex gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gold-400 text-xs font-bold text-brand-900">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-3xl border border-slate-200 p-6">
            <h3 className="font-bold">لست متأكدًا من مستواك؟</h3>
            <p className="mt-2 text-sm text-slate-600">اختبار قصير من 15 سؤالًا يقترح عليك الدورة المناسبة.</p>
            <Link href="/placement/" className="mt-4 inline-block font-bold text-brand-600">ابدأ الاختبار ←</Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
