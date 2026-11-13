import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/logo-full.png";

export const metadata: Metadata = { title: "عن المركز" };

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <div className="grid items-center gap-10 md:grid-cols-[260px_1fr]">
        <Image src={logo} alt="Language Leap Center" className="mx-auto w-60 rounded-3xl shadow-xl ring-1 ring-slate-100" />
        <div>
          <span className="font-bold text-gold-600">عن المركز</span>
          <h1 className="mt-2 text-3xl font-extrabold">Language Leap Center</h1>
          <p className="en mt-1 text-right italic text-brand-500" dir="ltr">Your leap to fluent English</p>
          <p className="mt-5 leading-9 text-slate-700">
            مركز لتعليم اللغة الإنجليزية للناطقين بالعربية. نؤمن بأن تعلّم اللغة قفزات صغيرة متتالية: درس قصير كل يوم، وممارسة حقيقية للاستماع والنطق، ومراجعة منتظمة تحفظ ما تعلّمته من الضياع.
          </p>
          <p className="mt-4 leading-9 text-slate-700">
            يبدأ المتعلم من حيث يقف فعلًا، باختبار يحدد مستواه، ثم يسير في مسار متدرج وفق الإطار الأوروبي المرجعي (CEFR) من A1 حتى C1، مع شرح القواعد بالعربية حين يحتاج إليها، والإنجليزية في كل ما عدا ذلك.
          </p>
          <Link href="/courses/" className="btn-primary mt-7 inline-block px-6 py-3">تصفح الدورات</Link>
        </div>
      </div>
    </div>
  );
}
