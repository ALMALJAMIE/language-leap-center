"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import mark from "@/assets/logo-mark-t.png";
import { getCourse, levels } from "@/data/courses";
import { certificateId, courseProgress } from "@/lib/account";
import { displayName, useAuth } from "@/lib/auth";
import { useMounted, useProgress } from "@/lib/store";
import { SignInPrompt } from "@/components/account/AccountShell";
import { courseHref } from "@/data/courses";

export function CertificateView() {
  const params = useSearchParams();
  const course = getCourse(params.get("course") ?? "");
  const mounted = useMounted();
  const completed = useProgress((s) => s.completed);
  const { user, ready } = useAuth();

  if (!mounted || !ready) return <div className="min-h-[60vh]" />;
  if (!course) return <p className="py-20 text-center text-slate-500">Certificate not found.</p>;
  if (!user) return <div className="mx-auto max-w-xl px-6 py-16"><SignInPrompt text="Sign in to view your certificate." /></div>;

  const pr = courseProgress(course, completed);
  if (!pr.certified)
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center text-slate-600">
        Finish every lesson in {course.title} to unlock this certificate.
        <div><Link href={courseHref(course.slug)} className="btn-primary mt-6 inline-block px-6 py-3">Go to the course</Link></div>
      </div>
    );

  const date = new Date(pr.finishedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="certificate-page bg-mist px-4 py-8">
      <div className="no-print mx-auto mb-6 flex max-w-5xl items-center justify-between">
        <Link href="/certificates/" className="flex items-center gap-1.5 text-sm font-bold text-slate-600 hover:text-ink"><ArrowLeft className="h-4 w-4" /> My certificates</Link>
        <button onClick={() => window.print()} className="btn-primary flex items-center gap-2 px-5 py-2.5 text-sm"><Printer className="h-4 w-4" /> Print / Save as PDF</button>
      </div>

      <div className="certificate mx-auto aspect-[1.414] w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-2xl">
        <div className="relative flex h-full flex-col items-center justify-between border-[14px] border-brand-800 p-[5%] text-center">
          <div className="pointer-events-none absolute inset-3 border-2 border-gold-400" />
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border-[40px] border-brand-50" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full border-[44px] border-gold-50" />

          <div className="relative flex flex-col items-center">
            <Image src={mark} alt="" className="h-[clamp(36px,7vw,72px)] w-auto" />
            <div className="mt-2 text-[clamp(9px,1.3vw,14px)] font-extrabold tracking-[0.35em] text-brand-700">LANGUAGE LEAP CENTER</div>
          </div>

          <div className="relative">
            <div className="text-[clamp(18px,4vw,44px)] font-extrabold tracking-wide text-brand-900">Certificate of Completion</div>
            <div className="mt-[2%] text-[clamp(10px,1.5vw,16px)] text-slate-500">This is to certify that</div>
            <div className="mx-auto mt-[2%] w-fit border-b-2 border-gold-400 px-8 pb-2 font-serif text-[clamp(22px,4.6vw,52px)] italic text-ink">{displayName(user)}</div>
            <div className="mt-[3%] text-[clamp(10px,1.5vw,16px)] text-slate-500">has successfully completed the course</div>
            <div className="mt-[1.5%] text-[clamp(14px,2.6vw,28px)] font-bold text-brand-700">{course.title}</div>
            <div className="mt-[1%] text-[clamp(9px,1.3vw,14px)] text-slate-500">
              CEFR level {course.level} · {levels[course.level].name} · {course.hours} hours
            </div>
          </div>

          <div className="relative grid w-full grid-cols-3 items-end text-[clamp(8px,1.2vw,13px)] text-slate-500">
            <div>
              <div className="font-semibold text-ink">{date}</div>
              <div className="mx-auto mt-1 w-3/4 border-t border-slate-300 pt-1">Date</div>
            </div>
            <div className="flex justify-center">
              <div className="grid aspect-square w-[clamp(54px,9vw,96px)] place-items-center rounded-full bg-gradient-to-br from-gold-300 to-gold-500 text-[clamp(7px,1vw,11px)] font-extrabold leading-tight text-brand-900 shadow-lg ring-4 ring-gold-100">
                LLC
                <br />
                CERTIFIED
              </div>
            </div>
            <div>
              <div className="font-mono font-semibold text-ink">{certificateId(user.id, course.slug)}</div>
              <div className="mx-auto mt-1 w-3/4 border-t border-slate-300 pt-1">Certificate ID</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
