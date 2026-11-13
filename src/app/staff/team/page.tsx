"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Trash2, UserPlus } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { roleInfo, roles, rpcError, type Role } from "@/lib/roles";
import { ErrorNote, RoleBadge, StaffShell, fmtDate } from "@/components/staff/StaffShell";

interface Member { user_id: string; email: string; full_name: string; role: Role; created_at: string; last_sign_in_at: string | null }

export default function TeamPage() {
  return (
    <StaffShell page="/staff/team/" title="Team & Roles" subtitle="Give team members access to the workspace. Each role sees only its own tools.">
      <Team />
    </StaffShell>
  );
}

function Team() {
  const me = useAuth((s) => s.user);
  const [list, setList] = useState<Member[] | null>(null);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("teacher");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("staff_list_team");
    setErr(rpcError(error));
    setList((data as Member[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const setFor = async (mail: string, r: Role | null) => {
    if (r === null && !confirm(`Remove ${mail} from the team? They keep their learner account.`)) return;
    setBusy(true);
    setMsg("");
    const { error } = await supabase.rpc("admin_set_role", { p_email: mail, p_role: r ?? "" });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    setErr("");
    setMsg(r ? `${mail} is now ${roleInfo[r].label}.` : `${mail} was removed from the team.`);
    load();
  };

  return (
    <>
      <ErrorNote text={err} />
      {msg && <div className="mb-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{msg}</div>}

      <form
        onSubmit={(e) => { e.preventDefault(); if (email.trim()) setFor(email.trim(), role).then(() => setEmail("")); }}
        className="mb-8 rounded-3xl border border-slate-200 bg-white p-6"
      >
        <h2 className="flex items-center gap-2 font-bold"><UserPlus className="h-5 w-5 text-brand-600" /> Add a team member</h2>
        <p className="mt-1 text-sm text-slate-500">The person must already have an account (they sign up on the website first).</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px_auto]">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Their email address" className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
          <select value={role} onChange={(e) => setRole(e.target.value as Role)} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-500">
            {roles.map((r) => <option key={r} value={r}>{roleInfo[r].label}</option>)}
          </select>
          <button disabled={busy} className="btn-primary px-6 py-2.5 text-sm disabled:opacity-60">{busy ? "Saving…" : "Add"}</button>
        </div>
        <div className="mt-5 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((r) => <div key={r}><RoleBadge role={r} /> <span className="ml-1">{roleInfo[r].desc}</span></div>)}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr><th className="px-4 py-3">Member</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Added</th><th className="px-4 py-3">Last sign-in</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody>
            {list === null && <tr><td colSpan={5} className="py-10 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" /></td></tr>}
            {list?.map((m) => {
              const self = m.user_id === me?.id;
              return (
                <tr key={m.user_id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{m.full_name || m.email.split("@")[0]} {self && <span className="text-xs font-normal text-slate-400">(you)</span>}</div>
                    <div className="text-xs text-slate-500">{m.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {self ? <RoleBadge role={m.role} /> : (
                      <select value={m.role} disabled={busy} onChange={(e) => setFor(m.email, e.target.value as Role)} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm">
                        {roles.map((r) => <option key={r} value={r}>{roleInfo[r].label}</option>)}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-slate-600">{fmtDate(m.last_sign_in_at, true)}</td>
                  <td className="px-4 py-3 text-right">
                    {!self && (
                      <button onClick={() => setFor(m.email, null)} disabled={busy} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" aria-label="Remove from team"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
