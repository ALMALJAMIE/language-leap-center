"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck, Loader2, Wallet } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError, useRole } from "@/lib/roles";
import { fmtScore, type Exam } from "@/lib/exams";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";
import { Empty, Tabs } from "@/components/teaching/ui";

interface Ticket { id: number; learner: string; email: string; amount: number; status: "pending" | "paid" | "used"; created_at: string; paid_at: string | null }
interface Result { attempt_id: number; exam_kind: string; learner: string; email: string; submitted_at: string | null; status: string; score: number | null; total: number | null; result_level: string | null }
type Tab = "fees" | "results";

export default function PlacementPage() {
  return (
    <StaffShell page="/staff/placement/" title="Placement Tests" subtitle="Confirm placement test fees, and see each learner's level before the speaking test and class placement">
      <Placement />
    </StaffShell>
  );
}

function Placement() {
  const role = useRole((s) => s.role);
  const fin = role === "finance" || role === "admin";
  const aca = role === "academic" || role === "admin" || role === "supervisor";
  const [tab, setTab] = useState<Tab>(fin ? "fees" : "results");
  const [exam, setExam] = useState<Exam | null>(null);
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [results, setResults] = useState<Result[] | null>(null);
  const [fee, setFee] = useState("");
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const e = await supabase.from("exams").select("*").eq("kind", "placement").order("id").limit(1);
    const ex = (e.data?.[0] as Exam) ?? null;
    setExam(ex);
    setFee(String(ex?.fee ?? ""));
    if (fin) {
      const t = await supabase.rpc("finance_placement");
      setErr(rpcError(t.error ?? e.error));
      setTickets((t.data as Ticket[]) ?? []);
    }
    if (aca) {
      const r = await supabase.rpc("grading_queue", { p_status: "all" });
      if (r.error) setErr(rpcError(r.error));
      setResults(((r.data as Result[]) ?? []).filter((x) => x.exam_kind === "placement"));
    }
  }, [fin, aca]);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const togglePaid = async (t: Ticket) => {
    const { error } = await supabase.rpc("mark_placement_paid", { p_id: t.id, p_paid: t.status !== "paid" });
    if (error) return setErr(rpcError(error));
    load();
  };
  const saveFee = async () => {
    if (!exam) return;
    const { error } = await supabase.from("exams").update({ fee: Math.max(0, Number(fee) || 0) }).eq("id", exam.id);
    if (error) return setErr(rpcError(error));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    load();
  };

  const items = [
    ...(fin ? [{ id: "fees" as Tab, label: "Fees", count: tickets?.filter((t) => t.status === "pending").length }] : []),
    ...(aca ? [{ id: "results" as Tab, label: "Results" }] : []),
  ];
  const levelCls: Record<string, string> = { A1: "bg-sky-50 text-sky-700", A2: "bg-teal-50 text-teal-700", B1: "bg-violet-50 text-violet-700", B2: "bg-amber-50 text-amber-700", C1: "bg-rose-50 text-rose-700" };

  return (
    <>
      <ErrorNote text={err} />
      {items.length > 1 && <Tabs value={tab} onChange={setTab} items={items} />}

      {tab === "fees" && fin && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-end gap-3 rounded-3xl border border-slate-200 bg-white p-5">
            <label className="text-xs font-semibold text-slate-500">Placement test fee (USD)
              <input type="number" min={0} step={1} value={fee} onChange={(e) => setFee(e.target.value)} disabled={!exam} className="mt-1 block w-40 rounded-xl border border-slate-300 px-3 py-2.5 text-sm" />
            </label>
            <button onClick={saveFee} disabled={!exam} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50">Save fee</button>
            {saved && <span className="text-sm font-semibold text-emerald-600">Saved</span>}
            <p className="w-full text-xs text-slate-500">{exam ? "Learners book the test, pay, and send the receipt. Switch “Paid” on and the Start button appears for them. 0 = free." : "No placement test yet — the academic team creates it in Exams & Question Bank."}</p>
          </div>
          {tickets === null ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /> : tickets.length === 0 ? (
            <Empty icon={Wallet} title="No bookings yet" text="Learners who book the placement test appear here." />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Booked</th><th className="px-4 py-3">Fee</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Paid</th></tr>
                </thead>
                <tbody>
                  {tickets.map((t) => (
                    <tr key={t.id} className="border-t border-slate-100">
                      <td className="px-4 py-3"><b>{t.learner}</b><div className="text-xs text-slate-500">{t.email}</div></td>
                      <td className="px-4 py-3 text-slate-600">{fmtDate(t.created_at, true)}</td>
                      <td className="px-4 py-3 font-semibold">${Number(t.amount)}</td>
                      <td className="px-4 py-3">{t.status === "used" ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">Test taken</span> : t.status === "paid" ? <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Paid · ready</span> : <span className="rounded-full bg-gold-50 px-2.5 py-1 text-xs font-bold text-gold-700">Waiting for payment</span>}</td>
                      <td className="px-4 py-3">
                        {t.status === "used" ? <span className="text-xs text-slate-400">{fmtDate(t.paid_at)}</span> : (
                          <button onClick={() => togglePaid(t)} className={`h-6 w-11 rounded-full p-0.5 transition ${t.status === "paid" ? "bg-emerald-500" : "bg-slate-200"}`} aria-pressed={t.status === "paid"} aria-label="Paid">
                            <span className={`block h-5 w-5 rounded-full bg-white shadow transition ${t.status === "paid" ? "translate-x-5" : ""}`} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === "results" && aca && (
        results === null ? <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /> : results.length === 0 ? (
          <Empty icon={ClipboardCheck} title="No placement results yet" text="Results appear here as soon as a learner finishes the test." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Finished</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Level</th></tr>
              </thead>
              <tbody>
                {results.map((r) => (
                  <tr key={r.attempt_id} className="border-t border-slate-100">
                    <td className="px-4 py-3"><b>{r.learner}</b><div className="text-xs text-slate-500">{r.email}</div></td>
                    <td className="px-4 py-3 text-slate-600">{r.status === "in_progress" ? "Taking the test now" : fmtDate(r.submitted_at, true)}</td>
                    <td className="px-4 py-3">{fmtScore(r.score)} / {fmtScore(r.total)}</td>
                    <td className="px-4 py-3">{r.result_level && <span className={`rounded-lg px-2.5 py-1 text-sm font-extrabold ${levelCls[r.result_level] ?? ""}`}>{r.result_level}</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">Next: give each learner the short speaking test and place them in a class.</p>
          </div>
        )
      )}
    </>
  );
}
