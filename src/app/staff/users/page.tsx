"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Loader2, MailWarning, Search } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError, type Role } from "@/lib/roles";
import { ErrorNote, RoleBadge, StaffShell, fmtDate } from "@/components/staff/StaffShell";

interface Row {
  id: string; email: string; full_name: string; created_at: string; last_sign_in_at: string | null;
  confirmed: boolean; role: Role | null; courses: number; last_active: string | null;
}

export default function UsersPage() {
  return (
    <StaffShell page="/staff/users/" title="Learners & Users" subtitle="Everyone with an account on Language Leap Center">
      <Users />
    </StaffShell>
  );
}

function Users() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState("");
  const [who, setWho] = useState<"all" | "learners" | "team">("all");

  const load = useCallback(async (search: string) => {
    setRows(null);
    const { data, error } = await supabase.rpc("staff_list_users", { search });
    setErr(rpcError(error));
    setRows((data as Row[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(() => load(""), 0);
    return () => clearTimeout(t);
  }, [load]);

  const shown = (rows ?? []).filter((r) => who === "all" || (who === "team" ? !!r.role : !r.role));

  return (
    <>
      <ErrorNote text={err} />
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <form onSubmit={(e) => { e.preventDefault(); load(q.trim()); }} className="relative min-w-64 flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email, then press Enter" className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-500" />
        </form>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm">
          {(["all", "learners", "team"] as const).map((f) => (
            <button key={f} onClick={() => setWho(f)} className={`rounded-lg px-3 py-1.5 font-semibold capitalize ${who === f ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Joined</th>
              <th className="px-4 py-3">Last sign-in</th>
              <th className="px-4 py-3">Last studied</th>
              <th className="px-4 py-3 text-center">Paid courses</th>
            </tr>
          </thead>
          <tbody>
            {rows === null && <tr><td colSpan={6} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>}
            {rows !== null && shown.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-slate-400">No accounts found</td></tr>}
            {shown.map((r) => (
              <tr key={r.id} className="border-t border-slate-100 hover:bg-slate-50/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-ink">{r.full_name || r.email.split("@")[0]}</div>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {r.email}
                    {r.confirmed ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" aria-label="Email confirmed" /> : <MailWarning className="h-3.5 w-3.5 text-amber-500" aria-label="Email not confirmed" />}
                  </div>
                </td>
                <td className="px-4 py-3"><RoleBadge role={r.role} /></td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(r.created_at)}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(r.last_sign_in_at, true)}</td>
                <td className="px-4 py-3 text-slate-600">{fmtDate(r.last_active)}</td>
                <td className="px-4 py-3 text-center font-bold">{r.courses || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows && <p className="mt-3 text-xs text-slate-400">Showing {shown.length} of {rows.length} accounts (latest 300). Unconfirmed emails show a yellow icon.</p>}
    </>
  );
}
