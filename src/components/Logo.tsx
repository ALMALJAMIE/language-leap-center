import Image from "next/image";
import mark from "@/assets/logo-mark-t.png";

export function Logo({ compact = false, light = false }: { compact?: boolean; light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <Image src={mark} alt="Language Leap Center" className="h-10 w-auto" priority />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`text-[13px] font-extrabold tracking-[0.18em] ${light ? "text-white" : "text-brand-700"}`}>
            LANGUAGE LEAP
          </span>
          <span className={`text-[10px] font-semibold tracking-[0.42em] ${light ? "text-gold-300" : "text-gold-500"}`}>
            CENTER
          </span>
        </span>
      )}
    </span>
  );
}
