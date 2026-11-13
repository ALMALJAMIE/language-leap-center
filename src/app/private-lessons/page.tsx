"use client";

import { Suspense } from "react";
import { PrivateLessonsView } from "./PrivateLessonsView";

export default function PrivateLessons() {
  return (
    <Suspense>
      <PrivateLessonsView />
    </Suspense>
  );
}
