import type { Metadata } from "next";
import { Suspense } from "react";
import { ProfileView } from "./ProfileView";

export const metadata: Metadata = { title: "Instructor Profile" };

export default function InstructorProfilePage() {
  return (
    <Suspense>
      <ProfileView />
    </Suspense>
  );
}
