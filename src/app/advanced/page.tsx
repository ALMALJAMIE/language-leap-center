"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  Accessibility, AtSign, BadgeCheck, Briefcase, CircleCheck, Clock, CloudUpload, GraduationCap, Heart, IdCard, Languages, Link2, Loader2, MapPin,
  Pencil, Phone, Save, Settings, Share2, SlidersHorizontal, Target, Trash2, TrendingUp, User, UserRound, Globe, BookOpen,
} from "lucide-react";
import { SignInPrompt } from "@/components/account/AccountShell";
import { AddButton, CheckGrid, Chip, inputCls, SectionCard, Select, TextArea, TextInput } from "@/components/profile/fields";
import * as O from "@/components/profile/options";
import { displayName, useAuth } from "@/lib/auth";
import { completion, resizeImage, saveProfile, sectionDone, useProfile, type ProfileData } from "@/lib/profile";
import { useMounted } from "@/lib/store";

type Tab = "personal" | "location" | "interests" | "advanced";
const tabs: { id: Tab; label: string; icon: typeof User; done: (d: ProfileData) => boolean }[] = [
  { id: "personal", label: "Personal Info", icon: User, done: sectionDone.personal },
  { id: "location", label: "Location & Languages", icon: MapPin, done: sectionDone.location },
  { id: "interests", label: "Profile & Interests", icon: IdCard, done: sectionDone.interests },
  { id: "advanced", label: "Advanced", icon: GraduationCap, done: sectionDone.advanced },
];

function TabHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-6 flex items-center gap-3 border-b border-slate-100 pb-6">
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-700">{icon}</span>
      <div>
        <h2 className="text-xl font-bold text-ink">{title}</h2>
        <p className="text-sm text-slate-500">{sub}</p>
      </div>
    </div>
  );
}

/* ---------------- Personal info ---------------- */
function Personal({ d, set, avatar, setAvatar }: { d: ProfileData; set: (p: Partial<ProfileData>) => void; avatar: string | null; setAvatar: (a: string | null) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);

  const pick = async (f?: File) => {
    if (!f) return;
    setErr(null);
    if (!/^image\/(jpeg|png|gif|webp)$/.test(f.type)) return setErr("Please choose a JPG, PNG or GIF image.");
    if (f.size > 2 * 1024 * 1024) return setErr("The photo must be smaller than 2 MB.");
    setAvatar(await resizeImage(f));
  };

  return (
    <>
      <TabHeader icon={<UserRound className="h-5 w-5" />} title="Personal Information" sub="Tell us about yourself" />
      <div className="border-b border-slate-100 pb-6">
        <div className="mb-2 text-sm font-medium text-slate-700">Profile Photo</div>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => ref.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); }}
            className={`grid h-32 w-32 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-dashed text-center transition ${drag ? "border-brand-500 bg-brand-50" : "border-slate-300 hover:border-brand-400"}`}
          >
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              <span className="px-3 text-xs text-slate-500">
                <CloudUpload className="mx-auto mb-1 h-6 w-6 text-slate-400" />
                Drop photo, or click to upload
                <span className="mt-1 block text-[10px] text-slate-400">JPG, PNG or GIF · Max 2MB</span>
              </span>
            )}
          </button>
          {avatar && (
            <div className="space-y-2">
              <button type="button" onClick={() => ref.current?.click()} className="block text-sm font-bold text-brand-600">Change photo</button>
              <button type="button" onClick={() => setAvatar(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-600"><Trash2 className="h-4 w-4" /> Remove</button>
            </div>
          )}
          <input ref={ref} type="file" accept="image/jpeg,image/png,image/gif,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
        </div>
        {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      </div>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <TextInput label="First Name" value={d.firstName} onChange={(v) => set({ firstName: v })} placeholder="Enter your first name" />
        <TextInput label="Last Name" value={d.lastName} onChange={(v) => set({ lastName: v })} placeholder="Enter your last name" />
        <TextInput label="Username" required value={d.username} onChange={(v) => set({ username: v.toLowerCase().replace(/[^a-z0-9_.]/g, "") })} placeholder="your_username" prefix={<AtSign className="h-4 w-4" />} />
        <TextInput label="Phone Number" type="tel" value={d.phone} onChange={(v) => set({ phone: v })} placeholder="+60 12-345 6789" prefix={<Phone className="h-4 w-4" />} />
        <TextInput label="Date of Birth" type="date" value={d.dob} onChange={(v) => set({ dob: v })} />
        <Select label="Gender" value={d.gender} onChange={(v) => set({ gender: v })} options={O.genders} placeholder="Select gender" />
      </div>
    </>
  );
}

/* ---------------- Location & languages ---------------- */
function Location({ d, set }: { d: ProfileData; set: (p: Partial<ProfileData>) => void }) {
  const countries = useMemo(() => O.countryList(), []);
  const [lang, setLang] = useState("");
  const [level, setLevel] = useState("");
  const [adding, setAdding] = useState(false);
  const langs = d.languages ?? [];

  return (
    <>
      <TabHeader icon={<MapPin className="h-5 w-5" />} title="Location & Languages" sub="Where are you from and what languages do you speak?" />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select label="Country" value={d.country} onChange={(v) => set({ country: v })} options={countries} placeholder="Select country" />
        <TextInput label="City" value={d.city} onChange={(v) => set({ city: v })} placeholder="Enter your city" />
        <TextInput label="State/Province" value={d.state} onChange={(v) => set({ state: v })} placeholder="Enter your state/province" />
        <TextInput label="Postal Code" value={d.postalCode} onChange={(v) => set({ postalCode: v })} placeholder="Enter postal code" />
        <div className="sm:col-span-2">
          <TextInput label="Address Line 1" value={d.address1} onChange={(v) => set({ address1: v })} placeholder="Street address, P.O. box" />
        </div>
        <div className="sm:col-span-2">
          <TextInput label="Address Line 2 (Optional)" value={d.address2} onChange={(v) => set({ address2: v })} placeholder="Apartment, suite, unit, building, floor, etc." />
        </div>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-6">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Languages className="h-4 w-4 text-gold-500" /> Languages You Speak</div>
        <p className="mb-3 text-xs text-slate-500">Add the languages you can communicate in</p>
        {langs.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {langs.map((l, i) => (
              <Chip key={l.name} onRemove={() => set({ languages: langs.filter((_, j) => j !== i) })}>{l.name} · <span className="text-brand-500">{l.level}</span></Chip>
            ))}
          </div>
        )}
        {adding ? (
          <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-mist p-4">
            <div className="min-w-[180px] flex-1"><Select label="Language" value={lang} onChange={setLang} options={O.commonLanguages.filter((x) => !langs.some((l) => l.name === x))} /></div>
            <div className="min-w-[160px] flex-1"><Select label="Level" value={level} onChange={setLevel} options={O.languageLevels} /></div>
            <button
              type="button"
              disabled={!lang || !level}
              onClick={() => { set({ languages: [...langs, { name: lang, level }] }); setLang(""); setLevel(""); setAdding(false); }}
              className="btn-primary px-4 py-2.5 text-sm"
            >
              Add
            </button>
            <button type="button" onClick={() => setAdding(false)} className="px-2 py-2.5 text-sm text-slate-500">Cancel</button>
          </div>
        ) : (
          <AddButton onClick={() => setAdding(true)}>Add Language</AddButton>
        )}
      </div>
    </>
  );
}

/* ---------------- Profile & interests ---------------- */
function Interests({ d, set }: { d: ProfileData; set: (p: Partial<ProfileData>) => void }) {
  const [interest, setInterest] = useState("");
  const [addI, setAddI] = useState(false);
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");
  const [addS, setAddS] = useState(false);
  const interests = d.interests ?? [];
  const socials = d.socials ?? [];

  return (
    <>
      <TabHeader icon={<IdCard className="h-5 w-5" />} title="Profile & Interests" sub="Share your background and interests" />
      <div className="space-y-6">
        <TextArea label="About You" icon={<Pencil className="h-4 w-4 text-slate-500" />} value={d.about} onChange={(v) => set({ about: v })} placeholder="Tell us a bit about yourself…" max={1000} />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextInput label="Occupation" icon={<Briefcase className="h-4 w-4 text-gold-500" />} value={d.occupation} onChange={(v) => set({ occupation: v })} placeholder="e.g., Teacher, Engineer, Student" />
          <Select label="Education Level" icon={<GraduationCap className="h-4 w-4 text-gold-500" />} value={d.education} onChange={(v) => set({ education: v })} options={O.educationLevels} placeholder="Select education level" />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Heart className="h-4 w-4 text-red-500" /> Interests & Hobbies</div>
          <p className="mb-3 text-xs text-slate-500">Add topics you&apos;re passionate about</p>
          {interests.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {interests.map((x) => <Chip key={x} onRemove={() => set({ interests: interests.filter((y) => y !== x) })}>{x}</Chip>)}
            </div>
          )}
          {addI ? (
            <form
              onSubmit={(e) => { e.preventDefault(); const v = interest.trim(); if (v && !interests.includes(v)) set({ interests: [...interests, v] }); setInterest(""); }}
              className="flex max-w-md gap-2"
            >
              <input autoFocus value={interest} onChange={(e) => setInterest(e.target.value)} placeholder="e.g., Football, Cooking, Travel" className={inputCls} />
              <button className="btn-primary px-4 text-sm">Add</button>
              <button type="button" onClick={() => setAddI(false)} className="px-2 text-sm text-slate-500">Done</button>
            </form>
          ) : (
            <AddButton onClick={() => setAddI(true)}>Add Interest</AddButton>
          )}
        </div>

        <TextInput label="Website URL (Optional)" icon={<Globe className="h-4 w-4 text-gold-500" />} type="url" value={d.website} onChange={(v) => set({ website: v })} placeholder="https://your-website.com" prefix={<Link2 className="h-4 w-4" />} />

        <div>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-700"><Share2 className="h-4 w-4 text-gold-500" /> Social Media Links (Optional)</div>
          <p className="mb-3 text-xs text-slate-500">Connect your social media profiles</p>
          {socials.length > 0 && (
            <div className="mb-3 space-y-2">
              {socials.map((s, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm">
                  <b className="w-24 shrink-0">{s.platform}</b>
                  <span className="flex-1 truncate text-slate-600">{s.url}</span>
                  <button type="button" onClick={() => set({ socials: socials.filter((_, j) => j !== i) })} className="text-slate-400 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          )}
          {addS ? (
            <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-mist p-4">
              <div className="min-w-[160px]"><Select label="Platform" value={platform} onChange={setPlatform} options={O.socialPlatforms} /></div>
              <div className="min-w-[220px] flex-1"><TextInput label="Profile link" type="url" value={url} onChange={setUrl} placeholder="https://…" /></div>
              <button
                type="button"
                disabled={!platform || !/^https?:\/\/.+/.test(url)}
                onClick={() => { set({ socials: [...socials, { platform, url }] }); setPlatform(""); setUrl(""); setAddS(false); }}
                className="btn-primary px-4 py-2.5 text-sm"
              >
                Add
              </button>
              <button type="button" onClick={() => setAddS(false)} className="px-2 py-2.5 text-sm text-slate-500">Cancel</button>
            </div>
          ) : (
            <AddButton onClick={() => setAddS(true)}>Add Social Link</AddButton>
          )}
        </div>
      </div>
    </>
  );
}

/* ---------------- Advanced ---------------- */
function Advanced({ d, set }: { d: ProfileData; set: (p: Partial<ProfileData>) => void }) {
  const slots = d.timeSlots ?? [];
  return (
    <>
      <TabHeader icon={<GraduationCap className="h-5 w-5" />} title="Advanced" sub="Tell us about your learning goals to get personalized teacher matches and recommendations." />
      <div className="space-y-5">
        <SectionCard icon={<BookOpen className="h-5 w-5 text-brand-700" />} title="Learning Information">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Current English Level" value={d.currentLevel} onChange={(v) => set({ currentLevel: v })} options={O.englishLevels} placeholder="Select your level…" />
            <Select label="Motivation Level" value={d.motivation} onChange={(v) => set({ motivation: v })} options={O.motivationLevels} placeholder="Select motivation…" />
            <Select label="Preferred Class Type" value={d.classType} onChange={(v) => set({ classType: v })} options={O.classTypes} placeholder="Select class type…" />
            <Select label="Learning Path" value={d.learningPath} onChange={(v) => set({ learningPath: v })} options={O.learningPaths} placeholder="Select learning path…" />
          </div>
          <TextArea
            label="Learning Goals"
            hint="What do you want to achieve?"
            value={d.goals}
            onChange={(v) => set({ goals: v })}
            placeholder="e.g., I want to speak confidently at work and pass IELTS with a band 7…"
          />
        </SectionCard>

        <SectionCard icon={<Target className="h-5 w-5 text-gold-500" />} title="Learning Targets">
          <div className="grid gap-5 sm:grid-cols-2">
            <Select label="Target Proficiency Level" value={d.targetLevel} onChange={(v) => set({ targetLevel: v })} options={O.targetLevels} placeholder="Select target level…" />
            <TextInput label="Target Achievement Date" type="date" value={d.targetDate} onChange={(v) => set({ targetDate: v })} />
          </div>
        </SectionCard>

        <SectionCard icon={<SlidersHorizontal className="h-5 w-5 text-gold-500" />} title="Learning Preferences">
          <CheckGrid label="Learning Styles" hint="Select all that apply" options={O.learningStyles} value={d.learningStyles} onChange={(v) => set({ learningStyles: v })} />
          <CheckGrid label="Lesson Topics of Interest" hint="Select all that interest you" options={O.lessonTopics} value={d.topics} onChange={(v) => set({ topics: v })} />
          <CheckGrid label="Preferred Teaching Methods" hint="Select all that suit your style" options={O.teachingMethods} value={d.methods} onChange={(v) => set({ methods: v })} />
        </SectionCard>

        <SectionCard icon={<BadgeCheck className="h-5 w-5 text-gold-500" />} title="Teacher Preferences">
          <CheckGrid label="Preferred Teacher Qualities" hint="What matters most to you?" options={O.instructorQualities} value={d.instructorQualities} onChange={(v) => set({ instructorQualities: v })} />
        </SectionCard>

        <SectionCard
          icon={<Clock className="h-5 w-5 text-brand-700" />}
          title="Schedule Preferences"
          action={
            <button type="button" onClick={() => set({ timeSlots: [...slots, { day: "Monday", from: "18:00", to: "19:00" }] })} className="text-sm font-semibold text-brand-700 hover:text-brand-900">
              + Add time slot
            </button>
          }
        >
          <p className="text-sm text-slate-500">Select your preferred days and times for learning sessions.</p>
          {slots.length === 0 ? (
            <p className="text-sm italic text-slate-400">No time slots added yet. Click “Add time slot” to set your availability.</p>
          ) : (
            <div className="space-y-2">
              {slots.map((s, i) => {
                const upd = (p: Partial<typeof s>) => set({ timeSlots: slots.map((x, j) => (j === i ? { ...x, ...p } : x)) });
                return (
                  <div key={i} className="flex flex-wrap items-center gap-2 rounded-xl bg-mist p-3">
                    <select value={s.day} onChange={(e) => upd({ day: e.target.value })} className={`${inputCls} w-40`}>
                      {O.weekDays.map((w) => <option key={w}>{w}</option>)}
                    </select>
                    <input type="time" value={s.from} onChange={(e) => upd({ from: e.target.value })} className={`${inputCls} w-32`} />
                    <span className="text-slate-400">to</span>
                    <input type="time" value={s.to} onChange={(e) => upd({ to: e.target.value })} className={`${inputCls} w-32`} />
                    <button type="button" onClick={() => set({ timeSlots: slots.filter((_, j) => j !== i) })} className="ml-auto text-slate-400 hover:text-red-600" aria-label="Remove"><Trash2 className="h-4 w-4" /></button>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard icon={<Accessibility className="h-5 w-5 text-brand-700" />} title="Accessibility & Special Needs">
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm">
            <input type="checkbox" checked={!!d.needsAccommodation} onChange={(e) => set({ needsAccommodation: e.target.checked })} className="h-4 w-4 accent-brand-600" />
            I require special accommodations for learning
          </label>
          {d.needsAccommodation && (
            <TextArea label="Tell us what would help you" value={d.accommodationNotes} onChange={(v) => set({ accommodationNotes: v })} placeholder="e.g., larger text, extra time in quizzes, captions for audio…" max={500} />
          )}
        </SectionCard>
      </div>
    </>
  );
}

/* ---------------- Page ---------------- */
function Editor() {
  const user = useAuth((s) => s.user);
  const { data, avatar, storage } = useProfile();
  const [draft, setDraft] = useState<ProfileData>(() => {
    const full = displayName(user).split(" ");
    return { firstName: full[0] ?? "", lastName: full.slice(1).join(" "), username: (user?.email ?? "").split("@")[0].toLowerCase().replace(/[^a-z0-9_.]/g, "_"), ...data };
  });
  const [photo, setPhoto] = useState<string | null>(avatar);
  const [tab, setTab] = useState<Tab>("personal");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (p: Partial<ProfileData>) => {
    setDraft((d) => ({ ...d, ...p }));
    setMsg(null);
  };
  const pct = completion(draft, photo);

  const save = async () => {
    if (!draft.username?.trim()) {
      setTab("personal");
      return setMsg({ ok: false, text: "Username is required." });
    }
    setBusy(true);
    const r = await saveProfile(draft, photo);
    setBusy(false);
    setMsg(
      r.ok
        ? { ok: true, text: r.local ? "Saved on this device. (Run the profile setup step in Supabase to save it to your account.)" : "Your profile has been saved." }
        : { ok: false, text: r.error ?? "Could not save. Please try again." },
    );
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-8">
      {/* Header card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-50 to-gold-50 ring-4 ring-white shadow">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : <User className="h-7 w-7 text-brand-800" />}
            </span>
            <div>
              <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Complete Your Profile</h1>
              <p className="text-sm text-slate-500">Help us personalize your experience on <b className="text-brand-800">Language Leap Center</b></p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-700">
            <TrendingUp className="h-4 w-4" /> {pct}% Complete
          </span>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-gold-400 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <Link href="/settings/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-900 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800">
          <Settings className="h-4 w-4" /> Settings
        </Link>
      </div>

      {/* Tabs */}
      <div className="no-scrollbar flex overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        {tabs.map((t) => {
          const Icon = t.icon;
          const on = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-1 shrink-0 items-center justify-center gap-2 border-b-2 px-4 py-3.5 text-sm font-medium transition ${on ? "border-brand-700 bg-brand-50/50 text-brand-800" : "border-transparent text-slate-500 hover:text-ink"}`}
            >
              <Icon className="h-4 w-4" /> <span className="whitespace-nowrap">{t.label}</span>
              {t.done(draft) && <CircleCheck className="h-4 w-4 fill-gold-400 text-white" />}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <div className="p-6 sm:p-7">
          {tab === "personal" && <Personal d={draft} set={set} avatar={photo} setAvatar={(a) => { setPhoto(a); setMsg(null); }} />}
          {tab === "location" && <Location d={draft} set={set} />}
          {tab === "interests" && <Interests d={draft} set={set} />}
          {tab === "advanced" && <Advanced d={draft} set={set} />}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-6 py-4 sm:px-7">
          <span className={`text-sm ${msg ? (msg.ok ? "text-emerald-600" : "text-red-600") : "text-slate-400"}`}>
            {msg ? msg.text : storage === "local" ? "Profile is saved on this device only." : ""}
          </span>
          <button onClick={save} disabled={busy} className="flex items-center gap-2 rounded-xl bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CompleteProfile() {
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const loaded = useProfile((s) => s.loaded && s.userId === user?.id);

  if (!mounted || !ready) return <div className="min-h-[60vh]" />;
  if (!user)
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-8">
        <SignInPrompt text="Sign in to complete your profile." />
      </div>
    );
  if (!loaded) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-brand-500" /></div>;
  return <Editor key={user.id} />;
}
