"use client";

import { create } from "zustand";
import { supabase, useAuth } from "./auth";
import type { Course } from "./types";

/**
 * Paid courses open only for learners with a row in the `enrollments` table.
 * Learners can read their own rows but cannot add them: the center adds a row
 * (in Supabase → Table Editor) once payment is confirmed.
 */
export const useEnrollments = create<{ slugs: string[]; loaded: boolean; userId: string | null }>(() => ({
  slugs: [],
  loaded: false,
  userId: null,
}));

export async function loadEnrollments(userId: string | null) {
  if (!userId) {
    useEnrollments.setState({ slugs: [], loaded: true, userId: null });
    return;
  }
  // never leave the learner waiting on a slow network: give up after 8 seconds
  const timeout = new Promise<{ data: null; error: Error }>((r) => setTimeout(() => r({ data: null, error: new Error("timeout") }), 8000));
  const { data, error } = await Promise.race([supabase.from("enrollments").select("course_slug").eq("user_id", userId), timeout]);
  useEnrollments.setState({ slugs: error ? [] : (data ?? []).map((r: { course_slug: string }) => r.course_slug), loaded: true, userId });
}

/** "open" = can study, "locked" = must enroll, "checking" = still loading */
export function useCourseAccess(course: Course): "open" | "locked" | "checking" {
  const { user, ready } = useAuth();
  const { slugs, loaded, userId } = useEnrollments();
  if (course.price === 0) return "open";
  if (!ready) return "checking";
  if (!user) return "locked";
  if (!loaded || userId !== user.id) return "checking";
  return slugs.includes(course.slug) ? "open" : "locked";
}
