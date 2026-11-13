"use client";

import { useEffect, useState } from "react";
import { Star, Video } from "lucide-react";
import { joinWindow, providerName, statusInfo, type LessonStatus, type PrivateLesson } from "@/lib/teaching";

export function StatusBadge({ status }: { status: LessonStatus }) {
  const s = statusInfo[status];
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${s.cls}`}>{s.label}</span>;
}

/** re-renders every 30s so join buttons switch on by themselves */
export function useNow(every = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), every);
    return () => clearInterval(t);
  }, [every]);
  return now;
}

const providerOf = (link: string) =>
  /zoom\./i.test(link) ? providerName.zoom : /meet\.google\./i.test(link) ? providerName.meet : providerName.other;

export function JoinButton({ lesson, now }: { lesson: PrivateLesson; now: number }) {
  const w = joinWindow(lesson, now);
  if (w === "none" || w === "over") return null;
  if (!lesson.meeting_link)
    return <span className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">Link coming soon</span>;
  if (w === "early")
    return (
      <span className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500" title="Opens 15 minutes before the start">
        <Video className="h-4 w-4" /> {providerOf(lesson.meeting_link)} · opens 15 min before
      </span>
    );
  return (
    <a href={lesson.meeting_link} target="_blank" rel="noopener noreferrer" className="flex animate-pulse items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 hover:[animation:none]">
      <Video className="h-4 w-4" /> Join on {providerOf(lesson.meeting_link)}
    </a>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <span className="flex" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onMouseEnter={() => setHover(n)} onClick={() => onChange(n)} aria-label={`${n} stars`} className="p-0.5">
          <Star className={`h-6 w-6 transition ${n <= (hover || value) ? "fill-gold-400 text-gold-400" : "text-slate-300"}`} />
        </button>
      ))}
    </span>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="flex">
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} className={`h-4 w-4 ${n <= value ? "fill-gold-400 text-gold-400" : "text-slate-200"}`} />)}
    </span>
  );
}

export function Tabs<T extends string>({ value, onChange, items }: { value: T; onChange: (v: T) => void; items: { id: T; label: string; count?: number }[] }) {
  return (
    <div className="mb-6 flex flex-wrap gap-1 rounded-2xl bg-slate-100 p-1 text-sm">
      {items.map((i) => (
        <button key={i.id} onClick={() => onChange(i.id)} className={`flex items-center gap-2 rounded-xl px-4 py-2 font-semibold transition ${value === i.id ? "bg-white text-brand-700 shadow-sm" : "text-slate-500 hover:text-ink"}`}>
          {i.label}
          {i.count ? <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] ${value === i.id ? "bg-brand-600 text-white" : "bg-slate-300 text-white"}`}>{i.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

export function Empty({ icon: Icon, title, text, children }: { icon: React.ComponentType<{ className?: string }>; title: string; text?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white px-6 py-12 text-center">
      <Icon className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-3 font-bold text-ink">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">{text}</p>}
      {children && <div className="mt-5">{children}</div>}
    </div>
  );
}
