"use client";

import Link from "next/link";
import { Check, Crown } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { courses } from "@/data/courses";

export default function Subscription() {
  const paid = courses.filter((c) => c.price > 0).length;
  return (
    <AccountShell title="Subscription" subtitle="Your plan and what it includes">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 to-brand-950 p-8 text-white">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-gold-400/15" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10"><Crown className="h-6 w-6 text-gold-300" /></span>
          <div>
            <div className="text-sm text-brand-200">Current plan</div>
            <div className="text-2xl font-extrabold">Free — Launch access</div>
          </div>
        </div>
        <ul className="relative mt-6 grid gap-3 text-brand-100 sm:grid-cols-2">
          {["All published lessons in every course", "Placement test and lesson quizzes", "Spaced review with FSRS", "Certificates for completed courses", "Progress saved to your account", "Arabic help for beginners"].map((x) => (
            <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-gold-300" /> {x}</li>
          ))}
        </ul>
      </div>
      <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="font-bold">Paid courses</h2>
        <p className="mt-2 text-slate-600">
          {paid} courses will become paid when they are complete. Online payment is not open yet — you&apos;ll be able to buy single courses or a full-access plan from this page.
        </p>
        <Link href="/courses/" className="mt-4 inline-block font-bold text-brand-600">See course prices →</Link>
      </div>
    </AccountShell>
  );
}
