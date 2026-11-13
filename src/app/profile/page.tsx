"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BadgeCheck, BookOpen, Briefcase, CalendarDays, CheckCircle2, Clock, Eye, Flame, Globe, GraduationCap, Heart, Languages, Mail, MapPin, Phone,
  Target, TrendingUp, UserPen, UserPlus, X,
} from "lucide-react";
import { SignInPrompt } from "@/components/account/AccountShell";
import { courseProgress, startedCourses } from "@/lib/account";
import { displayName, initials, useAuth } from "@/lib/auth";
import { completionParts, useProfile, type ProfileData } from "@/lib/profile";
import { useMounted, useProgress } from "@/lib/store";
import { courseLessons } from "@/data/courses";
import { englishLevels, targetLevels } from "@/components/profile/options";

const levelLabel = (code?: string) => englishLevels.find(([c]) => c === code)?.[1].split(" — ")[0] ?? "Not set";
const targetLabel = (code?: string) => targetLevels.find(([c]) => c === code)?.[1] ?? "Not set";

function Avatar({ name, avatar, size = "h-36 w-36 text-5xl" }: { name: string; avatar: string | null; size?: string }) {
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white shadow-xl ring-[6px] ring-white ${size}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </span>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-mist px-4 py-3">
      <span className="mt-0.5 text-brand-600">{icon}</span>
      <div className="min-w-0">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{label}</div>
        <div className="font-semibold text-ink">{value || <span className="font-normal text-slate-400">Not set</span>}</div>
      </div>
    </div>
  );
}

function PublicPreview({ name, d, avatar, onClose }: { name: string; d: ProfileData; avatar: string | null; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 px-4" onMouseDown={onClose}>
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl" onMouseDown={(e) => e.stopPropagation()}>
        <div className="relative h-24 bg-[linear-gradient(110deg,#061a37,#0b326d_55%,#845b13)]">
          <button onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-lg p-1 text-white hover:bg-white/10"><X className="h-5 w-5" /></button>
        </div>
        <div className="-mt-12 px-6 pb-6 text-center">
          <div className="flex justify-center"><Avatar name={name} avatar={avatar} size="h-24 w-24 text-3xl" /></div>
          <h3 className="mt-3 text-xl font-bold">{name}</h3>
          {d.username && <p className="text-sm text-slate-500">@{d.username}</p>}
          <p className="mt-1 text-xs font-semibold text-gold-600">This is how teachers and other learners see you</p>
          {d.about && <p className="mt-4 text-sm leading-6 text-slate-600">{d.about}</p>}
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
            {d.currentLevel && <span className="rounded-full bg-brand-50 px-3 py-1 font-semibold text-brand-700">English: {levelLabel(d.currentLevel)}</span>}
            {d.country && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{d.city ? `${d.city}, ` : ""}{d.country}</span>}
            {(d.interests ?? []).slice(0, 5).map((i) => <span key={i} className="rounded-full bg-gold-50 px-3 py-1 text-gold-700">{i}</span>)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyProfile() {
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const { data: d, avatar, loaded } = useProfile();
  const p = useProgress();
  const [preview, setPreview] = useState(false);

  if (!mounted || !ready) return <div className="min-h-[60vh]" />;
  if (!user) return <div className="mx-auto max-w-2xl px-6 py-12"><SignInPrompt text="Sign in to see your profile." /></div>;

  const name = displayName(user);
  const parts = completionParts(d, avatar);
  const started = startedCourses(p.completed);
  const completedCourses = started.filter((c) => courseProgress(c, p.completed).allPublishedDone).length;
  const minutes = started.flatMap((c) => courseLessons(c).filter((l) => p.completed[`${c.slug}/${l.id}`])).reduce((n, l) => n + l.minutes, 0);
  const verified = !!user.email_confirmed_at;
  const location = [d.city, d.state, d.country].filter(Boolean).join(", ");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Profile</h1>
        <div className="flex gap-2">
          <button onClick={() => setPreview(true)} className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            <Eye className="h-4 w-4" /> View Public Profile
          </button>
          <Link href="/advanced/" className="flex items-center gap-2 rounded-xl bg-gold-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-gold-600">
            <UserPen className="h-4 w-4" /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Cover */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="h-40 bg-[linear-gradient(110deg,#061a37,#0b326d_55%,#845b13)]" />
        <div className="flex flex-wrap items-end justify-between gap-6 px-6 pb-6 sm:px-8">
          <div className="-mt-20 flex flex-wrap items-end gap-5">
            <Avatar name={name} avatar={avatar} />
            <div className="pb-2">
              <div className="flex flex-wrap items-baseline gap-x-3">
                <h2 className="text-3xl font-extrabold text-ink">{name}</h2>
                {d.username && <span className="text-slate-500">@{d.username}</span>}
              </div>
              <div className="mt-2 flex gap-2 text-xs font-semibold">
                <span className="flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-brand-700"><GraduationCap className="h-3.5 w-3.5" /> Learner</span>
                {verified && <span className="flex items-center gap-1 rounded-full bg-gold-50 px-3 py-1 text-gold-700"><BadgeCheck className="h-3.5 w-3.5" /> Verified</span>}
              </div>
            </div>
          </div>
          <div className="w-48 rounded-2xl border border-slate-200 p-4 text-center shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Profile completion</div>
            <div className="mt-1 text-3xl font-extrabold">{loaded ? parts.total : 0}%</div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-gold-400" style={{ width: `${parts.total}%` }} /></div>
            <div className="mt-3 grid grid-cols-2 text-xs">
              <div><div className="text-slate-500">General</div><b className="text-gold-600">{parts.general}%</b></div>
              <div><div className="text-slate-500">Learning</div><b className="text-brand-700">{parts.learning}%</b></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Total courses", v: started.length, icon: <BookOpen className="h-6 w-6" />, c: "from-gold-500 to-gold-600" },
          { l: "Completed", v: completedCourses, icon: <CheckCircle2 className="h-6 w-6" />, c: "from-brand-800 to-brand-950" },
          { l: "Study hours", v: `${Math.round((minutes / 60) * 10) / 10}h`, icon: <Clock className="h-6 w-6" />, c: "from-gold-500 to-gold-600" },
          { l: "Current streak", v: p.streak, sub: "days", icon: <Flame className="h-6 w-6" />, c: "from-orange-500 to-orange-600" },
        ].map((s) => (
          <div key={s.l} className={`flex justify-between rounded-2xl bg-gradient-to-br p-5 text-white shadow-sm ${s.c}`}>
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-white/80">{s.l}</div>
              <div className="mt-2 text-3xl font-extrabold">{s.v}</div>
              {s.sub && <div className="text-xs text-white/80">{s.sub}</div>}
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/20">{s.icon}</span>
          </div>
        ))}
      </div>

      {/* Complete your profile */}
      {parts.total < 100 && (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border-2 border-brand-100 bg-brand-50/40 p-5">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-brand-950 text-white"><UserPlus className="h-5 w-5" /></span>
          <div className="flex-1">
            <div className="text-lg font-bold">Complete Your Profile</div>
            <p className="text-slate-600">
              Your profile is <b>{parts.total}% complete</b>. General profile is <b className="text-gold-600">{parts.general}%</b>. Learning preferences at <b className="text-brand-700">{parts.learning}%</b>.
            </p>
          </div>
          <Link href="/advanced/" className="flex items-center gap-2 rounded-xl bg-gold-500 px-5 py-2.5 font-semibold text-white hover:bg-gold-600"><UserPen className="h-4 w-4" /> Edit Profile</Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="mb-5 flex items-center gap-3 text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700"><TrendingUp className="h-5 w-5" /></span> English Learning Journey</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Row icon={<Languages className="h-5 w-5" />} label="Current level" value={d.currentLevel ? levelLabel(d.currentLevel) : p.placement ? levelLabel(p.placement.level) : undefined} />
              <Row icon={<Target className="h-5 w-5" />} label="Target level" value={d.targetLevel ? targetLabel(d.targetLevel) : undefined} />
              <Row icon={<GraduationCap className="h-5 w-5" />} label="Learning path" value={d.learningPath} />
              <Row icon={<CalendarDays className="h-5 w-5" />} label="Target date" value={d.targetDate ? new Date(d.targetDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : undefined} />
              <Row icon={<Flame className="h-5 w-5" />} label="Motivation" value={d.motivation?.split(" — ")[0]} />
              <Row icon={<BookOpen className="h-5 w-5" />} label="Class type" value={d.classType?.split(" — ")[0]} />
            </div>
            {d.goals && (
              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Learning goals</div>
                <p className="mt-1 text-slate-700">{d.goals}</p>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 text-xl font-bold">About</h3>
            {d.about ? <p className="leading-7 text-slate-700">{d.about}</p> : <p className="text-slate-400">Tell others a little about yourself in Edit Profile.</p>}
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <Row icon={<Briefcase className="h-5 w-5" />} label="Occupation" value={d.occupation} />
              <Row icon={<GraduationCap className="h-5 w-5" />} label="Education" value={d.education} />
            </div>
            {(d.interests?.length ?? 0) > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Heart className="h-4 w-4 text-red-500" /> Interests</div>
                <div className="flex flex-wrap gap-2">{d.interests!.map((i) => <span key={i} className="rounded-full bg-gold-50 px-3 py-1 text-sm text-gold-700">{i}</span>)}</div>
              </div>
            )}
            {(d.languages?.length ?? 0) > 0 && (
              <div className="mt-5">
                <div className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><Languages className="h-4 w-4 text-brand-600" /> Languages</div>
                <div className="flex flex-wrap gap-2">{d.languages!.map((l) => <span key={l.name} className="rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">{l.name} · {l.level}</span>)}</div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6">
            <h3 className="mb-4 flex items-center gap-3 text-xl font-bold"><span className="grid h-10 w-10 place-items-center rounded-xl bg-gold-50 text-gold-600"><Mail className="h-5 w-5" /></span> Contact Info</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex gap-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="min-w-0 break-all">
                  {user.email}
                  {verified && <span className="mt-0.5 flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Verified</span>}
                </span>
              </li>
              <li className="flex gap-3"><Phone className="h-4 w-4 shrink-0 text-slate-400" /> {d.phone || <span className="text-slate-400">No phone number</span>}</li>
              <li className="flex gap-3"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /> {location || <span className="text-slate-400">No location</span>}</li>
              {d.website && <li className="flex gap-3"><Globe className="h-4 w-4 shrink-0 text-slate-400" /> <a href={d.website} target="_blank" rel="noopener noreferrer" className="truncate text-brand-600 hover:underline">{d.website}</a></li>}
            </ul>
            {(d.socials?.length ?? 0) > 0 && (
              <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
                {d.socials!.map((s) => <a key={s.url} href={s.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200">{s.platform}</a>)}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
            <div className="font-bold text-ink">Member since</div>
            <div>{new Date(user.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div>
            <Link href="/settings/" className="mt-4 inline-block font-bold text-brand-600">Account settings →</Link>
          </div>
        </aside>
      </div>

      {preview && <PublicPreview name={name} d={d} avatar={avatar} onClose={() => setPreview(false)} />}
    </div>
  );
}
