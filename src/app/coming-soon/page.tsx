"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Sparkles } from "lucide-react";
import { comingSoon } from "@/components/portal/nav";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { site } from "@/lib/site";

function Inner() {
  const f = useSearchParams().get("f") ?? "";
  const info = comingSoon[f] ?? { title: "Coming soon", icon: Sparkles, text: "This part of Language Leap Center is being built." };
  const Icon = info.icon;
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-brand-50 to-gold-50 text-brand-700">
        <Icon className="h-9 w-9" />
      </div>
      <span className="mt-6 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-gold-700">Coming soon</span>
      <h1 className="mt-3 text-3xl font-extrabold">{info.title}</h1>
      <p className="mt-3 leading-7 text-slate-600">{info.text}</p>
      <p className="mt-2 text-slate-600">Until then, our team is one message away.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-bold text-white hover:bg-emerald-700">
          <WhatsAppIcon className="h-5 w-5" /> Contact us
        </a>
        <Link href="/dashboard/" className="rounded-xl border-2 border-slate-200 bg-white px-5 py-3 font-bold hover:border-brand-400">Back to dashboard</Link>
      </div>
    </div>
  );
}

export default function ComingSoon() {
  return (
    <Suspense>
      <Inner />
    </Suspense>
  );
}
