"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, Clock, Gem, Lock, PlayCircle, Puzzle, ShieldCheck, Ticket, X, Zap } from "lucide-react";
import { courseTypes, getCourse, lessonCount, levels, programs } from "@/data/courses";
import { CourseCover } from "@/components/CourseCard";
import { SignInPrompt } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { displayName, useAuth } from "@/lib/auth";
import { payments, site } from "@/lib/site";
import { useMounted } from "@/lib/store";
import { useEnrollments } from "@/lib/enrollments";

const money = (n: number) => `$${n.toFixed(2)}`;

function Checkout() {
  const slug = useSearchParams().get("course") ?? "";
  const course = getCourse(slug);
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const [addOns, setAddOns] = useState<string[]>([]);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; percent: number; label: string } | null>(null);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const enrolled = useEnrollments((s) => s.slugs);

  if (!mounted || !ready) return <div className="min-h-[60vh]" />;
  if (!course || course.price === 0)
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">{course ? "This course is free" : "Course not found"}</h1>
        <p className="mt-2 text-slate-600">{course ? "No payment is needed — you can start learning right away." : "Choose a course to enroll in."}</p>
        <Link href={course ? `/courses/${course.slug}/` : "/courses/"} className="btn-primary mt-6 inline-block px-6 py-3">{course ? "Open the course" : "Browse courses"}</Link>
      </div>
    );
  if (!user)
    return (
      <div className="mx-auto max-w-2xl px-6 py-12">
        <SignInPrompt text={`Sign in or create a free account to enroll in ${course.title}.`} />
      </div>
    );

  if (enrolled.includes(course.slug))
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">You&apos;re already enrolled</h1>
        <p className="mt-2 text-slate-600">{course.title} is open in your account.</p>
        <Link href={`/courses/${course.slug}/`} className="btn-primary mt-6 inline-block px-6 py-3">Go to the course</Link>
      </div>
    );

  const chosen = payments.addOns.filter((a) => addOns.includes(a.id));
  const subtotal = course.price + chosen.reduce((s, a) => s + a.price, 0);
  const discount = coupon ? Math.round(subtotal * coupon.percent) / 100 : 0;
  const total = Math.max(0, subtotal - discount);
  const link = payments.links[course.slug];

  const applyCoupon = () => {
    const c = payments.coupons[code.trim().toUpperCase()];
    if (!c) {
      setCoupon(null);
      setCouponMsg("This code is not valid.");
      return;
    }
    setCoupon({ code: code.trim().toUpperCase(), ...c });
    setCouponMsg(null);
  };

  const complete = () => {
    const order = {
      course: course.title,
      plan: `Premium — ${courseTypes[course.type]}`,
      addOns: chosen.map((a) => a.title),
      coupon: coupon?.code ?? null,
      total,
      name: displayName(user),
      email: user.email,
      at: new Date().toISOString(),
    };
    try {
      localStorage.setItem(`llc-order-${course.slug}`, JSON.stringify(order));
    } catch {}
    if (link) {
      const url = new URL(link);
      if (user.email && /stripe\.com/.test(url.host)) url.searchParams.set("prefilled_email", user.email);
      window.location.assign(url.toString());
      return;
    }
    const text = [
      "Hello Language Leap Center! I'd like to enroll:",
      `• Course: ${order.course}`,
      `• Plan: ${order.plan} (${payments.accessMonths} months access)`,
      ...(order.addOns.length ? [`• Add-ons: ${order.addOns.join(", ")}`] : []),
      ...(order.coupon ? [`• Coupon: ${order.coupon}`] : []),
      `• Total: ${money(total)}`,
      `• Name: ${order.name}`,
      `• Email: ${order.email}`,
      `• Account ID: ${user.id}`,
    ].join("\n");
    window.open(`${site.whatsapp}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
    setSent(true);
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-8 lg:grid-cols-[1fr_320px]">
      {/* Order summary */}
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
        <h1 className="border-b border-slate-100 px-6 py-5 text-xl font-bold">Order Summary</h1>
        <div className="space-y-6 p-6">
          <div className="flex gap-4">
            <CourseCover course={course} className="h-20 w-20 shrink-0 rounded-xl" mini />
            <div>
              <Link href={`/courses/${course.slug}/`} className="text-xl font-bold hover:text-brand-700">{course.title}</Link>
              <p className="text-sm text-slate-500">{programs[course.program].name} · {course.code} {levels[course.level].name}</p>
              <p className="mt-1 flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {course.hours}h</span>
                <span className="flex items-center gap-1"><PlayCircle className="h-3.5 w-3.5" /> {lessonCount(course)} lessons</span>
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-mist p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex items-center gap-1.5 rounded-full bg-brand-950 px-3 py-1 text-xs font-bold text-white"><Gem className="h-3.5 w-3.5 text-gold-300" /> Premium</span>
                <span className="text-slate-700">{courseTypes[course.type]} Learning</span>
              </div>
              <span className="text-xl font-extrabold">{money(course.price)}</span>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-sm text-slate-500"><Clock className="h-4 w-4" /> {payments.accessMonths} months access</p>
          </div>

          {payments.addOns.length > 0 && (
            <div>
              <h2 className="mb-3 flex items-center gap-2 font-semibold"><Puzzle className="h-4 w-4 text-slate-500" /> Optional Add-ons</h2>
              <div className="space-y-3">
                {payments.addOns.map((a) => {
                  const on = addOns.includes(a.id);
                  return (
                    <label key={a.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${on ? "border-brand-400 bg-brand-50/50" : "border-slate-200 hover:border-slate-300"}`}>
                      <input type="checkbox" checked={on} onChange={() => setAddOns(on ? addOns.filter((x) => x !== a.id) : [...addOns, a.id])} className="mt-1 h-4 w-4 accent-brand-700" />
                      <span className="flex-1">
                        <span className="block font-semibold">{a.title}</span>
                        <span className="block text-sm text-slate-500">{a.desc}</span>
                      </span>
                      <span className="font-bold">{money(a.price)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Ticket className="h-4 w-4 text-slate-500" /> Coupon Code</h2>
            {coupon ? (
              <div className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <span><b>{coupon.code}</b> — {coupon.label}</span>
                <button onClick={() => { setCoupon(null); setCode(""); }} aria-label="Remove coupon"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); applyCoupon(); }} className="flex gap-2">
                <input value={code} onChange={(e) => { setCode(e.target.value); setCouponMsg(null); }} placeholder="Enter discount code" className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 uppercase outline-none placeholder:normal-case focus:border-brand-500" />
                <button disabled={!code.trim()} className="rounded-xl border border-slate-300 px-5 font-semibold text-slate-600 hover:border-brand-400 disabled:opacity-50">Apply</button>
              </form>
            )}
            {couponMsg && <p className="mt-2 text-sm text-red-600">{couponMsg}</p>}
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="h-fit overflow-hidden rounded-3xl border border-slate-200 bg-white lg:sticky lg:top-24">
        <h2 className="border-b border-slate-100 px-6 py-5 text-xl font-bold">Payment</h2>
        <div className="space-y-4 p-6">
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-slate-600">Premium plan</dt><dd>{money(course.price)}</dd></div>
            {chosen.map((a) => (
              <div key={a.id} className="flex justify-between gap-3"><dt className="text-slate-600">{a.title}</dt><dd>{money(a.price)}</dd></div>
            ))}
            {coupon && <div className="flex justify-between text-emerald-600"><dt>Discount ({coupon.percent}%)</dt><dd>−{money(discount)}</dd></div>}
          </dl>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="font-bold">Total</span>
            <span className="text-3xl font-extrabold">{money(total)}</span>
          </div>
          <p className="text-xs text-slate-500">One-time payment for {payments.accessMonths} months access</p>

          {sent ? (
            <div className="rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-bold"><Check className="h-4 w-4" /> Order sent</div>
              <p className="mt-1">Our team will reply on WhatsApp with the payment details. The course opens in your account as soon as payment is confirmed.</p>
              <button onClick={complete} className="mt-3 text-xs font-bold underline">Send again</button>
            </div>
          ) : (
            <button onClick={complete} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-950 py-3.5 font-bold text-white transition hover:bg-brand-800">
              {link ? <Lock className="h-4 w-4" /> : <WhatsAppIcon className="h-5 w-5" />} Complete Enrollment
            </button>
          )}

          <ul className="space-y-2.5 text-sm text-slate-500">
            <li className="flex gap-2"><ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" /> {link ? "Secure payment processing" : "Payment is arranged directly with our team"}</li>
            <li className="flex gap-2"><Lock className="h-4 w-4 shrink-0 text-emerald-600" /> Your details are only used for this order</li>
            <li className="flex gap-2"><Zap className="h-4 w-4 shrink-0 text-emerald-600" /> Access as soon as payment is confirmed</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <Checkout />
    </Suspense>
  );
}
