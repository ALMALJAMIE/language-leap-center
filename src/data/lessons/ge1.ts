import type { Module } from "@/lib/types";

/** General English 1 — Starter (A1) */
export const ge1Modules: Module[] = [
  {
    title: "Hello! Greetings & Introductions",
    lessons: [
      {
        id: "greetings",
        title: "Everyday greetings",
        minutes: 8,
        words: [
          { en: "hello", def: "a word to greet someone", ar: "مرحبًا", ex: "Hello, Sara!", emoji: "👋" },
          { en: "good morning", def: "a greeting before noon", ar: "صباح الخير", ex: "Good morning, teacher.", emoji: "🌅" },
          { en: "good evening", def: "a greeting at night", ar: "مساء الخير", ex: "Good evening, everyone.", emoji: "🌆" },
          { en: "goodbye", def: "what you say when you leave", ar: "مع السلامة", ex: "Goodbye, see you tomorrow.", emoji: "🙋" },
          { en: "thank you", def: "words to show you are grateful", ar: "شكرًا لك", ex: "Thank you very much.", emoji: "🙏" },
          { en: "please", def: "a polite word when you ask", ar: "من فضلك", ex: "Water, please.", emoji: "🤲" },
        ],
        sentences: [
          { en: "Good morning, how are you?", ar: "صباح الخير، كيف حالك؟" },
          { en: "I am fine, thank you.", ar: "أنا بخير، شكرًا لك." },
          { en: "See you tomorrow.", ar: "أراك غدًا." },
        ],
        grammar: {
          title: "How are you?",
          body: "We ask “How are you?” to be friendly. The usual answers are “I am fine” or “I'm good”, and we add “thank you” to be polite. The word I (= me) is always a capital letter.",
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
        title: "My name is…",
        minutes: 9,
        words: [
          { en: "name", def: "what people call you", ar: "اسم", ex: "My name is Omar.", emoji: "🪪" },
          { en: "what", def: "a question word for things", ar: "ماذا / ما", ex: "What is your name?", emoji: "❓" },
          { en: "my", def: "belongs to me", ar: "ـي (ملكي)", ex: "This is my book.", emoji: "🙋‍♂️" },
          { en: "your", def: "belongs to you", ar: "ـك (ملكك)", ex: "What is your name?", emoji: "👉" },
          { en: "nice to meet you", def: "what you say to a new person", ar: "تشرفت بمعرفتك", ex: "Nice to meet you, Huda.", emoji: "🤝" },
          { en: "friend", def: "a person you like and know well", ar: "صديق", ex: "He is my friend.", emoji: "🧑‍🤝‍🧑" },
        ],
        sentences: [
          { en: "What is your name?", ar: "ما اسمك؟" },
          { en: "My name is Ahmed.", ar: "اسمي أحمد." },
          { en: "Nice to meet you.", ar: "تشرفت بمعرفتك." },
        ],
        grammar: {
          title: "my and your",
          body: "Put “my” or “your” before a noun to show who it belongs to: my name, your friend. They never change: my book, my books.",
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
        title: "Where are you from?",
        minutes: 9,
        words: [
          { en: "country", def: "a nation, like Japan or Brazil", ar: "بلد", ex: "Yemen is a beautiful country.", emoji: "🗺️" },
          { en: "from", def: "shows where you started", ar: "من", ex: "I am from Yemen.", emoji: "📍" },
          { en: "Yemen", def: "a country in Arabia", ar: "اليمن", ex: "Sana'a is in Yemen.", emoji: "🇾🇪" },
          { en: "Malaysia", def: "a country in Southeast Asia", ar: "ماليزيا", ex: "I live in Malaysia.", emoji: "🇲🇾" },
          { en: "Arabic", def: "the language of Arab countries", ar: "العربية", ex: "I speak Arabic.", emoji: "🗣️" },
          { en: "English", def: "the language you are learning", ar: "الإنجليزية", ex: "I am learning English.", emoji: "🇬🇧" },
        ],
        sentences: [
          { en: "Where are you from?", ar: "من أين أنت؟" },
          { en: "I am from Yemen.", ar: "أنا من اليمن." },
          { en: "I speak Arabic and English.", ar: "أتحدث العربية والإنجليزية." },
        ],
        grammar: {
          title: "Capital letters for countries and languages",
          body: "Names of countries, languages and nationalities always start with a capital letter in English: Yemen, Arabic, English — even in the middle of a sentence.",
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
    title: "People Around Me",
    lessons: [
      {
        id: "family",
        title: "My family",
        minutes: 9,
        words: [
          { en: "mother", def: "your female parent", ar: "أم", ex: "My mother is a teacher.", emoji: "👩" },
          { en: "father", def: "your male parent", ar: "أب", ex: "My father works in a bank.", emoji: "👨" },
          { en: "brother", def: "a boy with the same parents", ar: "أخ", ex: "I have one brother.", emoji: "👦" },
          { en: "sister", def: "a girl with the same parents", ar: "أخت", ex: "My sister is ten.", emoji: "👧" },
          { en: "son", def: "a person's male child", ar: "ابن", ex: "This is my son, Yusuf.", emoji: "🧒" },
          { en: "family", def: "parents, children and relatives", ar: "عائلة", ex: "I love my family.", emoji: "👨‍👩‍👧‍👦" },
        ],
        sentences: [
          { en: "This is my mother.", ar: "هذه أمي." },
          { en: "I have two brothers.", ar: "لدي أخوان." },
          { en: "My family is big.", ar: "عائلتي كبيرة." },
        ],
        grammar: {
          title: "This is… and I have…",
          body: "Use “This is…” to introduce a person. Use “I have…” to talk about the people or things you have. For more than one, we usually add -s: one sister, two sisters.",
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
        title: "Numbers 1–10",
        minutes: 8,
        words: [
          { en: "one", def: "the number 1", ar: "واحد", emoji: "1️⃣" },
          { en: "two", def: "the number 2", ar: "اثنان", emoji: "2️⃣" },
          { en: "three", def: "the number 3", ar: "ثلاثة", emoji: "3️⃣" },
          { en: "five", def: "the number 5", ar: "خمسة", emoji: "5️⃣" },
          { en: "seven", def: "the number 7", ar: "سبعة", emoji: "7️⃣" },
          { en: "ten", def: "the number 10", ar: "عشرة", emoji: "🔟" },
        ],
        sentences: [
          { en: "I am ten years old.", ar: "عمري عشر سنوات." },
          { en: "I have two sisters.", ar: "لدي أختان." },
          { en: "How old are you?", ar: "كم عمرك؟" },
        ],
        grammar: {
          title: "How old are you?",
          body: "Ask about age with “How old are you?” and answer with “I am + number + years old”. Do not say “I have ten years”.",
          examples: [
            { en: "How old are you?", ar: "كم عمرك؟" },
            { en: "I am seven years old.", ar: "عمري سبع سنوات." },
          ],
        },
      },
      {
        id: "jobs",
        title: "Jobs",
        minutes: 10,
        words: [
          { en: "teacher", def: "a person who teaches at school", ar: "معلم", ex: "She is a teacher.", emoji: "👩‍🏫" },
          { en: "student", def: "a person who studies", ar: "طالب", ex: "I am a student.", emoji: "🎓" },
          { en: "doctor", def: "a person who helps sick people", ar: "طبيب", ex: "My uncle is a doctor.", emoji: "🩺" },
          { en: "engineer", def: "a person who designs and builds", ar: "مهندس", ex: "He is an engineer.", emoji: "👷" },
          { en: "driver", def: "a person who drives a car or bus", ar: "سائق", ex: "The driver is here.", emoji: "🚕" },
          { en: "job", def: "the work you do for money", ar: "وظيفة", ex: "What is your job?", emoji: "💼" },
        ],
        sentences: [
          { en: "What is your job?", ar: "ما عملك؟" },
          { en: "I am a teacher.", ar: "أنا معلم." },
          { en: "He is an engineer.", ar: "هو مهندس." },
        ],
        grammar: {
          title: "a or an before a job",
          body: "Use a or an before a job. Use “an” when the next word starts with a vowel sound (a, e, i, o, u): an engineer. Use “a” for other sounds: a doctor.",
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
    title: "My Daily Life",
    lessons: [
      {
        id: "food",
        title: "Food & drink",
        minutes: 9,
        words: [
          { en: "bread", def: "food made from flour, baked", ar: "خبز", ex: "I eat bread every day.", emoji: "🍞" },
          { en: "water", def: "a clear drink from the tap", ar: "ماء", ex: "Can I have some water?", emoji: "💧" },
          { en: "tea", def: "a hot drink made from leaves", ar: "شاي", ex: "I like tea with milk.", emoji: "🍵" },
          { en: "coffee", def: "a hot dark drink from beans", ar: "قهوة", ex: "Yemeni coffee is famous.", emoji: "☕" },
          { en: "rice", def: "small white grains we cook", ar: "أرز", ex: "We eat rice for lunch.", emoji: "🍚" },
          { en: "apple", def: "a round red or green fruit", ar: "تفاحة", ex: "An apple a day.", emoji: "🍎" },
        ],
        sentences: [
          { en: "I like coffee.", ar: "أحب القهوة." },
          { en: "I don't like tea.", ar: "لا أحب الشاي." },
          { en: "Can I have some water, please?", ar: "هل يمكنني الحصول على بعض الماء من فضلك؟" },
        ],
        grammar: {
          title: "I like… / I don't like…",
          body: "Say what you enjoy with “I like…”. To make it negative, put don't (= do not) before the verb: I don't like…",
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
        title: "My day",
        minutes: 10,
        words: [
          { en: "wake up", def: "stop sleeping", ar: "يستيقظ", ex: "I wake up at six.", emoji: "⏰" },
          { en: "breakfast", def: "the first meal of the day", ar: "فطور", ex: "I eat breakfast at home.", emoji: "🍳" },
          { en: "work", def: "the job you do every day", ar: "عمل", ex: "I go to work by bus.", emoji: "🏢" },
          { en: "study", def: "learn from books or lessons", ar: "يدرس", ex: "I study English at night.", emoji: "📚" },
          { en: "sleep", def: "rest at night with eyes closed", ar: "ينام", ex: "I sleep at eleven.", emoji: "😴" },
          { en: "every day", def: "on all days", ar: "كل يوم", ex: "I read every day.", emoji: "📅" },
        ],
        sentences: [
          { en: "I wake up at six.", ar: "أستيقظ في السادسة." },
          { en: "I go to work every day.", ar: "أذهب إلى العمل كل يوم." },
          { en: "She studies English at night.", ar: "هي تدرس الإنجليزية في الليل." },
        ],
        grammar: {
          title: "Present simple for habits",
          body: "Use the present simple for things you do regularly. With he, she and it, add -s to the verb: I study → she studies, I go → he goes.",
          examples: [
            { en: "I work every day.", ar: "أعمل كل يوم." },
            { en: "He works every day.", ar: "هو يعمل كل يوم." },
          ],
        },
      },
      {
        id: "places",
        title: "Places in town",
        minutes: 9,
        words: [
          { en: "school", def: "where children learn", ar: "مدرسة", ex: "The school is near my house.", emoji: "🏫" },
          { en: "hospital", def: "where doctors help sick people", ar: "مستشفى", ex: "Where is the hospital?", emoji: "🏥" },
          { en: "market", def: "where you buy food and things", ar: "سوق", ex: "We buy fruit at the market.", emoji: "🛒" },
          { en: "mosque", def: "a place where Muslims pray", ar: "مسجد", ex: "The mosque is on the left.", emoji: "🕌" },
          { en: "park", def: "a green public place with trees", ar: "حديقة عامة", ex: "Children play in the park.", emoji: "🌳" },
          { en: "near", def: "not far from", ar: "قريب من", ex: "The bank is near the park.", emoji: "📌" },
        ],
        sentences: [
          { en: "Where is the hospital?", ar: "أين المستشفى؟" },
          { en: "The school is near the park.", ar: "المدرسة قريبة من الحديقة." },
          { en: "Go straight and turn left.", ar: "امشِ مباشرة ثم انعطف يسارًا." },
        ],
        grammar: {
          title: "Where is…?",
          body: "Ask where something is with “Where is the…?”. Answer with place words: near, next to, on the left, on the right.",
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
