import type { Course, CourseType, Level, ProgramId } from "@/lib/types";
import { ge1Modules } from "./lessons/ge1";
import { biz1Modules, conv1Modules, ge2Modules, ielts1Modules, kids1Modules } from "./lessons/others";

export const programs: Record<ProgramId, { name: string; nameEn: string; desc: string; icon: string }> = {
  GE: { name: "الإنجليزية العامة", nameEn: "General English", desc: "مسار متدرج من الصفر حتى C1 وفق الإطار الأوروبي المرجعي.", icon: "🎯" },
  KIDS: { name: "الإنجليزية للأطفال", nameEn: "English for Kids", desc: "دروس قصيرة بالصور والأصوات والألعاب للأعمار 5–10.", icon: "🧸" },
  CONV: { name: "المحادثة اليومية", nameEn: "Everyday Conversation", desc: "مواقف حقيقية: المقهى، المطار، الطبيب، الهاتف.", icon: "💬" },
  BIZ: { name: "إنجليزية الأعمال", nameEn: "Business English", desc: "البريد الرسمي والاجتماعات والعروض التقديمية.", icon: "💼" },
  IELTS: { name: "التحضير للآيلتس", nameEn: "IELTS Preparation", desc: "استراتيجيات ومفردات أكاديمية للمهارات الأربع.", icon: "🎓" },
};

export const levels: Record<Level, { name: string; desc: string }> = {
  A1: { name: "مبتدئ", desc: "Beginner" },
  A2: { name: "أساسي", desc: "Elementary" },
  B1: { name: "متوسط", desc: "Intermediate" },
  B2: { name: "فوق المتوسط", desc: "Upper-Intermediate" },
  C1: { name: "متقدم", desc: "Advanced" },
};

export const courseTypes: Record<CourseType, string> = {
  self: "ذاتي التعلم",
  live: "حصص مباشرة",
  mixed: "مدمج",
};

export const courses: Course[] = [
  {
    slug: "general-english-1",
    code: "GE-A1",
    program: "GE",
    level: "A1",
    title: "الإنجليزية العامة 1: البداية",
    titleEn: "General English 1 — Starter",
    description: "نقطة الانطلاق لمن يبدأ من الصفر: التحية والتعارف والعائلة والأرقام والمهن والحياة اليومية، بجمل قصيرة تسمعها وتنطقها وتكتبها.",
    outcomes: [
      "تقديم نفسك وعائلتك والسؤال عن الآخرين",
      "استعمال نحو 60 كلمة أساسية في جمل صحيحة",
      "فهم حوارات قصيرة بطيئة ومجاراتها",
      "طلب الطعام والسؤال عن الأماكن",
    ],
    skills: ["استماع", "محادثة", "مفردات", "قواعد", "كتابة"],
    hours: 24,
    type: "self",
    price: 0,
    certificate: true,
    cover: { from: "#1f66c8", to: "#0b326d", icon: "🚀" },
    modules: ge1Modules,
    order: 1,
  },
  {
    slug: "general-english-2",
    code: "GE-A2",
    program: "GE",
    level: "A2",
    title: "الإنجليزية العامة 2: الأساسيات",
    titleEn: "General English 2 — Elementary",
    description: "الحديث عن الماضي والتسوق والسفر والصحة. تنتقل فيه من الجمل المفردة إلى وصف تجاربك وسرد أحداث بسيطة.",
    outcomes: ["سرد أحداث في الماضي البسيط", "التعامل في المتاجر والمواصلات", "المقارنة بين الأشياء", "كتابة رسالة قصيرة"],
    skills: ["استماع", "محادثة", "قراءة", "قواعد"],
    hours: 30,
    type: "self",
    price: 49,
    certificate: true,
    cover: { from: "#2a74d6", to: "#0c3d88", icon: "🧭" },
    modules: ge2Modules,
    order: 2,
  },
  {
    slug: "general-english-3",
    code: "GE-B1",
    program: "GE",
    level: "B1",
    title: "الإنجليزية العامة 3: المتوسط",
    titleEn: "General English 3 — Intermediate",
    description: "التعبير عن الرأي وسرد القصص ومناقشة موضوعات العمل والمجتمع، مع المضارع التام والجمل الشرطية.",
    outcomes: ["إبداء الرأي وتبريره", "فهم الأفكار الرئيسة في الأخبار", "استعمال الأزمنة التامة", "كتابة فقرة مترابطة"],
    skills: ["محادثة", "قراءة", "كتابة", "قواعد"],
    hours: 40,
    type: "mixed",
    price: 69,
    certificate: true,
    cover: { from: "#0f4ca7", to: "#061a37", icon: "🏔️" },
    modules: [{ title: "قيد الإعداد", titleEn: "Coming soon", lessons: [], upcoming: ["الآراء والنقاش", "القصص والأحداث", "العمل والمستقبل", "المجتمع والإعلام"] }],
    order: 3,
  },
  {
    slug: "general-english-4",
    code: "GE-B2",
    program: "GE",
    level: "B2",
    title: "الإنجليزية العامة 4: فوق المتوسط",
    titleEn: "General English 4 — Upper-Intermediate",
    description: "طلاقة أكبر في النقاش والكتابة، والتعامل مع اللغة الأصيلة في المقالات والبودكاست.",
    outcomes: ["المشاركة في نقاش مطوّل", "كتابة مقال رأي منظم", "فهم المتحدثين الأصليين بسرعة طبيعية"],
    skills: ["محادثة", "استماع", "كتابة"],
    hours: 45,
    type: "mixed",
    price: 79,
    certificate: true,
    cover: { from: "#0c3d88", to: "#0a2852", icon: "🛫" },
    modules: [{ title: "قيد الإعداد", titleEn: "Coming soon", lessons: [], upcoming: ["الحجاج والإقناع", "اللغة في الإعلام", "التعابير الاصطلاحية"] }],
    order: 4,
  },
  {
    slug: "general-english-5",
    code: "GE-C1",
    program: "GE",
    level: "C1",
    title: "الإنجليزية العامة 5: المتقدم",
    titleEn: "General English 5 — Advanced",
    description: "دقة الأسلوب وثراء المفردات، والكتابة الأكاديمية والمهنية، وفهم الفروق الدقيقة في المعنى.",
    outcomes: ["التعبير بدقة ومرونة", "الكتابة الأكاديمية والمهنية", "فهم النصوص المعقدة"],
    skills: ["كتابة", "قراءة", "محادثة"],
    hours: 50,
    type: "live",
    price: 99,
    certificate: true,
    cover: { from: "#0a2852", to: "#061a37", icon: "👑" },
    modules: [{ title: "قيد الإعداد", titleEn: "Coming soon", lessons: [], upcoming: ["الأسلوب والسجل اللغوي", "الكتابة الأكاديمية", "الخطابة"] }],
    order: 5,
  },
  {
    slug: "kids-english-1",
    code: "KIDS-1",
    program: "KIDS",
    level: "A1",
    title: "إنجليزي الصغار 1",
    titleEn: "Little Leapers 1",
    description: "رحلة ملونة للأطفال: الألوان والحيوانات والأرقام بالصور والأصوات وتمارين التوصيل والنطق.",
    outcomes: ["تمييز الألوان والحيوانات بالإنجليزية", "نطق كلمات بسيطة بثقة", "فهم جمل قصيرة جدًا"],
    skills: ["استماع", "نطق", "مفردات"],
    hours: 12,
    type: "self",
    price: 0,
    certificate: false,
    ageGroup: "5–8 سنوات",
    cover: { from: "#efb52a", to: "#ce961d", icon: "🦁" },
    modules: kids1Modules,
    isNew: true,
    order: 6,
  },
  {
    slug: "kids-english-2",
    code: "KIDS-2",
    program: "KIDS",
    level: "A1",
    title: "إنجليزي الصغار 2",
    titleEn: "Little Leapers 2",
    description: "المدرسة والبيت والطعام والملابس، مع قصص قصيرة مسموعة وأغانٍ.",
    outcomes: ["وصف البيت والمدرسة", "تكوين جمل من 3–4 كلمات"],
    skills: ["استماع", "نطق", "قراءة"],
    hours: 14,
    type: "self",
    price: 29,
    certificate: false,
    ageGroup: "7–10 سنوات",
    cover: { from: "#f3c74d", to: "#a97716", icon: "🎈" },
    modules: [{ title: "قيد الإعداد", titleEn: "Coming soon", lessons: [], upcoming: ["مدرستي", "بيتي", "ملابسي", "طعامي المفضل"] }],
    order: 7,
  },
  {
    slug: "everyday-conversation",
    code: "CONV-1",
    program: "CONV",
    level: "A2",
    title: "المحادثة اليومية",
    titleEn: "Everyday Conversation",
    description: "عبارات جاهزة لمواقف تمر بها كل يوم في الغربة والسفر: المقهى، المطار، الطبيب، المكالمات.",
    outcomes: ["الطلب بأدب في المطاعم والمحلات", "إنهاء إجراءات السفر بثقة", "طرح الأسئلة وطلب المساعدة"],
    skills: ["محادثة", "استماع", "نطق"],
    hours: 18,
    type: "self",
    price: 39,
    certificate: true,
    cover: { from: "#1f66c8", to: "#ce961d", icon: "☕" },
    modules: conv1Modules,
    isNew: true,
    order: 8,
  },
  {
    slug: "business-english",
    code: "BIZ-1",
    program: "BIZ",
    level: "B1",
    title: "إنجليزية الأعمال",
    titleEn: "Business English Essentials",
    description: "لغة المكتب والشركات: التعارف المهني، البريد الرسمي، الاجتماعات، العروض التقديمية.",
    outcomes: ["تقديم نفسك ودورك الوظيفي", "كتابة بريد رسمي واضح", "إدارة اجتماع قصير"],
    skills: ["محادثة", "كتابة", "مفردات"],
    hours: 26,
    type: "mixed",
    price: 89,
    certificate: true,
    cover: { from: "#0b326d", to: "#845b13", icon: "📊" },
    modules: biz1Modules,
    order: 9,
  },
  {
    slug: "ielts-preparation",
    code: "IELTS-1",
    program: "IELTS",
    level: "B2",
    title: "التحضير للآيلتس",
    titleEn: "IELTS Preparation",
    description: "مفردات أكاديمية واستراتيجيات للمهارات الأربع، مع نماذج لأسئلة الكتابة والمحادثة.",
    outcomes: ["وصف الرسوم البيانية في Task 1", "بناء مقال Task 2", "إدارة الوقت في الاختبار"],
    skills: ["كتابة", "قراءة", "استماع", "محادثة"],
    hours: 36,
    type: "mixed",
    price: 119,
    certificate: true,
    cover: { from: "#0c3d88", to: "#efb52a", icon: "🏆" },
    modules: ielts1Modules,
    order: 10,
  },
];

export const getCourse = (slug: string) => courses.find((c) => c.slug === slug);

export const courseLessons = (c: Course) => c.modules.flatMap((m) => m.lessons);

export const lessonCount = (c: Course) =>
  c.modules.reduce((n, m) => n + m.lessons.length + (m.upcoming?.length ?? 0), 0);

export const isAvailable = (c: Course) => courseLessons(c).length > 0;

export const findLesson = (courseSlug: string, lessonId: string) => {
  const c = getCourse(courseSlug);
  if (!c) return undefined;
  const all = courseLessons(c);
  const i = all.findIndex((l) => l.id === lessonId);
  if (i < 0) return undefined;
  return { course: c, lesson: all[i], index: i, next: all[i + 1] };
};

export const totals = () => {
  const ls = courses.flatMap(courseLessons);
  return {
    courses: courses.length,
    lessons: ls.length,
    words: ls.reduce((n, l) => n + l.words.length, 0),
    programs: Object.keys(programs).length,
  };
};

export const formatPrice = (p: number) => (p === 0 ? "مجاني" : `$${p}`);
