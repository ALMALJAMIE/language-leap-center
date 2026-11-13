"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createEmptyCard, fsrs, generatorParameters, Rating, TypeConvert, type Card, type Grade } from "ts-fsrs";
import type { Level, Word } from "./types";

/** FSRS spaced-repetition scheduler (the algorithm used by modern Anki) */
export const scheduler = fsrs(generatorParameters({ enable_fuzz: true, request_retention: 0.9 }));

export const todayKey = (d = new Date()) => d.toLocaleDateString("en-CA"); // YYYY-MM-DD in local time

const dayDiff = (a: string, b: string) => Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);

export interface SavedCard {
  word: Word;
  course: string;
  card: Card;
}

interface Progress {
  xp: number;
  xpByDay: Record<string, number>;
  streak: number;
  bestStreak: number;
  lastActive: string | null;
  dailyGoal: number;
  completed: Record<string, { accuracy: number; xp: number; at: string }>;
  cards: Record<string, SavedCard>;
  wishlist: string[];
  placement: { level: Level; score: number; total: number; at: string } | null;
  name: string;
  arabicHelp: boolean;

  addXp: (n: number) => void;
  completeLesson: (course: string, lesson: string, xp: number, accuracy: number, words: Word[]) => void;
  review: (key: string, grade: Grade) => void;
  toggleWish: (slug: string) => void;
  setPlacement: (level: Level, score: number, total: number) => void;
  setGoal: (n: number) => void;
  setName: (s: string) => void;
  toggleArabic: () => void;
  reset: () => void;
}

const initial = {
  xp: 0,
  xpByDay: {},
  streak: 0,
  bestStreak: 0,
  lastActive: null,
  dailyGoal: 30,
  completed: {},
  cards: {},
  wishlist: [],
  placement: null,
  name: "",
  arabicHelp: false,
};

export const useProgress = create<Progress>()(
  persist(
    (set, get) => ({
      ...initial,

      addXp: (n) => {
        const t = todayKey();
        const { lastActive, streak, bestStreak, xpByDay, xp } = get();
        let s = streak;
        if (lastActive !== t) s = lastActive && dayDiff(lastActive, t) === 1 ? streak + 1 : 1;
        set({
          xp: xp + n,
          xpByDay: { ...xpByDay, [t]: (xpByDay[t] ?? 0) + n },
          streak: s,
          bestStreak: Math.max(bestStreak, s),
          lastActive: t,
        });
      },

      completeLesson: (course, lesson, xp, accuracy, words) => {
        const key = `${course}/${lesson}`;
        const prev = get().completed[key];
        const cards = { ...get().cards };
        const now = new Date();
        words.forEach((w) => {
          const k = w.en.toLowerCase();
          if (!cards[k]) cards[k] = { word: w, course, card: createEmptyCard(now) };
        });
        set({
          cards,
          completed: {
            ...get().completed,
            [key]: { accuracy: Math.max(accuracy, prev?.accuracy ?? 0), xp, at: now.toISOString() },
          },
        });
        get().addXp(xp);
      },

      review: (key, grade) => {
        const c = get().cards[key];
        if (!c) return;
        const card = TypeConvert.card(c.card);
        const next = scheduler.next(card, new Date(), grade).card;
        set({ cards: { ...get().cards, [key]: { ...c, card: next } } });
        get().addXp(grade === Rating.Again ? 1 : 2);
      },

      toggleWish: (slug) => {
        const w = get().wishlist;
        set({ wishlist: w.includes(slug) ? w.filter((x) => x !== slug) : [...w, slug] });
      },

      setPlacement: (level, score, total) => set({ placement: { level, score, total, at: new Date().toISOString() } }),
      setGoal: (n) => set({ dailyGoal: n }),
      setName: (s) => set({ name: s }),
      toggleArabic: () => set({ arabicHelp: !get().arabicHelp }),
      reset: () => set({ ...initial }),
    }),
    { name: "llc-progress-v1" },
  ),
);

/** Avoids server/client mismatch before progress is read from localStorage */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function dueCards(cards: Record<string, SavedCard>, now = new Date()) {
  return Object.entries(cards)
    .filter(([, c]) => new Date(c.card.due).getTime() <= now.getTime())
    .sort((a, b) => new Date(a[1].card.due).getTime() - new Date(b[1].card.due).getTime());
}

/** When the card would come back for each rating */
export function previewIntervals(saved: SavedCard) {
  const now = new Date();
  const rec = scheduler.repeat(TypeConvert.card(saved.card), now);
  const fmt = (d: Date) => {
    const mins = Math.round((d.getTime() - now.getTime()) / 60000);
    if (mins < 60) return `${Math.max(1, mins)}m`;
    const h = Math.round(mins / 60);
    if (h < 24) return `${h}h`;
    const days = Math.round(h / 24);
    if (days < 30) return `${days}d`;
    return `${Math.round(days / 30)}mo`;
  };
  return {
    [Rating.Again]: fmt(rec[Rating.Again].card.due),
    [Rating.Hard]: fmt(rec[Rating.Hard].card.due),
    [Rating.Good]: fmt(rec[Rating.Good].card.due),
    [Rating.Easy]: fmt(rec[Rating.Easy].card.due),
  } as Record<Grade, string>;
}

export { Rating };
