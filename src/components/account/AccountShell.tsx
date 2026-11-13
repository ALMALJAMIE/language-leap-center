"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Award, BarChart3, BookOpen, Cloud, CloudOff, Gauge, LogIn, User } from "lucide-react";
import { displayName, initials, useAuth } from "@/lib/auth";
import { useSync } from "@/lib/sync";

export const accountNav = [
  { href: "/dashboard/", label: "Learner Dashboard", icon: Gauge },
  { href: "/profile/", label: "Profile", icon: User },
  { href: "/my-courses/", label: "My Courses", icon: BookOpen },
  { href: "/certificates/", label: "Certificates", icon: Award },
  { href: "/progress/", label: "Progress", icon: BarChart3 },
];

function SyncBadge() {
  const status = useSync((s) => s.status);
  const user = useAuth((s) => s.user);
  if (!user) return null;
  if (status === "offline")
    return (
      <span className="flex items-center gap-1.5 text-xs text-slate-400" title="Progress is saved on this device only">
        <CloudOff className="h-3.5 w-3.5" /> Saved on this device
      </span>
    );
  return (
    <span className="flex items-center gap-1.5 text-xs text-emerald-600">
      <Cloud className="h-3.5 w-3.5" /> {status === "syncing" ? "Syncing…" : "Synced to your account"}
    </span>
  );
}

/** Sidebar layout shared by all learner account pages */
export function AccountShell({ title, subtitle, children, actions }: { title: string; subtitle?: string; children: React.ReactNode; actions?: React.ReactNode }) {
  const path = usePathname();
  const { user, ready, openModal } = useAuth();
  const name = displayName(user);

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[250px_1fr] lg:py-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3 border-b border-slate-100 px-2 pb-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-sm font-bold text-white ring-2 ring-gold-300">
              {user ? initials(name) : <User className="h-5 w-5" />}
            </span>
            <div className="min-w-0">
              <div className="truncate font-bold">{user ? name : "Guest learner"}</div>
              {user ? (
                <div className="truncate text-xs text-slate-500">{user.email}</div>
              ) : ready ? (
                <button onClick={() => openModal("signin")} className="text-xs font-bold text-brand-600">Sign in to save progress</button>
              ) : null}
            </div>
          </div>
          <nav className="no-scrollbar mt-3 flex gap-1 overflow-x-auto lg:flex-col">
            {accountNav.map(({ href, label, icon: Icon }) => {
              const on = path?.startsWith(href.replace(/\/$/, ""));
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    on ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-ink"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${on ? "text-gold-500" : ""}`} /> {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 hidden border-t border-slate-100 px-2 pt-3 lg:block">
            <SyncBadge />
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
            {subtitle && <p className="mt-1 text-slate-500">{subtitle}</p>}
          </div>
          {actions}
        </div>
        {children}
      </section>
    </div>
  );
}

export function SignInPrompt({ text }: { text: string }) {
  const openModal = useAuth((s) => s.openModal);
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-600"><LogIn className="h-6 w-6" /></div>
      <p className="mt-4 text-slate-600">{text}</p>
      <div className="mt-6 flex justify-center gap-3">
        <button onClick={() => openModal("signin")} className="rounded-xl border-2 border-slate-200 px-5 py-2.5 font-bold hover:border-brand-400">Sign In</button>
        <Link href="/register/" className="btn-primary px-5 py-2.5">Create an Account</Link>
      </div>
    </div>
  );
}
