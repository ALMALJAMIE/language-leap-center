"use client";

import { initials } from "@/lib/auth";
import { useProfile } from "@/lib/profile";

/** Round avatar: the profile photo if there is one, otherwise the initials */
export function UserAvatar({ name, className = "h-10 w-10 text-sm" }: { name: string; className?: string }) {
  const avatar = useProfile((s) => s.avatar);
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-brand-800 font-bold text-white ring-2 ring-gold-300 ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : initials(name)}
    </span>
  );
}
