"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { KeyRound, Loader2 } from "lucide-react";
import { authError, supabase, useAuth } from "@/lib/auth";
import { Field, primaryBtn } from "@/components/auth/AuthModal";

export default function ResetPassword() {
  const router = useRouter();
  const { user, ready } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return setMsg({ text: "Password must be at least 6 characters." });
    if (password !== confirm) return setMsg({ text: "Passwords don't match." });
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setMsg({ text: authError(error.message) });
    setMsg({ ok: true, text: "Your password has been updated." });
    setTimeout(() => router.push("/dashboard/"), 1200);
  };

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600"><KeyRound className="h-6 w-6" /></div>
        <h1 className="mt-4 text-center text-2xl font-extrabold">Choose a new password</h1>
        {ready && !user ? (
          <p className="mt-4 text-center text-slate-600">This link has expired or was already used. Request a new one from “Forgot password?” in the sign-in window.</p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <Field label="New Password" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
            <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} autoComplete="new-password" />
            {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
            <button disabled={busy} className={primaryBtn}>
              {busy && <Loader2 className="h-5 w-5 animate-spin" />} Update password
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
