"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";

/** "Start for Free": signed-in learners go to their dashboard, visitors go to sign-up */
export function StartFreeLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  return (
    <Link href={user ? "/dashboard/" : "/register/"} className={className}>
      {children}
    </Link>
  );
}
