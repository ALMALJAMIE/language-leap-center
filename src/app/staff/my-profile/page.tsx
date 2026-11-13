"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Camera, CheckCircle2, ExternalLink, Eye, Loader2, Lock, Save } from "lucide-react";
import { programs } from "@/data/courses";
import { displayName, supabase, useAuth } from "@/lib/auth";
import { resizeImage } from "@/lib/profile";
import { rpcError } from "@/lib/roles";
import { loadMyTeacher, loadTeachers, money, slugify, useMyTeacher, type TeacherRow } from "@/lib/teaching";
import type { ProgramId } from "@/lib/types";
import { InstructorAvatar } from "@/components/Instructors";
import { ErrorNote, StaffShell } from "@/components/staff/StaffShell";

export default function MyTeacherProfilePage() {
  return (
    <StaffShell page="/staff/my-profile/" title="My Public Profile" subtitle="How learners see you on the Instructors page">
      <Editor />
    </StaffShell>
  );
}

type Form = Pick<TeacherRow, "name" | "title" | "bio" | "photo" | "country" | "languages" | "specialties" | "qualifications" | "experience_years">;

function Editor() {
  const user = useAuth((s) => s.user)!;
  const { profile, loaded } = useMyTeacher();
  useEffect(() => {
    loadMyTeacher(user.id);
  }, [user.id]);
  if (!loaded) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  return <FormView key={profile?.user_id ?? "new"} profile={profile} userId={user.id} fallbackName={displayName(user)} />;
}

const inputCls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500";

function FormView({ profile, userId, fallbackName }: { profile: TeacherRow | null; userId: string; fallbackName: string }) {
  const [f, setF] = useState<Form>({
    name: profile?.name ?? fallbackName,
    title: profile?.title ?? "",
    bio: profile?.bio ?? "",
    photo: profile?.photo ?? null,
    country: profile?.country ?? "",
    languages: profile?.languages ?? ["English"],
    specialties: profile?.specialties ?? [],
    qualifications: profile?.qualifications ?? [],
    experience_years: profile?.experience_years ?? null,
  });
  const [langText, setLangText] = useState((profile?.languages ?? ["English", "Arabic"]).join(", "));
  const [qualText, setQualText] = useState((profile?.qualifications ?? []).join(", "));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF({ ...f, [k]: v });
    setOk(false);
  };
  const split = (s: string) => s.split(",").map((x) => x.trim()).filter(Boolean);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    const row = { ...f, country: f.country || null, languages: split(langText), qualifications: split(qualText) };
    const { error } = profile
      ? await supabase.from("teachers").update(row).eq("user_id", userId)
      : await supabase.from("teachers").insert({ ...row, user_id: userId, slug: `${slugify(f.name)}-${userId.slice(0, 4)}` });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    setOk(true);
    loadMyTeacher(userId);
    loadTeachers(true);
  };

  const preview = {
    slug: profile?.slug ?? "preview", name: f.name || "Your name", title: f.title, bio: f.bio, photo: f.photo ?? undefined,
    languages: split(langText), specialties: f.specialties as ProgramId[], privateLessons: true, verified: true,
  };

  return (
    <form onSubmit={save} className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <ErrorNote text={err} />
        {!profile && <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">Create your profile to start teaching: learners can book you once the team publishes it and you set your availability.</div>}

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center gap-5">
            <InstructorAvatar t={preview} />
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold hover:border-brand-400">
              <Camera className="h-4 w-4" /> {f.photo ? "Change photo" : "Upload photo"}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const file = e.target.files?.[0]; if (file) set("photo", await resizeImage(file, 320)); }} />
            </label>
            {f.photo && <button type="button" onClick={() => set("photo", null)} className="text-sm text-slate-500 hover:text-red-600">Remove</button>}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">Name shown to learners</span><input required value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">Country</span><input value={f.country ?? ""} onChange={(e) => set("country", e.target.value)} className={inputCls} /></label>
            <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Headline</span><input required maxLength={120} value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="CELTA-certified English teacher | 8 years of experience" className={inputCls} /></label>
            <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold">About you</span><textarea required rows={6} maxLength={2000} value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="How you teach, who you help most, and what a lesson with you looks like." className={inputCls} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">Languages you speak</span><input value={langText} onChange={(e) => setLangText(e.target.value)} placeholder="English, Arabic" className={inputCls} /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-semibold">Years of experience</span><input type="number" min={0} max={60} value={f.experience_years ?? ""} onChange={(e) => set("experience_years", e.target.value ? Number(e.target.value) : null)} className={inputCls} /></label>
            <label className="block sm:col-span-2"><span className="mb-1.5 block text-sm font-semibold">Qualifications</span><input value={qualText} onChange={(e) => setQualText(e.target.value)} placeholder="CELTA, MA TESOL, IELTS examiner" className={inputCls} /></label>
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">What you teach</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(Object.keys(programs) as ProgramId[]).map((p) => {
              const on = f.specialties.includes(p);
              return (
                <button type="button" key={p} onClick={() => set("specialties", on ? f.specialties.filter((x) => x !== p) : [...f.specialties, p])} className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold transition ${on ? "border-brand-600 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-600 hover:border-slate-300"}`}>
                  {programs[p].icon} {programs[p].name}
                </button>
              );
            })}
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button disabled={busy} className="btn-primary flex items-center gap-2 px-6 py-3 disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {profile ? "Save changes" : "Create my profile"}</button>
          {ok && <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved</span>}
        </div>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-bold"><Eye className="h-4 w-4 text-brand-600" /> Status</div>
          <p className="mt-2 text-sm">
            {profile?.published ? <span className="font-semibold text-emerald-600">Published on the Instructors page</span> : <span className="text-amber-700">Not published yet — the team publishes your profile after review.</span>}
          </p>
          {profile?.published && <Link href={`/instructors/profile/?id=${profile.slug}`} className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:underline">View my public page <ExternalLink className="h-3.5 w-3.5" /></Link>}
        </div>
        <div className="rounded-3xl border border-slate-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-bold"><Lock className="h-4 w-4 text-slate-500" /> Set by the team</div>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Learner price</dt><dd className="font-semibold">{profile ? `${money(profile.lesson_price)}/h` : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Your pay</dt><dd className="font-semibold">{profile ? `${money(profile.hourly_pay)}/h` : "—"}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-slate-500">Prices are set by finance. You earn your hourly pay for the length of each lesson you complete.</p>
        </div>
      </aside>
    </form>
  );
}
