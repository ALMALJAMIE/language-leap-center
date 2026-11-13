"use client";

import { createClient, type Session, type User } from "@supabase/supabase-js";
import { create } from "zustand";
import { basePath, supabaseConfig } from "./site";

export const supabase = createClient(supabaseConfig.url, supabaseConfig.key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

interface AuthState {
  /** signed-in learner (null for visitors, including anonymous chat sessions) */
  user: User | null;
  /** id of whoever is signed in, including an anonymous chat visitor */
  sessionUserId: string | null;
  ready: boolean;
  modal: null | "signin" | "forgot";
  openModal: (m: AuthState["modal"]) => void;
  setSession: (s: Session | null) => void;
}

export const useAuth = create<AuthState>()((set) => ({
  user: null,
  sessionUserId: null,
  ready: false,
  modal: null,
  openModal: (modal) => set({ modal }),
  setSession: (s) => set({ user: s?.user && !s.user.is_anonymous ? s.user : null, sessionUserId: s?.user?.id ?? null, ready: true }),
}));

let started = false;
/** Call once on the client: loads the session and listens for changes */
export function startAuth() {
  if (started || typeof window === "undefined") return;
  started = true;

  // "Remember me" off → end the session when the browser is closed
  try {
    if (localStorage.getItem("llc-no-remember") && !sessionStorage.getItem("llc-alive")) {
      supabase.auth.signOut({ scope: "local" });
      localStorage.removeItem("llc-no-remember");
    }
  } catch {}

  const apply = (session: Session | null) => {
    useAuth.getState().setSession(session);
    // load lazily to keep the auth module small
    const real = session?.user && !session.user.is_anonymous ? session.user : null;
    import("./sync").then((m) => m.onUserChange(real));
    import("./roles").then((m) => m.loadRole(real?.id ?? null));
  };
  supabase.auth.getSession().then(({ data }) => apply(data.session));
  supabase.auth.onAuthStateChange((_e, session) => apply(session));
}

export function setRemember(remember: boolean) {
  try {
    if (remember) localStorage.removeItem("llc-no-remember");
    else {
      localStorage.setItem("llc-no-remember", "1");
      sessionStorage.setItem("llc-alive", "1");
    }
  } catch {}
}

export const siteUrl = (path = "/") =>
  typeof window === "undefined" ? path : `${window.location.origin}${basePath}${path}`;

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

export const displayName = (u: User | null) =>
  (u?.user_metadata?.full_name as string | undefined) || u?.email?.split("@")[0] || "";

/** Friendly messages for common Supabase auth errors */
export function authError(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "Wrong email or password.";
  if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox.";
  if (m.includes("already registered") || m.includes("already been registered")) return "This email already has an account. Try signing in.";
  if (m.includes("password") && m.includes("6")) return "Password must be at least 6 characters.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a few minutes and try again.";
  if (m.includes("valid email") || m.includes("invalid format")) return "Please enter a valid email address.";
  return msg;
}
