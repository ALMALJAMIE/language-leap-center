"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft, CalendarCheck, CalendarDays, CalendarPlus, Camera, Check, ChevronLeft, ChevronRight, Clock, GraduationCap, Loader2, NotebookPen, Star, UserRound, X,
} from "lucide-react";
import { AccountShell, SignInPrompt } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { InstructorAvatar } from "@/components/Instructors";
import { Empty, JoinButton, StarInput, Stars, StatusBadge, Tabs, useNow } from "@/components/teaching/ui";
import { displayName, supabase, useAuth } from "@/lib/auth";
import { resizeImage, saveProfile, useProfile } from "@/lib/profile";
import { rpcError } from "@/lib/roles";
import { site } from "@/lib/site";
import { useMounted } from "@/lib/store";
import {
  fmtDay, fmtTime, fmtWhen, freeStarts, loadTeachers, money, timeZone, useTeacherList,
  type BookableInstructor, type PrivateLesson, type Slot,
} from "@/lib/teaching";

export function PrivateLessonsView() {
  const params = useSearchParams();
  const router = useRouter();
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const profile = useProfile();
  const { list, loaded } = useTeacherList();
  useEffect(() => {
    loadTeachers();
  }, []);

  const slug = params.get("teacher");
  const open = (s: string | null) => {
    router.push(s ? `/private-lessons/?teacher=${s}` : "/private-lessons/");
    window.scrollTo({ top: 0 });
  };
  const teacher = list.find((t) => t.slug === slug && t.id);
  const scrollToTeachers = () => document.getElementById("instructors")?.scrollIntoView({ behavior: "smooth" });

  // learners book with their real name and photo, like a class register
  const needsProfile = !!user && profile.loaded && profile.userId === user.id && (!profile.avatar || !profile.data.firstName || !profile.data.lastName);

  const body = () => {
    if (!mounted || !ready) return null;
    if (needsProfile) return <CompleteProfile />;
    if (teacher)
      return <Booking teacher={teacher} onBack={() => open(null)} onBooked={() => { open(null); }} />;
    return (
      <div className="space-y-10">
        {user ? <MyLessons /> : <SignInPrompt text="Sign in to book lessons and see your schedule." />}
        <section id="instructors" className="scroll-mt-24">
          <h2 className="mb-4 text-xl font-bold">Choose an instructor</h2>
          {!loaded ? (
            <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>
          ) : list.length === 0 ? (
            <WhatsAppBooking />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((t) => <TeacherTile key={t.slug} t={t} onBook={() => open(t.slug)} />)}
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <AccountShell
      title="Private Lessons"
      subtitle="Book a 1-on-1 live lesson with an instructor — no course needed."
      actions={!needsProfile && !teacher ? <button onClick={scrollToTeachers} className="flex items-center gap-2 rounded-xl bg-brand-950 px-5 py-3 text-sm font-bold text-white hover:bg-brand-800"><CalendarPlus className="h-4 w-4" /> Book a lesson</button> : undefined}
    >
      {body()}
    </AccountShell>
  );
}

/* ---------------------------------------------------------------- */

function CompleteProfile() {
  const { data, avatar } = useProfile();
  const [first, setFirst] = useState(data.firstName ?? "");
  const [last, setLast] = useState(data.lastName ?? "");
  const [photo, setPhoto] = useState<string | null>(avatar);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setErr("Please add a photo so your teacher can recognise you.");
    setBusy(true);
    const r = await saveProfile({ firstName: first.trim(), lastName: last.trim() }, photo);
    setBusy(false);
    if (!r.ok) setErr(r.error ?? "Could not save. Please try again.");
  };
  return (
    <form onSubmit={save} className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gold-50 text-gold-600"><UserRound className="h-7 w-7" /></span>
      <h2 className="mt-4 text-2xl font-extrabold">Complete your profile first</h2>
      <p className="mt-2 text-slate-600">Your teacher sees your name and photo before each lesson. Only these three things are needed — you can fill in the rest later.</p>
      <label className="mx-auto mt-6 block w-fit cursor-pointer">
        <span className="relative grid h-28 w-28 place-items-center overflow-hidden rounded-full border-4 border-white bg-slate-100 shadow ring-2 ring-brand-100">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" className="h-full w-full object-cover" />
          ) : <Camera className="h-8 w-8 text-slate-400" />}
        </span>
        <span className="mt-2 block text-sm font-bold text-brand-700">{photo ? "Change photo" : "Add your photo"} <span className="text-red-500">*</span></span>
        <input type="file" accept="image/*" className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (f) { setPhoto(await resizeImage(f)); setErr(""); } }} />
      </label>
      <div className="mt-6 grid gap-3 text-left sm:grid-cols-2">
        <label className="block text-sm font-semibold">First name <span className="text-red-500">*</span><input required value={first} onChange={(e) => setFirst(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-brand-500" /></label>
        <label className="block text-sm font-semibold">Last name <span className="text-red-500">*</span><input required value={last} onChange={(e) => setLast(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 px-3 py-2.5 font-normal outline-none focus:border-brand-500" /></label>
      </div>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="btn-primary mt-6 flex w-full items-center justify-center gap-2 py-3 disabled:opacity-60">{busy && <Loader2 className="h-4 w-4 animate-spin" />} Save and continue</button>
      <Link href="/advanced/" className="mt-3 block text-sm font-semibold text-slate-500 hover:text-ink">Fill in my full profile instead</Link>
    </form>
  );
}

function TeacherTile({ t, onBook }: { t: BookableInstructor; onBook: () => void }) {
  const bookable = !!t.id;
  const wa = () => window.open(`${site.whatsapp}?text=${encodeURIComponent(`Hello Language Leap Center! I'd like to book a private lesson with ${t.name}.`)}`, "_blank", "noopener");
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:shadow-md">
      <Link href={`/instructors/profile/?id=${t.slug}`} className="flex items-center gap-3">
        <div className="h-12 w-12 shrink-0 overflow-hidden"><div className="origin-top-left scale-[0.43]"><InstructorAvatar t={t} /></div></div>
        <span className="min-w-0">
          <b className="block truncate hover:text-brand-700">{t.name}</b>
          {t.rating ? <span className="flex items-center gap-1 text-sm text-slate-500"><Star className="h-4 w-4 fill-gold-400 text-gold-400" />{t.rating.toFixed(1)}</span> : <span className="line-clamp-1 text-xs text-slate-500">{t.title}</span>}
        </span>
      </Link>
      <div className="mt-4 flex-1">
        {t.hourly ? <span className="text-sm"><b className="text-base">{money(t.hourly)}</b> <span className="text-xs text-slate-500">/ hour</span></span> : null}
      </div>
      {bookable ? (
        <button onClick={onBook} className="mt-4 rounded-xl bg-brand-950 py-2.5 text-sm font-bold text-white hover:bg-brand-800">Book</button>
      ) : (
        <button onClick={wa} className="mt-4 rounded-xl bg-brand-950 py-2.5 text-sm font-bold text-white hover:bg-brand-800">Book</button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function Booking({ teacher, onBack, onBooked }: { teacher: BookableInstructor; onBack: () => void; onBooked: () => void }) {
  const { user, ready } = useAuth();
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [mins, setMins] = useState(30);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [busy, setBusy] = useState<{ starts_at: string; minutes: number }[]>([]);
  const [week, setWeek] = useState(0);
  const [day, setDay] = useState<string | null>(null);
  const [start, setStart] = useState<Date | null>(null);
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      supabase.from("availability").select("weekday,start_min,end_min").eq("teacher_id", teacher.id!),
      supabase.rpc("teacher_busy", { p_teacher: teacher.id }),
    ]).then(([a, b]) => {
      setSlots((a.data as Slot[]) ?? []);
      setBusy((b.data as { starts_at: string; minutes: number }[]) ?? []);
    });
  }, [teacher.id]);

  const WEEKS = 4;
  const starts = useMemo(() => (slots ? freeStarts(slots, busy, mins, WEEKS * 7) : []), [slots, busy, mins]);
  const byDay = useMemo(() => {
    const m = new Map<string, Date[]>();
    for (const s of starts) {
      const k = s.toDateString();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    }
    return m;
  }, [starts]);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 7 }, (_, i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + week * 7 + i));
  const firstFree = days.find((d) => byDay.has(d.toDateString()))?.toDateString() ?? null;
  const activeDay = day && days.some((d) => d.toDateString() === day) ? day : firstFree;
  const times = activeDay ? byDay.get(activeDay) ?? [] : [];
  const price = teacher.hourly ? (teacher.hourly * mins) / 60 : 0;

  const send = async () => {
    if (!start) return;
    setSending(true);
    setErr("");
    const { error } = await supabase.rpc("book_private_lesson", { p_teacher: teacher.id, p_start: start.toISOString(), p_minutes: mins, p_note: note });
    setSending(false);
    if (error) return setErr(rpcError(error));
    onBooked();
  };
  const askTeam = () =>
    window.open(`${site.whatsapp}?text=${encodeURIComponent(`Hello Language Leap Center! I'd like to book a ${mins}-minute private lesson with ${teacher.name}. Which times are possible?`)}`, "_blank", "noopener");

  const stepNames = ["Instructor", "Time", "Pay", "Review"];

  return (
    <div className="mx-auto max-w-3xl">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Private Lessons</button>
      <h2 className="mt-4 text-2xl font-extrabold">Book a private lesson</h2>

      <ol className="mt-5 flex flex-wrap items-center gap-2 text-sm">
        {stepNames.map((n, i) => {
          const no = i + 1;
          const done = no < step;
          const on = no === step;
          const can = no >= 2 && no < step;
          return (
            <li key={n} className="flex items-center gap-2">
              <button disabled={!can && no !== 1} onClick={() => (no === 1 ? onBack() : can && setStep(no as 2 | 3 | 4))} className={`flex items-center gap-2 ${on ? "font-bold text-ink" : done ? "text-emerald-700" : "text-slate-400"}`}>
                <span className={`grid h-6 w-6 place-items-center rounded-full border text-xs ${on ? "border-ink" : done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"}`}>{done ? <Check className="h-3.5 w-3.5" /> : no}</span>
                {n}
              </button>
              {no < 4 && <ChevronRight className="h-4 w-4 text-slate-300" />}
            </li>
          );
        })}
      </ol>

      <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 overflow-hidden"><div className="origin-top-left scale-[0.39]"><InstructorAvatar t={teacher} /></div></div>
            <div><b>{teacher.name}</b>{teacher.hourly ? <div className="text-xs text-slate-500">{money(teacher.hourly)} / hour</div> : null}</div>
          </div>
          <button onClick={onBack} className="text-sm font-semibold text-slate-600 hover:text-ink">Change</button>
        </div>

        {step === 2 && (
          <>
            <div className="mt-6 text-sm font-semibold">Length</div>
            <div className="mt-2 inline-flex rounded-xl border border-slate-200 p-1">
              {[30, 60, 90].map((m) => (
                <button key={m} onClick={() => { setMins(m); setStart(null); }} className={`rounded-lg px-4 py-2 text-sm transition ${mins === m ? "bg-brand-950 font-semibold text-white" : "text-slate-600 hover:bg-slate-50"}`}>{m} min</button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500">Times shown in {timeZone()}</span>
              <span className="flex gap-2">
                <button disabled={week === 0} onClick={() => { setWeek(week - 1); setDay(null); setStart(null); }} aria-label="Previous week" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
                <button disabled={week >= WEEKS - 1} onClick={() => { setWeek(week + 1); setDay(null); setStart(null); }} aria-label="Next week" className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
              </span>
            </div>
            {slots === null ? (
              <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-7 gap-2">
                  {days.map((d) => {
                    const k = d.toDateString();
                    const n = byDay.get(k)?.length ?? 0;
                    const on = k === activeDay;
                    return (
                      <button key={k} disabled={!n} onClick={() => { setDay(k); setStart(null); }} className={`rounded-xl border py-2 text-center text-xs leading-5 transition ${on ? "border-brand-700 bg-brand-50 text-brand-900 ring-1 ring-brand-700" : n ? "border-slate-200 hover:border-slate-300" : "border-slate-100 text-slate-300"}`}>
                        <div className="font-semibold">{d.toLocaleDateString("en-GB", { weekday: "short" })}</div>
                        <div>{d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</div>
                        <div className={n ? "text-emerald-600" : ""}>{n}</div>
                      </button>
                    );
                  })}
                </div>
                {starts.length === 0 ? (
                  <div className="mt-5 rounded-2xl bg-slate-50 p-5 text-center">
                    <CalendarDays className="mx-auto h-8 w-8 text-slate-300" />
                    <p className="mt-2 text-sm text-slate-600">{slots.length === 0 ? `${teacher.name} hasn't opened booking times yet.` : `No free times in the next ${WEEKS} weeks for a ${mins}-minute lesson. Try a shorter lesson.`}</p>
                    <button onClick={askTeam} className="mx-auto mt-3 flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700"><WhatsAppIcon className="h-4 w-4" /> Ask our team for a time</button>
                  </div>
                ) : times.length === 0 ? (
                  <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">No free times this week — use the arrow to see the next week.</p>
                ) : (
                  <>
                    <div className="mt-6 text-sm font-semibold">Start time <span className="font-normal text-slate-500">({timeZone()})</span></div>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {times.map((t) => (
                        <button key={t.toISOString()} onClick={() => setStart(t)} className={`rounded-xl border py-2.5 text-sm transition ${start?.getTime() === t.getTime() ? "border-brand-700 bg-brand-950 font-semibold text-white" : "border-slate-200 hover:border-brand-300"}`}>
                          {fmtTime(t)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
            <div className="mt-6 flex justify-end">
              <button disabled={!start} onClick={() => setStep(3)} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-40">Continue</button>
            </div>
          </>
        )}

        {step === 3 && start && (
          <div className="mt-6">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex justify-between text-sm"><span className="text-slate-500">{mins}-minute lesson · {fmtWhen(start.toISOString())}</span><b className="text-lg">{money(price)}</b></div>
            </div>
            <div className="mt-4 rounded-2xl border border-gold-200 bg-gold-50/60 p-5 text-sm leading-6 text-slate-700">
              <b className="text-gold-800">Pay after the teacher confirms.</b> Online card payment is coming soon. For now, our team sends you the payment details (bank transfer or another method) once {teacher.name} confirms your time — nothing is charged now.
            </div>
            <div className="mt-6 flex justify-between">
              <button onClick={() => setStep(2)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Back</button>
              <button onClick={() => setStep(4)} className="btn-primary px-6 py-2.5 text-sm">Continue</button>
            </div>
          </div>
        )}

        {step === 4 && start && (
          <div className="mt-6">
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 text-sm">
              {[["Instructor", teacher.name], ["Date", fmtDay(start)], ["Time", `${fmtTime(start)} – ${fmtTime(new Date(start.getTime() + mins * 60_000))} (${timeZone()})`], ["Length", `${mins} minutes`], ["Price", money(price)], ["Payment", "After the teacher confirms"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 px-4 py-3"><dt className="text-slate-500">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
            </dl>
            <label className="mt-5 block text-sm font-semibold">What do you want to work on? <span className="font-normal text-slate-400">(optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={600} placeholder="e.g. I have a job interview next week and want to practise answering questions." className="mt-2 w-full rounded-xl border border-slate-300 p-3 text-sm font-normal outline-none focus:border-brand-500" />
            </label>
            {err && <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
            {ready && !user ? (
              <div className="mt-5"><SignInPrompt text="Sign in to send your booking request." /></div>
            ) : (
              <div className="mt-6 flex justify-between">
                <button onClick={() => setStep(3)} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Back</button>
                <button onClick={send} disabled={sending} className="btn-gold flex items-center gap-2 px-6 py-2.5 disabled:opacity-50">
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />} Send booking request
                </button>
              </div>
            )}
            <p className="mt-4 text-xs text-slate-500">The teacher confirms your request, then the video link appears in “Your lessons”.</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** Before any teacher has opened their calendar: book through WhatsApp */
function WhatsAppBooking({ teacher }: { teacher?: BookableInstructor }) {
  const user = useAuth((s) => s.user);
  const options = [
    { mins: 30, title: "Quick practice", desc: "Conversation practice or a single grammar question." },
    { mins: 60, title: "Standard lesson", desc: "A full lesson planned around your goal and level." },
    { mins: 90, title: "Intensive session", desc: "Exam preparation, interviews or presentations." },
  ];
  const book = (mins: number) => {
    const name = displayName(user);
    const text = `Hello Language Leap Center! I'd like to book a ${mins}-minute private English lesson${teacher ? ` with ${teacher.name}` : ""}.${name ? ` My name is ${name}.` : ""}${user?.email ? ` Email: ${user.email}.` : ""}`;
    window.open(`${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };
  return (
    <>
      <div className="grid gap-5 md:grid-cols-3">
        {options.map((o, i) => (
          <div key={o.mins} className={`flex flex-col rounded-3xl border p-6 ${i === 1 ? "border-brand-300 bg-gradient-to-b from-brand-50 to-white shadow-lg" : "border-slate-200 bg-white"}`}>
            {i === 1 && <span className="mb-3 w-fit rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-brand-900">Most popular</span>}
            <div className="flex items-center gap-2 text-3xl font-extrabold text-brand-800"><Clock className="h-6 w-6 text-gold-500" /> {o.mins} min</div>
            <div className="mt-2 font-bold">{o.title}</div>
            <p className="mt-1 flex-1 text-sm text-slate-600">{o.desc}</p>
            <button onClick={() => book(o.mins)} className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 font-bold text-white hover:bg-emerald-700">
              <WhatsAppIcon className="h-5 w-5" /> Book on WhatsApp
            </button>
          </div>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">How booking works</h2>
        <ul className="mt-4 space-y-3 text-slate-700">
          {["Choose a length and tap “Book on WhatsApp”.", "Our team replies with available times and the price.", "You get a video-call link for your lesson."].map((s) => (
            <li key={s} className="flex gap-3"><Check className="h-5 w-5 shrink-0 text-emerald-500" />{s}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- */

function MyLessons() {
  const user = useAuth((s) => s.user)!;
  const now = useNow();
  const teachers = useTeacherList((s) => s.list);
  const [rows, setRows] = useState<PrivateLesson[] | null>(null);
  const [rated, setRated] = useState<Record<string, number>>({});
  const [err, setErr] = useState("");
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const load = useCallback(async () => {
    const [l, r] = await Promise.all([
      supabase.from("private_lessons").select("*").eq("student_id", user.id).order("starts_at", { ascending: false }),
      supabase.from("teacher_reviews").select("lesson_id,rating").eq("student_id", user.id),
    ]);
    setErr(rpcError(l.error));
    setRows((l.data as PrivateLesson[]) ?? []);
    setRated(Object.fromEntries(((r.data as { lesson_id: string; rating: number }[]) ?? []).map((x) => [x.lesson_id, x.rating])));
  }, [user.id]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const all = rows ?? [];
  const nameOf = (id: string) => teachers.find((t) => t.id === id)?.name ?? "Your teacher";
  const upcoming = all.filter((l) => ["requested", "confirmed"].includes(l.status) && new Date(l.starts_at).getTime() + l.minutes * 60_000 > now - 15 * 60_000).reverse();
  const past = all.filter((l) => !upcoming.includes(l));
  const doneMin = all.filter((l) => l.status === "completed").reduce((n, l) => n + l.minutes, 0);
  const bookedMin = upcoming.filter((l) => l.status === "confirmed").reduce((n, l) => n + l.minutes, 0);
  const hm = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h${m % 60 ? ` ${m % 60}m` : ""}` : `${m}m`);
  const list = tab === "upcoming" ? upcoming : past;

  return (
    <div className="space-y-8">
      {err && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{err}</p>}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { l: "Hours learned", v: hm(doneMin), icon: GraduationCap },
          { l: "Hours booked", v: hm(bookedMin), icon: CalendarCheck },
          { l: "Lessons taken", v: all.filter((x) => x.status === "completed").length, icon: Clock },
        ].map((c) => (
          <div key={c.l} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5">
            <div><div className="text-xs font-bold uppercase tracking-wide text-slate-500">{c.l}</div><div className="mt-1 text-2xl font-extrabold">{rows ? c.v : "—"}</div></div>
            <c.icon className="h-8 w-8 text-brand-100" />
          </div>
        ))}
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Your lessons</h2>
          <div className="-mb-6"><Tabs value={tab} onChange={setTab} items={[{ id: "upcoming", label: "Upcoming", count: upcoming.length }, { id: "past", label: "Past" }]} /></div>
        </div>
        {rows === null ? (
          <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>
        ) : list.length === 0 ? (
          <Empty icon={CalendarDays} title={tab === "upcoming" ? "No upcoming private lessons." : "No past lessons yet."} />
        ) : (
          <div className="space-y-3">{list.map((l) => <LessonCard key={l.id} l={l} teacher={nameOf(l.teacher_id)} now={now} rated={rated[l.id]} onChange={load} />)}</div>
        )}
      </section>
    </div>
  );
}

function LessonCard({ l, teacher, now, rated, onChange }: { l: PrivateLesson; teacher: string; now: number; rated?: number; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const start = new Date(l.starts_at).getTime();
  const canCancel = l.status === "requested" || (l.status === "confirmed" && start - now > 24 * 3600_000);

  const cancel = async () => {
    if (!confirm("Cancel this lesson?")) return;
    const { error } = await supabase.rpc("cancel_private_lesson", { p_id: l.id, p_reason: "Cancelled by learner" });
    if (error) return setMsg(rpcError(error));
    onChange();
  };
  const rate = async () => {
    const { error } = await supabase.rpc("review_lesson", { p_lesson: l.id, p_rating: stars, p_comment: comment });
    if (error) return setMsg(rpcError(error));
    onChange();
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-brand-50 text-center leading-tight text-brand-800">
          <div><div className="text-[10px] font-bold uppercase">{new Date(l.starts_at).toLocaleDateString("en-GB", { month: "short" })}</div><div className="text-xl font-extrabold">{new Date(l.starts_at).getDate()}</div></div>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2"><b>{fmtTime(l.starts_at)}</b><span className="text-sm text-slate-500">· {l.minutes} min with {teacher}</span><StatusBadge status={l.status} /></div>
          <div className="mt-0.5 text-xs text-slate-500">
            {money(l.price)} · {l.paid ? <span className="font-semibold text-emerald-600">Paid</span> : "Payment pending — our team will contact you"}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <JoinButton lesson={l} now={now} />
          {canCancel && <button onClick={cancel} className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600"><X className="mr-1 inline h-3.5 w-3.5" />Cancel</button>}
          {(l.summary || l.homework || l.next_focus) && (
            <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:border-brand-400"><NotebookPen className="h-3.5 w-3.5" /> Teacher&apos;s notes</button>
          )}
        </div>
      </div>
      {msg && <p className="mt-3 text-sm text-red-600">{msg}</p>}
      {open && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-slate-50 p-4 text-sm sm:grid-cols-3">
          {[["What we covered", l.summary], ["Homework", l.homework], ["Next time", l.next_focus]].map(([h, v]) => v && (
            <div key={h}><div className="text-xs font-bold uppercase tracking-wide text-slate-500">{h}</div><p className="mt-1 whitespace-pre-line text-slate-700">{v}</p></div>
          ))}
        </div>
      )}
      {l.status === "completed" && (
        rated ? (
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">Your rating: <Stars value={rated} /></div>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl border border-gold-200 bg-gold-50/50 p-3">
            <span className="text-sm font-semibold"><GraduationCap className="mr-1 inline h-4 w-4 text-gold-600" />How was your lesson?</span>
            <StarInput value={stars} onChange={setStars} />
            {stars > 0 && (
              <>
                <input value={comment} onChange={(e) => setComment(e.target.value)} maxLength={500} placeholder="A few words for other learners (optional)" className="min-w-48 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none" />
                <button onClick={rate} className="btn-primary px-4 py-2 text-sm">Send</button>
              </>
            )}
          </div>
        )
      )}
    </div>
  );
}
