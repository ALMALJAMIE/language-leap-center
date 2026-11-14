"use client";

import { create } from "zustand";
import { supabase } from "./auth";
import { builtInCourses, courses } from "@/data/courses";
import type { Course } from "./types";

/** A course row from the Course Builder */
export interface CourseRow {
  slug: string;
  data: Omit<Course, "slug" | "price">;
  price: number;
  published: boolean;
  updated_at: string;
}

interface CatalogState {
  /** bumps whenever the course list changes, so pages re-render */
  version: number;
  loaded: boolean;
}
export const useCatalog = create<CatalogState>()(() => ({ version: 0, loaded: false }));

export const rowToCourse = (r: CourseRow): Course => ({ ...(r.data as Course), slug: r.slug, price: Number(r.price) });

let inFlight: Promise<void> | null = null;

/**
 * Loads Course Builder rows and merges them into the shared `courses` list:
 * a published row replaces the built-in course with the same slug (or adds a new one),
 * an unpublished row hides it from learners. Team members also see drafts.
 */
export function loadCatalog(includeDrafts = false) {
  if (inFlight) return inFlight;
  inFlight = (async () => {
    const timeout = new Promise<{ data: null; error: { message: string } }>((r) => setTimeout(() => r({ data: null, error: { message: "timeout" } }), 8000));
    const { data, error } = await Promise.race([supabase.from("courses").select("slug,data,price,published,updated_at"), timeout]);
    inFlight = null;
    if (error || !data) return useCatalog.setState({ loaded: true });
    const rows = data as CourseRow[];
    const merged: Course[] = builtInCourses.map((c) => ({ ...c }));
    for (const r of rows) {
      const i = merged.findIndex((c) => c.slug === r.slug);
      if (!r.published && !includeDrafts) {
        if (i >= 0) merged.splice(i, 1);
        continue;
      }
      if (i >= 0) merged[i] = rowToCourse(r);
      else merged.push(rowToCourse(r));
    }
    merged.sort((a, b) => a.order - b.order);
    const changed = JSON.stringify(merged) !== JSON.stringify(courses);
    if (changed) courses.splice(0, courses.length, ...merged);
    useCatalog.setState((s) => ({ loaded: true, version: changed ? s.version + 1 : s.version }));
  })();
  return inFlight;
}
