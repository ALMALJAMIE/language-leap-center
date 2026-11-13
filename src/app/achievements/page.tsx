"use client";

import { Lock } from "lucide-react";
import { AccountShell } from "@/components/account/AccountShell";
import { badges, earned } from "@/lib/achievements";
import { useMounted, useProgress } from "@/lib/store";

export default function Achievements() {
  const mounted = useMounted();
  const p = useProgress();
  if (!mounted) return <AccountShell title="Achievements"><div className="min-h-[50vh]" /></AccountShell>;
  const list = badges(p);
  const got = list.filter(earned).length;

  return (
    <AccountShell title="Achievements" subtitle={`${got} of ${list.length} badges unlocked`}>
      <div className="mb-8 h-3 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-gold-300 to-gold-500" style={{ width: `${(got / list.length) * 100}%` }} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((b) => {
          const ok = earned(b);
          return (
            <div key={b.id} className={`rounded-3xl border p-5 ${ok ? "border-gold-200 bg-gradient-to-br from-gold-50 to-white" : "border-slate-200 bg-white"}`}>
              <div className="flex items-center gap-4">
                <span className={`grid h-14 w-14 place-items-center rounded-2xl text-3xl ${ok ? "bg-white shadow-sm" : "bg-slate-100 grayscale"}`}>
                  {ok ? b.icon : <Lock className="h-6 w-6 text-slate-400" />}
                </span>
                <div>
                  <div className="font-bold">{b.name}</div>
                  <div className="text-sm text-slate-500">{b.desc}</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className={`h-full rounded-full ${ok ? "bg-gold-400" : "bg-brand-400"}`} style={{ width: `${Math.min(1, b.value / b.goal) * 100}%` }} />
                </div>
                <span className="text-xs font-bold text-slate-500">{Math.min(b.value, b.goal)}/{b.goal}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AccountShell>
  );
}
