import type { Metadata } from "next";
import { Suspense } from "react";
import { CertificateView } from "./CertificateView";

export const metadata: Metadata = { title: "Certificate" };

export default function Page() {
  return (
    <Suspense>
      <CertificateView />
    </Suspense>
  );
}
