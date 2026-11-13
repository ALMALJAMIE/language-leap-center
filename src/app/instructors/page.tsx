import type { Metadata } from "next";
import { Suspense } from "react";
import { InstructorsView } from "./InstructorsView";

export const metadata: Metadata = { title: "Our Instructors" };

export default function InstructorsPage() {
  return (
    <Suspense>
      <InstructorsView />
    </Suspense>
  );
}
