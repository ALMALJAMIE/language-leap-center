"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/** Global UI state shared by the public site and the learner portal */
export const useUI = create<{ searchOpen: boolean; setSearch: (v: boolean) => void; drawer: boolean; setDrawer: (v: boolean) => void }>()((set) => ({
  searchOpen: false,
  setSearch: (searchOpen) => set({ searchOpen }),
  drawer: false,
  setDrawer: (drawer) => set({ drawer }),
}));

/** Persisted portal preferences */
export const usePortalPrefs = create<{
  collapsed: boolean;
  dismissed: string[];
  readNotes: string[];
  toggleCollapsed: () => void;
  dismiss: (id: string) => void;
  markRead: (ids: string[]) => void;
}>()(
  persist(
    (set, get) => ({
      collapsed: false,
      dismissed: [],
      readNotes: [],
      toggleCollapsed: () => set({ collapsed: !get().collapsed }),
      dismiss: (id) => set({ dismissed: [...get().dismissed, id] }),
      markRead: (ids) => set({ readNotes: Array.from(new Set([...get().readNotes, ...ids])) }),
    }),
    { name: "llc-portal-v1" },
  ),
);

/** Routes that use the learner-portal layout (sidebar) instead of the public site layout */
export const portalRoutes = [
  "/dashboard",
  "/advanced",
  "/my-courses",
  "/progress",
  "/assessments",
  "/review",
  "/certificates",
  "/private-lessons",
  "/resources",
  "/profile",
  "/achievements",
  "/settings",
  "/subscription",
  "/refer",
  "/help",
  "/coming-soon",
  "/checkout",
];

export const isPortal = (path: string | null) => !!path && portalRoutes.some((r) => path === r || path.startsWith(r + "/"));
