"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { programs } from "@/data/courses";
import { Mail, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { InstagramIcon, SnapchatIcon, WhatsAppIcon } from "./BrandIcons";

export function Footer() {
  const path = usePathname();
  if (path?.startsWith("/learn/")) return null;

  return (
    <footer className="no-print brand-gradient mt-24 text-brand-100">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="inline-block rounded-2xl bg-white px-3 py-2">
            <Logo />
          </div>
          <p className="mt-4 text-sm italic text-gold-200">Your leap to fluent English</p>
          <p className="mt-2 text-sm leading-7 text-brand-200">
            Learn English step by step: short lessons, real speaking practice, and smart review that keeps what you learn.
          </p>
          <div className="mt-5 flex gap-3">
            <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20"><InstagramIcon /></a>
            <a href={site.social.snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20"><SnapchatIcon /></a>
            <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-9 w-9 place-items-center rounded-lg bg-white/10 hover:bg-white/20"><WhatsAppIcon /></a>
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Learning</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/courses/" className="hover:text-gold-300">Browse all courses</Link></li>
            <li><Link href="/courses/?level=A1" className="hover:text-gold-300">Course levels</Link></li>
            {Object.entries(programs).map(([id, p]) => (
              <li key={id}><Link href={`/courses/?program=${id}`} className="hover:text-gold-300">{p.name}</Link></li>
            ))}
            <li><Link href="/private-lessons/" className="hover:text-gold-300">Private lessons</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Support</h3>
          <ul className="space-y-2.5 text-sm">
            <li><Link href="/help/" className="hover:text-gold-300">Help Center</Link></li>
            <li><Link href="/#faq" className="hover:text-gold-300">FAQs</Link></li>
            <li><Link href="/placement/" className="hover:text-gold-300">Placement test</Link></li>
            <li><Link href="/#method" className="hover:text-gold-300">Our method</Link></li>
            <li><Link href="/about/" className="hover:text-gold-300">About us</Link></li>
            <li><a href={`mailto:${site.email}`} className="hover:text-gold-300">Contact us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li><a href={site.phoneHref} className="flex items-center gap-2 hover:text-gold-300"><Phone className="h-4 w-4 text-gold-300" /> {site.phone}</a></li>
            <li><a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-gold-300"><Mail className="h-4 w-4 text-gold-300" /> {site.email}</a></li>
            <li><a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-gold-300"><WhatsAppIcon className="h-4 w-4 text-gold-300" /> WhatsApp</a></li>
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
