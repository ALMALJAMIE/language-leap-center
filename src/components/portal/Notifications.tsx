"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { courses } from "@/data/courses";
import { courseProgress } from "@/lib/account";
import { badges, earned } from "@/lib/achievements";
import { dueCards, todayKey, useMounted, useProgress } from "@/lib/store";
import { usePortalPrefs } from "@/lib/ui";

interface Note {
  id: string;
  icon: string;
  title: string;
  body: string;
  href: string;
}

/** Notifications are worked out from the learner's own progress */
function useNotes(): Note[] {
  const p = useProgress();
  return useMemo(() => {
    const notes: Note[] = [];
    const due = dueCards(p.cards).length;
    const today = p.xpByDay[todayKey()] ?? 0;
    if (due) notes.push({ id: `due-${todayKey()}-${due}`, icon: "🔁", title: `${due} words to review`, body: "Review them now before you forget.", href: "/review/" });
    if (p.streak > 0 && today === 0)
      notes.push({ id: `streak-${todayKey()}`, icon: "🔥", title: "Keep your streak alive", body: `You're on a ${p.streak}-day streak. One lesson today keeps it going.`, href: "/dashboard/" });
    if (today >= p.dailyGoal) notes.push({ id: `goal-${todayKey()}`, icon: "🎯", title: "Daily goal reached!", body: `You earned ${today} XP today. Great work.`, href: "/progress/" });
    courses
      .filter((c) => courseProgress(c, p.completed).certified)
      .forEach((c) => notes.push({ id: `cert-${c.slug}`, icon: "🎓", title: "Certificate ready", body: c.title, href: "/certificates/" }));
    badges(p)
      .filter(earned)
      .slice(-3)
      .forEach((b) => notes.push({ id: `badge-${b.id}`, icon: b.icon, title: `Badge unlocked: ${b.name}`, body: b.desc, href: "/achievements/" }));
    if (!p.placement) notes.push({ id: "placement", icon: "🧭", title: "Find your level", body: "Take the 5-minute placement test.", href: "/placement/" });
    notes.push({ id: "welcome", icon: "👋", title: "Welcome to Language Leap Center", body: "Your leap to fluent English starts here.", href: "/dashboard/" });
    return notes;
  }, [p]);
}

export function NotificationBell() {
  const mounted = useMounted();
  const notes = useNotes();
  const { readNotes, markRead } = usePortalPrefs();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unread = mounted ? notes.filter((n) => !readNotes.includes(n.id)).length : 0;

  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => {
          setOpen(!open);
          if (!open) setTimeout(() => markRead(notes.map((n) => n.id)), 1500);
        }}
        aria-label="Notifications"
        className="relative grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <span className="font-bold">Notifications</span>
            {unread > 0 && <span className="text-xs text-slate-500">{unread} new</span>}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notes.map((n) => (
              <Link key={n.id} href={n.href} onClick={() => setOpen(false)} className={`flex gap-3 border-b border-slate-50 px-4 py-3 hover:bg-slate-50 ${readNotes.includes(n.id) ? "" : "bg-brand-50/50"}`}>
                <span className="text-xl">{n.icon}</span>
                <span>
                  <span className="block text-sm font-semibold text-ink">{n.title}</span>
                  <span className="block text-xs text-slate-500">{n.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
