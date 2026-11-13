import type { Module } from "@/lib/types";

/** General English 2 — Elementary (A2) */
export const ge2Modules: Module[] = [
  {
    title: "الماضي والتجارب",
    titleEn: "Past & Experiences",
    lessons: [
      {
        id: "last-weekend",
        title: "عطلة نهاية الأسبوع الماضية",
        titleEn: "Last weekend",
        minutes: 11,
        words: [
          { en: "yesterday", ar: "أمس", ex: "I visited my uncle yesterday.", emoji: "📆" },
          { en: "visited", ar: "زار", ex: "We visited Penang.", emoji: "🧳" },
          { en: "went", ar: "ذهب", ex: "She went to the beach.", emoji: "🏖️" },
          { en: "saw", ar: "رأى", ex: "I saw a great film.", emoji: "👀" },
          { en: "bought", ar: "اشترى", ex: "He bought a new phone.", emoji: "🛍️" },
          { en: "last week", ar: "الأسبوع الماضي", ex: "I was busy last week.", emoji: "⏪" },
        ],
        sentences: [
          { en: "I went to the market yesterday.", ar: "ذهبت إلى السوق أمس." },
          { en: "We visited our family last week.", ar: "زرنا عائلتنا الأسبوع الماضي." },
          { en: "Did you see the film?", ar: "هل رأيت الفيلم؟" },
        ],
        grammar: {
          title: "الماضي البسيط: المنتظم والشاذ",
          body: "الأفعال المنتظمة تأخذ ed في الماضي (visit ← visited). وهناك أفعال شاذة تُحفظ: go ← went، see ← saw، buy ← bought. في السؤال والنفي نعود للفعل الأصلي مع did: Did you go? / I didn't go.",
          examples: [
            { en: "I played football.", ar: "لعبت كرة القدم." },
            { en: "I didn't go to work.", ar: "لم أذهب إلى العمل." },
          ],
        },
        dialogue: [
          { who: "Rami", en: "What did you do last weekend?", ar: "ماذا فعلت في عطلة الأسبوع الماضي؟" },
          { who: "Layla", en: "I went to Penang with my family.", ar: "ذهبت إلى بينانغ مع عائلتي." },
          { who: "Rami", en: "Did you like it?", ar: "هل أعجبتك؟" },
          { who: "Layla", en: "Yes! We saw the old town and ate great food.", ar: "نعم! رأينا المدينة القديمة وأكلنا طعامًا رائعًا." },
        ],
      },
      {
        id: "shopping",
        title: "التسوق",
        titleEn: "Shopping",
        minutes: 10,
        words: [
          { en: "how much", ar: "بكم / كم السعر", ex: "How much is this shirt?", emoji: "💲" },
          { en: "cheap", ar: "رخيص", ex: "This bag is cheap.", emoji: "🏷️" },
          { en: "expensive", ar: "غالٍ", ex: "The phone is expensive.", emoji: "💎" },
          { en: "size", ar: "مقاس", ex: "Do you have a bigger size?", emoji: "📏" },
          { en: "pay", ar: "يدفع", ex: "Can I pay by card?", emoji: "💳" },
          { en: "shop", ar: "متجر", ex: "The shop opens at nine.", emoji: "🏬" },
        ],
        sentences: [
          { en: "How much is this?", ar: "بكم هذا؟" },
          { en: "It is too expensive.", ar: "إنه غالٍ جدًا." },
          { en: "Can I pay by card?", ar: "هل يمكنني الدفع بالبطاقة؟" },
        ],
        grammar: {
          title: "too و very",
          body: "very تعني (جدًا) وتصف الشيء فقط: very cheap. أما too فتعني (أكثر من اللازم) وفيها معنى المشكلة: too expensive أي لا أستطيع شراءه.",
          examples: [
            { en: "It is very nice.", ar: "إنه جميل جدًا." },
            { en: "It is too big for me.", ar: "إنه كبير جدًا عليّ." },
          ],
        },
        dialogue: [
          { who: "Customer", en: "Excuse me, how much is this jacket?", ar: "عفوًا، بكم هذا المعطف؟" },
          { who: "Seller", en: "It's ninety ringgit.", ar: "بتسعين رنغيت." },
          { who: "Customer", en: "Do you have a smaller size?", ar: "هل لديك مقاس أصغر؟" },
          { who: "Seller", en: "Yes, here you are.", ar: "نعم، تفضل." },
          { who: "Customer", en: "Great. Can I pay by card?", ar: "رائع. هل يمكنني الدفع بالبطاقة؟" },
        ],
      },
    ],
    upcoming: ["السفر والمواصلات", "الصحة وزيارة الطبيب", "الطقس والفصول"],
  },
];

/** English for Kids 1 */
export const kids1Modules: Module[] = [
  {
    title: "عالم الألوان والحيوانات",
    titleEn: "Colors & Animals",
    lessons: [
      {
        id: "colors",
        title: "الألوان",
        titleEn: "Colors",
        minutes: 6,
        words: [
          { en: "red", ar: "أحمر", ex: "The apple is red.", emoji: "🔴" },
          { en: "blue", ar: "أزرق", ex: "The sky is blue.", emoji: "🔵" },
          { en: "yellow", ar: "أصفر", ex: "The sun is yellow.", emoji: "🟡" },
          { en: "green", ar: "أخضر", ex: "The tree is green.", emoji: "🟢" },
          { en: "white", ar: "أبيض", ex: "The cloud is white.", emoji: "⚪" },
        ],
        sentences: [
          { en: "The sky is blue.", ar: "السماء زرقاء." },
          { en: "I like red.", ar: "أحب اللون الأحمر." },
        ],
      },
      {
        id: "animals",
        title: "الحيوانات",
        titleEn: "Animals",
        minutes: 6,
        words: [
          { en: "cat", ar: "قطة", ex: "The cat is small.", emoji: "🐱" },
          { en: "dog", ar: "كلب", ex: "The dog can run.", emoji: "🐶" },
          { en: "bird", ar: "طائر", ex: "The bird can fly.", emoji: "🐦" },
          { en: "fish", ar: "سمكة", ex: "The fish can swim.", emoji: "🐟" },
          { en: "camel", ar: "جمل", ex: "The camel is tall.", emoji: "🐪" },
        ],
        sentences: [
          { en: "The bird can fly.", ar: "الطائر يستطيع الطيران." },
          { en: "I have a cat.", ar: "عندي قطة." },
        ],
      },
    ],
    upcoming: ["الأرقام بالأغاني", "جسمي", "ألعابي"],
  },
];

/** Everyday Conversation */
export const conv1Modules: Module[] = [
  {
    title: "مواقف من الحياة اليومية",
    titleEn: "Real-life Situations",
    lessons: [
      {
        id: "cafe",
        title: "في المقهى",
        titleEn: "At the café",
        minutes: 10,
        words: [
          { en: "I'd like", ar: "أودّ / أريد (بأدب)", ex: "I'd like a latte, please.", emoji: "🙂" },
          { en: "order", ar: "طلب / يطلب", ex: "Can I take your order?", emoji: "📝" },
          { en: "to go", ar: "سفري (للأخذ)", ex: "A coffee to go, please.", emoji: "🥤" },
          { en: "the bill", ar: "الحساب / الفاتورة", ex: "Can we have the bill?", emoji: "🧾" },
          { en: "sugar", ar: "سكر", ex: "No sugar, please.", emoji: "🍬" },
          { en: "small", ar: "صغير", ex: "A small tea, please.", emoji: "🔹" },
        ],
        sentences: [
          { en: "I'd like a small coffee, please.", ar: "أريد قهوة صغيرة من فضلك." },
          { en: "Can I have the bill, please?", ar: "هل يمكنني الحصول على الحساب من فضلك؟" },
          { en: "For here or to go?", ar: "هنا أم سفري؟" },
        ],
        grammar: {
          title: "الطلب بأدب: I'd like و Can I have",
          body: "قول I want مباشر وقد يبدو جافًا. الأفضل في المطاعم والمحلات: I'd like… أو Can I have…, please?",
          examples: [
            { en: "I'd like some water.", ar: "أودّ بعض الماء." },
            { en: "Can I have a menu, please?", ar: "هل يمكنني الحصول على قائمة الطعام؟" },
          ],
        },
        dialogue: [
          { who: "Barista", en: "Hi! What can I get you?", ar: "أهلًا! ماذا أحضر لك؟" },
          { who: "You", en: "I'd like a small latte, please.", ar: "أريد لاتيه صغيرًا من فضلك." },
          { who: "Barista", en: "For here or to go?", ar: "هنا أم سفري؟" },
          { who: "You", en: "To go, please. No sugar.", ar: "سفري من فضلك. بلا سكر." },
        ],
      },
      {
        id: "airport",
        title: "في المطار",
        titleEn: "At the airport",
        minutes: 11,
        words: [
          { en: "passport", ar: "جواز سفر", ex: "Here is my passport.", emoji: "🛂" },
          { en: "flight", ar: "رحلة جوية", ex: "My flight is at ten.", emoji: "✈️" },
          { en: "gate", ar: "بوابة", ex: "Go to gate twelve.", emoji: "🚪" },
          { en: "luggage", ar: "أمتعة", ex: "Where is my luggage?", emoji: "🧳" },
          { en: "boarding pass", ar: "بطاقة الصعود", ex: "Show your boarding pass.", emoji: "🎫" },
          { en: "delayed", ar: "متأخر (مؤجل)", ex: "The flight is delayed.", emoji: "⏳" },
        ],
        sentences: [
          { en: "Where is gate twelve?", ar: "أين البوابة رقم اثني عشر؟" },
          { en: "My flight is delayed.", ar: "رحلتي متأخرة." },
          { en: "Here is my passport.", ar: "هذا جواز سفري." },
        ],
        dialogue: [
          { who: "Officer", en: "Passport, please.", ar: "الجواز من فضلك." },
          { who: "You", en: "Here you are.", ar: "تفضل." },
          { who: "Officer", en: "What is the purpose of your visit?", ar: "ما غرض زيارتك؟" },
          { who: "You", en: "I'm here for study.", ar: "جئت للدراسة." },
        ],
      },
    ],
    upcoming: ["مكالمة هاتفية", "عند الطبيب", "حجز فندق"],
  },
];

/** Business English */
export const biz1Modules: Module[] = [
  {
    title: "الإنجليزية في بيئة العمل",
    titleEn: "English at Work",
    lessons: [
      {
        id: "work-intro",
        title: "تقديم نفسك في العمل",
        titleEn: "Introducing yourself at work",
        minutes: 12,
        words: [
          { en: "colleague", ar: "زميل عمل", ex: "This is my colleague, Sam.", emoji: "🧑‍💼" },
          { en: "department", ar: "قسم / إدارة", ex: "I work in the finance department.", emoji: "🏢" },
          { en: "responsible for", ar: "مسؤول عن", ex: "I'm responsible for sales.", emoji: "📋" },
          { en: "meeting", ar: "اجتماع", ex: "The meeting starts at nine.", emoji: "📅" },
          { en: "deadline", ar: "موعد التسليم النهائي", ex: "The deadline is Friday.", emoji: "⏱️" },
          { en: "manager", ar: "مدير", ex: "She is the project manager.", emoji: "👩‍💼" },
        ],
        sentences: [
          { en: "I work in the marketing department.", ar: "أعمل في قسم التسويق." },
          { en: "I'm responsible for customer service.", ar: "أنا مسؤول عن خدمة العملاء." },
          { en: "The deadline is next Monday.", ar: "موعد التسليم يوم الإثنين القادم." },
        ],
        grammar: {
          title: "work in / work for / work as",
          body: "work in + القسم أو المجال، work for + اسم الشركة، work as + المسمى الوظيفي. مثال: I work as an accountant for Petronas in the finance department.",
          examples: [
            { en: "I work for a bank.", ar: "أعمل لدى بنك." },
            { en: "She works as a designer.", ar: "تعمل مصممة." },
          ],
        },
        dialogue: [
          { who: "Sam", en: "Hi, I don't think we've met. I'm Sam.", ar: "مرحبًا، لا أظننا التقينا. أنا سام." },
          { who: "Aisha", en: "Nice to meet you, Sam. I'm Aisha. I work in HR.", ar: "تشرفت يا سام. أنا عائشة، أعمل في الموارد البشرية." },
          { who: "Sam", en: "What are you responsible for?", ar: "عن ماذا أنتِ مسؤولة؟" },
          { who: "Aisha", en: "I'm responsible for training new staff.", ar: "أنا مسؤولة عن تدريب الموظفين الجدد." },
        ],
      },
    ],
    upcoming: ["كتابة البريد الإلكتروني الرسمي", "إدارة الاجتماعات", "العروض التقديمية"],
  },
];

/** IELTS Preparation */
export const ielts1Modules: Module[] = [
  {
    title: "مفردات أكاديمية أساسية",
    titleEn: "Core Academic Vocabulary",
    lessons: [
      {
        id: "academic-1",
        title: "مفردات وصف البيانات",
        titleEn: "Describing data (Task 1)",
        minutes: 14,
        words: [
          { en: "increase", ar: "ارتفاع / يرتفع", ex: "Sales increased sharply in 2020.", emoji: "📈" },
          { en: "decline", ar: "انخفاض / ينخفض", ex: "There was a slight decline.", emoji: "📉" },
          { en: "remain stable", ar: "يظل ثابتًا", ex: "Prices remained stable.", emoji: "➖" },
          { en: "significant", ar: "كبير / ملحوظ", ex: "a significant rise", emoji: "❗" },
          { en: "proportion", ar: "نسبة", ex: "a large proportion of students", emoji: "🥧" },
          { en: "approximately", ar: "تقريبًا", ex: "approximately 40 percent", emoji: "≈" },
        ],
        sentences: [
          { en: "The number of students increased significantly.", ar: "ارتفع عدد الطلاب ارتفاعًا ملحوظًا." },
          { en: "Prices remained stable until 2015.", ar: "ظلت الأسعار ثابتة حتى عام 2015." },
          { en: "The chart shows a gradual decline.", ar: "يُظهر الرسم البياني انخفاضًا تدريجيًا." },
        ],
        grammar: {
          title: "الفعل + الظرف، أو الصفة + الاسم",
          body: "في وصف الرسوم البيانية يمكنك التنويع بين صيغتين: increased significantly (فعل + ظرف) أو a significant increase (صفة + اسم). التنويع يرفع درجة Lexical Resource.",
          examples: [
            { en: "Sales rose sharply.", ar: "ارتفعت المبيعات بحدة." },
            { en: "There was a sharp rise in sales.", ar: "حدث ارتفاع حاد في المبيعات." },
          ],
        },
      },
    ],
    upcoming: ["هيكل مقال Task 2", "استراتيجيات الاستماع", "أسئلة المحادثة Part 2"],
  },
];
