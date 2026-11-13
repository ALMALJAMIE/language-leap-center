"use client";

import { useState } from "react";
import { Copy, Gift, Check } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { siteUrl } from "@/lib/auth";
import { useMounted } from "@/lib/store";

export default function Refer() {
  const [copied, setCopied] = useState(false);
  const mounted = useMounted();
  const link = mounted ? siteUrl("/") : "";
  const msg = `I'm learning English with Language Leap Center — short lessons, speaking practice and a free A1 course. Join me: ${link}`;

  return (
    <AccountShell title="Refer & Earn" subtitle="Invite friends and family to learn English with you">
      <div className="relative overflow-hidden rounded-3xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-8">
        <Gift className="h-10 w-10 text-pink-500" />
        <h2 className="mt-4 text-2xl font-extrabold">Learning is better together</h2>
        <p className="mt-2 max-w-xl text-slate-600">Share Language Leap Center with people you know. Rewards for referrals are coming soon — every friend you invite now will count.</p>
        <div className="mt-6 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
          <input readOnly value={link} className="flex-1 bg-transparent px-3 text-sm text-slate-600 outline-none" />
          <button
            onClick={async () => {
              await navigator.clipboard.writeText(link);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="btn-primary flex items-center gap-1.5 px-4 py-2 text-sm"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(msg)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-bold text-white hover:bg-emerald-700"
        >
          <WhatsAppIcon className="h-5 w-5" /> Share on WhatsApp
        </a>
      </div>
    </AccountShell>
  );
}
