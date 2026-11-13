import type { Module } from "@/lib/types";

/** General English 1 — Starter (A1) */
export const ge1Modules: Module[] = [
  {
    title: "مرحبًا! التحية والتعارف",
    titleEn: "Hello! Greetings & Introductions",
    lessons: [
      {
        id: "greetings",
        title: "التحيات اليومية",
        titleEn: "Everyday greetings",
        minutes: 8,
        words: [
          { en: "hello", ar: "مرحبًا", ex: "Hello, Sara!", emoji: "👋" },
          { en: "good morning", ar: "صباح الخير", ex: "Good morning, teacher.", emoji: "🌅" },
          { en: "good evening", ar: "مساء الخير", ex: "Good evening, everyone.", emoji: "🌆" },
          { en: "goodbye", ar: "مع السلامة", ex: "Goodbye, see you tomorrow.", emoji: "🙋" },
          { en: "thank you", ar: "شكرًا لك", ex: "Thank you very much.", emoji: "🙏" },
          { en: "please", ar: "من فضلك", ex: "Water, please.", emoji: "🤲" },
        ],
        sentences: [
          { en: "Good morning, how are you?", ar: "صباح الخير، كيف حالك؟" },
          { en: "I am fine, thank you.", ar: "أنا بخير، شكرًا لك." },
          { en: "See you tomorrow.", ar: "أراك غدًا." },
        ],
        grammar: {
          title: "كيف تسأل عن الحال وتجيب؟",
          body: "في الإنجليزية نسأل: How are you? وأشهر الإجابات: I am fine أو I'm good، ثم نضيف thank you تأدبًا. كلمة I (أنا) تُكتب دائمًا بحرف كبير.",
          examples: [
            { en: "How are you?", ar: "كيف حالك؟" },
            { en: "I'm fine, thanks.", ar: "أنا بخير، شكرًا." },
          ],
        },
        dialogue: [
          { who: "Ali", en: "Good morning, Sara!", ar: "صباح الخير يا سارة!" },
          { who: "Sara", en: "Good morning, Ali. How are you?", ar: "صباح الخير يا علي. كيف حالك؟" },
          { who: "Ali", en: "I am fine, thank you. And you?", ar: "أنا بخير، شكرًا. وأنتِ؟" },
          { who: "Sara", en: "I'm good. See you tomorrow!", ar: "أنا بخير. أراك غدًا!" },
        ],
      },
      {
        id: "my-name",
        title: "اسمي هو…",
        titleEn: "My name is…",
        minutes: 9,
        words: [
          { en: "name", ar: "اسم", ex: "My name is Omar.", emoji: "🪪" },
          { en: "what", ar: "ماذا / ما", ex: "What is your name?", emoji: "❓" },
          { en: "my", ar: "ـي (ملكي)", ex: "This is my book.", emoji: "🙋‍♂️" },
          { en: "your", ar: "ـك (ملكك)", ex: "What is your name?", emoji: "👉" },
          { en: "nice to meet you", ar: "تشرفت بمعرفتك", ex: "Nice to meet you, Huda.", emoji: "🤝" },
          { en: "friend", ar: "صديق", ex: "He is my friend.", emoji: "🧑‍🤝‍🧑" },
        ],
        sentences: [
          { en: "What is your name?", ar: "ما اسمك؟" },
          { en: "My name is Ahmed.", ar: "اسمي أحمد." },
          { en: "Nice to meet you.", ar: "تشرفت بمعرفتك." },
        ],
        grammar: {
          title: "my و your",
          body: "الإنجليزية لا تضيف ضميرًا في آخر الكلمة كما نفعل في العربية (اسمي، اسمك)، بل تضع كلمة قبلها: my name = اسمي، your name = اسمك.",
          examples: [
            { en: "my name", ar: "اسمي" },
            { en: "your friend", ar: "صديقك" },
          ],
        },
        dialogue: [
          { who: "Omar", en: "Hi! What is your name?", ar: "مرحبًا! ما اسمك؟" },
          { who: "Huda", en: "My name is Huda. And you?", ar: "اسمي هدى. وأنت؟" },
          { who: "Omar", en: "I'm Omar. Nice to meet you.", ar: "أنا عمر. تشرفت بمعرفتك." },
          { who: "Huda", en: "Nice to meet you too.", ar: "وأنا كذلك." },
        ],
      },
      {
        id: "countries",
        title: "من أين أنت؟",
        titleEn: "Where are you from?",
        minutes: 9,
        words: [
          { en: "country", ar: "بلد", ex: "Yemen is a beautiful country.", emoji: "🗺️" },
          { en: "from", ar: "من", ex: "I am from Yemen.", emoji: "📍" },
          { en: "Yemen", ar: "اليمن", ex: "Sana'a is in Yemen.", emoji: "🇾🇪" },
          { en: "Malaysia", ar: "ماليزيا", ex: "I live in Malaysia.", emoji: "🇲🇾" },
          { en: "Arabic", ar: "العربية", ex: "I speak Arabic.", emoji: "🗣️" },
          { en: "English", ar: "الإنجليزية", ex: "I am learning English.", emoji: "🇬🇧" },
        ],
        sentences: [
          { en: "Where are you from?", ar: "من أين أنت؟" },
          { en: "I am from Yemen.", ar: "أنا من اليمن." },
          { en: "I speak Arabic and English.", ar: "أتحدث العربية والإنجليزية." },
        ],
        grammar: {
          title: "أسماء البلدان واللغات بحرف كبير",
          body: "تبدأ أسماء البلدان واللغات والجنسيات في الإنجليزية بحرف كبير دائمًا: Yemen, Arabic, English، حتى في وسط الجملة.",
          examples: [
            { en: "She is from Egypt.", ar: "هي من مصر." },
            { en: "We speak English.", ar: "نتحدث الإنجليزية." },
          ],
        },
        dialogue: [
          { who: "Lee", en: "Where are you from?", ar: "من أين أنت؟" },
          { who: "Saleh", en: "I am from Yemen. And you?", ar: "أنا من اليمن. وأنت؟" },
          { who: "Lee", en: "I'm from Malaysia.", ar: "أنا من ماليزيا." },
          { who: "Saleh", en: "Do you speak Arabic?", ar: "هل تتحدث العربية؟" },
          { who: "Lee", en: "A little!", ar: "قليلًا!" },
        ],
      },
    ],
  },
  {
    title: "الناس من حولي",
    titleEn: "People Around Me",
    lessons: [
      {
        id: "family",
        title: "عائلتي",
        titleEn: "My family",
        minutes: 9,
        words: [
          { en: "mother", ar: "أم", ex: "My mother is a teacher.", emoji: "👩" },
          { en: "father", ar: "أب", ex: "My father works in a bank.", emoji: "👨" },
          { en: "brother", ar: "أخ", ex: "I have one brother.", emoji: "👦" },
          { en: "sister", ar: "أخت", ex: "My sister is ten.", emoji: "👧" },
          { en: "son", ar: "ابن", ex: "This is my son, Yusuf.", emoji: "🧒" },
          { en: "family", ar: "عائلة", ex: "I love my family.", emoji: "👨‍👩‍👧‍👦" },
        ],
        sentences: [
          { en: "This is my mother.", ar: "هذه أمي." },
          { en: "I have two brothers.", ar: "لدي أخوان." },
          { en: "My family is big.", ar: "عائلتي كبيرة." },
        ],
        grammar: {
          title: "this is و I have",
          body: "نقدّم شخصًا بقولنا This is… (هذا/هذه). ونستعمل I have… للتعبير عن الملكية والعدد: I have two sisters. الجمع غالبًا بإضافة s.",
          examples: [
            { en: "This is my father.", ar: "هذا أبي." },
            { en: "I have three sisters.", ar: "لدي ثلاث أخوات." },
          ],
        },
        dialogue: [
          { who: "Noor", en: "Is this your family?", ar: "هل هذه عائلتك؟" },
          { who: "Adam", en: "Yes. This is my mother and this is my father.", ar: "نعم. هذه أمي وهذا أبي." },
          { who: "Noor", en: "Do you have a brother?", ar: "هل لديك أخ؟" },
          { who: "Adam", en: "Yes, I have one brother and two sisters.", ar: "نعم، لدي أخ وأختان." },
        ],
      },
      {
        id: "numbers",
        title: "الأرقام من 1 إلى 10",
        titleEn: "Numbers 1–10",
        minutes: 8,
        words: [
          { en: "one", ar: "واحد (1)", emoji: "1️⃣" },
          { en: "two", ar: "اثنان (2)", emoji: "2️⃣" },
          { en: "three", ar: "ثلاثة (3)", emoji: "3️⃣" },
          { en: "five", ar: "خمسة (5)", emoji: "5️⃣" },
          { en: "seven", ar: "سبعة (7)", emoji: "7️⃣" },
          { en: "ten", ar: "عشرة (10)", emoji: "🔟" },
        ],
        sentences: [
          { en: "I am ten years old.", ar: "عمري عشر سنوات." },
          { en: "I have two sisters.", ar: "لدي أختان." },
          { en: "How old are you?", ar: "كم عمرك؟" },
        ],
        grammar: {
          title: "السؤال عن العمر",
          body: "نسأل عن العمر بـ How old are you? ونجيب بـ I am + الرقم + years old. لا نستعمل have للعمر كما في بعض اللغات.",
          examples: [
            { en: "How old are you?", ar: "كم عمرك؟" },
            { en: "I am seven years old.", ar: "عمري سبع سنوات." },
          ],
        },
      },
      {
        id: "jobs",
        title: "المهن",
        titleEn: "Jobs",
        minutes: 10,
        words: [
          { en: "teacher", ar: "معلم", ex: "She is a teacher.", emoji: "👩‍🏫" },
          { en: "student", ar: "طالب", ex: "I am a student.", emoji: "🎓" },
          { en: "doctor", ar: "طبيب", ex: "My uncle is a doctor.", emoji: "🩺" },
          { en: "engineer", ar: "مهندس", ex: "He is an engineer.", emoji: "👷" },
          { en: "driver", ar: "سائق", ex: "The driver is here.", emoji: "🚕" },
          { en: "job", ar: "وظيفة / عمل", ex: "What is your job?", emoji: "💼" },
        ],
        sentences: [
          { en: "What is your job?", ar: "ما عملك؟" },
          { en: "I am a teacher.", ar: "أنا معلم." },
          { en: "He is an engineer.", ar: "هو مهندس." },
        ],
        grammar: {
          title: "a و an قبل المهنة",
          body: "نضع a أو an قبل المهنة المفردة. نستعمل an إذا بدأت الكلمة بصوت متحرك (a, e, i, o, u) مثل an engineer، و a في غير ذلك مثل a doctor.",
          examples: [
            { en: "She is a doctor.", ar: "هي طبيبة." },
            { en: "I am an engineer.", ar: "أنا مهندس." },
          ],
        },
        dialogue: [
          { who: "Mona", en: "What is your job?", ar: "ما عملك؟" },
          { who: "Khalid", en: "I am an engineer. And you?", ar: "أنا مهندس. وأنتِ؟" },
          { who: "Mona", en: "I'm a teacher. I teach English.", ar: "أنا معلمة. أدرّس الإنجليزية." },
        ],
      },
    ],
  },
  {
    title: "حياتي اليومية",
    titleEn: "My Daily Life",
    lessons: [
      {
        id: "food",
        title: "الطعام والشراب",
        titleEn: "Food & drink",
        minutes: 9,
        words: [
          { en: "bread", ar: "خبز", ex: "I eat bread every day.", emoji: "🍞" },
          { en: "water", ar: "ماء", ex: "Can I have some water?", emoji: "💧" },
          { en: "tea", ar: "شاي", ex: "I like tea with milk.", emoji: "🍵" },
          { en: "coffee", ar: "قهوة", ex: "Yemeni coffee is famous.", emoji: "☕" },
          { en: "rice", ar: "أرز", ex: "We eat rice for lunch.", emoji: "🍚" },
          { en: "apple", ar: "تفاحة", ex: "An apple a day.", emoji: "🍎" },
        ],
        sentences: [
          { en: "I like coffee.", ar: "أحب القهوة." },
          { en: "I don't like tea.", ar: "لا أحب الشاي." },
          { en: "Can I have some water, please?", ar: "هل يمكنني الحصول على بعض الماء من فضلك؟" },
        ],
        grammar: {
          title: "I like و I don't like",
          body: "نعبّر عن الإعجاب بـ I like، وعن النفي بإضافة don't (اختصار do not) قبل الفعل: I don't like.",
          examples: [
            { en: "I like rice.", ar: "أحب الأرز." },
            { en: "I don't like coffee.", ar: "لا أحب القهوة." },
          ],
        },
        dialogue: [
          { who: "Waiter", en: "Good evening. What would you like?", ar: "مساء الخير. ماذا تحب أن تطلب؟" },
          { who: "Sami", en: "Rice and chicken, please.", ar: "أرز ودجاج من فضلك." },
          { who: "Waiter", en: "And to drink?", ar: "وماذا تشرب؟" },
          { who: "Sami", en: "Tea, please. Thank you.", ar: "شاي من فضلك. شكرًا." },
        ],
      },
      {
        id: "routine",
        title: "يومي",
        titleEn: "My day",
        minutes: 10,
        words: [
          { en: "wake up", ar: "يستيقظ", ex: "I wake up at six.", emoji: "⏰" },
          { en: "breakfast", ar: "فطور", ex: "I eat breakfast at home.", emoji: "🍳" },
          { en: "work", ar: "عمل / يعمل", ex: "I go to work by bus.", emoji: "🏢" },
          { en: "study", ar: "يدرس", ex: "I study English at night.", emoji: "📚" },
          { en: "sleep", ar: "ينام", ex: "I sleep at eleven.", emoji: "😴" },
          { en: "every day", ar: "كل يوم", ex: "I read every day.", emoji: "📅" },
        ],
        sentences: [
          { en: "I wake up at six.", ar: "أستيقظ في السادسة." },
          { en: "I go to work every day.", ar: "أذهب إلى العمل كل يوم." },
          { en: "She studies English at night.", ar: "هي تدرس الإنجليزية في الليل." },
        ],
        grammar: {
          title: "المضارع البسيط للعادات",
          body: "نستعمل المضارع البسيط للحديث عن العادات اليومية. مع he و she و it نضيف s للفعل: I study ← she studies، I go ← he goes.",
          examples: [
            { en: "I work every day.", ar: "أعمل كل يوم." },
            { en: "He works every day.", ar: "هو يعمل كل يوم." },
          ],
        },
      },
      {
        id: "places",
        title: "أماكن في المدينة",
        titleEn: "Places in town",
        minutes: 9,
        words: [
          { en: "school", ar: "مدرسة", ex: "The school is near my house.", emoji: "🏫" },
          { en: "hospital", ar: "مستشفى", ex: "Where is the hospital?", emoji: "🏥" },
          { en: "market", ar: "سوق", ex: "We buy fruit at the market.", emoji: "🛒" },
          { en: "mosque", ar: "مسجد", ex: "The mosque is on the left.", emoji: "🕌" },
          { en: "park", ar: "حديقة عامة", ex: "Children play in the park.", emoji: "🌳" },
          { en: "near", ar: "قريب من", ex: "The bank is near the park.", emoji: "📌" },
        ],
        sentences: [
          { en: "Where is the hospital?", ar: "أين المستشفى؟" },
          { en: "The school is near the park.", ar: "المدرسة قريبة من الحديقة." },
          { en: "Go straight and turn left.", ar: "امشِ مباشرة ثم انعطف يسارًا." },
        ],
        grammar: {
          title: "Where is…? للسؤال عن المكان",
          body: "نسأل عن مكان شيء بـ Where is the…? ونجيب بحروف الجر: near (قريب من)، next to (بجانب)، on the left (على اليسار).",
          examples: [
            { en: "Where is the market?", ar: "أين السوق؟" },
            { en: "It is next to the mosque.", ar: "إنه بجانب المسجد." },
          ],
        },
        dialogue: [
          { who: "Tourist", en: "Excuse me, where is the hospital?", ar: "عفوًا، أين المستشفى؟" },
          { who: "Hasan", en: "Go straight and turn left.", ar: "امشِ مباشرة ثم انعطف يسارًا." },
          { who: "Tourist", en: "Is it near the park?", ar: "هل هو قريب من الحديقة؟" },
          { who: "Hasan", en: "Yes, it is next to the park.", ar: "نعم، إنه بجانب الحديقة." },
          { who: "Tourist", en: "Thank you very much!", ar: "شكرًا جزيلًا!" },
        ],
      },
    ],
  },
];
