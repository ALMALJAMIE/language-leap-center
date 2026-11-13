"use client";

import { Suspense } from "react";
import { ComingSoonView } from "@/components/portal/ComingSoonView";

export default function ComingSoon() {
  return (
    <Suspense>
      <ComingSoonView />
    </Suspense>
  );
}
