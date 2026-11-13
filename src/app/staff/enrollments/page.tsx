"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Search, Ticket, Trash2 } from "lucide-react";
import { supabase } from "@/lib/auth";
import { courses, formatPrice, getCourse } from "@/data/courses";
import { rpcError } from "@/lib/roles";
import { ErrorNote, StaffShell, fmtDate } from "@/components/staff/StaffShell";

interface Row { email: string; full_name: string; course_slug: string; created_at: string; note: string | null; granted_by: string | null }

const paid = courses.filter((c) => c.price > 0);

export default function EnrollmentsPage() {
  return (
    <StaffShell page="/staff/enrollments/" title="Course Access" subtitle="Paid courses stay locked until access is opened here (until the payment gateway is connected).">
      <Enrollments />
    </StaffShell>
  );
}

function Enrollments() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [slug, setSlug] = useState(paid[0]?.slug ?? "");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("staff_list_enrollments");
    setErr(rpcError(error));
    setRows((data as Row[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const grant = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg("");
    const { error } = await supabase.rpc("staff_grant_course", { p_email: email.trim(), p_slug: slug, p_note: note });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    setErr("");
    setMsg(`Access to “${getCourse(slug)?.title}” opened for ${email.trim()}.`);
    setEmail("");
    setNote("");
    load();
  };

  const revoke = async (r: Row) => {
    if (!confirm(`Remove access to “${getCourse(r.course_slug)?.title ?? r.course_slug}” for ${r.email}?`)) return;
    const { error } = await supabase.rpc("staff_revoke_course", { p_email: r.email, p_slug: r.course_slug });
    if (error) return setErr(rpcError(error));
    setMsg(`Access removed for ${r.email}.`);
    load();
  };

  const s = q.trim().toLowerCase();
  const shown = (rows ?? []).filter((r) => !s || `${r.email} ${r.full_name} ${r.course_slug}`.toLowerCase().includes(s));

  return (
    <>
      <ErrorNote text={err} />
      {msg && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}

      <form onSubmit={grant} className="mb-8 rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="flex items-center gap-2 font-bold"><Ticket className="h-5 w-5 text-emerald-600" /> Open a paid course</h2>
        <p className="mt-1 text-sm text-slate-500">Use this after you receive the payment. The learner sees the course unlocked the next time they open it.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr]">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Learner's email" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
          <select value={slug} onChange={(e) => setSlug(e.target.value)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
            {paid.map((c) => <option key={c.slug} value={c.slug}>{c.title} — {formatPrice(c.price)}</option>)}
          </select>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional): receipt number, amount, method…" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500 md:col-span-1" />
          <button disabled={busy} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">{busy ? "Opening…" : "Open course"}</button>
        </div>
      </form>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-bold">Learners with paid access {rows && <span className="font-normal text-slate-400">({rows.length})</span>}</h2>
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter" className="w-52 rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none" />
        </label>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Learner</th><th className="px-4 py-3">Course</th><th className="px-4 py-3">Opened</th><th className="px-4 py-3">Note</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {rows === null && <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>}
            {rows !== null && shown.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-slate-400">No paid access yet</td></tr>}
            {shown.map((r) => (
              <tr key={r.email + r.course_slug} className="border-t border-slate-100">
                <td className="px-4 py-3"><div className="font-semibold">{r.full_name || r.email.split("@")[0]}</div><div className="text-xs text-slate-500">{r.email}</div></td>
                <td className="px-4 py-3">{getCourse(r.course_slug)?.title ?? r.course_slug}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(r.created_at)}{r.granted_by && <div className="text-xs text-slate-400">by {r.granted_by}</div>}</td>
                <td className="px-4 py-3 text-slate-600">{r.note ?? "—"}</td>
                <td className="px-4 py-3 text-right"><button onClick={() => revoke(r)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove access"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
