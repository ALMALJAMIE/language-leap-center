"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Headset, LifeBuoy, Mail, MessagesSquare, Phone, X } from "lucide-react";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "./BrandIcons";

/** Support + chat buttons fixed at the bottom-right of every page */
export function FloatingHelp() {
  const [open, setOpen] = useState(false);
  return (
    <div className="no-print fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="mb-1 w-72 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="brand-gradient flex items-center justify-between px-4 py-3 text-white">
              <div>
                <div className="font-bold">Need help?</div>
                <div className="text-xs text-brand-100">We usually reply within a few hours</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-2">
              {[
                { href: site.whatsapp, icon: <WhatsAppIcon className="h-5 w-5 text-emerald-600" />, t: "WhatsApp", s: "Chat with our team", ext: true },
                { href: `mailto:${site.email}`, icon: <Mail className="h-5 w-5 text-brand-600" />, t: "Email", s: site.email, ext: true },
                { href: site.phoneHref, icon: <Phone className="h-5 w-5 text-gold-500" />, t: "Call us", s: site.phone, ext: true },
                { href: "/help/", icon: <LifeBuoy className="h-5 w-5 text-rose-500" />, t: "Help center", s: "Answers to common questions", ext: false },
              ].map((x) =>
                x.ext ? (
                  <a key={x.t} href={x.href} target={x.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                    {x.icon}
                    <span><span className="block text-sm font-semibold">{x.t}</span><span className="block text-xs text-slate-500">{x.s}</span></span>
                  </a>
                ) : (
                  <Link key={x.t} href={x.href} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50">
                    {x.icon}
                    <span><span className="block text-sm font-semibold">{x.t}</span><span className="block text-xs text-slate-500">{x.s}</span></span>
                  </Link>
                ),
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Support"
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-white shadow-lg shadow-gold-600/30 transition hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Headset className="h-6 w-6" />}
      </button>
      <a
        href={site.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-brand-700 to-brand-950 text-white shadow-lg shadow-brand-900/30 transition hover:scale-105"
      >
        <MessagesSquare className="h-6 w-6" />
      </a>
    </div>
  );
}
