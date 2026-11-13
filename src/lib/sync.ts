"use client";

import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase } from "./auth";
import { useProgress, type SavedCard } from "./store";

/**
 * Keeps the learner's progress in Supabase (table: learner_progress) so it follows
 * the account across devices. If the table does not exist yet, everything keeps
 * working locally and sync simply stays "offline".
 */

type Snap = ReturnType<typeof snapshot>;

export const useSync = create<{ status: "idle" | "syncing" | "saved" | "offline" }>(() => ({ status: "idle" }));

function snapshot() {
  const s = useProgress.getState();
  return {
    xp: s.xp,
    xpByDay: s.xpByDay,
    streak: s.streak,
    bestStreak: s.bestStreak,
    lastActive: s.lastActive,
    dailyGoal: s.dailyGoal,
    completed: s.completed,
    cards: s.cards,
    wishlist: s.wishlist,
    placement: s.placement,
  };
}

const later = (a: string | null | undefined, b: string | null | undefined) => (a ?? "") >= (b ?? "");

function newerCard(a: SavedCard, b: SavedCard) {
  if (a.card.reps !== b.card.reps) return a.card.reps > b.card.reps ? a : b;
  return later(String(a.card.last_review ?? ""), String(b.card.last_review ?? "")) ? a : b;
}

function merge(local: Snap, remote: Partial<Snap>): Snap {
  const xpByDay = { ...(remote.xpByDay ?? {}) };
  for (const [d, v] of Object.entries(local.xpByDay)) xpByDay[d] = Math.max(v, xpByDay[d] ?? 0);

  const completed = { ...(remote.completed ?? {}) };
  for (const [k, v] of Object.entries(local.completed)) {
    const r = completed[k];
    completed[k] = !r ? v : { ...v, accuracy: Math.max(v.accuracy, r.accuracy), at: later(v.at, r.at) ? v.at : r.at };
  }

  const cards = { ...(remote.cards ?? {}) };
  for (const [k, v] of Object.entries(local.cards)) cards[k] = cards[k] ? newerCard(v, cards[k]) : v;

  const localIsLater = later(local.lastActive, remote.lastActive);
  return {
    xp: Math.max(local.xp, remote.xp ?? 0),
    xpByDay,
    streak: localIsLater ? local.streak : (remote.streak ?? local.streak),
    bestStreak: Math.max(local.bestStreak, remote.bestStreak ?? 0),
    lastActive: localIsLater ? local.lastActive : (remote.lastActive ?? null),
    dailyGoal: remote.dailyGoal ?? local.dailyGoal,
    completed,
    cards,
    wishlist: Array.from(new Set([...(remote.wishlist ?? []), ...local.wishlist])),
    placement:
      local.placement && remote.placement
        ? later(local.placement.at, remote.placement.at)
          ? local.placement
          : remote.placement
        : (local.placement ?? remote.placement ?? null),
  };
}

let unsub: (() => void) | null = null;
let timer: ReturnType<typeof setTimeout> | null = null;
let currentUser: string | null = null;

async function push(userId: string) {
  useSync.setState({ status: "syncing" });
  const { error } = await supabase
    .from("learner_progress")
    .upsert({ user_id: userId, data: snapshot(), updated_at: new Date().toISOString() });
  useSync.setState({ status: error ? "offline" : "saved" });
}

export async function onUserChange(user: User | null) {
  if (user?.id === currentUser) return;
  import("./profile").then((m) => m.loadProfile(user?.id ?? null));
  import("./enrollments").then((m) => m.loadEnrollments(user?.id ?? null));
  unsub?.();
  unsub = null;

  if (!user) {
    // Signed out: progress is safe in the cloud, so clear this device
    if (currentUser) useProgress.getState().reset();
    currentUser = null;
    useSync.setState({ status: "idle" });
    return;
  }

  currentUser = user.id;
  useSync.setState({ status: "syncing" });
  const { data, error } = await supabase.from("learner_progress").select("data").eq("user_id", user.id).maybeSingle();
  if (error) {
    useSync.setState({ status: "offline" });
  } else {
    const merged = merge(snapshot(), (data?.data as Partial<Snap>) ?? {});
    useProgress.setState(merged);
    await push(user.id);
  }

  unsub = useProgress.subscribe(() => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => currentUser && push(currentUser), 1500);
  });
}
