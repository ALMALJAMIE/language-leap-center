"use client";

import { useEffect, useState } from "react";
import { Banknote, CalendarCheck, Clock, HandCoins, Loader2, Wallet } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtWhen, money, type PrivateLesson } from "@/lib/teaching";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";

interface Balance { hourly_pay: number; lessons: number; minutes: number; earned: number; paid: number; balance: number }
interface Payout { id: number; amount: number; method: string | null; reference: string | null; note: string | null; paid_at: string }

export default function EarningsPage() {
  return (
    <StaffShell page="/staff/earnings/" title="Earnings" subtitle="What you have earned from your lessons and what has been paid to you">
      <Earnings />
    </StaffShell>
  );
}

function Earnings() {
  const user = useAuth((s) => s.user)!;
  const [b, setB] = useState<Balance | null>(null);
  const [lessons, setLessons] = useState<PrivateLesson[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      supabase.rpc("teacher_balances"),
      supabase.from("private_lessons").select("*").eq("teacher_id", user.id).in("status", ["completed", "no_show"]).order("starts_at", { ascending: false }),
      supabase.from("teacher_payouts").select("*").eq("teacher_id", user.id).order("paid_at", { ascending: false }),
    ]).then(([bal, l, p]) => {
      setErr(rpcError(bal.error ?? l.error));
      setB(((bal.data as (Balance & { teacher_id: string })[]) ?? []).find((x) => x.teacher_id === user.id) ?? null);
      setLessons((l.data as PrivateLesson[]) ?? []);
      setPayouts((p.data as Payout[]) ?? []);
      setLoaded(true);
    });
  }, [user.id]);

  if (!loaded) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const cards = [
    { l: "Lessons taught", v: b?.lessons ?? 0, icon: CalendarCheck, c: "from-brand-600 to-brand-800" },
    { l: "Hours taught", v: ((b?.minutes ?? 0) / 60).toFixed(1).replace(/\.0$/, ""), icon: Clock, c: "from-violet-500 to-violet-700" },
    { l: "Total earned", v: money(b?.earned), icon: Banknote, c: "from-emerald-500 to-emerald-700" },
    { l: "Paid to you", v: money(b?.paid), icon: HandCoins, c: "from-slate-600 to-slate-800" },
    { l: "Balance due", v: money(b?.balance), icon: Wallet, c: "from-gold-500 to-gold-700" },
  ];

  return (
    <>
      <ErrorNote text={err} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.l} className={`rounded-2xl bg-gradient-to-br ${c.c} p-5 text-white`}>
            <div className="flex items-center justify-between text-sm text-white/80">{c.l}<c.icon className="h-5 w-5 text-white/70" /></div>
            <div className="mt-2 text-2xl font-extrabold">{c.v}</div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-500">Your rate is {money(b?.hourly_pay)} per hour, set by finance. Each lesson you close as “completed” (or “learner didn&apos;t attend”) adds its pay to your balance; payments from finance are subtracted.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-slate-200 bg-white">
          <h2 className="border-b border-slate-100 px-5 py-4 font-bold">Lessons</h2>
          {lessons.length === 0 ? <p className="p-5 text-sm text-slate-500">No closed lessons yet.</p> : (
            <ul className="divide-y divide-slate-100">
              {lessons.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span><b>{l.student_name ?? "Learner"}</b><span className="block text-xs text-slate-500">{fmtWhen(l.starts_at)} · {l.minutes} min{l.status === "no_show" ? " · learner absent" : ""}</span></span>
                  <b className="text-emerald-700">+{money(l.teacher_pay)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
        <section className="rounded-3xl border border-slate-200 bg-white lg:self-start">
          <h2 className="border-b border-slate-100 px-5 py-4 font-bold">Payments received</h2>
          {payouts.length === 0 ? <p className="p-5 text-sm text-slate-500">No payments recorded yet.</p> : (
            <ul className="divide-y divide-slate-100">
              {payouts.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                  <span><b>{fmtDate(p.paid_at)}</b><span className="block text-xs text-slate-500">{[p.method, p.reference].filter(Boolean).join(" · ") || "Payment"}</span></span>
                  <b>−{money(p.amount)}</b>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
