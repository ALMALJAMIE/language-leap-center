"use client";

import Link from "next/link";
import { Award, Lock, Eye } from "lucide-react";
import { courses } from "@/data/courses";
import { AccountShell, SignInPrompt } from "@/components/account/AccountShell";
import { certificateId, courseProgress } from "@/lib/account";
import { useAuth } from "@/lib/auth";
import { useMounted, useProgress } from "@/lib/store";
import { courseHref } from "@/data/courses";

export default function Certificates() {
  const mounted = useMounted();
  const completed = useProgress((s) => s.completed);
  const user = useAuth((s) => s.user);

  if (!mounted) return <AccountShell title="Certificates"><div className="min-h-[50vh]" /></AccountShell>;

  const items = courses.filter((c) => c.certificate).map((c) => ({ c, pr: courseProgress(c, completed) }));
  const earned = items.filter((x) => x.pr.certified);
  const others = items.filter((x) => !x.pr.certified);

  return (
    <AccountShell title="Certificates" subtitle="Finish every lesson in a course to earn its certificate">
      {earned.length > 0 &&
        (user ? (
          <div className="mb-8 grid gap-5 md:grid-cols-2">
            {earned.map(({ c, pr }) => (
              <div key={c.slug} className="relative overflow-hidden rounded-3xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-white p-6">
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-[16px] border-gold-200/60" />
                <Award className="relative h-10 w-10 text-gold-500" />
                <h3 className="relative mt-3 text-lg font-bold">{c.title}</h3>
                <p className="relative mt-1 text-sm text-slate-600">
                  Completed {new Date(pr.finishedAt!).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                <p className="relative mt-1 font-mono text-xs text-slate-400">{certificateId(user.id, c.slug)}</p>
                <Link href={`/certificates/view/?course=${c.slug}`} className="btn-primary relative mt-5 inline-flex items-center gap-2 px-5 py-2.5 text-sm">
                  <Eye className="h-4 w-4" /> View & download
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-8">
            <SignInPrompt text={`You've earned ${earned.length} certificate${earned.length > 1 ? "s" : ""}! Sign in so we can put your name on it.`} />
          </div>
        ))}

      {earned.length === 0 && (
        <div className="mb-8 rounded-3xl bg-mist p-6 text-center text-slate-600">
          No certificates yet. Complete <Link href="/courses/general-english-1/" className="font-bold text-brand-600">General English 1</Link> to earn your first one.
        </div>
      )}

      <h2 className="mb-4 font-bold">Available certificates</h2>
      <div className="space-y-3">
        {others.map(({ c, pr }) => (
          <div key={c.slug} className="flex items-center gap-4 rounded-2xl border border-slate-200 p-4">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-400"><Lock className="h-5 w-5" /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-semibold">{c.title}</div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gold-400" style={{ width: `${pr.total ? (pr.done / (pr.total + pr.upcoming)) * 100 : 0}%` }} />
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {pr.done}/{pr.total + pr.upcoming} lessons{pr.upcoming ? ` · ${pr.upcoming} still being prepared` : ""}
              </div>
            </div>
            <Link href={courseHref(c.slug)} className="text-sm font-bold text-brand-600">Open →</Link>
          </div>
        ))}
      </div>
    </AccountShell>
  );
}
