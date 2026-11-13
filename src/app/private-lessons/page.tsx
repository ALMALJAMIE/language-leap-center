"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Clock, Users } from "lucide-react";
import { getInstructor } from "@/data/instructors";
import { InstructorAvatar } from "@/components/Instructors";
import { AccountShell } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { displayName, useAuth } from "@/lib/auth";
import { site } from "@/lib/site";

const options = [
  { mins: 30, title: "Quick practice", desc: "Conversation practice or a single grammar question." },
  { mins: 60, title: "Standard lesson", desc: "A full lesson planned around your goal and level." },
  { mins: 90, title: "Intensive session", desc: "Exam preparation, interviews or presentations." },
];

export default function PrivateLessons() {
  const user = useAuth((s) => s.user);
  const book = (mins: number) => {
    const name = displayName(user);
    const teacher = getInstructor(new URLSearchParams(window.location.search).get("teacher") ?? "");
    const text = `Hello Language Leap Center! I'd like to book a ${mins}-minute private English lesson${teacher ? ` with ${teacher.name}` : ""}.${name ? ` My name is ${name}.` : ""}${user?.email ? ` Email: ${user.email}.` : ""}`;
    window.open(`${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  return (
    <AccountShell
      title="Private Lessons"
      subtitle="Practise 1-on-1 with a teacher — no course needed"
      actions={<Link href="/instructors/" className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold hover:border-brand-400"><Users className="h-4 w-4" /> Our Instructors</Link>}
    >
      <Suspense><Teacher /></Suspense>
      <div className="grid gap-5 md:grid-cols-3">
        {options.map((o, i) => (
          <div key={o.mins} className={`flex flex-col rounded-3xl border p-6 ${i === 1 ? "border-brand-300 bg-gradient-to-b from-brand-50 to-white shadow-lg" : "border-slate-200 bg-white"}`}>
            {i === 1 && <span className="mb-3 w-fit rounded-full bg-gold-400 px-3 py-1 text-xs font-bold text-brand-900">Most popular</span>}
            <div className="flex items-center gap-2 text-3xl font-extrabold text-brand-800">
              <Clock className="h-6 w-6 text-gold-500" /> {o.mins} min
            </div>
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
    </AccountShell>
  );
}

function Teacher() {
  const t = getInstructor(useSearchParams().get("teacher") ?? "");
  if (!t) return null;
  return (
    <div className="mb-6 flex items-center gap-4 rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
      <div className="origin-left scale-50 -mr-14 -my-7"><InstructorAvatar t={t} /></div>
      <div className="flex-1">
        <div className="text-xs font-bold uppercase tracking-wide text-slate-500">Booking with</div>
        <div className="font-bold text-ink">{t.name}</div>
      </div>
      <Link href={`/instructors/profile/?id=${t.slug}`} className="text-sm font-semibold text-brand-700 hover:underline">View profile</Link>
    </div>
  );
}
