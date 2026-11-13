"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck, CalendarDays, Check, Clock, GraduationCap, Loader2, NotebookPen, Users, X } from "lucide-react";
import { AccountShell, SignInPrompt } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { InstructorAvatar } from "@/components/Instructors";
import { Empty, JoinButton, StarInput, Stars, StatusBadge, Tabs, useNow } from "@/components/teaching/ui";
import { displayName, supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { site } from "@/lib/site";
import { useMounted } from "@/lib/store";
import {
  fmtDay, fmtTime, fmtWhen, freeStarts, loadTeachers, money, timeZone, useTeacherList,
  type BookableInstructor, type PrivateLesson, type Slot,
} from "@/lib/teaching";

type Tab = "book" | "mine";

export function PrivateLessonsView() {
  const params = useSearchParams();
  const router = useRouter();
  const tab: Tab = params.get("tab") === "mine" ? "mine" : "book";
  const setTab = (t: Tab) => router.replace(t === "mine" ? "/private-lessons/?tab=mine" : "/private-lessons/");

  return (
    <AccountShell
      title="Private Lessons"
      subtitle="Practise 1-on-1 with a teacher — no course needed"
      actions={<Link href="/instructors/" className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold hover:border-brand-400"><Users className="h-4 w-4" /> Our Instructors</Link>}
    >
      <Tabs value={tab} onChange={setTab} items={[{ id: "book", label: "Book a lesson" }, { id: "mine", label: "My lessons" }]} />
      {tab === "book" ? <Book key={params.get("teacher") ?? ""} initialSlug={params.get("teacher")} onBooked={() => setTab("mine")} /> : <Mine />}
    </AccountShell>
  );
}

/* ---------------------------------------------------------------- */

function Book({ initialSlug, onBooked }: { initialSlug: string | null; onBooked: () => void }) {
  const { list, loaded } = useTeacherList();
  useEffect(() => {
    loadTeachers();
  }, []);
  const bookable = list.filter((t) => t.id && t.hasSlots);
  const [slug, setSlug] = useState<string | null>(initialSlug);
  const teacher = bookable.find((t) => t.slug === slug) ?? null;

  if (!loaded) return <div className="grid min-h-[30vh] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-slate-300" /></div>;
  if (bookable.length === 0) return <WhatsAppBooking teacher={list.find((t) => t.slug === slug)} />;
  if (!teacher)
    return (
      <>
        <h2 className="mb-4 font-bold">1. Choose your teacher</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {bookable.map((t) => (
            <button key={t.slug} onClick={() => setSlug(t.slug)} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-brand-300 hover:shadow-md">
              <div className="h-16 w-16 shrink-0 overflow-hidden"><div className="origin-top-left scale-[0.57]"><InstructorAvatar t={t} /></div></div>
              <span className="min-w-0">
                <b className="block truncate">{t.name}</b>
                <span className="line-clamp-2 text-xs text-slate-500">{t.title}</span>
                <span className="mt-1 flex items-center gap-2 text-xs">
                  {t.hourly && <b className="text-brand-700">{money(t.hourly)}/h</b>}
                  {t.rating && <span className="text-slate-500">★ {t.rating.toFixed(1)}</span>}
                </span>
              </span>
            </button>
          ))}
        </div>
      </>
    );
  return <Booking teacher={teacher} onBack={() => setSlug(null)} onBooked={onBooked} />;
}

function Booking({ teacher, onBack, onBooked }: { teacher: BookableInstructor; onBack: () => void; onBooked: () => void }) {
  const { user, ready } = useAuth();
  const [mins, setMins] = useState(60);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [busy, setBusy] = useState<{ starts_at: string; minutes: number }[]>([]);
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

  const starts = useMemo(() => (slots ? freeStarts(slots, busy, mins) : []), [slots, busy, mins]);
  const days = useMemo(() => {
    const m = new Map<string, Date[]>();
    for (const s of starts) {
      const k = s.toDateString();
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(s);
    }
    return [...m.entries()];
  }, [starts]);
  const activeDay = day && days.some(([k]) => k === day) ? day : days[0]?.[0] ?? null;
  const times = days.find(([k]) => k === activeDay)?.[1] ?? [];
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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><ArrowLeft className="h-4 w-4" /> Choose another teacher</button>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">1. Lesson length</h2>
          <div className="mt-3 grid grid-cols-3 gap-3">
            {[30, 60, 90].map((m) => (
              <button key={m} onClick={() => { setMins(m); setStart(null); }} className={`rounded-2xl border-2 p-3 text-center transition ${mins === m ? "border-brand-600 bg-brand-50" : "border-slate-200 hover:border-slate-300"}`}>
                <div className="flex items-center justify-center gap-1.5 text-lg font-extrabold"><Clock className="h-4 w-4 text-gold-500" /> {m} min</div>
                {teacher.hourly ? <div className="text-xs text-slate-500">{money((teacher.hourly * m) / 60)}</div> : null}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-bold">2. Pick a time</h2>
            <span className="text-xs text-slate-500">Times shown in {timeZone()}</span>
          </div>
          {slots === null ? (
            <div className="py-8 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>
          ) : days.length === 0 ? (
            <p className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">No free times in the next 3 weeks for a {mins}-minute lesson. Try a shorter lesson or another teacher.</p>
          ) : (
            <>
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
                {days.map(([k, list]) => (
                  <button key={k} onClick={() => { setDay(k); setStart(null); }} className={`shrink-0 rounded-xl border-2 px-3 py-2 text-center text-sm transition ${k === activeDay ? "border-brand-600 bg-brand-50 font-bold text-brand-800" : "border-slate-200 hover:border-slate-300"}`}>
                    <div>{fmtDay(list[0])}</div>
                    <div className="text-[11px] font-normal text-slate-500">{list.length} times</div>
                  </button>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {times.map((t) => (
                  <button key={t.toISOString()} onClick={() => setStart(t)} className={`rounded-xl border-2 py-2 text-sm font-semibold transition ${start?.getTime() === t.getTime() ? "border-gold-400 bg-gold-50 text-brand-900" : "border-slate-200 hover:border-brand-300"}`}>
                    {fmtTime(t)}
                  </button>
                ))}
              </div>
            </>
          )}
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="font-bold">3. What do you want to work on? <span className="font-normal text-slate-400">(optional)</span></h2>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={600} placeholder="e.g. I have a job interview next week and want to practise answering questions." className="mt-3 w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-brand-500" />
        </section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 shrink-0 overflow-hidden"><div className="origin-top-left scale-50"><InstructorAvatar t={teacher} /></div></div>
            <div className="min-w-0"><b className="block truncate">{teacher.name}</b><span className="line-clamp-1 text-xs text-slate-500">{teacher.title}</span></div>
          </div>
          <dl className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-slate-500">Length</dt><dd className="font-semibold">{mins} minutes</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">When</dt><dd className="font-semibold">{start ? fmtWhen(start.toISOString()) : "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Price</dt><dd className="font-extrabold text-brand-800">{price ? money(price) : "—"}</dd></div>
          </dl>
          {err && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{err}</p>}
          {!ready ? null : !user ? (
            <div className="mt-5"><SignInPrompt text="Sign in to send your booking request." /></div>
          ) : (
            <button onClick={send} disabled={!start || sending} className="btn-gold mt-5 flex w-full items-center justify-center gap-2 py-3 disabled:cursor-not-allowed disabled:opacity-50">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />} Send booking request
            </button>
          )}
          <p className="mt-3 text-xs leading-5 text-slate-500">The teacher confirms your request, then the video link appears in “My lessons”. Our team will contact you about payment.</p>
        </div>
      </aside>
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

function Mine() {
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const now = useNow();
  const teachers = useTeacherList((s) => s.list);
  const [rows, setRows] = useState<PrivateLesson[] | null>(null);
  const [rated, setRated] = useState<Record<string, number>>({});
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!user) return;
    const [l, r] = await Promise.all([
      supabase.from("private_lessons").select("*").eq("student_id", user.id).order("starts_at", { ascending: false }),
      supabase.from("teacher_reviews").select("lesson_id,rating").eq("student_id", user.id),
    ]);
    setErr(rpcError(l.error));
    setRows((l.data as PrivateLesson[]) ?? []);
    setRated(Object.fromEntries(((r.data as { lesson_id: string; rating: number }[]) ?? []).map((x) => [x.lesson_id, x.rating])));
  }, [user]);
  useEffect(() => {
    loadTeachers();
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (!mounted || !ready) return null;
  if (!user) return <SignInPrompt text="Sign in to see your private lessons." />;
  if (rows === null) return <div className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></div>;

  const nameOf = (id: string) => teachers.find((t) => t.id === id)?.name ?? "Your teacher";
  const upcoming = rows.filter((l) => ["requested", "confirmed"].includes(l.status) && new Date(l.starts_at).getTime() + l.minutes * 60_000 > now - 15 * 60_000).reverse();
  const past = rows.filter((l) => !upcoming.includes(l));

  return (
    <div className="space-y-8">
      {err && <p className="rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{err}</p>}
      <section>
        <h2 className="mb-3 font-bold">Upcoming</h2>
        {upcoming.length === 0 ? (
          <Empty icon={CalendarDays} title="No upcoming lessons" text="Book a lesson with one of our teachers — it only takes a minute." />
        ) : (
          <div className="space-y-3">{upcoming.map((l) => <LessonCard key={l.id} l={l} teacher={nameOf(l.teacher_id)} now={now} onChange={load} />)}</div>
        )}
      </section>
      {past.length > 0 && (
        <section>
          <h2 className="mb-3 font-bold">History</h2>
          <div className="space-y-3">{past.map((l) => <LessonCard key={l.id} l={l} teacher={nameOf(l.teacher_id)} now={now} rated={rated[l.id]} onChange={load} />)}</div>
        </section>
      )}
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
