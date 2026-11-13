"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { Info, Loader2, LogOut, MailOpen, Send, UserPen } from "lucide-react";
import { authError, siteUrl, supabase } from "@/lib/auth";
import { site } from "@/lib/site";
import { primaryBtn } from "@/components/auth/AuthModal";
import { Logo } from "@/components/Logo";

const KEY = "llc-pending-email";
const readPending = () => {
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
};

export default function VerifyEmail() {
  const router = useRouter();
  const email = useSyncExternalStore(() => () => {}, readPending, () => null);
  const [busy, setBusy] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [msg, setMsg] = useState<{ ok?: boolean; text: string } | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(cooldown - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const resend = async () => {
    if (!email) return setMsg({ text: "We couldn't find your email. Please register again." });
    setBusy(true);
    const { error } = await supabase.auth.resend({ type: "signup", email, options: { emailRedirectTo: siteUrl("/dashboard/") } });
    setBusy(false);
    if (error) return setMsg({ text: authError(error.message) });
    setMsg({ ok: true, text: `A new verification link was sent to ${email}.` });
    setCooldown(60);
  };

  const logOut = async () => {
    try {
      sessionStorage.removeItem(KEY);
    } catch {}
    await supabase.auth.signOut({ scope: "local" });
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50/60 via-white to-gold-50/50 px-4 py-12">
      <div className="flex justify-center">
        <Link href="/" aria-label="Home">
          <Logo />
        </Link>
      </div>

      <div className="mx-auto mt-8 w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-brand-900/10">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-brand-50 to-gold-50 text-brand-800">
          <MailOpen className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-extrabold text-ink">Verify Your Email</h1>
        <p className="mt-2 text-[15px] leading-6 text-slate-600">
          We&apos;ve sent a verification link to {email ? <b className="text-ink">{email}</b> : "your email address"}. Please check your inbox and click the link to verify.
        </p>

        {msg && <p className={`mt-5 rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}

        <button onClick={resend} disabled={busy || cooldown > 0} className={`${primaryBtn} mt-6`}>
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Verification Email"}
        </button>

        <div className="mt-4 flex items-center justify-center gap-4 text-sm">
          <Link href="/register/" className="flex items-center gap-1.5 font-semibold text-brand-800 hover:text-brand-600">
            <UserPen className="h-4 w-4" /> Edit Profile
          </Link>
          <span className="h-4 w-px bg-slate-300" />
          <button onClick={logOut} className="flex items-center gap-1.5 text-slate-600 hover:text-red-600">
            <LogOut className="h-4 w-4" /> Log Out
          </button>
        </div>

        <div className="mt-6 flex items-start justify-center gap-2 border-t border-slate-100 pt-5 text-sm text-slate-500">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Didn&apos;t receive the email? Check your spam folder or request a new link above.</span>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-3 text-xs text-slate-500">
        <Link href="/" className="hover:text-ink">Home</Link>·
        <a href={`mailto:${site.email}`} className="hover:text-ink">Contact</a>·
        <Link href="/#faq" className="hover:text-ink">Help</Link>
      </div>
    </div>
  );
}
