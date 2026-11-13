"use client";

import { usePathname } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { site } from "@/lib/site";
import { InstagramIcon, SnapchatIcon, WhatsAppIcon } from "./BrandIcons";

export function TopBar() {
  const path = usePathname();
  if (path?.startsWith("/learn/")) return null;

  return (
    <div className="bg-brand-900 text-[13px] text-brand-100">
      <div className="mx-auto flex h-10 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex items-center gap-5">
          <a href={site.phoneHref} className="flex items-center gap-1.5 hover:text-gold-300">
            <Phone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{site.phone}</span>
          </a>
          <a href={`mailto:${site.email}`} className="flex items-center gap-1.5 hover:text-gold-300">
            <Mail className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{site.email}</span>
          </a>
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-gold-300">
            <WhatsAppIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden items-center gap-1.5 text-gold-300 lg:flex">⭐ Your leap to fluent English</span>
          <a href={site.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-gold-300">
            <InstagramIcon />
          </a>
          <a href={site.social.snapchat} target="_blank" rel="noopener noreferrer" aria-label="Snapchat" className="hover:text-gold-300">
            <SnapchatIcon />
          </a>
        </div>
      </div>
    </div>
  );
}
