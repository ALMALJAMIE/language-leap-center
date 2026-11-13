"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Loader2, MailCheck, UserPlus } from "lucide-react";
import { authError, siteUrl, supabase, useAuth } from "@/lib/auth";
import { Divider, Field, OAuthButtons, primaryBtn } from "@/components/auth/AuthModal";
import { Logo } from "@/components/Logo";

const perks = ["Free A1 course — no card needed", "Audio for every word and sentence", "Progress, XP and streaks saved to your account"];

export function RegisterForm() {
  const router = useRouter();
  const openModal = useAuth((s) => s.openModal);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const strength = [password.length >= 8, /[A-Z]/.test(password) && /[a-z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password.length < 6) return setMsg("Password must be at least 6 characters.");
    if (password !== confirm) return setMsg("Passwords don't match.");
    if (!agree) return setMsg("Please accept the Terms and Privacy Policy.");
    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: siteUrl("/dashboard/") },
    });
    setBusy(false);
    if (error) return setMsg(authError(error.message));
    if (data.session) router.push("/dashboard/");
    else setSentTo(email.trim());
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 to-white">
      <div className="absolute -right-40 top-10 h-[480px] w-[480px] rounded-full border-[64px] border-brand-100/60" />
      <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full border-[40px] border-gold-200/40" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-14 lg:grid-cols-2">
        <div className="hidden lg:block">
          <Logo />
          <h1 className="mt-8 text-4xl font-extrabold leading-tight text-ink">
            Start your <span className="text-gold-gradient">leap</span> to fluent English today
          </h1>
          <p className="mt-4 max-w-md text-lg leading-8 text-slate-600">Create a free account to save your progress and continue on any device.</p>
          <ul className="mt-8 space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 text-slate-700">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-gold-100 text-gold-600"><Check className="h-4 w-4" /></span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl shadow-brand-900/10 sm:p-8">
          {sentTo ? (
            <div className="py-6 text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><MailCheck className="h-8 w-8" /></div>
              <h2 className="mt-5 text-2xl font-extrabold">Check your email</h2>
              <p className="mt-2 text-slate-600">
                We sent a confirmation link to <b>{sentTo}</b>. Click it to activate your account, then sign in.
              </p>
              <button onClick={() => openModal("signin")} className={`${primaryBtn} mt-6`}>Go to sign in</button>
            </div>
          ) : (
            <form onSubmit={submit}>
              <h2 className="text-center text-2xl font-extrabold text-ink">Create Your Account</h2>
              <p className="mt-1 text-center text-sm text-slate-500">Join Language Leap Center and start learning for free</p>

              <OAuthButtonsWrapper onMessage={setMsg} />

              <Divider>Or sign up with email</Divider>

              <div className="space-y-4">
                <Field label="Full Name" value={name} onChange={setName} placeholder="Your full name" autoComplete="name" />
                <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" />
                <div>
                  <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" />
                  {password && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex flex-1 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < strength ? (strength <= 1 ? "bg-red-400" : strength <= 2 ? "bg-gold-400" : "bg-emerald-500") : "bg-slate-200"}`} />
                        ))}
                      </div>
                      <span className="text-xs text-slate-500">{["Weak", "Weak", "Fair", "Good", "Strong"][strength]}</span>
                    </div>
                  )}
                </div>
                <Field label="Confirm Password" type="password" value={confirm} onChange={setConfirm} placeholder="Repeat your password" autoComplete="new-password" />
              </div>

              <label className="mt-4 flex cursor-pointer items-start gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-600" />
                <span>I agree to the <span className="font-semibold text-brand-700">Terms of Service</span> and <span className="font-semibold text-brand-700">Privacy Policy</span></span>
              </label>

              {msg && <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{msg}</p>}

              <button disabled={busy} className={`${primaryBtn} mt-5`}>
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserPlus className="h-5 w-5" />} Create Account
              </button>

              <p className="mt-6 text-center text-sm text-slate-600">
                Already have an account?{" "}
                <button type="button" onClick={() => openModal("signin")} className="font-bold text-brand-700 hover:text-brand-900">Sign in</button>
              </p>
            </form>
          )}
          <div className="mt-6 flex justify-center gap-3 text-xs text-slate-400">
            <Link href="/" className="hover:text-slate-600">Home</Link>·<a href="mailto:llcent.mgmt@gmail.com" className="hover:text-slate-600">Contact</a>·<Link href="/#faq" className="hover:text-slate-600">Help</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function OAuthButtonsWrapper({ onMessage }: { onMessage: (m: string) => void }) {
  return (
    <div className="mt-6">
      <OAuthButtons onMessage={onMessage} />
    </div>
  );
}
