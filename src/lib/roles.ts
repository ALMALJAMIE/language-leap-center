"use client";

import { create } from "zustand";
import { supabase } from "./auth";

export type Role = "admin" | "teacher" | "finance" | "academic" | "support" | "supervisor";

export const roleInfo: Record<Role, { label: string; badge: string; desc: string }> = {
  admin: { label: "Platform Admin", badge: "bg-brand-900 text-white", desc: "Full access to every part of the workspace." },
  teacher: { label: "Teacher", badge: "bg-emerald-100 text-emerald-800", desc: "Teaches learners and runs private lessons." },
  finance: { label: "Finance", badge: "bg-gold-100 text-gold-800", desc: "Payments, course access and reports." },
  academic: { label: "Academic", badge: "bg-violet-100 text-violet-800", desc: "Courses, lessons, levels and certificates." },
  support: { label: "Support", badge: "bg-sky-100 text-sky-800", desc: "Answers learners and fixes account problems." },
  supervisor: { label: "Academic Supervisor", badge: "bg-teal-100 text-teal-800", desc: "Follows live classes: approves attendance and grades, observes lessons." },
};
export const roles = Object.keys(roleInfo) as Role[];

interface RoleState {
  role: Role | null;
  loaded: boolean;
}
export const useRole = create<RoleState>()(() => ({ role: null, loaded: false }));

let current: string | null | undefined;
/** Called by startAuth whenever the signed-in account changes */
export async function loadRole(userId: string | null) {
  if (userId === current) return;
  current = userId;
  if (!userId) return useRole.setState({ role: null, loaded: true });
  useRole.setState({ role: null, loaded: false });
  const { data } = await supabase.from("staff").select("*").eq("user_id", userId).maybeSingle();
  if (current !== userId) return;
  // before roles.sql is run the table has no role column: the owner's row counts as admin
  const role = data ? ((data.role as Role | undefined) ?? "admin") : null;
  useRole.setState({ role, loaded: true });
  // team members also see draft courses (for previews and the Course Builder)
  if (role) import("./catalog").then((m) => m.loadCatalog(true));
}

/** Which roles may open each workspace page (admin may open all) */
export const pageAccess: Record<string, Role[]> = {
  "/staff/": roles,
  "/staff/users/": ["support", "finance", "academic"],
  "/staff/team/": [],
  "/staff/enrollments/": ["finance"],
  "/staff/courses/": ["academic", "finance"],
  "/staff/courses/edit/": ["academic", "finance"],
  "/staff/inbox/": ["support"],
  "/staff/teachers/": ["finance", "academic"],
  "/staff/payouts/": ["finance"],
  "/staff/questions/": ["teacher", "academic"],
  "/staff/lessons/": ["teacher"],
  "/staff/students/": ["teacher"],
  "/staff/assignments/": ["teacher"],
  "/staff/availability/": ["teacher"],
  "/staff/earnings/": ["teacher"],
  "/staff/my-profile/": ["teacher"],
  "/staff/soon/": roles,
};

/** Pages outside /staff/ that team accounts may open (everything else in the learner portal sends them to /staff/) */
export const staffAlsoAllowed = ["/settings", "/help"];

/** Public-site pages team accounts may open: lesson previews, teacher pages, password reset.
 *  Everything made for learners (home, catalog, placement, review, checkout…) sends them to /staff/. */
export const staffPublicAllowed = ["/learn", "/instructors", "/reset-password"];

export const can = (role: Role | null, page: string) =>
  !!role && (role === "admin" || (pageAccess[page] ?? []).includes(role));

/** Turn a Postgres/RPC error into a short message */
export function rpcError(e: { message?: string; code?: string } | null) {
  if (!e) return "";
  const m = e.message ?? "";
  if (e.code === "PGRST202" || /function .* does not exist|schema cache/i.test(m))
    return "The database is not ready yet: run supabase/roles.sql in the Supabase SQL Editor.";
  if (/fetch|network/i.test(m)) return "Can't reach the server. Check your connection and try again.";
  return m;
}
