"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Loader2,
  Lock,
  LogIn,
  Rocket,
  ShieldCheck,
} from "lucide-react";
import { authError, siteUrl, supabase, useAuth } from "@/lib/auth";
import { site } from "@/lib/site";
import {
  Divider,
  Field,
  OAuthButtons,
  primaryBtn,
} from "@/components/auth/AuthModal";

type Org = "none" | "institution" | "code";
type For = "self" | "child";

function Radio({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input
        type="radio"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-brand-700"
      />
      {children}
    </label>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const openModal = useAuth((s) => s.openModal);
  const user = useAuth((s) => s.user);
  // already signed in → go straight to the dashboard
  useEffect(() => {
    if (user) router.replace("/dashboard/");
  }, [user, router]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [org, setOrg] = useState<Org>("none");
  const [institution, setInstitution] = useState("");
  const [code, setCode] = useState("");
  const [forWho, setForWho] = useState<For>("self");
  const [childName, setChildName] = useState("");
  const [agree, setAgree] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (password.length < 8)
      return setMsg("Password must be at least 8 characters.");
    if (password !== confirm) return setMsg("Passwords don't match.");
    if (org === "institution" && !institution.trim())
      return setMsg("Please enter your institution's name.");
    if (org === "code" && !code.trim())
      return setMsg("Please enter your invitation code.");
    if (forWho === "child" && !childName.trim())
      return setMsg("Please enter your child's name.");
    if (!agree)
      return setMsg("Please accept the Terms of Service and Privacy Policy.");

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: siteUrl("/dashboard/"),
        data: {
          full_name: name.trim(),
          account_for: forWho,
          child_name: forWho === "child" ? childName.trim() : null,
          institution: org === "institution" ? institution.trim() : null,
          invitation_code: org === "code" ? code.trim() : null,
        },
      },
    });
    setBusy(false);
    if (error) return setMsg(authError(error.message));
    if (data.session) return router.push("/dashboard/");
    try {
      sessionStorage.setItem("llc-pending-email", email.trim());
    } catch {}
    router.push("/verify-email/");
  };

  return (
    <div className="bg-gradient-to-br from-brand-50/50 via-white to-gold-50/40 px-4 py-10">
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-brand-900/10 sm:p-8">
        {
          <form onSubmit={submit}>
            <h1 className="text-center text-2xl font-extrabold text-ink">
              Create Your Account
            </h1>
            <p className="mt-1 text-center text-sm text-slate-500">
              Start your English learning journey today
            </p>

            <div className="mt-6 space-y-4">
              <Field
                label="Full Name"
                value={name}
                onChange={setName}
                placeholder="Enter your full name"
                autoComplete="name"
                autoFocus
              />
              <Field
                label="Email Address"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="you@example.com"
                autoComplete="email"
              />
              <div>
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />
                <p
                  className={`mt-1 text-xs ${password && password.length < 8 ? "text-red-500" : "text-slate-500"}`}
                >
                  Minimum 8 characters
                </p>
              </div>
              <Field
                label="Confirm Password"
                type="password"
                value={confirm}
                onChange={setConfirm}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
            </div>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-medium text-slate-700">
                Are you part of an institution or have an invitation code?
              </legend>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <Radio checked={org === "none"} onChange={() => setOrg("none")}>
                  No
                </Radio>
                <Radio
                  checked={org === "institution"}
                  onChange={() => setOrg("institution")}
                >
                  Select institution
                </Radio>
                <Radio checked={org === "code"} onChange={() => setOrg("code")}>
                  Invitation code
                </Radio>
              </div>
              {org === "institution" && (
                <input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="School, university or company name"
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              )}
              {org === "code" && (
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter your invitation code"
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 font-mono tracking-widest outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              )}
            </fieldset>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-medium text-slate-700">
                Who is this account for?
              </legend>
              <div className="space-y-2">
                <Radio
                  checked={forWho === "self"}
                  onChange={() => setForWho("self")}
                >
                  I am registering for myself.
                </Radio>
                <Radio
                  checked={forWho === "child"}
                  onChange={() => setForWho("child")}
                >
                  I am a parent or guardian registering my child.
                </Radio>
              </div>
              {forWho === "child" && (
                <input
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="Your child's name"
                  className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-[15px] outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-100"
                />
              )}
              <p className="mt-3 rounded-xl border border-slate-200 bg-mist px-3 py-2.5 text-xs leading-5 text-slate-500">
                Students under the age of 13 may access Language Leap Center
                only through an account created and managed by their parent or
                legal guardian.
              </p>
            </fieldset>

            <label className="mt-5 flex cursor-pointer items-start gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-brand-700"
              />
              <span>
                I agree to the{" "}
                <span className="font-semibold text-brand-800">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="font-semibold text-brand-800">
                  Privacy Policy
                </span>
              </span>
            </label>

            {msg && (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {msg}
              </p>
            )}

            <button disabled={busy} className={`${primaryBtn} mt-5`}>
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Rocket className="h-5 w-5" />
              )}{" "}
              Create Account
            </button>

            <Divider>Or continue with</Divider>
            <OAuthButtons onMessage={setMsg} />

            <Divider>Already have an account?</Divider>
            <button
              type="button"
              onClick={() => openModal("signin")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 py-3 text-sm font-bold text-ink transition hover:border-brand-400 hover:bg-brand-50"
            >
              <LogIn className="h-4 w-4" /> Sign In Instead
            </button>

            <div className="mt-6 flex justify-center gap-5 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-brand-700" /> Secure
              </span>
              <span className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-gold-500" /> Private
              </span>
              <span className="flex items-center gap-1">
                <BadgeCheck className="h-3.5 w-3.5 text-brand-700" /> Free to
                Start
              </span>
            </div>
          </form>
        }
      </div>
      <div className="mt-6 flex justify-center gap-3 text-xs text-slate-500">
        <Link href="/" className="hover:text-ink">
          Home
        </Link>
        ·
        <a href={`mailto:${site.email}`} className="hover:text-ink">
          Contact
        </a>
        ·
        <Link href="/#faq" className="hover:text-ink">
          Help
        </Link>
      </div>
    </div>
  );
}
