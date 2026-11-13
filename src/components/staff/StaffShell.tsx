"use client";

import Link from "next/link";
import { Loader2, ShieldAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { can, roleInfo, useRole } from "@/lib/roles";
import { useMounted } from "@/lib/store";
import { AccountShell, SignInPrompt } from "@/components/account/AccountShell";

/** Frame + access check for every /staff/ page */
export function StaffShell({
  page, title, subtitle, actions, children, wide,
}: { page: string; title: string; subtitle?: string; actions?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const { role, loaded } = useRole();

  if (!mounted || !ready || (user && !loaded))
    return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-slate-300" /></div>;
  if (!user)
    return <div className="mx-auto max-w-2xl px-6 py-12"><SignInPrompt text="Sign in with your team account to open the workspace." /></div>;
  if (!can(role, page))
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-slate-400"><ShieldAlert className="h-8 w-8" /></span>
        <h1 className="mt-5 text-2xl font-extrabold">{role ? "Not part of your role" : "Team members only"}</h1>
        <p className="mt-2 text-slate-600">
          {role ? `Your account is set up as ${roleInfo[role].label}, which doesn't include this page.` : "This area is for the Language Leap Center team."}
        </p>
        <Link href={role ? "/staff/" : "/dashboard/"} className="btn-primary mt-6 inline-block px-5 py-2.5">{role ? "Back to workspace" : "Go to my dashboard"}</Link>
      </div>
    );

  if (wide) return <>{children}</>;
  return (
    <AccountShell title={title} subtitle={subtitle} actions={actions}>
      {children}
    </AccountShell>
  );
}

export function RoleBadge({ role }: { role: keyof typeof roleInfo | null | undefined }) {
  if (!role) return <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">Learner</span>;
  return <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${roleInfo[role].badge}`}>{roleInfo[role].label}</span>;
}

export function ErrorNote({ text }: { text: string }) {
  if (!text) return null;
  return <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{text}</div>;
}

export const fmtDate = (d: string | null | undefined, withTime = false) =>
  d ? new Date(d).toLocaleString("en-GB", withTime ? { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" } : { day: "numeric", month: "short", year: "numeric" }) : "—";
