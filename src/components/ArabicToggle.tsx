"use client";

import { Languages } from "lucide-react";
import { useMounted, useProgress } from "@/lib/store";

/** Lets beginners show Arabic translations. Off by default: the platform is English-first. */
export function ArabicToggle({ className = "" }: { className?: string }) {
  const mounted = useMounted();
  const { arabicHelp, toggleArabic } = useProgress();
  const on = mounted && arabicHelp;
  return (
    <button
      onClick={toggleArabic}
      title="Show Arabic translations"
      aria-pressed={on}
      className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
        on ? "border-gold-400 bg-gold-50 text-gold-700" : "border-slate-200 text-slate-500 hover:border-brand-300"
      } ${className}`}
    >
      <Languages className="h-4 w-4" />
      <span>Arabic help</span>
      <span className={`h-4 w-7 rounded-full p-0.5 transition ${on ? "bg-gold-400" : "bg-slate-200"}`}>
        <span className={`block h-3 w-3 rounded-full bg-white transition ${on ? "translate-x-3" : ""}`} />
      </span>
    </button>
  );
}

/** Renders Arabic text only when Arabic help is on */
export function ArHint({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const mounted = useMounted();
  const on = useProgress((s) => s.arabicHelp);
  if (!mounted || !on) return null;
  return <span className={`ar ${className}`}>{children}</span>;
}
