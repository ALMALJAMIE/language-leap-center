import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "./Catalog";

export const metadata: Metadata = { title: "الدورات" };

export default function CoursesPage() {
  return (
    <Suspense>
      <Catalog />
    </Suspense>
  );
}
