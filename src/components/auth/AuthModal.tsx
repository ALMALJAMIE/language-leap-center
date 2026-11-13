"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Eye, EyeOff, Loader2, LogIn, UserPlus, X, KeyRound, ArrowLeft } from "lucide-react";
import { authError, setRemember, siteUrl, supabase, useAuth } from "@/lib/auth";
import { oauthEnabled } from "@/lib/site";
import { FacebookIcon, GoogleIcon } from "../BrandIcons";

export function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  autoFocus,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}) {
  const [show, setShow] = useState(false);
  const isPw = type === "password";
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <span className="relative block">
        <input
          type={isPw && show ? "text" : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
        />
        {isPw && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </span>
    </label>
  );
}

export function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="my-5 flex items-center gap-3 text-xs text-slate-500">
      <span className="h-px flex-1 bg-slate-200" />
      {children}
      <span className="h-px flex-1 bg-slate-200" />
    </div>
  );
}

export function OAuthButtons({ onMessage }: { onMessage: (m: string) => void }) {
  const go = async (provider: "google" | "facebook") => {
    if (!oauthEnabled[provider]) {
      onMessage(`${provider === "google" ? "Google" : "Facebook"} sign-in is coming soon. Please use your email for now.`);
      return;
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: siteUrl("/dashboard/") } });
    if (error) onMessage(authError(error.message));
  };
  return (
    <div className="grid grid-cols-2 gap-3">
      <button type="button" onClick={() => go("google")} aria-label="Continue with Google" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold transition hover:bg-slate-50">
        <GoogleIcon /> <span className="hidden sm:inline">Google</span>
      </button>
      <button type="button" onClick={() => go("facebook")} aria-label="Continue with Facebook" className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 py-2.5 text-sm font-semibold transition hover:bg-slate-50">
        <FacebookIcon /> <span className="hidden sm:inline">Facebook</span>
      </button>
    </div>
  );
}

export const primaryBtn =
  "flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold text-white shadow-lg shadow-brand-900/20 transition hover:brightness-110 disabled:opacity-60 bg-[linear-gradient(100deg,#0b326d_0%,#1f66c8_55%,#ce961d_100%)]";

function SignIn({ close, toForgot }: { close: () => void; toForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRem] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    setRemember(remember);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) return setMsg({ text: authError(error.message) });
    close();
  };

  return (
    <form onSubmit={submit}>
      <h2 className="text-center text-2xl font-extrabold text-ink">Welcome Back</h2>
      <p className="mt-1 text-center text-sm text-slate-500">Sign in to continue your English learning journey</p>

      <div className="mt-6 space-y-4">
        <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" autoFocus />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="Enter your password" autoComplete="current-password" />
      </div>

      <div className="mt-4 flex items-center justify-between text-sm">
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input type="checkbox" checked={remember} onChange={(e) => setRem(e.target.checked)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
          Remember me
        </label>
        <button type="button" onClick={toForgot} className="font-semibold text-brand-700 hover:text-brand-900">
          Forgot password?
        </button>
      </div>

      {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}

      <button disabled={busy} className={`${primaryBtn} mt-5`}>
        {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <LogIn className="h-5 w-5" />} Sign In
      </button>

      <Divider>Or continue with</Divider>
      <OAuthButtons onMessage={(t) => setMsg({ text: t })} />

      <Divider>New to Language Leap Center?</Divider>
      <Link href="/register/" onClick={close} className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-bold text-ink transition hover:border-brand-400 hover:bg-brand-50">
        <UserPlus className="h-4 w-4" /> Create an Account
      </Link>
    </form>
  );
}

function Forgot({ back }: { back: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: siteUrl("/reset-password/") });
    setBusy(false);
    setMsg(error ? { text: authError(error.message) } : { ok: true, text: "If this email has an account, a reset link is on its way. Check your inbox." });
  };

  return (
    <form onSubmit={submit}>
      <button type="button" onClick={back} className="mb-4 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </button>
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-brand-50 text-brand-600">
        <KeyRound className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-center text-2xl font-extrabold text-ink">Reset your password</h2>
      <p className="mt-1 text-center text-sm text-slate-500">Enter your email and we&apos;ll send you a link to choose a new password.</p>
      <div className="mt-6">
        <Field label="Email Address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" autoComplete="email" autoFocus />
      </div>
      {msg && <p className={`mt-4 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
      <button disabled={busy} className={`${primaryBtn} mt-5`}>
        {busy && <Loader2 className="h-5 w-5 animate-spin" />} Send reset link
      </button>
    </form>
  );
}

export function AuthModal() {
  const { modal, openModal } = useAuth();
  const close = () => openModal(null);

  useEffect(() => {
    if (!modal) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && openModal(null);
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [modal, openModal]);

  return (
    <AnimatePresence>
      {modal && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto bg-brand-950/40 px-4 py-10 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={close}
        >
          <motion.div
            initial={{ y: 20, scale: 0.97 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: 20, scale: 0.97 }}
            className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-2xl sm:p-8"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button onClick={close} aria-label="Close" className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X className="h-5 w-5" />
            </button>
            {modal === "signin" ? <SignIn close={close} toForgot={() => openModal("forgot")} /> : <Forgot back={() => openModal("signin")} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
