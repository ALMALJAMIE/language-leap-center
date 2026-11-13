"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useAuth } from "@/lib/auth";

/** Page frame used inside the learner portal (the sidebar comes from PortalChrome) */
export function AccountShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 lg:py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
          {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function SignInPrompt({ text }: { text: string }) {
  const openModal = useAuth((s) => s.openModal);
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><LogIn className="h-6 w-6" /></div>
      <p className="mt-4 text-slate-600">{text}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => openModal("signin")} className="rounded-xl border-2 border-slate-200 px-5 py-2.5 font-bold hover:border-brand-400">Sign In</button>
        <Link href="/register/" className="btn-primary px-5 py-2.5">Create an Account</Link>
      </div>
    </div>
  );
}
