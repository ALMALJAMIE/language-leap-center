import { courses } from "@/data/courses";
import { courseProgress } from "./account";
import type { SavedCard } from "./store";

interface P {
  xp: number;
  bestStreak: number;
  completed: Record<string, { accuracy: number; xp: number; at: string }>;
  cards: Record<string, SavedCard>;
  placement: unknown;
}

export interface Badge {
  id: string;
  icon: string;
  name: string;
  desc: string;
  value: number;
  goal: number;
}

/** All badges with progress toward each one */
export function badges(p: P): Badge[] {
  const lessons = Object.keys(p.completed).length;
  const words = Object.keys(p.cards).length;
  const perfect = Object.values(p.completed).filter((c) => c.accuracy >= 0.999).length;
  const reviewed = Object.values(p.cards).filter((c) => c.card.reps > 0).length;
  const certs = courses.filter((c) => courseProgress(c, p.completed).certified).length;
  return [
    { id: "first", icon: "🚀", name: "First Leap", desc: "Finish your first lesson", value: lessons, goal: 1 },
    { id: "unit", icon: "🏅", name: "Unit Done", desc: "Finish 3 lessons", value: lessons, goal: 3 },
    { id: "ten", icon: "📘", name: "Bookworm", desc: "Finish 10 lessons", value: lessons, goal: 10 },
    { id: "placed", icon: "🧭", name: "Know Your Level", desc: "Take the placement test", value: p.placement ? 1 : 0, goal: 1 },
    { id: "streak3", icon: "🔥", name: "On Fire", desc: "Keep a 3-day streak", value: p.bestStreak, goal: 3 },
    { id: "streak7", icon: "👑", name: "Golden Week", desc: "Keep a 7-day streak", value: p.bestStreak, goal: 7 },
    { id: "words30", icon: "📚", name: "Word Collector", desc: "Learn 30 words", value: words, goal: 30 },
    { id: "words100", icon: "🧠", name: "Word Master", desc: "Learn 100 words", value: words, goal: 100 },
    { id: "review", icon: "🔁", name: "Never Forget", desc: "Review 20 words", value: reviewed, goal: 20 },
    { id: "perfect", icon: "🎯", name: "Perfectionist", desc: "Finish a lesson with no mistakes", value: perfect, goal: 1 },
    { id: "xp100", icon: "⚡", name: "100 XP", desc: "Earn 100 XP", value: p.xp, goal: 100 },
    { id: "xp500", icon: "💎", name: "500 XP", desc: "Earn 500 XP", value: p.xp, goal: 500 },
    { id: "cert", icon: "🎓", name: "Certified", desc: "Earn your first certificate", value: certs, goal: 1 },
  ];
}

export const earned = (b: Badge) => b.value >= b.goal;
