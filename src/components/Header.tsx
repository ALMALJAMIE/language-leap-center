"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Flame, LogOut, Menu, Search, X, Zap } from "lucide-react";
import { Logo } from "./Logo";
import { ArabicToggle } from "./ArabicToggle";
import { dueCards, useMounted, useProgress } from "@/lib/store";
import { displayName, initials, supabase, useAuth } from "@/lib/auth";
import { useUI } from "@/lib/ui";
import { accountNav } from "./account/accountNav";

const nav = [
  { href: "/", label: "Home" },
  { href: "/courses/", label: "Courses" },
  { href: "/placement/", label: "Placement Test" },
  { href: "/review/", label: "Review" },
  { href: "/about/", label: "About" },
];

function UserMenu() {
  const user = useAuth((s) => s.user);
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const name = displayName(user);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-2 rounded-xl py-1 pl-1 pr-2 transition hover:bg-slate-50" aria-haspopup="menu" aria-expanded={open}>
        <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-800 text-xs font-bold text-white ring-2 ring-gold-300">{initials(name)}</span>
        <span className="hidden max-w-[140px] truncate text-sm font-semibold text-ink md:block">{name}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 top-12 z-50 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          <div className="border-b border-slate-100 px-4 pb-2.5 pt-1 md:hidden">
            <div className="truncate font-bold">{name}</div>
            <div className="truncate text-xs text-slate-500">{user?.email}</div>
          </div>
          {accountNav.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-slate-50 ${path?.startsWith(href.replace(/\/$/, "")) ? "font-semibold text-brand-700" : "text-slate-700"}`}
            >
              <Icon className="h-4 w-4 text-slate-500" /> {label}
            </Link>
          ))}
          <div className="my-1.5 border-t border-slate-100" />
          <button
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await supabase.auth.signOut();
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const setSearch = useUI((s) => s.setSearch);
  const mounted = useMounted();
  const { xp, streak, cards } = useProgress();
  const { user, ready, openModal } = useAuth();
  const due = mounted ? dueCards(cards).length : 0;

  const hidden = path?.startsWith("/learn/"); // the lesson player is full screen
  const active = (href: string) => (href === "/" ? path === "/" : path?.startsWith(href.replace(/\/$/, "")));

  return (
    <>
      {!hidden && (
        <header className="no-print sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-md">
          <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
            <Link href="/" aria-label="Home">
              <Logo />
            </Link>

            <nav className="hidden items-center gap-1 lg:flex">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className={`relative rounded-lg px-3.5 py-2 text-[15px] font-medium transition ${
                    active(n.href) ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-brand-700"
                  }`}
                >
                  {n.label}
                  {n.href === "/review/" && due > 0 && (
                    <span className="absolute -top-1 right-0 grid h-5 min-w-5 place-items-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-brand-900">{due}</span>
                  )}
                  {active(n.href) && <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-gold-400" />}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button onClick={() => setSearch(true)} aria-label="Search (Ctrl+K)" title="Search (Ctrl+K)" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 transition hover:bg-slate-100 hover:text-brand-700">
                <Search className="h-5 w-5" />
              </button>

              {mounted && (xp > 0 || streak > 0) && (
                <Link href="/dashboard/" className="hidden items-center gap-3 rounded-xl bg-mist px-3 py-2 text-sm font-bold xl:flex">
                  <span className="flex items-center gap-1 text-orange-500" title="Day streak"><Flame className="h-4 w-4" />{streak}</span>
                  <span className="flex items-center gap-1 text-gold-500" title="XP"><Zap className="h-4 w-4" />{xp}</span>
                </Link>
              )}

              <ArabicToggle className="hidden xl:flex" />

              {ready && user ? (
                <UserMenu />
              ) : (
                <>
                  <button onClick={() => openModal("signin")} className="hidden rounded-xl border-2 border-slate-200 px-5 py-2 text-sm font-bold text-ink transition hover:border-brand-400 sm:block">
                    Sign In
                  </button>
                  <Link href="/register/" className="rounded-xl bg-[linear-gradient(100deg,#0b326d_0%,#1f66c8_60%,#efb52a_100%)] px-4 py-2.5 text-sm font-bold text-white shadow-md transition hover:brightness-110 sm:px-5">
                    Start for Free
                  </Link>
                </>
              )}

              <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
                {open ? <X /> : <Menu />}
              </button>
            </div>
          </div>

          {open && (
            <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
              {[...nav, ...(user ? [] : [{ href: "/dashboard/", label: "Learner Dashboard" }])].map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className={`block rounded-lg px-3 py-2.5 font-medium ${active(n.href) ? "bg-brand-50 text-brand-700" : "text-slate-700"}`}>
                  {n.label}
                </Link>
              ))}
              {!user && (
                <button onClick={() => { setOpen(false); openModal("signin"); }} className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left font-bold text-brand-700 sm:hidden">
                  Sign In
                </button>
              )}
              <ArabicToggle className="mt-2" />
            </nav>
          )}
        </header>
      )}
    </>
  );
}
