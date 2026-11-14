"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CourseDetail } from "../[slug]/CourseDetail";

/** Courses created in the Course Builder (no page built at deploy time) */
function View() {
  const slug = useSearchParams().get("c") ?? "";
  return <CourseDetail key={slug} slug={slug} />;
}

export default function CourseViewPage() {
  return (
    <Suspense>
      <View />
    </Suspense>
  );
}
