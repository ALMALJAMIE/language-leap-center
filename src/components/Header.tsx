"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Flame, Menu, X, Zap, Layers } from "lucide-react";
import { Logo } from "./Logo";
import { dueCards, useMounted, useProgress } from "@/lib/store";

const nav = [
  { href: "/", label: "الرئيسية" },
  { href: "/courses/", label: "الدورات" },
  { href: "/placement/", label: "اختبار تحديد المستوى" },
  { href: "/review/", label: "المراجعة" },
  { href: "/dashboard/", label: "لوحتي" },
];

export function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const mounted = useMounted();
  const { xp, streak, cards } = useProgress();
  const due = mounted ? dueCards(cards).length : 0;

  if (path?.startsWith("/learn/")) return null; // مشغّل الدرس بملء الشاشة

  const active = (href: string) => (href === "/" ? path === "/" : path?.startsWith(href.replace(/\/$/, "")));

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="الصفحة الرئيسية">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={`relative rounded-lg px-3 py-2 text-[15px] font-medium transition ${
                active(n.href) ? "text-brand-700" : "text-slate-600 hover:text-brand-700"
              }`}
            >
              {n.label}
              {n.href === "/review/" && due > 0 && (
                <span className="absolute -top-0.5 left-0 grid h-5 min-w-5 place-items-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-brand-900">
                  {due}
                </span>
              )}
              {active(n.href) && <span className="absolute inset-x-3 -bottom-[13px] h-[3px] rounded-full bg-gold-400" />}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {mounted && (
            <Link href="/dashboard/" className="hidden items-center gap-3 rounded-xl bg-mist px-3 py-1.5 text-sm font-bold sm:flex">
              <span className="flex items-center gap-1 text-orange-500" title="أيام متتالية">
                <Flame className="h-4 w-4" />
                {streak}
              </span>
              <span className="flex items-center gap-1 text-gold-500" title="نقاط الخبرة">
                <Zap className="h-4 w-4" />
                {xp}
              </span>
              {due > 0 && (
                <span className="flex items-center gap-1 text-brand-600 lg:hidden" title="بطاقات للمراجعة">
                  <Layers className="h-4 w-4" />
                  {due}
                </span>
              )}
            </Link>
          )}
          <Link href="/courses/general-english-1/" className="btn-primary hidden px-4 py-2 text-sm sm:inline-block">
            ابدأ مجانًا
          </Link>
          <button className="rounded-lg p-2 lg:hidden" onClick={() => setOpen(!open)} aria-label="القائمة">
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setOpen(false)}
              className={`block rounded-lg px-3 py-2.5 font-medium ${active(n.href) ? "bg-brand-50 text-brand-700" : "text-slate-700"}`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
