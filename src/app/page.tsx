import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Brain, Check, Ear, Flame, Mic, PenLine, Sparkles, Zap } from "lucide-react";
import mark from "@/assets/logo-mark-t.png";
import { courses, levels, programs, totals } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import { SpeakBtn } from "@/components/lesson/Exercises";
import type { Level } from "@/lib/types";

const faqs = [
  { q: "هل أحتاج إلى أي معرفة سابقة بالإنجليزية؟", a: "لا. دورة «الإنجليزية العامة 1» مجانية وتبدأ من الصفر، وكل الشروحات فيها بالعربية." },
  { q: "كيف تعمل المراجعة الذكية؟", a: "كل كلمة تتعلمها تتحول إلى بطاقة. تحسب خوارزمية FSRS متى ستبدأ بنسيانها، فتعرضها عليك قبل ذلك بقليل. هكذا تراجع أقل وتتذكر أكثر." },
  { q: "هل يمكنني التدرب على النطق؟", a: "نعم. في كل درس تمرين تنطق فيه الجملة بصوتك، فتلوّن المنصة الكلمات التي نطقتها صحيحة والتي تحتاج إلى إعادة. يعمل في Chrome و Edge و Safari." },
  { q: "أين يُحفظ تقدمي؟", a: "يُحفظ حاليًا على جهازك في المتصفح. حسابات المستخدمين والمزامنة بين الأجهزة ضمن المرحلة القادمة." },
  { q: "هل أحصل على شهادة؟", a: "الدورات المعلَّمة بالشهادة تمنحك شهادة إتمام بعد إنهاء جميع دروسها واختباراتها." },
];

const method = [
  { icon: <Sparkles />, t: "تعلّم", d: "كلمات وقواعد قصيرة مشروحة بالعربية، مع صوت ومثال لكل كلمة." },
  { icon: <Ear />, t: "استمع وتدرّب", d: "استماع، توصيل، ترتيب جمل، ملء فراغات. تمرين جديد كل نصف دقيقة." },
  { icon: <Mic />, t: "تحدّث", d: "انطق الجمل بصوتك واحصل على تقييم فوري لكل كلمة." },
  { icon: <Brain />, t: "راجع بذكاء", d: "خوارزمية FSRS تعيد الكلمات إليك قبل أن تنساها مباشرة." },
];

export default function Home() {
  const t = totals();
  const featured = courses.filter((c) => ["general-english-1", "everyday-conversation", "kids-english-1"].includes(c.slug));

  return (
    <div>
      {/* البطل */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/70 to-white">
        <div className="absolute -left-40 top-10 h-[520px] w-[520px] rounded-full border-[70px] border-brand-100/60" />
        <div className="absolute -right-24 bottom-0 h-72 w-72 rounded-full border-[40px] border-gold-200/50" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2 lg:pt-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-bold text-brand-700 shadow-sm ring-1 ring-brand-100">
              <span className="h-2 w-2 rounded-full bg-gold-400" /> منصة عربية لتعلّم الإنجليزية
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-[1.35] text-ink sm:text-5xl lg:text-[3.4rem]">
              قفزتك نحو
              <br />
              <span className="text-brand-600">إنجليزية </span>
              <span className="text-gold-gradient">بطلاقة</span>
            </h1>
            <p className="en mt-3 text-right text-lg italic text-brand-400" dir="ltr">Your leap to fluent English</p>
            <p className="mt-5 max-w-xl text-lg leading-9 text-slate-600">
              دروس قصيرة تسمع فيها وتنطق وتكتب، وتمارين تفاعلية تشبه اللعب، ومراجعة ذكية تحفظ لك ما تعلّمت. من أول كلمة حتى المستوى المتقدم.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/courses/general-english-1/" className="btn-primary px-7 py-4 text-lg">ابدأ مجانًا</Link>
              <Link href="/placement/" className="rounded-2xl border-2 border-brand-200 bg-white px-7 py-3.5 text-lg font-bold text-brand-700 hover:border-brand-400">
                حدّد مستواك
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              {["بدون تسجيل", "شرح بالعربية", "تمارين نطق", "تقدمك محفوظ"].map((x) => (
                <li key={x} className="flex items-center gap-1.5"><Check className="h-4 w-4 text-emerald-500" /> {x}</li>
              ))}
            </ul>
          </div>

          {/* معاينة درس حية */}
          <div className="relative mx-auto w-full max-w-md">
            <div className="absolute -top-6 right-2 z-10 sm:-right-6 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <Flame className="h-6 w-6 text-orange-500" />
              <div><div className="text-lg font-extrabold leading-none">7</div><div className="text-[11px] text-slate-500">أيام متتالية</div></div>
            </div>
            <div className="absolute -bottom-5 left-2 z-10 sm:-left-5 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl">
              <Zap className="h-6 w-6 text-gold-500" />
              <div><div className="text-lg font-extrabold leading-none">+25 XP</div><div className="text-[11px] text-slate-500">درس مكتمل</div></div>
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-2xl shadow-brand-900/15 ring-1 ring-slate-100">
              <div className="mb-5 flex items-center gap-3">
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full w-3/5 rounded-full bg-gradient-to-l from-gold-300 to-gold-500" /></div>
                <span className="text-xs font-bold text-slate-400">6/10</span>
              </div>
              <div className="text-sm font-bold text-slate-500">ماذا تسمع؟ جرّب الآن 👇</div>
              <div className="my-6 flex justify-center"><SpeakBtn text="Nice to meet you" size="lg" /></div>
              <div className="grid grid-cols-2 gap-3">
                {["تشرفت بمعرفتك", "مع السلامة", "صباح الخير", "شكرًا لك"].map((o, i) => (
                  <div key={o} data-state={i === 0 ? "correct" : ""} className="tile p-3 text-center font-semibold">{o}</div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-700">
                <span className="font-extrabold">أحسنت! 🎉</span>
                <span className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-bold text-white">متابعة</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* أرقام */}
      <section className="mx-auto -mt-6 max-w-5xl px-6">
        <div className="brand-gradient grid grid-cols-2 gap-6 rounded-3xl px-8 py-7 text-center text-white shadow-xl sm:grid-cols-4">
          {[
            [t.courses, "دورات"],
            [t.lessons, "درسًا تفاعليًا جاهزًا"],
            [t.words, "كلمة وعبارة بالصوت"],
            ["A1 → C1", "مسار متكامل"],
          ].map(([n, l]) => (
            <div key={String(l)}>
              <div className="en text-3xl font-extrabold text-gold-300">{n}</div>
              <div className="mt-1 text-sm text-brand-100">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* البرامج */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-extrabold">برامج تناسب هدفك</h2>
          <p className="mt-3 text-slate-600">سواء كنت تبدأ من الصفر، أو تستعد للعمل، أو تعلّم أطفالك</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Object.entries(programs).map(([id, p]) => (
            <Link key={id} href={`/courses/?program=${id}`} className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg">
              <div className="text-4xl">{p.icon}</div>
              <h3 className="mt-4 font-bold group-hover:text-brand-600">{p.name}</h3>
              <p className="en text-xs text-slate-400">{p.nameEn}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* المنهج */}
      <section id="method" className="mx-auto max-w-7xl scroll-mt-24 px-6 pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <span className="font-bold text-gold-600">منهجنا</span>
            <h2 className="mt-2 text-3xl font-extrabold leading-snug">أربع خطوات في كل درس، تُبنى على ما أثبتته أبحاث تعلّم اللغات</h2>
            <p className="mt-4 leading-8 text-slate-600">
              الدرس الواحد بين 8 و12 دقيقة. تتعلم كلمات قليلة، ثم تستعملها بطرق مختلفة: تسمعها، تختارها، تركّب بها جملة، تنطقها، ثم تراها في حوار حقيقي. والأخطاء لا تُعاقَب، بل تعود إليك في آخر الدرس حتى تتقنها.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Image src={mark} alt="" className="h-12 w-auto" />
              <span className="en text-sm font-bold tracking-[0.2em] text-brand-700">LEARN · LEAP · LEAD</span>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {method.map((m, i) => (
              <div key={m.t} className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6">
                <span className="en absolute left-4 top-3 text-5xl font-black text-brand-50">{i + 1}</span>
                <div className={`relative grid h-12 w-12 place-items-center rounded-2xl ${i % 2 ? "bg-gold-100 text-gold-600" : "bg-brand-100 text-brand-600"}`}>{m.icon}</div>
                <h3 className="relative mt-4 text-lg font-bold">{m.t}</h3>
                <p className="relative mt-1 text-sm leading-6 text-slate-600">{m.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* المسار */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="rounded-[2rem] bg-mist p-8 sm:p-12">
          <h2 className="text-center text-3xl font-extrabold">مسارك من الصفر إلى الطلاقة</h2>
          <p className="mt-3 text-center text-slate-600">مستويات الإطار الأوروبي المرجعي المشترك للغات (CEFR)</p>
          <div className="mt-10 grid gap-4 sm:grid-cols-5">
            {(Object.keys(levels) as Level[]).map((l, i) => (
              <Link key={l} href={`/courses/?level=${l}`} className="group relative rounded-2xl bg-white p-5 text-center shadow-sm transition hover:shadow-md" style={{ marginTop: `${(4 - i) * 0}px` }}>
                <div className="mx-auto mb-3 h-2 rounded-full" style={{ background: `linear-gradient(90deg, #efb52a ${i * 25}%, #1f66c8 ${i * 25}%)`, width: "100%", opacity: 0.25 + i * 0.18 }} />
                <div className="en text-3xl font-extrabold text-brand-700 group-hover:text-gold-500">{l}</div>
                <div className="mt-1 font-semibold">{levels[l].name}</div>
                <div className="en text-xs text-slate-400">{levels[l].desc}</div>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/placement/" className="btn-gold inline-flex items-center gap-2 px-6 py-3">
              لا تعرف من أين تبدأ؟ خذ اختبار المستوى <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* دورات مختارة */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-3xl font-extrabold">ابدأ بإحدى هذه الدورات</h2>
            <p className="mt-2 text-slate-600">دروس جاهزة الآن، وتُضاف دروس جديدة باستمرار</p>
          </div>
          <Link href="/courses/" className="hidden font-bold text-brand-600 sm:block">كل الدورات ←</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((c) => <CourseCard key={c.slug} course={c} />)}
        </div>
      </section>

      {/* المهارات */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { i: <Ear />, t: "الاستماع", d: "نطق أمريكي واضح لكل كلمة وجملة، مع خيار الاستماع البطيء." },
            { i: <Mic />, t: "المحادثة", d: "تعرّف على الصوت يقيّم نطقك كلمة كلمة." },
            { i: <PenLine />, t: "الكتابة", d: "ترتيب الجمل والكتابة من الذاكرة مع تنبيه للأخطاء الإملائية." },
            { i: <Sparkles />, t: "المفردات", d: "كلمات مختارة بعناية لكل مستوى، وكل كلمة في مثال حي." },
          ].map((s) => (
            <div key={s.t} className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 p-6 text-white">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15 text-gold-300">{s.i}</div>
              <h3 className="mt-4 text-lg font-bold">{s.t}</h3>
              <p className="mt-1 text-sm leading-6 text-brand-100">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* الأسئلة الشائعة */}
      <section id="faq" className="mx-auto max-w-3xl scroll-mt-24 px-6 pt-24">
        <h2 className="mb-8 text-center text-3xl font-extrabold">أسئلة شائعة</h2>
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="group rounded-2xl border border-slate-200 bg-white p-5 open:border-brand-200 open:bg-brand-50/40">
              <summary className="flex cursor-pointer list-none items-center justify-between font-bold">
                {f.q}
                <span className="grid h-7 w-7 place-items-center rounded-full bg-brand-100 text-brand-700 transition group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 leading-8 text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* دعوة أخيرة */}
      <section className="mx-auto max-w-7xl px-6 pt-24">
        <div className="brand-gradient relative overflow-hidden rounded-[2rem] px-8 py-14 text-center text-white">
          <div className="absolute -left-16 -top-16 h-64 w-64 rounded-full border-[36px] border-white/5" />
          <div className="absolute -bottom-24 -right-10 h-64 w-64 rounded-full border-[36px] border-gold-400/20" />
          <h2 className="relative text-3xl font-extrabold sm:text-4xl">جاهز للقفزة الأولى؟</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-brand-100">عشر دقائق اليوم تكفي لتبدأ. الدرس الأول مجاني ولا يحتاج إلى تسجيل.</p>
          <Link href="/courses/general-english-1/" className="btn-gold relative mt-8 inline-block px-8 py-4 text-lg">ابدأ الدرس الأول</Link>
        </div>
      </section>
    </div>
  );
}
