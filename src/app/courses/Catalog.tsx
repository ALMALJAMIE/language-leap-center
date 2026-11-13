"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { courses, courseTypes, levels, programs, totals } from "@/data/courses";
import { CourseCard } from "@/components/CourseCard";
import type { CourseType, Level, ProgramId } from "@/lib/types";

type Sort = "order" | "new" | "priceAsc" | "priceDesc" | "level" | "alpha";

const sorts: Record<Sort, string> = {
  order: "الترتيب المقترح",
  level: "حسب المستوى",
  new: "الأحدث",
  priceAsc: "السعر: الأقل أولًا",
  priceDesc: "السعر: الأعلى أولًا",
  alpha: "أبجديًا",
};

const levelOrder: Level[] = ["A1", "A2", "B1", "B2", "C1"];

function Chip({ on, children, onClick }: { on: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
        on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
      }`}
    >
      {children}
    </button>
  );
}

export function Catalog() {
  const params = useSearchParams();
  const initialProgram = params.get("program") as ProgramId | null;
  const initialLevel = params.get("level") as Level | null;

  const [q, setQ] = useState("");
  const [program, setProgram] = useState<ProgramId | null>(initialProgram && programs[initialProgram] ? initialProgram : null);
  const [level, setLevel] = useState<Level | null>(initialLevel && levels[initialLevel] ? initialLevel : null);
  const [type, setType] = useState<CourseType | null>(null);
  const [price, setPrice] = useState<"free" | "paid" | null>(null);
  const [sort, setSort] = useState<Sort>("order");
  const [showFilters, setShowFilters] = useState(false);

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    const r = courses.filter(
      (c) =>
        (!program || c.program === program) &&
        (!level || c.level === level) &&
        (!type || c.type === type) &&
        (!price || (price === "free" ? c.price === 0 : c.price > 0)) &&
        (!s || `${c.title} ${c.titleEn} ${c.description} ${c.code}`.toLowerCase().includes(s)),
    );
    const by: Record<Sort, (a: (typeof r)[0], b: (typeof r)[0]) => number> = {
      order: (a, b) => a.order - b.order,
      new: (a, b) => Number(!!b.isNew) - Number(!!a.isNew) || b.order - a.order,
      priceAsc: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      level: (a, b) => levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level),
      alpha: (a, b) => a.title.localeCompare(b.title, "ar"),
    };
    return [...r].sort(by[sort]);
  }, [q, program, level, type, price, sort]);

  const anyFilter = program || level || type || price || q;
  const t = totals();

  const filters = (
    <div className="space-y-6">
      <div>
        <h4 className="mb-2.5 text-sm font-bold text-slate-800">البرنامج</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(programs) as ProgramId[]).map((p) => (
            <Chip key={p} on={program === p} onClick={() => setProgram(program === p ? null : p)}>
              {programs[p].icon} {programs[p].name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2.5 text-sm font-bold text-slate-800">المستوى (CEFR)</h4>
        <div className="flex flex-wrap gap-2">
          {levelOrder.map((l) => (
            <Chip key={l} on={level === l} onClick={() => setLevel(level === l ? null : l)}>
              <span className="en font-bold">{l}</span> {levels[l].name}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2.5 text-sm font-bold text-slate-800">نوع الدورة</h4>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(courseTypes) as CourseType[]).map((k) => (
            <Chip key={k} on={type === k} onClick={() => setType(type === k ? null : k)}>
              {courseTypes[k]}
            </Chip>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2.5 text-sm font-bold text-slate-800">السعر</h4>
        <div className="flex flex-wrap gap-2">
          <Chip on={price === "free"} onClick={() => setPrice(price === "free" ? null : "free")}>مجاني</Chip>
          <Chip on={price === "paid"} onClick={() => setPrice(price === "paid" ? null : "paid")}>مدفوع</Chip>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* رأس الصفحة */}
      <section className="brand-gradient relative overflow-hidden">
        <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full border-[40px] border-white/5" />
        <div className="absolute -bottom-32 right-10 h-72 w-72 rounded-full border-[30px] border-gold-400/15" />
        <div className="relative mx-auto max-w-7xl px-6 py-14">
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            اكتشف <span className="text-gold-gradient">دورات الإنجليزية</span>
          </h1>
          <p className="mt-3 max-w-2xl text-brand-100">
            مسارات متدرجة وفق الإطار الأوروبي المرجعي (CEFR)، من أول كلمة حتى الطلاقة. اختر برنامجك أو ابدأ باختبار تحديد المستوى.
          </p>
          <div className="mt-8 flex flex-wrap gap-8 text-white">
            {[
              [t.courses, "دورة"],
              [t.lessons, "درسًا تفاعليًا جاهزًا"],
              [t.words, "كلمة وعبارة"],
              [t.programs, "برامج"],
            ].map(([n, l]) => (
              <div key={l as string}>
                <div className="text-3xl font-extrabold text-gold-300">{n}</div>
                <div className="text-sm text-brand-200">{l}</div>
              </div>
            ))}
          </div>
          <div className="relative mt-8 max-w-xl">
            <Search className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن دورة… (مثل: محادثة، IELTS، أطفال)"
              className="w-full rounded-2xl border-0 bg-white py-3.5 pl-4 pr-12 text-ink shadow-lg outline-none ring-gold-400 focus:ring-4"
            />
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-bold">تصفية النتائج</h3>
              {anyFilter && (
                <button
                  className="text-xs font-bold text-brand-600"
                  onClick={() => {
                    setProgram(null); setLevel(null); setType(null); setPrice(null); setQ("");
                  }}
                >
                  مسح الكل
                </button>
              )}
            </div>
            {filters}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <p className="text-slate-600">
              <b className="text-ink">{list.length}</b> دورة
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" /> تصفية
              </button>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
              >
                {Object.entries(sorts).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>

          {list.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              لا توجد دورات مطابقة. جرّب تغيير خيارات التصفية.
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((c) => (
                <CourseCard key={c.slug} course={c} />
              ))}
            </div>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setShowFilters(false)}>
          <div className="absolute inset-x-0 bottom-0 max-h-[80vh] overflow-auto rounded-t-3xl bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-bold">تصفية النتائج</h3>
              <button onClick={() => setShowFilters(false)}><X /></button>
            </div>
            {filters}
            <button onClick={() => setShowFilters(false)} className="btn-primary mt-6 w-full py-3">
              عرض {list.length} دورة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
