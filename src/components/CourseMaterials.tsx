"use client";

import { useEffect, useState } from "react";
import { FileText, Link2, Lock, Music, Video } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import type { Course } from "@/lib/types";

interface Material { id: number; unit_index: number | null; lesson_id: string | null; title: string; kind: string; url: string | null; path: string | null; team_only?: boolean }
const icons: Record<string, typeof FileText> = { pdf: FileText, audio: Music, video: Video, link: Link2, file: FileText };

/** Curriculum files and links the academic team added to a course */
export function CourseMaterials({ course, locked }: { course: Course; locked: boolean }) {
  const user = useAuth((s) => s.user);
  const [rows, setRows] = useState<Material[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase.from("course_materials").select("*").eq("course_slug", course.slug).order("sort").order("id")
      .then(({ data }) => setRows((data as Material[]) ?? []));
  }, [user, course.slug]);
  if (!rows.length) return null;

  const open = async (m: Material) => {
    if (locked) return;
    if (m.url) return window.open(m.url, "_blank", "noopener");
    const { data } = await supabase.storage.from("materials").createSignedUrl(m.path!, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
  };
  const where = (m: Material) =>
    m.lesson_id ? course.modules.flatMap((x) => x.lessons).find((l) => l.id === m.lesson_id)?.title ?? "Lesson" : m.unit_index !== null ? `Unit ${m.unit_index + 1}` : "Whole course";

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="bg-mist px-6 py-4">
        <span className="text-xs font-bold uppercase tracking-wide text-gold-600">Course materials</span>
        <h3 className="font-bold">Books, audio and links</h3>
      </div>
      <ul className="divide-y divide-slate-100">
        {rows.map((m) => {
          const Icon = icons[m.kind] ?? FileText;
          return (
            <li key={m.id}>
              <button onClick={() => open(m)} disabled={locked} className="flex w-full items-center gap-4 px-6 py-3.5 text-left transition hover:bg-brand-50/50 disabled:cursor-not-allowed">
                <Icon className="h-5 w-5 shrink-0 text-brand-600" />
                <span className="flex-1 font-semibold">{m.title}{m.team_only && <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">Team only</span>}</span>
                <span className="text-xs text-slate-500">{where(m)}</span>
                {locked && <Lock className="h-4 w-4 text-slate-400" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
