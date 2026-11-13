/** Choice lists for the Complete Your Profile page */

export const genders = ["Male", "Female", "Prefer not to say"];

export const languageLevels = ["Native", "Fluent", "Advanced", "Intermediate", "Basic"];

export const commonLanguages = [
  "Arabic", "English", "Malay", "Indonesian", "Urdu", "Hindi", "Bengali", "Turkish", "Persian", "French", "Spanish", "German",
  "Chinese (Mandarin)", "Japanese", "Korean", "Russian", "Portuguese", "Italian", "Swahili", "Somali", "Tamil", "Thai", "Other",
];

export const educationLevels = ["Primary school", "Secondary / High school", "Diploma", "Bachelor's degree", "Master's degree", "Doctorate (PhD)", "Other"];

export const socialPlatforms = ["Facebook", "Instagram", "LinkedIn", "X (Twitter)", "TikTok", "YouTube", "Snapchat", "Other"];

export const englishLevels: [string, string][] = [
  ["A1", "Beginner — Basic phrases and greetings"],
  ["A2", "Elementary — Simple everyday conversations"],
  ["B1", "Intermediate — Can handle most daily situations"],
  ["B2", "Upper-intermediate — Discuss many topics with confidence"],
  ["C1", "Advanced — Fluent in most situations"],
  ["C2", "Proficient — Near-native"],
];

export const motivationLevels = [
  "Low — Occasional study",
  "Moderate — Regular study schedule",
  "High — Daily practice",
  "Very high — Intensive learning",
];

export const classTypes = ["Self-paced — Learn on my own", "Live classes — With a teacher", "Both — Flexible options"];

export const learningPaths = [
  "General English",
  "Everyday Conversation",
  "Business English",
  "IELTS / TOEFL preparation",
  "Academic English (university)",
  "English for Kids",
  "English for travel",
];

export const targetLevels: [string, string][] = [
  ["A2", "A2 — Elementary"],
  ["B1", "B1 — Intermediate"],
  ["B2", "B2 — Upper-intermediate"],
  ["C1", "C1 — Advanced"],
  ["C2", "C2 — Proficient"],
];

export const learningStyles = [
  "Visual — Images and videos",
  "Auditory — Listening",
  "Reading / Writing — Through text",
  "Kinesthetic — Learn by doing",
  "Social — With others",
  "Solitary — Self-study",
];

export const lessonTopics = [
  "Grammar & Structure",
  "Vocabulary Building",
  "Conversation Practice",
  "Pronunciation & Accent",
  "Reading Comprehension",
  "Writing Skills",
  "Listening Comprehension",
  "Culture & Idioms",
  "Exam Preparation (IELTS / TOEFL)",
  "Business Communication",
];

export const teachingMethods = [
  "Communicative Approach",
  "Task-Based Learning",
  "Immersion",
  "Grammar-Focused",
  "Conversation-Focused",
  "Gamification",
  "Story-Based Learning",
  "Multimedia Learning",
];

export const instructorQualities = [
  "Patient & Understanding",
  "Native English Speaker",
  "Certified Teacher (CELTA / TESOL)",
  "Highly Experienced",
  "Friendly & Approachable",
  "Professional",
  "Flexible Schedule",
  "Speaks Arabic",
  "Motivating & Encouraging",
  "Structured Teaching Style",
];

export const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/** Country list built from the browser's own region names */
export function countryList(): string[] {
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const out: string[] = [];
    const A = 65;
    for (let i = 0; i < 26; i++)
      for (let j = 0; j < 26; j++) {
        const code = String.fromCharCode(A + i) + String.fromCharCode(A + j);
        if (["EU", "EZ", "UN", "ZZ", "QO", "XA", "XB", "AA", "QM", "QN", "QP", "QQ", "QR", "QS", "QT", "QU", "QV", "QW", "QX", "QY", "QZ"].includes(code)) continue;
        const name = dn.of(code);
        if (name && name !== code && !/unknown/i.test(name)) out.push(name);
      }
    return Array.from(new Set(out)).sort((a, b) => a.localeCompare(b));
  } catch {
    return ["Malaysia", "Yemen", "Saudi Arabia", "United Arab Emirates", "Egypt", "Indonesia", "United Kingdom", "United States", "Other"];
  }
}
