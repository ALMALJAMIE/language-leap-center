"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, GraduationCap, Headset, Ticket, UserPlus, Users, Activity, ShieldCheck } from "lucide-react";
import { displayName, supabase, useAuth } from "@/lib/auth";
import { roleInfo, rpcError, useRole, type Role } from "@/lib/roles";
import { staffNav, comingSoon } from "@/components/portal/nav";
import { ErrorNote, RoleBadge, StaffShell } from "@/components/staff/StaffShell";

interface Overview { learners: number; new_week: number; active_week: number; enrollments: number; open_chats: number; team: number }

const statDefs = [
  { k: "learners", l: "Learners", icon: Users, c: "from-brand-600 to-brand-800", roles: ["admin", "finance", "academic", "support"] },
  { k: "new_week", l: "New this week", icon: UserPlus, c: "from-emerald-500 to-emerald-700", roles: ["admin", "support", "finance"] },
  { k: "active_week", l: "Active this week", icon: Activity, c: "from-violet-500 to-violet-700", roles: ["admin", "academic"] },
  { k: "enrollments", l: "Paid course access", icon: Ticket, c: "from-gold-500 to-gold-700", roles: ["admin", "finance", "academic"] },
  { k: "open_chats", l: "Open chats", icon: Headset, c: "from-rose-500 to-rose-700", roles: ["admin", "support"] },
  { k: "team", l: "Team members", icon: ShieldCheck, c: "from-slate-600 to-slate-800", roles: ["admin"] },
] as const;

const liveText: Record<string, string> = {
  "/staff/users/": "Find any learner: when they joined, last sign-in, and paid courses.",
  "/staff/team/": "Add team members and choose what each one can see.",
  "/staff/enrollments/": "Open a paid course for a learner after payment, or remove access.",
  "/staff/courses/": "Every course with its lessons, price, status and paid learners.",
  "/staff/inbox/": "Answer visitors and learners in real time.",
};

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default function StaffHome() {
  return (
    <StaffShell page="/staff/" title="Workspace" wide>
      <Home />
    </StaffShell>
  );
}

function Home() {
  const user = useAuth((s) => s.user);
  const role = useRole((s) => s.role) as Role;
  const [data, setData] = useState<Overview | null>(null);
  const [err, setErr] = useState("");
  const showStats = role !== "teacher";

  useEffect(() => {
    if (!showStats) return;
    supabase.rpc("staff_overview").then(({ data, error }) => {
      if (error) setErr(rpcError(error));
      else setData(data as Overview);
    });
  }, [showStats]);

  const items = staffNav(role).slice(0, -1).flat().filter((i) => i.href !== "/staff/");
  const live = items.filter((i) => !i.soon);
  const soon = items.filter((i) => i.soon);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
      <div className="relative overflow-hidden rounded-3xl bg-[linear-gradient(120deg,#061a37_0%,#0a2852_55%,#845b13_100%)] p-7 text-white sm:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <RoleBadge role={role} />
          <span className="text-xs font-bold uppercase tracking-wider text-gold-300">Team Workspace</span>
        </div>
        <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{greeting()}, {displayName(user)} 👋</h1>
        <p className="mt-2 max-w-2xl text-brand-100">{roleInfo[role].desc}</p>
      </div>

      {showStats && (
        <div className="mt-6">
          <ErrorNote text={err} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statDefs.filter((s) => (s.roles as readonly string[]).includes(role)).map((s) => (
              <div key={s.k} className={`rounded-2xl bg-gradient-to-br ${s.c} p-5 text-white shadow-sm`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/80">{s.l}</span>
                  <s.icon className="h-5 w-5 text-white/70" />
                </div>
                <div className="mt-2 text-3xl font-extrabold">{data ? data[s.k] : "—"}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {live.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Your tools</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {live.map((i) => (
              <Link key={i.href} href={i.href} className="group rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-brand-300 hover:shadow-md">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-slate-50"><i.icon className={`h-5 w-5 ${i.color}`} /></span>
                <h3 className="mt-3 flex items-center justify-between font-bold">{i.label} <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-brand-600" /></h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">{liveText[i.href]}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {role === "teacher" && (
        <section className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/50 p-6">
          <h2 className="flex items-center gap-2 font-bold text-emerald-900"><GraduationCap className="h-5 w-5" /> Your teaching workspace is being prepared</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-900/80">
            Below are the tools you&apos;ll use to teach on Language Leap Center. Until they are live, the team will send you your learners and lesson times directly.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm">
            <Link href="/instructors/" className="rounded-xl bg-white px-4 py-2 font-semibold text-emerald-800 shadow-sm hover:shadow">Instructors page</Link>
            <Link href="/courses/" className="flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 font-semibold text-emerald-800 shadow-sm hover:shadow"><BookOpen className="h-4 w-4" /> Course catalog</Link>
          </div>
        </section>
      )}

      {soon.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">Coming next</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {soon.map((i) => {
              const key = i.href.split("f=")[1] ?? "";
              return (
                <Link key={i.href} href={i.href} className="flex gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/60 p-4 transition hover:border-slate-300 hover:bg-white">
                  <i.icon className={`mt-0.5 h-5 w-5 shrink-0 ${i.color}`} />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-bold">{i.label} <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">Soon</span></span>
                    <span className="mt-1 line-clamp-2 block text-xs leading-5 text-slate-500">{comingSoon[key]?.text}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
