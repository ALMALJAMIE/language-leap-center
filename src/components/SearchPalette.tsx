"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import {
  BookOpen,
  CornerDownLeft,
  GraduationCap,
  Search,
  Compass,
} from "lucide-react";
import { courseLessons, courses, levels } from "@/data/courses";

type Item = {
  href: string;
  title: string;
  sub: string;
  kind: "course" | "lesson" | "page";
};

const pages: Item[] = [
  {
    href: "/courses/",
    title: "All courses",
    sub: "Browse the catalog",
    kind: "page",
  },
  {
    href: "/placement/",
    title: "Placement test",
    sub: "Find your level",
    kind: "page",
  },
  {
    href: "/review/",
    title: "Spaced review",
    sub: "Review your words",
    kind: "page",
  },
  {
    href: "/dashboard/",
    title: "Learner dashboard",
    sub: "Continue learning",
    kind: "page",
  },
  { href: "/levels/", title: "Levels", sub: "All skill levels, A1 to C1", kind: "page" },
  { href: "/my-courses/", title: "My courses", sub: "Courses you started", kind: "page" },
  { href: "/certificates/", title: "Certificates", sub: "Your earned certificates", kind: "page" },
  { href: "/progress/", title: "Progress", sub: "XP, streak and badges", kind: "page" },
  { href: "/profile/", title: "Profile", sub: "Account and preferences", kind: "page" },
];

const index: Item[] = [
  ...courses.map((c) => ({
    href: `/courses/${c.slug}/`,
    title: c.title,
    sub: `${c.level} · ${levels[c.level].name}`,
    kind: "course" as const,
  })),
  ...courses.flatMap((c) =>
    courseLessons(c).map((l) => ({
      href: `/learn/${c.slug}/${l.id}/`,
      title: l.title,
      sub: `${c.title} · ${l.words
        .map((w) => w.en)
        .slice(0, 4)
        .join(", ")}`,
      kind: "lesson" as const,
    })),
  ),
  ...pages,
];

const icons = { course: GraduationCap, lesson: BookOpen, page: Compass };

export function SearchPalette({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>{open && <Palette onClose={onClose} />}</AnimatePresence>
  );
}

function Palette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s)
      return [
        ...courses
          .slice(0, 4)
          .map((c) => index.find((i) => i.href === `/courses/${c.slug}/`)!),
        ...pages.slice(0, 2),
      ];
    // also match words taught inside lessons
    return index
      .filter((i) => {
        if (`${i.title} ${i.sub}`.toLowerCase().includes(s)) return true;
        if (i.kind !== "lesson") return false;
        const [, , slug, id] = i.href.split("/");
        const l = courseLessons(courses.find((c) => c.slug === slug)!).find(
          (x) => x.id === id,
        );
        return l?.words.some((w) => w.en.toLowerCase().includes(s));
      })
      .slice(0, 8);
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 30);
    return () => clearTimeout(t);
  }, []);

  const go = (i: Item) => {
    onClose();
    router.push(i.href);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[60] flex items-start justify-center bg-brand-950/40 px-4 pt-[12vh] backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={onClose}
    >
      <motion.div
        initial={{ y: -10, scale: 0.98 }}
        animate={{ y: 0, scale: 1 }}
        className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, results.length - 1));
              }
              if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              }
              if (e.key === "Enter" && results[active]) go(results[active]);
              if (e.key === "Escape") onClose();
            }}
            placeholder="Search courses, lessons or words…"
            className="h-14 flex-1 bg-transparent text-base outline-none"
          />
          <kbd className="rounded-md border border-slate-200 px-1.5 py-0.5 text-xs text-slate-400">
            ESC
          </kbd>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-2">
          {!q && (
            <div className="px-3 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-slate-400">
              Quick links
            </div>
          )}
          {results.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              No results for “{q}”.
            </p>
          ) : (
            results.map((r, i) => {
              const Icon = icons[r.kind];
              return (
                <button
                  key={r.href}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${i === active ? "bg-brand-50" : ""}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${r.kind === "lesson" ? "bg-gold-50 text-gold-600" : "bg-brand-50 text-brand-600"}`}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-ink">
                      {r.title}
                    </span>
                    <span className="block truncate text-xs text-slate-500">
                      {r.sub}
                    </span>
                  </span>
                  {i === active && (
                    <CornerDownLeft className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
