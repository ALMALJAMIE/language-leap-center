"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, Loader2, LogOut, Save, Settings as SettingsIcon } from "lucide-react";
import { AccountShell, SignInPrompt } from "@/components/account/AccountShell";
import { Field } from "@/components/auth/AuthModal";
import { authError, displayName, supabase, useAuth } from "@/lib/auth";
import { useMounted } from "@/lib/store";
import type { User } from "@supabase/supabase-js";

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="mb-5 font-bold">{title}</h2>
      {children}
    </div>
  );
}

function Note({ msg }: { msg: { ok?: boolean; text: string } | null }) {
  if (!msg) return null;
  return <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>;
}

function Details({ user }: { user: User }) {
  const meta = user.user_metadata ?? {};
  const [name, setName] = useState(displayName(user));
  const [child, setChild] = useState<string>(meta.child_name ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim(), ...(meta.account_for === "child" ? { child_name: child.trim() } : {}) } });
    setBusy(false);
    setMsg(error ? { text: authError(error.message) } : { ok: true, text: "Your profile has been saved." });
  };

  return (
    <Card title="Personal details">
      <form onSubmit={save} className="space-y-4">
        <Field label="Full Name" value={name} onChange={setName} autoComplete="name" />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Email Address</span>
          <input value={user.email ?? ""} disabled className="w-full rounded-xl border border-slate-200 bg-mist px-4 py-3 text-slate-500" />
        </label>
        {meta.account_for === "child" && <Field label="Child's Name" value={child} onChange={setChild} />}
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="rounded-xl bg-mist px-4 py-3">
            <div className="text-xs text-slate-500">Account type</div>
            <div className="font-semibold">{meta.account_for === "child" ? "Parent / guardian" : "Personal"}</div>
          </div>
          <div className="rounded-xl bg-mist px-4 py-3">
            <div className="text-xs text-slate-500">Institution</div>
            <div className="font-semibold">{meta.institution || (meta.invitation_code ? `Code ${meta.invitation_code}` : "—")}</div>
          </div>
        </div>
        <button disabled={busy} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </form>
      <Note msg={msg} />
    </Card>
  );
}

function Password() {
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
    <Card title="Change password">
      <form onSubmit={save} className="space-y-4">
        <Field label="New Password" type="password" value={pw} onChange={setPw} placeholder="Minimum 8 characters" autoComplete="new-password" />
        <Field label="Confirm New Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
        <button disabled={busy} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold hover:border-brand-400">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />} Update password
        </button>
      </form>
      <Note msg={msg} />
    </Card>
  );
}

export default function Profile() {
  const mounted = useMounted();
  const { user, ready } = useAuth();

  return (
    <AccountShell title="Profile" subtitle="Your account details and preferences">
      {!mounted || !ready ? (
        <div className="min-h-[40vh]" />
      ) : !user ? (
        <div className="space-y-6">
          <SignInPrompt text="Sign in to manage your profile and keep your progress on every device." />
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          <Details key={user.id} user={user} />
          <Password />
          <div className="flex flex-wrap gap-3 xl:col-span-2">
            <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-5 py-2.5 text-sm font-bold hover:border-red-300 hover:text-red-600">
              <LogOut className="h-4 w-4" /> Sign out
            </button>
            <Link href="/settings/" className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-ink">
              <SettingsIcon className="h-4 w-4" /> Learning preferences
            </Link>
          </div>
        </div>
      )}
    </AccountShell>
  );
}
