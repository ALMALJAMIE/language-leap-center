"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Award, CheckCircle2, Heart, Play } from "lucide-react";
import { courses, levels } from "@/data/courses";
import { CourseCover } from "@/components/CourseCard";
import { AccountShell } from "@/components/account/AccountShell";
import { courseProgress, startedCourses } from "@/lib/account";
import { useMounted, useProgress } from "@/lib/store";

type Tab = "all" | "active" | "completed" | "wishlist";
const TABS: Tab[] = ["all", "active", "completed", "wishlist"];

function MyCoursesInner() {
  const mounted = useMounted();
  const { completed, wishlist, toggleWish } = useProgress();
  const router = useRouter();
  const q = useSearchParams().get("tab") as Tab | null;
  const tab: Tab = q && TABS.includes(q) ? q : "all";
  const setTab = (t: Tab) => router.replace(`/my-courses/?tab=${t}`, { scroll: false });

  if (!mounted) return <AccountShell title="My Courses"><div className="min-h-[50vh]" /></AccountShell>;

  const started = startedCourses(completed).map((c) => ({ c, pr: courseProgress(c, completed) }));
  const wished = courses.filter((c) => wishlist.includes(c.slug)).map((c) => ({ c, pr: courseProgress(c, completed) }));
  const lists: Record<Tab, typeof started> = {
    all: [...started, ...wished.filter((w) => !started.some((s) => s.c.slug === w.c.slug))],
    active: started.filter((x) => !x.pr.allPublishedDone),
    completed: started.filter((x) => x.pr.allPublishedDone),
    wishlist: wished,
  };
  const tabs: { id: Tab; label: string }[] = [
    { id: "all", label: "All Courses" },
    { id: "active", label: "Active Courses" },
    { id: "completed", label: "Completed" },
    { id: "wishlist", label: "Wishlist" },
  ];
  const list = lists[tab];

  return (
    <AccountShell title="My Courses" subtitle="Courses you've started, finished or saved for later">
      <div className="mb-6 flex gap-2 border-b border-slate-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-bold transition ${tab === t.id ? "border-gold-400 text-brand-700" : "border-transparent text-slate-500 hover:text-ink"}`}
          >
            {t.label} <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs">{lists[t.id].length}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 p-10 text-center">
          <p className="text-slate-500">
            {tab === "wishlist" ? "Tap the ♡ on any course to save it here." : tab === "completed" ? "Finished courses will appear here." : tab === "active" ? "You have no courses in progress." : "You haven't started or saved a course yet."}
          </p>
          <Link href="/courses/" className="btn-primary mt-5 inline-block px-6 py-3">Browse courses</Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {list.map(({ c, pr }) => (
            <div key={c.slug} className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
              <div className="flex">
                <CourseCover course={c} className="w-32 shrink-0" />
                <div className="min-w-0 flex-1 p-5">
                  <div className="text-xs font-bold text-gold-600">{c.level} · {levels[c.level].name}</div>
                  <h3 className="mt-1 font-bold leading-snug">{c.title}</h3>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${pr.allPublishedDone ? "bg-emerald-500" : "bg-gold-400"}`} style={{ width: `${pr.pct * 100}%` }} />
                  </div>
                  <div className="mt-1.5 text-xs text-slate-500">
                    {pr.done}/{pr.total} lessons{pr.upcoming ? ` · ${pr.upcoming} coming soon` : ""}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
                {tab === "wishlist" || (tab === "all" && pr.done === 0) ? (
                  <button onClick={() => toggleWish(c.slug)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500">
                    <Heart className="h-4 w-4 fill-red-500 text-red-500" /> Remove
                  </button>
                ) : pr.certified ? (
                  <Link href="/certificates/" className="flex items-center gap-1.5 text-sm font-bold text-emerald-600"><Award className="h-4 w-4" /> Certificate ready</Link>
                ) : pr.allPublishedDone ? (
                  <span className="flex items-center gap-1.5 text-sm font-bold text-emerald-600"><CheckCircle2 className="h-4 w-4" /> All lessons done</span>
                ) : (
                  <span className="text-sm text-slate-500">{Math.round(pr.pct * 100)}% complete</span>
                )}
                {pr.next ? (
                  <Link href={`/learn/${c.slug}/${pr.next.id}/`} className="flex items-center gap-1.5 text-sm font-bold text-brand-600"><Play className="h-4 w-4" /> {pr.done ? "Continue" : "Start"}</Link>
                ) : (
                  <Link href={`/courses/${c.slug}/`} className="text-sm font-bold text-brand-600">Open course →</Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}

export default function MyCourses() {
  return (
    <Suspense>
      <MyCoursesInner />
    </Suspense>
  );
}
