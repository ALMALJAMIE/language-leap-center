"use client";

import Link from "next/link";
import Image from "next/image";
import { Award, BookOpen, Clock, Heart, PlayCircle } from "lucide-react";
import mark from "@/assets/logo-mark-t.png";
import type { Course } from "@/lib/types";
import { courseLessons, courseTypes, formatPrice, isAvailable, lessonCount, levels, programs } from "@/data/courses";
import { useMounted, useProgress } from "@/lib/store";
import { courseHref } from "@/data/courses";

export function CourseCover({ course, className = "", mini = false }: { course: Course; className?: string; mini?: boolean }) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundImage: `linear-gradient(135deg, ${course.cover.from}, ${course.cover.to})` }}
    >
      {/* rings inspired by the C in the logo */}
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full border-[18px] border-white/10" />
      <div className="absolute -bottom-16 left-6 h-36 w-36 rounded-full border-[14px] border-gold-300/25" />
      <span className={`absolute drop-shadow-lg ${mini ? "bottom-1 right-1.5 text-2xl" : "bottom-3 right-4 text-5xl"}`}>{course.cover.icon}</span>
      {!mini && (
        <span className="absolute bottom-3 left-4 rounded-md bg-white/15 px-2 py-0.5 text-xs font-bold tracking-wider text-white backdrop-blur">{course.code}</span>
      )}
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
      <Link href={courseHref(course.slug)} className="block">
        <CourseCover course={course} className="h-40" />
      </Link>

      <span className="absolute left-3 top-3 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[11px] font-semibold text-slate-700 shadow-sm">
        <PlayCircle className="h-3 w-3 text-gold-500" /> {courseTypes[course.type]}
      </span>
      <button
        onClick={() => toggleWish(course.slug)}
        aria-label="Add to wishlist"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow transition hover:scale-110"
      >
        <Heart className={`h-4 w-4 ${wished ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
      </button>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap items-center gap-1.5 text-[11px] font-bold">
          <span className="rounded-md bg-brand-50 px-2 py-1 text-brand-700">{programs[course.program].icon} {programs[course.program].name}</span>
          <span className="rounded-md bg-gold-50 px-2 py-1 text-gold-700">
            {course.level} · {levels[course.level].name}
          </span>
          {course.isNew && <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">New</span>}
        </div>

        <Link href={courseHref(course.slug)}>
          <h3 className="text-lg font-bold leading-snug text-ink group-hover:text-brand-600">{course.title}</h3>
        </Link>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{course.description}</p>

        <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
          <Image src={mark} alt="" className="h-6 w-6 rounded-full bg-white object-contain p-0.5 ring-1 ring-slate-200" />
          LLC Teaching Team
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> {course.hours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> {lessonCount(course)} lessons
          </span>
          {course.ageGroup && <span>{course.ageGroup}</span>}
        </div>

        {done > 0 && (
          <div className="mt-4">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-gold-400" style={{ width: `${(done / total) * 100}%` }} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {done} of {total} completed
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 mt-5">
          <span className="flex items-center gap-2">
            <span className={`text-lg font-extrabold ${course.price === 0 ? "text-emerald-600" : "text-ink"}`}>
              {course.price === 0 ? "Free" : <><span className="text-xs font-medium text-slate-500">From </span>{formatPrice(course.price)}</>}
            </span>
            {course.certificate && (
              <span className="flex items-center gap-1 rounded-md border border-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-600" title="Certificate of completion">
                <Award className="h-3 w-3 text-gold-500" /> Cert
              </span>
            )}
          </span>
          {available ? (
            <Link href={courseHref(course.slug)} className="whitespace-nowrap text-sm font-bold text-brand-600 hover:text-brand-800">
              {done > 0 ? "Continue →" : course.price > 0 ? "View course →" : "Start course →"}
            </Link>
          ) : (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">Coming soon</span>
          )}
        </div>
      </div>
    </article>
  );
}
