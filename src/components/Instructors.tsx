"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarPlus, Star } from "lucide-react";
import { basePath } from "@/lib/site";
import type { Instructor } from "@/data/instructors";

const initialsOf = (name: string) =>
  name
    .replace(/^(mr|mrs|ms|dr|prof|teacher)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export const profileHref = (t: Instructor) => `/instructors/profile/?id=${t.slug}`;
export const bookHref = (t: Instructor) => `/private-lessons/?teacher=${t.slug}`;

export function InstructorAvatar({ t, size = "md" }: { t: Instructor; size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-36 w-36 text-5xl" : "h-28 w-28 text-4xl";
  return (
    <div className={`relative ${box}`}>
      {t.photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={`${basePath}${t.photo}`} alt={t.name} className="h-full w-full rounded-full object-cover shadow-md ring-4 ring-white" />
      ) : (
        <div className="grid h-full w-full place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-extrabold text-white shadow-md ring-4 ring-white">
          {initialsOf(t.name)}
        </div>
      )}
      {t.verified && (
        <span title="Verified teacher" className="absolute bottom-1 right-1 grid h-7 w-7 place-items-center rounded-full bg-gold-400 text-brand-950 ring-2 ring-white">
          <BadgeCheck className="h-4 w-4" />
        </span>
      )}
    </div>
  );
}

export function Rating({ t }: { t: Instructor }) {
  if (!t.rating) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold-50 px-3 py-1 text-sm">
      <Star className="h-4 w-4 fill-gold-400 text-gold-400" />
      <b>{t.rating.toFixed(1)}</b>
      {t.reviews ? <span className="text-slate-500">({t.reviews} reviews)</span> : null}
    </span>
  );
}

export function Stats({ t }: { t: Instructor }) {
  const items = [
    { v: t.courses?.length, l: "Courses", c: "text-gold-600" },
    { v: t.students, l: "Students", c: "text-ink" },
    { v: t.experienceYears, l: "Years exp.", c: "text-brand-700" },
  ].filter((i) => i.v);
  if (!items.length) return null;
  return (
    <div className="grid gap-2 rounded-xl bg-slate-50 py-4" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
      {items.map((i) => (
        <div key={i.l} className="text-center">
          <div className={`text-2xl font-extrabold ${i.c}`}>{i.v}</div>
          <div className="text-xs text-slate-500">{i.l}</div>
        </div>
      ))}
    </div>
  );
}

export function Price({ t }: { t: Instructor }) {
  if (!t.hourly && !t.packagesFrom) return null;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {t.hourly ? (
        <span className="text-sm">
          <b className="text-base">${t.hourly}</b> <span className="text-xs text-slate-500">/ hour</span>
        </span>
      ) : null}
      {t.packagesFrom ? (
        <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Packages from ${t.packagesFrom}/h</span>
      ) : null}
    </div>
  );
}

export function InstructorCard({ t }: { t: Instructor }) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-sm transition hover:shadow-lg">
      <div className="mx-auto">
        <InstructorAvatar t={t} />
      </div>
      <h3 className="mt-5 text-lg font-bold text-ink">{t.name}</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">{t.title}</p>
      <div className="mt-3 empty:hidden">
        <Rating t={t} />
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">{t.bio}</p>
      <div className="mt-5 space-y-5">
        <Stats t={t} />
        <Price t={t} />
      </div>
      <div className="mt-5 space-y-3">
        <Link href={profileHref(t)} className="flex items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#0a2852,#0f4ca7_55%,#efb52a)] py-3 font-bold text-white shadow transition hover:brightness-110">
          View Profile <ArrowRight className="h-4 w-4" />
        </Link>
        {t.privateLessons && (
          <Link href={bookHref(t)} className="flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-2.5 text-sm font-bold text-brand-950 transition hover:bg-gold-400">
            <CalendarPlus className="h-4 w-4" /> Book a private lesson
          </Link>
        )}
      </div>
    </div>
  );
}
