"use client";

import { useCallback, useEffect, useState } from "react";
import { HandCoins, Loader2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { fmtWhen, money, type PrivateLesson } from "@/lib/teaching";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";
import { StatusBadge, Tabs } from "@/components/teaching/ui";

interface Bal { teacher_id: string; name: string; email: string; hourly_pay: number; lessons: number; minutes: number; earned: number; paid: number; balance: number }
interface Payout { id: number; teacher_id: string; amount: number; method: string | null; reference: string | null; note: string | null; paid_at: string }
type Tab = "teachers" | "learners";

export default function PayoutsPage() {
  return (
    <StaffShell page="/staff/payouts/" title="Teacher Payouts" subtitle="What each teacher has earned, what you paid them, and lesson payments from learners">
      <Payouts />
    </StaffShell>
  );
}

function Payouts() {
  const [tab, setTab] = useState<Tab>("teachers");
  const [bal, setBal] = useState<Bal[] | null>(null);
  const [hist, setHist] = useState<Payout[]>([]);
  const [lessons, setLessons] = useState<PrivateLesson[]>([]);
  const [err, setErr] = useState("");
  const [payFor, setPayFor] = useState<Bal | null>(null);

  const load = useCallback(async () => {
    const [b, h, l] = await Promise.all([
      supabase.rpc("teacher_balances"),
      supabase.from("teacher_payouts").select("*").order("paid_at", { ascending: false }).limit(200),
      supabase.from("private_lessons").select("*").in("status", ["confirmed", "completed", "no_show"]).order("starts_at", { ascending: false }).limit(300),
    ]);
    setErr(rpcError(b.error ?? h.error ?? l.error));
    setBal((b.data as Bal[]) ?? []);
    setHist((h.data as Payout[]) ?? []);
    setLessons((l.data as PrivateLesson[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  if (bal === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const name = (id: string) => bal.find((b) => b.teacher_id === id)?.name ?? "Teacher";
  const unpaid = lessons.filter((l) => !l.paid);
  const totalDue = bal.reduce((n, b) => n + Number(b.balance), 0);

  return (
    <>
      <ErrorNote text={err} />
      <Tabs value={tab} onChange={setTab} items={[{ id: "teachers", label: "Pay teachers" }, { id: "learners", label: "Learner payments", count: unpaid.length }]} />

      {tab === "teachers" ? (
        <div className="space-y-8">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Teacher</th><th className="px-4 py-3">Rate</th><th className="px-4 py-3">Lessons</th><th className="px-4 py-3">Earned</th><th className="px-4 py-3">Paid</th><th className="px-4 py-3">Balance due</th><th className="px-4 py-3" /></tr>
              </thead>
              <tbody>
                {bal.length === 0 && <tr><td colSpan={7} className="py-10 text-center text-slate-400">No teachers yet</td></tr>}
                {bal.map((b) => (
                  <tr key={b.teacher_id} className="border-t border-slate-100">
                    <td className="px-4 py-3"><b>{b.name}</b><div className="text-xs text-slate-500">{b.email}</div></td>
                    <td className="px-4 py-3">{money(b.hourly_pay)}/h</td>
                    <td className="px-4 py-3">{b.lessons} <span className="text-xs text-slate-400">({(b.minutes / 60).toFixed(1)} h)</span></td>
                    <td className="px-4 py-3">{money(b.earned)}</td>
                    <td className="px-4 py-3">{money(b.paid)}</td>
                    <td className="px-4 py-3 text-base font-extrabold text-gold-700">{money(b.balance)}</td>
                    <td className="px-4 py-3 text-right"><button onClick={() => setPayFor(b)} className="btn-primary px-3 py-1.5 text-xs">Record payment</button></td>
                  </tr>
                ))}
              </tbody>
              {bal.length > 0 && <tfoot><tr className="border-t border-slate-200 bg-slate-50 font-bold"><td className="px-4 py-3" colSpan={5}>Total owed to teachers</td><td className="px-4 py-3 text-gold-700">{money(totalDue)}</td><td /></tr></tfoot>}
            </table>
          </div>
          {payFor && <PayForm b={payFor} onClose={() => setPayFor(null)} onSaved={() => { setPayFor(null); load(); }} />}

          <section>
            <h2 className="mb-3 font-bold">Payment history</h2>
            {hist.length === 0 ? <p className="text-sm text-slate-500">No payments recorded.</p> : (
              <ul className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-white">
                {hist.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
                    <span><b>{name(p.teacher_id)}</b> · {fmtDate(p.paid_at)}<span className="block text-xs text-slate-500">{[p.method, p.reference, p.note].filter(Boolean).join(" · ")}</span></span>
                    <span className="flex items-center gap-3"><b>{money(p.amount)}</b>
                      <button onClick={async () => { if (confirm("Delete this payment record? The amount goes back to the teacher's balance.")) { await supabase.from("teacher_payouts").delete().eq("id", p.id); load(); } }} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Delete"><Trash2 className="h-4 w-4" /></button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Teacher</th><th className="px-4 py-3">Lesson</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Paid by learner</th></tr>
            </thead>
            <tbody>
              {lessons.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-400">No booked lessons yet</td></tr>}
              {lessons.map((l) => (
                <tr key={l.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold">{l.student_name ?? "Learner"}</td>
                  <td className="px-4 py-3">{name(l.teacher_id)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtWhen(l.starts_at)} · {l.minutes} min</td>
                  <td className="px-4 py-3"><StatusBadge status={l.status} /></td>
                  <td className="px-4 py-3 font-semibold">{money(l.price)}</td>
                  <td className="px-4 py-3">
                    <button onClick={async () => { const { error } = await supabase.rpc("mark_lesson_paid", { p_id: l.id, p_paid: !l.paid }); if (error) setErr(rpcError(error)); load(); }} className={`h-6 w-11 rounded-full p-0.5 transition ${l.paid ? "bg-emerald-500" : "bg-slate-200"}`} aria-pressed={l.paid} aria-label="Paid">
                      <span className={`block h-5 w-5 rounded-full bg-white shadow transition ${l.paid ? "translate-x-5" : ""}`} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function PayForm({ b, onClose, onSaved }: { b: Bal; onClose: () => void; onSaved: () => void }) {
  const [amount, setAmount] = useState(String(Math.max(0, Number(b.balance))));
  const [method, setMethod] = useState("Bank transfer");
  const [reference, setReference] = useState("");
  const [note, setNote] = useState("");
  const [err, setErr] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!(Number(amount) > 0)) return setErr("Enter an amount above zero.");
    const { error } = await supabase.from("teacher_payouts").insert({ teacher_id: b.teacher_id, amount: Number(amount), method, reference: reference || null, note: note || null });
    if (error) return setErr(rpcError(error));
    onSaved();
  };
  const cls = "w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500";
  return (
    <form onSubmit={save} className="rounded-3xl border border-brand-200 bg-brand-50/40 p-6">
      <h2 className="flex items-center gap-2 font-bold"><HandCoins className="h-5 w-5 text-brand-700" /> Record a payment to {b.name}</h2>
      <p className="mt-1 text-sm text-slate-500">Balance due: <b>{money(b.balance)}</b>. The amount is subtracted from the teacher&apos;s balance and shows in their Earnings page.</p>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <label className="block text-xs font-semibold text-slate-500">Amount (USD)<input type="number" min={0} step={0.01} value={amount} onChange={(e) => setAmount(e.target.value)} className={`${cls} mt-1`} /></label>
        <label className="block text-xs font-semibold text-slate-500">Method<select value={method} onChange={(e) => setMethod(e.target.value)} className={`${cls} mt-1 bg-white`}>{["Bank transfer", "PayPal", "Wise", "Cash", "Other"].map((m) => <option key={m}>{m}</option>)}</select></label>
        <label className="block text-xs font-semibold text-slate-500">Reference<input value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Transfer no." className={`${cls} mt-1`} /></label>
        <label className="block text-xs font-semibold text-slate-500">Note<input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. October lessons" className={`${cls} mt-1`} /></label>
      </div>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <div className="mt-4 flex gap-3">
        <button className="btn-primary px-6 py-2.5 text-sm">Save payment</button>
        <button type="button" onClick={onClose} className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-100">Cancel</button>
      </div>
    </form>
  );
}
