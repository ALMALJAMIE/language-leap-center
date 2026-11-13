"use client";

import { Mail, Phone } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { site } from "@/lib/site";

const faqs = [
  { q: "How do I start learning?", a: "Open Browse Courses and start General English 1 — it's free and begins from zero. Not sure of your level? Take the placement test first." },
  { q: "Why can't I hear the audio?", a: "Check that your device isn't muted. Audio uses your browser's built-in voices; Chrome, Edge and Safari work best." },
  { q: "The speaking exercise doesn't work.", a: "Allow microphone access when your browser asks. Speech recognition works in Chrome, Edge and Safari. You can always tap “Can't speak now” to skip." },
  { q: "Is my progress saved?", a: "Yes. When you're signed in, your progress is saved to your account and appears on any device you sign in from." },
  { q: "How do I get a certificate?", a: "Finish every lesson in a course that offers a certificate, then open Certificates to view, print or save it as a PDF." },
  { q: "I didn't get the confirmation email.", a: "Check your spam folder. You can request a new link from the Verify Your Email page, or contact us." },
  { q: "How do I change my password?", a: "Go to My Profile → Change password. If you forgot it, use “Forgot password?” in the sign-in window." },
];

export default function Help() {
  return (
    <AccountShell title="Help & Support" subtitle="Answers to common questions, and how to reach us">
      <div className="grid gap-4 sm:grid-cols-3">
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <WhatsAppIcon className="h-6 w-6 text-emerald-600" />
          <div className="mt-3 font-bold">WhatsApp</div>
          <div className="text-sm text-slate-500">Fastest reply</div>
        </a>
        <a href={`mailto:${site.email}`} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <Mail className="h-6 w-6 text-brand-600" />
          <div className="mt-3 font-bold">Email</div>
          <div className="truncate text-sm text-slate-500">{site.email}</div>
        </a>
        <a href={site.phoneHref} className="rounded-2xl border border-slate-200 bg-white p-5 hover:shadow-md">
          <Phone className="h-6 w-6 text-gold-500" />
          <div className="mt-3 font-bold">Phone</div>
          <div className="text-sm text-slate-500">{site.phone}</div>
        </a>
      </div>
      <h2 className="mb-4 mt-8 font-bold">Frequently asked questions</h2>
      <div className="space-y-3">
        {faqs.map((f) => (
          <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-brand-200">
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
              {f.q}
              <span className="text-slate-400 transition group-open:rotate-45">＋</span>
            </summary>
            <p className="mt-3 leading-7 text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </AccountShell>
  );
}
