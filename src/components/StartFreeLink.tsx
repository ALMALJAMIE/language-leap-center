"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRole } from "@/lib/roles";

/** "Start for Free": signed-in learners go to their dashboard, visitors go to sign-up */
export function StartFreeLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  const role = useRole((s) => s.role);
  return (
    <Link href={role ? "/staff/" : user ? "/dashboard/" : "/register/"} className={className}>
      {children}
    </Link>
  );
}
