"use client";

import { useState } from "react";
import { Check, KeyRound, Loader2, LogOut, Trash2 } from "lucide-react";
import { Field } from "@/components/auth/AuthModal";
import { AccountShell } from "@/components/account/AccountShell";
import { ArabicToggle } from "@/components/ArabicToggle";
import { authError, supabase, useAuth } from "@/lib/auth";
import { useProgress } from "@/lib/store";
import { usePortalPrefs } from "@/lib/ui";

function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 py-5 last:border-0">
      <div>
        <div className="font-semibold">{title}</div>
        <div className="text-sm text-slate-500">{desc}</div>
      </div>
      {children}
    </div>
  );
}

function ChangePassword() {
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) return setMsg({ text: "Password must be at least 8 characters." });
    if (pw !== confirm) return setMsg({ text: "Passwords don't match." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setMsg({ text: authError(error.message) });
    setPw("");
    setConfirm("");
    setMsg({ ok: true, text: "Your password has been changed." });
  };
  return (
    <form onSubmit={save} className="grid gap-4 py-5 sm:grid-cols-2">
      <Field label="New Password" type="password" value={pw} onChange={setPw} placeholder="Minimum 8 characters" autoComplete="new-password" />
      <Field label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
      <div className="flex items-center gap-3 sm:col-span-2">
        <button disabled={busy} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold hover:border-brand-400">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password
        </button>
        {msg && <span className={`text-sm ${msg.ok ? "text-emerald-600" : "text-red-600"}`}>{msg.text}</span>}
      </div>
    </form>
  );
}

export default function Settings() {
  const { dailyGoal, setGoal, reset } = useProgress();
  const user = useAuth((s) => s.user);
  const { collapsed, toggleCollapsed } = usePortalPrefs();

  return (
    <AccountShell title="Settings" subtitle="Learning preferences and account options">
      <div className="rounded-3xl border border-slate-200 bg-white px-6">
        <Row title="Daily goal" desc="How much XP you want to earn each day">
          <div className="flex flex-wrap gap-2">
            {[{ n: 10, l: "Casual" }, { n: 30, l: "Regular" }, { n: 50, l: "Serious" }, { n: 80, l: "Intense" }].map((g) => (
              <button
                key={g.n}
                onClick={() => setGoal(g.n)}
                className={`flex items-center gap-1 rounded-xl border-2 px-3 py-1.5 text-sm font-bold ${dailyGoal === g.n ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-200 text-slate-500"}`}
              >
                {dailyGoal === g.n && <Check className="h-4 w-4" />} {g.l} · {g.n}
              </button>
            ))}
          </div>
        </Row>
        <Row title="Arabic help" desc="Show Arabic translations under words and sentences in lessons">
          <ArabicToggle />
        </Row>
        <Row title="Compact sidebar" desc="Show only icons in the sidebar on large screens">
          <button onClick={toggleCollapsed} className={`h-6 w-11 rounded-full p-0.5 transition ${collapsed ? "bg-brand-600" : "bg-slate-200"}`} aria-pressed={collapsed}>
            <span className={`block h-5 w-5 rounded-full bg-white shadow transition ${collapsed ? "translate-x-5" : ""}`} />
          </button>
        </Row>
      </div>

      {user && (
        <>
          <h2 className="mb-3 mt-8 font-bold">Password</h2>
          <div className="rounded-3xl border border-slate-200 bg-white px-6">
            <ChangePassword />
          </div>
        </>
      )}

      <h2 className="mb-3 mt-8 font-bold text-red-600">Danger zone</h2>
      <div className="rounded-3xl border border-red-200 bg-white px-6">
        <Row title="Reset my progress" desc="Erase all lessons, XP, streaks and review cards. This cannot be undone.">
          <button
            onClick={() => confirm("This will erase all your progress. Are you sure?") && reset()}
            className="flex items-center gap-2 rounded-xl border-2 border-red-200 px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" /> Reset
          </button>
        </Row>
        {user && (
          <Row title="Sign out" desc="Your progress stays saved in your account">
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold hover:border-slate-300">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </Row>
        )}
      </div>
    </AccountShell>
  );
}
