"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { programs } from "@/data/courses";

export function Footer() {
  const path = usePathname();
  if (path?.startsWith("/learn/") || path?.startsWith("/verify-email")) return null;

  return (
    <footer className="brand-gradient mt-24 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-2xl bg-white px-3 py-2">
            <Logo />
          </div>
          <p className="mt-4 text-sm italic text-gold-200">Your leap to fluent English</p>
          <p className="mt-2 text-sm leading-7 text-brand-200">
            Learn English step by step: short lessons, real speaking practice, and smart review that keeps what you learn.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Programs</h3>
          <ul className="space-y-2.5 text-sm">
            {Object.entries(programs).map(([id, p]) => (
              <li key={id}>
                <Link href={`/courses/?program=${id}`} className="hover:text-gold-300">
                  {p.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Learn</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/courses/" className="hover:text-gold-300">All courses</Link></li>
            <li><Link href="/placement/" className="hover:text-gold-300">Placement test</Link></li>
            <li><Link href="/review/" className="hover:text-gold-300">Spaced review</Link></li>
            <li><Link href="/dashboard/" className="hover:text-gold-300">My progress</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Center</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/#method" className="hover:text-gold-300">Our method</Link></li>
            <li><Link href="/#faq" className="hover:text-gold-300">FAQ</Link></li>
            <li><Link href="/about/" className="hover:text-gold-300">About us</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-6 py-5 text-xs text-brand-300 sm:flex-row">
          <span>© {new Date().getFullYear()} Language Leap Center. All rights reserved.</span>
          <span>LLC · Learn · Leap · Lead</span>
        </div>
      </div>
    </footer>
  );
}
