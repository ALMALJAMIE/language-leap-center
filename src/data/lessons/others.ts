import type { Module } from "@/lib/types";

/** General English 2 — Elementary (A2) */
export const ge2Modules: Module[] = [
  {
    title: "Past & Experiences",
    lessons: [
      {
        id: "last-weekend",
        title: "Last weekend",
        minutes: 11,
        words: [
          { en: "yesterday", def: "the day before today", ar: "أمس", ex: "I visited my uncle yesterday.", emoji: "📆" },
          { en: "visited", def: "went to see a person or place", ar: "زار", ex: "We visited Penang.", emoji: "🧳" },
          { en: "went", def: "past of “go”", ar: "ذهب", ex: "She went to the beach.", emoji: "🏖️" },
          { en: "saw", def: "past of “see”", ar: "رأى", ex: "I saw a great film.", emoji: "👀" },
          { en: "bought", def: "past of “buy”", ar: "اشترى", ex: "He bought a new phone.", emoji: "🛍️" },
          { en: "last week", def: "the week before this one", ar: "الأسبوع الماضي", ex: "I was busy last week.", emoji: "⏪" },
        ],
        sentences: [
          { en: "I went to the market yesterday.", ar: "ذهبت إلى السوق أمس." },
          { en: "We visited our family last week.", ar: "زرنا عائلتنا الأسبوع الماضي." },
          { en: "Did you see the film?", ar: "هل رأيت الفيلم؟" },
        ],
        grammar: {
          title: "Past simple: regular and irregular verbs",
          body: "Regular verbs add -ed (visit → visited). Irregular verbs change form and must be learned: go → went, see → saw, buy → bought. In questions and negatives use did + the base verb: Did you go? / I didn't go.",
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
        title: "Shopping",
        minutes: 10,
        words: [
          { en: "how much", def: "asks about the price", ar: "بكم", ex: "How much is this shirt?", emoji: "💲" },
          { en: "cheap", def: "low in price", ar: "رخيص", ex: "This bag is cheap.", emoji: "🏷️" },
          { en: "expensive", def: "high in price", ar: "غالٍ", ex: "The phone is expensive.", emoji: "💎" },
          { en: "size", def: "how big or small clothes are", ar: "مقاس", ex: "Do you have a bigger size?", emoji: "📏" },
          { en: "pay", def: "give money for something", ar: "يدفع", ex: "Can I pay by card?", emoji: "💳" },
          { en: "shop", def: "a place where you buy things", ar: "متجر", ex: "The shop opens at nine.", emoji: "🏬" },
        ],
        sentences: [
          { en: "How much is this?", ar: "بكم هذا؟" },
          { en: "It is too expensive.", ar: "إنه غالٍ جدًا." },
          { en: "Can I pay by card?", ar: "هل يمكنني الدفع بالبطاقة؟" },
        ],
        grammar: {
          title: "too vs. very",
          body: "“Very” makes an adjective stronger: very cheap. “Too” means more than you want — it shows a problem: too expensive (so I can't buy it).",
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
    upcoming: ["Travel & transport", "At the doctor's", "Weather & seasons"],
  },
];

/** English for Kids 1 */
export const kids1Modules: Module[] = [
  {
    title: "Colors & Animals",
    lessons: [
      {
        id: "colors",
        title: "Colors",
        minutes: 6,
        words: [
          { en: "red", def: "the color of an apple", ar: "أحمر", ex: "The apple is red.", emoji: "🔴" },
          { en: "blue", def: "the color of the sky", ar: "أزرق", ex: "The sky is blue.", emoji: "🔵" },
          { en: "yellow", def: "the color of the sun", ar: "أصفر", ex: "The sun is yellow.", emoji: "🟡" },
          { en: "green", def: "the color of a leaf", ar: "أخضر", ex: "The tree is green.", emoji: "🟢" },
          { en: "white", def: "the color of milk", ar: "أبيض", ex: "The cloud is white.", emoji: "⚪" },
        ],
        sentences: [
          { en: "The sky is blue.", ar: "السماء زرقاء." },
          { en: "I like red.", ar: "أحب اللون الأحمر." },
        ],
      },
      {
        id: "animals",
        title: "Animals",
        minutes: 6,
        words: [
          { en: "cat", def: "a small pet that says meow", ar: "قطة", ex: "The cat is small.", emoji: "🐱" },
          { en: "dog", def: "a pet that says woof", ar: "كلب", ex: "The dog can run.", emoji: "🐶" },
          { en: "bird", def: "an animal that can fly", ar: "طائر", ex: "The bird can fly.", emoji: "🐦" },
          { en: "fish", def: "an animal that lives in water", ar: "سمكة", ex: "The fish can swim.", emoji: "🐟" },
          { en: "camel", def: "a desert animal with a hump", ar: "جمل", ex: "The camel is tall.", emoji: "🐪" },
        ],
        sentences: [
          { en: "The bird can fly.", ar: "الطائر يستطيع الطيران." },
          { en: "I have a cat.", ar: "عندي قطة." },
        ],
      },
    ],
    upcoming: ["Number songs", "My body", "My toys"],
  },
];

/** Everyday Conversation */
export const conv1Modules: Module[] = [
  {
    title: "Real-life Situations",
    lessons: [
      {
        id: "cafe",
        title: "At the café",
        minutes: 10,
        words: [
          { en: "I'd like", def: "a polite way to say “I want”", ar: "أودّ", ex: "I'd like a latte, please.", emoji: "🙂" },
          { en: "order", def: "ask for food or drink", ar: "يطلب", ex: "Can I take your order?", emoji: "📝" },
          { en: "to go", def: "to take away, not eat here", ar: "سفري", ex: "A coffee to go, please.", emoji: "🥤" },
          { en: "the bill", def: "the paper that shows what to pay", ar: "الحساب", ex: "Can we have the bill?", emoji: "🧾" },
          { en: "sugar", def: "something sweet for drinks", ar: "سكر", ex: "No sugar, please.", emoji: "🍬" },
          { en: "small", def: "not big", ar: "صغير", ex: "A small tea, please.", emoji: "🔹" },
        ],
        sentences: [
          { en: "I'd like a small coffee, please.", ar: "أريد قهوة صغيرة من فضلك." },
          { en: "Can I have the bill, please?", ar: "هل يمكنني الحصول على الحساب من فضلك؟" },
          { en: "For here or to go?", ar: "هنا أم سفري؟" },
        ],
        grammar: {
          title: "Ordering politely",
          body: "“I want…” can sound rude in a café or shop. Say “I'd like…” or “Can I have…, please?” instead.",
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
        title: "At the airport",
        minutes: 11,
        words: [
          { en: "passport", def: "your travel document", ar: "جواز سفر", ex: "Here is my passport.", emoji: "🛂" },
          { en: "flight", def: "a trip by plane", ar: "رحلة جوية", ex: "My flight is at ten.", emoji: "✈️" },
          { en: "gate", def: "where you get on the plane", ar: "بوابة", ex: "Go to gate twelve.", emoji: "🚪" },
          { en: "luggage", def: "your bags when you travel", ar: "أمتعة", ex: "Where is my luggage?", emoji: "🧳" },
          { en: "boarding pass", def: "the ticket to get on the plane", ar: "بطاقة الصعود", ex: "Show your boarding pass.", emoji: "🎫" },
          { en: "delayed", def: "later than planned", ar: "متأخر", ex: "The flight is delayed.", emoji: "⏳" },
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
    upcoming: ["Phone calls", "At the doctor's", "Booking a hotel"],
  },
];

/** Business English */
export const biz1Modules: Module[] = [
  {
    title: "English at Work",
    lessons: [
      {
        id: "work-intro",
        title: "Introducing yourself at work",
        minutes: 12,
        words: [
          { en: "colleague", def: "a person you work with", ar: "زميل عمل", ex: "This is my colleague, Sam.", emoji: "🧑‍💼" },
          { en: "department", def: "a section of a company", ar: "قسم", ex: "I work in the finance department.", emoji: "🏢" },
          { en: "responsible for", def: "in charge of", ar: "مسؤول عن", ex: "I'm responsible for sales.", emoji: "📋" },
          { en: "meeting", def: "people meeting to discuss work", ar: "اجتماع", ex: "The meeting starts at nine.", emoji: "📅" },
          { en: "deadline", def: "the last time to finish work", ar: "موعد التسليم", ex: "The deadline is Friday.", emoji: "⏱️" },
          { en: "manager", def: "a person who leads a team", ar: "مدير", ex: "She is the project manager.", emoji: "👩‍💼" },
        ],
        sentences: [
          { en: "I work in the marketing department.", ar: "أعمل في قسم التسويق." },
          { en: "I'm responsible for customer service.", ar: "أنا مسؤول عن خدمة العملاء." },
          { en: "The deadline is next Monday.", ar: "موعد التسليم يوم الإثنين القادم." },
        ],
        grammar: {
          title: "work in / work for / work as",
          body: "work in + department or field, work for + company name, work as + job title. Example: I work as an accountant for Petronas in the finance department.",
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
    upcoming: ["Writing formal emails", "Running meetings", "Presentations"],
  },
];

/** IELTS Preparation */
export const ielts1Modules: Module[] = [
  {
    title: "Core Academic Vocabulary",
    lessons: [
      {
        id: "academic-1",
        title: "Describing data (Task 1)",
        minutes: 14,
        words: [
          { en: "increase", def: "go up / a rise", ar: "ارتفاع", ex: "Sales increased sharply in 2020.", emoji: "📈" },
          { en: "decline", def: "go down / a fall", ar: "انخفاض", ex: "There was a slight decline.", emoji: "📉" },
          { en: "remain stable", def: "stay the same", ar: "يظل ثابتًا", ex: "Prices remained stable.", emoji: "➖" },
          { en: "significant", def: "large or important", ar: "ملحوظ", ex: "a significant rise", emoji: "❗" },
          { en: "proportion", def: "a part of a whole", ar: "نسبة", ex: "a large proportion of students", emoji: "🥧" },
          { en: "approximately", def: "about, not exactly", ar: "تقريبًا", ex: "approximately 40 percent", emoji: "≈" },
        ],
        sentences: [
          { en: "The number of students increased significantly.", ar: "ارتفع عدد الطلاب ارتفاعًا ملحوظًا." },
          { en: "Prices remained stable until 2015.", ar: "ظلت الأسعار ثابتة حتى عام 2015." },
          { en: "The chart shows a gradual decline.", ar: "يُظهر الرسم البياني انخفاضًا تدريجيًا." },
        ],
        grammar: {
          title: "Verb + adverb or adjective + noun",
          body: "Vary your language when describing charts: “increased significantly” (verb + adverb) or “a significant increase” (adjective + noun). This variety raises your Lexical Resource score.",
          examples: [
            { en: "Sales rose sharply.", ar: "ارتفعت المبيعات بحدة." },
            { en: "There was a sharp rise in sales.", ar: "حدث ارتفاع حاد في المبيعات." },
          ],
        },
      },
    ],
    upcoming: ["Task 2 essay structure", "Listening strategies", "Speaking Part 2"],
  },
];
