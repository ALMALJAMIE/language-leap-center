import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo-full.png";

export const metadata: Metadata = { title: "About us" };

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-[260px_1fr]">
        <Image src={logo} alt="Language Leap Center" className="mx-auto w-60 rounded-3xl shadow-xl ring-1 ring-slate-100" />
        <div>
          <span className="font-bold text-gold-600">About us</span>
          <h1 className="mt-2 text-3xl font-extrabold">Language Leap Center</h1>
          <p className="mt-1 italic text-brand-500">Your leap to fluent English</p>
          <p className="mt-5 leading-9 text-slate-700">
            Language Leap Center is an English learning center. We believe a language is learned in small, steady leaps: a short lesson every day, real listening and speaking practice, and regular review so nothing you learn is lost.
          </p>
          <p className="mt-4 leading-9 text-slate-700">
            Every learner starts where they really are, with a placement test, then follows a clear path based on the Common European Framework (CEFR) from A1 to C1 — with optional Arabic support for beginners who need it.
          </p>
          <Link href="/courses/" className="btn-primary mt-7 inline-block px-6 py-3">Browse courses</Link>
        </div>
      </div>
    </div>
  );
}
