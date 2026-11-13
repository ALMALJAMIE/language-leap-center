"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Award, BookOpen, CalendarPlus, ChevronRight, Globe, Languages, MapPin, UserX } from "lucide-react";
import { getCourse, programs } from "@/data/courses";
import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/lib/auth";
import { useRole } from "@/lib/roles";
import { loadTeachers, useTeacherList } from "@/lib/teaching";
import { CourseCard } from "@/components/CourseCard";
import { InstructorAvatar, Price, Rating, Stats, bookHref } from "@/components/Instructors";

export function ProfileView() {
  const id = useSearchParams().get("id") ?? "";
  const { list, loaded } = useTeacherList();
  useEffect(() => {
    loadTeachers();
  }, []);
  const t = list.find((i) => i.slug === id);
  const staff = !!useRole((s) => s.role);

  if (!t && !loaded) return <div className="min-h-[60vh]" />;
  if (!t) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><UserX className="h-8 w-8" /></span>
        <h1 className="mt-5 text-2xl font-extrabold">Instructor not found</h1>
        <p className="mt-2 text-slate-500">This profile doesn&apos;t exist or is no longer available.</p>
        <Link href="/instructors/" className="btn-primary mt-6 inline-flex items-center gap-2 px-5 py-2.5"><ArrowLeft className="h-4 w-4" /> All instructors</Link>
      </div>
    );
  }

  const taught = (t.courses ?? []).map(getCourse).filter((c) => !!c);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
        <Link href="/" className="hover:text-ink">Home</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/courses/" className="hover:text-ink">Courses</Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/instructors/" className="hover:text-ink">Instructors</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="font-semibold text-ink">{t.name}</span>
      </nav>

      <div className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-32 bg-[linear-gradient(120deg,#061a37_0%,#0f4ca7_60%,#efb52a_100%)]" />
        <div className="flex flex-col items-center gap-6 px-6 pb-8 sm:flex-row sm:items-end sm:px-10">
          <div className="-mt-16"><InstructorAvatar t={t} size="lg" /></div>
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-extrabold text-ink">{t.name}</h1>
            <p className="mt-1 text-slate-600">{t.title}</p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              <Rating t={t} />
              {t.country && <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600"><MapPin className="h-3.5 w-3.5" /> {t.country}</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6">
            <h2 className="text-lg font-bold">About</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-slate-700">{t.bio}</p>
          </section>

          <section className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="flex items-center gap-2 font-bold"><Languages className="h-4 w-4 text-brand-600" /> Languages</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.languages.map((l) => <span key={l} className="rounded-full bg-brand-50 px-3 py-1 text-sm font-medium text-brand-700">{l}</span>)}
              </div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="flex items-center gap-2 font-bold"><Globe className="h-4 w-4 text-gold-600" /> Specialties</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {t.specialties.map((p) => (
                  <Link key={p} href={`/courses/?program=${p}`} className="rounded-full bg-gold-50 px-3 py-1 text-sm font-medium text-gold-800 hover:bg-gold-100">{programs[p].icon} {programs[p].name}</Link>
                ))}
              </div>
            </div>
          </section>

          {t.qualifications?.length ? (
            <section className="rounded-3xl border border-slate-200 bg-white p-6">
              <h3 className="flex items-center gap-2 font-bold"><Award className="h-4 w-4 text-emerald-600" /> Qualifications</h3>
              <ul className="mt-3 flex flex-wrap gap-2">
                {t.qualifications.map((q) => <li key={q} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm">{q}</li>)}
              </ul>
            </section>
          ) : null}

          {t.id && <Reviews teacherId={t.id} />}

          {taught.length > 0 && (
            <section>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold"><BookOpen className="h-5 w-5 text-brand-600" /> Courses by {t.name}</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {taught.map((c) => <CourseCard key={c.slug} course={c} />)}
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-28 lg:self-start">
          <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <Stats t={t} />
            <Price t={t} />
            {staff ? null : t.privateLessons ? (
              <Link href={bookHref(t)} className="flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 font-bold text-brand-950 transition hover:bg-gold-400">
                <CalendarPlus className="h-4 w-4" /> Book a private lesson
              </Link>
            ) : (
              <p className="text-sm text-slate-500">This teacher isn&apos;t taking private lessons right now.</p>
            )}
          </div>
          <Link href="/instructors/" className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-ink">
            <ArrowLeft className="h-4 w-4" /> All instructors
          </Link>
        </aside>
      </div>
    </div>
  );
}

function Reviews({ teacherId }: { teacherId: string }) {
  const [rows, setRows] = useState<{ rating: number; comment: string; first_name: string; created_at: string }[]>([]);
  useEffect(() => {
    supabase.rpc("teacher_public_reviews", { p_teacher: teacherId }).then(({ data }) => setRows(data ?? []));
  }, [teacherId]);
  if (!rows.length) return null;
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold">What learners say</h2>
      <ul className="mt-4 divide-y divide-slate-100">
        {rows.map((r, i) => (
          <li key={i} className="py-4">
            <div className="flex items-center gap-2">
              <span className="flex">{[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= r.rating ? "fill-gold-400 text-gold-400" : "text-slate-200"}`} />)}</span>
              <span className="text-sm font-semibold">{r.first_name}</span>
              <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
            </div>
            <p className="mt-1.5 text-sm leading-6 text-slate-700">{r.comment}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
