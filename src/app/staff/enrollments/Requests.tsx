"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Inbox, Loader2, X } from "lucide-react";
import { supabase } from "@/lib/auth";
import { formatPrice, getCourse } from "@/data/courses";
import { rpcError } from "@/lib/roles";
import { fmtDate } from "@/components/staff/StaffShell";
import { openReceipt } from "@/components/ReceiptUpload";

interface Req { id: number; learner: string; email: string; course_slug: string; amount: number; details: { addOns?: string[]; coupon?: string | null }; receipt_path: string | null; status: "pending" | "approved" | "rejected"; decision_note: string | null; created_at: string; decided_at: string | null }

/** Course requests from learners: finance opens the course with one click */
export function Requests({ onChange }: { onChange: () => void }) {
  const [rows, setRows] = useState<Req[] | null>(null);
  const [err, setErr] = useState("");
  const [showDone, setShowDone] = useState(false);
  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("finance_enrollment_requests");
    setErr(rpcError(error));
    setRows((data as Req[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const approve = async (r: Req) => {
    const { error } = await supabase.rpc("approve_enrollment", { p_id: r.id });
    if (error) return setErr(rpcError(error));
    load();
    onChange();
  };
  const reject = async (r: Req) => {
    const note = prompt(`Why is ${r.learner}'s request not accepted? (the learner sees this)`, "Payment not received");
    if (note === null) return;
    const { error } = await supabase.rpc("reject_enrollment", { p_id: r.id, p_note: note });
    if (error) return setErr(rpcError(error));
    load();
  };

  if (rows === null) return <Loader2 className="mx-auto mb-8 h-6 w-6 animate-spin text-slate-300" />;
  const pending = rows.filter((r) => r.status === "pending");
  const done = rows.filter((r) => r.status !== "pending");
  const list = showDone ? done : pending;

  return (
    <section className="mb-8">
      <div className="mb-3 flex items-center gap-3">
        <h2 className="flex items-center gap-2 font-bold"><Inbox className="h-5 w-5 text-brand-600" /> Course requests {pending.length > 0 && <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs text-brand-950">{pending.length}</span>}</h2>
        <button onClick={() => setShowDone(!showDone)} className="ml-auto text-xs font-bold text-slate-500 hover:text-brand-700">{showDone ? "Show waiting requests" : `Show handled (${done.length})`}</button>
      </div>
      {err && <p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">{err}</p>}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Receipt</th><th className="px-4 py-3">Sent</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={6} className="py-8 text-center text-slate-400">{showDone ? "No handled requests yet" : "No requests waiting"}</td></tr>}
            {list.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-4 py-3"><b>{r.learner}</b><div className="text-xs text-slate-500">{r.email}</div></td>
                <td className="px-4 py-3">{getCourse(r.course_slug)?.title ?? r.course_slug}{(r.details?.addOns?.length || r.details?.coupon) ? <div className="text-xs text-slate-400">{[...(r.details.addOns ?? []), r.details.coupon && `coupon ${r.details.coupon}`].filter(Boolean).join(" · ")}</div> : null}</td>
                <td className="px-4 py-3 font-semibold">{formatPrice(Number(r.amount))}</td>
                <td className="px-4 py-3">{r.receipt_path ? <button onClick={() => openReceipt(r.receipt_path!)} className="text-xs font-bold text-brand-700 underline">View</button> : <span className="text-xs text-slate-400">Not yet</span>}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(r.created_at, true)}</td>
                <td className="px-4 py-3 text-right">
                  {r.status === "pending" ? (
                    <span className="inline-flex gap-2">
                      <button onClick={() => approve(r)} className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"><Check className="h-4 w-4" /> Add to course</button>
                      <button onClick={() => reject(r)} className="rounded-xl p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Reject"><X className="h-4 w-4" /></button>
                    </span>
                  ) : r.status === "approved" ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">Added · {fmtDate(r.decided_at)}</span>
                  ) : (
                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600" title={r.decision_note ?? ""}>Not accepted</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
