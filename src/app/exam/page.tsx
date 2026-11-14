"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useMounted } from "@/lib/store";
import { SignInPrompt } from "@/components/account/AccountShell";
import { ExamRunner, ExamScore, type ExamResult } from "@/components/exam/ExamRunner";

function ExamPage() {
  const id = Number(useSearchParams().get("id"));
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const [result, setResult] = useState<ExamResult | null>(null);

  if (!mounted || !ready) return <div className="min-h-[60vh]" />;
  if (!user) return <div className="mx-auto max-w-2xl px-6 py-12"><SignInPrompt text="Sign in to take your exam." /></div>;
  if (!id) return <p className="py-20 text-center text-slate-500">Exam not found.</p>;
  if (result)
    return (
      <div className="mx-auto max-w-xl px-6 py-16">
        <ExamScore r={result} />
        <div className="mt-6 text-center"><Link href="/assessments/" className="btn-primary inline-block px-6 py-3">Back to my assessments</Link></div>
      </div>
    );
  return <ExamRunner examId={id} onDone={setResult} />;
}

export default function Page() {
  return <Suspense fallback={<div className="min-h-[60vh]" />}><ExamPage /></Suspense>;
}
