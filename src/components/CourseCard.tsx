"use client";

import Link from "next/link";
import { Award, BookOpen, Clock, Heart } from "lucide-react";
import type { Course } from "@/lib/types";
import { courseLessons, courseTypes, formatPrice, isAvailable, lessonCount, levels, programs } from "@/data/courses";
import { useMounted, useProgress } from "@/lib/store";

export function CourseCover({ course, className = "" }: { course: Course; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${course.cover.from}, ${course.cover.to})` }}
    >
      {/* زخرفة مستوحاة من حرف C في الشعار */}
      <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
      <div className="absolute -bottom-16 right-6 h-36 w-36 rounded-full border-[14px] border-gold-300/25" />
      <span className="absolute bottom-3 left-4 text-5xl drop-shadow-lg">{course.cover.icon}</span>
      <span className="en absolute right-4 top-4 rounded-md bg-white/15 px-2 py-0.5 text-xs font-bold tracking-wider text-white backdrop-blur">
        {course.code}
      </span>
    </div>
  );
}

export function CourseCard({ course }: { course: Course }) {
  const mounted = useMounted();
  const { wishlist, toggleWish, completed } = useProgress();
  const available = isAvailable(course);
  const total = courseLessons(course).length;
  const done = mounted ? courseLessons(course).filter((l) => completed[`${course.slug}/${l.id}`]).length : 0;
  const wished = mounted && wishlist.includes(course.slug);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-900/10">
      <Link href={`/courses/${course.slug}/`} className="block">
        <CourseCover course={course} className="h-40" />
      </Link>

      <button
        onClick={() => toggleWish(course.slug)}
        aria-label="أضف إلى المفضلة"
        className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-brand-700">{programs[course.program].name}</span>
          <span className="en rounded-full bg-gold-50 px-2.5 py-1 text-gold-600">
            {course.level} · {levels[course.level].desc}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">{courseTypes[course.type]}</span>
          {course.isNew && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">جديد</span>}
        </div>

        <Link href={`/courses/${course.slug}/`}>
          <h3 className="text-lg font-bold leading-snug text-ink group-hover:text-brand-600">{course.title}</h3>
          <p className="en mt-0.5 text-right text-xs text-slate-400" dir="ltr">
            {course.titleEn}
          </p>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>

        <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.hours} ساعة
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {lessonCount(course)} درسًا
          </span>
          {course.certificate && (
            <span className="flex items-center gap-1 text-gold-600">
              <Award className="h-3.5 w-3.5" /> شهادة
            </span>
          )}
        </div>

        {done > 0 && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gold-400" style={{ width: `${(done / total) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              أنجزت {done} من {total}
            </p>
          </div>
        )}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4 mt-5">
          <span className={`text-lg font-extrabold ${course.price === 0 ? "text-emerald-600" : "text-brand-700"}`}>
            {formatPrice(course.price)}
          </span>
          {available ? (
            <Link href={`/courses/${course.slug}/`} className="text-sm font-bold text-brand-600 hover:text-brand-800">
              {done > 0 ? "تابع التعلّم ←" : "ابدأ الدورة ←"}
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">قريبًا</span>
          )}
        </div>
      </div>
    </article>
  );
}
