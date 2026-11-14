"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { LessonRoute } from "@/components/lesson/LessonRoute";

/** Lessons added in the Course Builder (no page built at deploy time) */
function View() {
  const p = useSearchParams();
  return <LessonRoute courseSlug={p.get("c") ?? ""} lessonId={p.get("l") ?? ""} />;
}

export default function LessonViewPage() {
  return (
    <Suspense>
      <View />
    </Suspense>
  );
}
