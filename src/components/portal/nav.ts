import {
  Award, BarChart3, CircleCheck, CirclePlay, Heart, LayoutGrid, BookOpen, BookMarked, Brain, CalendarDays, ClipboardCheck, ClipboardList, Crown, Gauge, Gift, GraduationCap, Home,
  LifeBuoy, Mail, Banknote, CalendarClock, BadgePercent, FileBarChart, FileCheck2, Headset, LayoutDashboard, ListChecks, Receipt, RotateCcw, ServerCog, ShieldCheck, Star, Ticket, Undo2, UserCog, Wallet, MailOpen, MessageCircle, MessagesSquare, Presentation, Search, Settings, SlidersHorizontal, Trophy, User, UserPlus, Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  color: string;
  soon?: boolean;
  external?: boolean;
  /** sub-items shown under this item */
  children?: { label: string; href: string; icon: LucideIcon }[];
  badge?: "due";
  /** opens the chat panel instead of navigating */
  action?: "chat";
}

const soon = (key: string) => `/coming-soon/?f=${key}`;

export const portalNav: NavItem[][] = [
  [
    { label: "Dashboard", href: "/dashboard/", icon: Gauge, color: "text-brand-600" },
    { label: "Advanced view", href: "/advanced/", icon: SlidersHorizontal, color: "text-indigo-500" },
    {
      label: "My Courses",
      href: "/my-courses/",
      icon: BookOpen,
      color: "text-emerald-600",
      children: [
        { label: "All Courses", href: "/my-courses/?tab=all", icon: LayoutGrid },
        { label: "Active Courses", href: "/my-courses/?tab=active", icon: CirclePlay },
        { label: "Completed", href: "/my-courses/?tab=completed", icon: CircleCheck },
        { label: "Wishlist", href: "/my-courses/?tab=wishlist", icon: Heart },
      ],
    },
    { label: "My Classes", href: soon("classes"), icon: Presentation, color: "text-teal-600", soon: true },
    { label: "Browse Courses", href: "/courses/", icon: Search, color: "text-sky-600" },
    { label: "My Progress", href: "/progress/", icon: BarChart3, color: "text-blue-600" },
    { label: "Assessments & Quizzes", href: "/assessments/", icon: ClipboardCheck, color: "text-rose-600" },
    { label: "Daily Review", href: "/review/", icon: Brain, color: "text-violet-600", badge: "due" },
    { label: "Assignments", href: "/assignments/", icon: ClipboardList, color: "text-orange-500" },
    { label: "Certificates", href: "/certificates/", icon: Award, color: "text-gold-500" },
    { label: "Messages", href: "#messages", icon: Mail, color: "text-blue-500", action: "chat" },
    { label: "Live Chat", href: "#chat", icon: MessagesSquare, color: "text-cyan-600", action: "chat" },
    { label: "Schedule", href: soon("schedule"), icon: CalendarDays, color: "text-amber-600", soon: true },
    { label: "Private Lessons", href: "/private-lessons/", icon: GraduationCap, color: "text-pink-600" },
  ],
  [{ label: "Resources", href: "/resources/", icon: BookMarked, color: "text-orange-500" }],
  [
    { label: "My Profile", href: "/profile/", icon: User, color: "text-brand-600" },
    { label: "Achievements", href: "/achievements/", icon: Trophy, color: "text-gold-500" },
    { label: "My Emails", href: soon("emails"), icon: MailOpen, color: "text-teal-600", soon: true },
    { label: "Settings", href: "/settings/", icon: Settings, color: "text-slate-600" },
    { label: "Subscription", href: "/subscription/", icon: Crown, color: "text-lime-600" },
    { label: "Refer & Earn", href: "/refer/", icon: Gift, color: "text-pink-500" },
    { label: "Help & Support", href: "/help/", icon: LifeBuoy, color: "text-emerald-600" },
    { label: "Invitations", href: soon("invitations"), icon: UserPlus, color: "text-indigo-500", soon: true },
  ],
  [{ label: "Main Website", href: "/", icon: Home, color: "text-slate-600", external: true }],
];

/* ------------------------------------------------------------------ */
/* Team workspace (/staff/) — the sidebar depends on the account's role */

type StaffRole = "admin" | "teacher" | "finance" | "academic" | "support";
const s = (key: string) => `/staff/soon/?f=${key}`;

const it = {
  overview: { label: "Overview", href: "/staff/", icon: LayoutDashboard, color: "text-brand-600" },
  users: { label: "Learners & Users", href: "/staff/users/", icon: Users, color: "text-sky-600" },
  team: { label: "Team & Roles", href: "/staff/team/", icon: ShieldCheck, color: "text-indigo-600" },
  enrollments: { label: "Course Access", href: "/staff/enrollments/", icon: Ticket, color: "text-emerald-600" },
  courses: { label: "Courses & Lessons", href: "/staff/courses/", icon: BookOpen, color: "text-violet-600" },
  inbox: { label: "Support Inbox", href: "/staff/inbox/", icon: Headset, color: "text-gold-600" },
  instructors: { label: "Instructor Profiles", href: s("st-instructors"), icon: GraduationCap, color: "text-pink-600", soon: true },
  payments: { label: "Payments", href: s("st-payments"), icon: Receipt, color: "text-lime-600", soon: true },
  coupons: { label: "Coupons & Pricing", href: s("st-coupons"), icon: BadgePercent, color: "text-orange-500", soon: true },
  refunds: { label: "Refunds", href: s("st-refunds"), icon: Undo2, color: "text-rose-500", soon: true },
  payouts: { label: "Teacher Payouts", href: s("st-payouts"), icon: Wallet, color: "text-teal-600", soon: true },
  reports: { label: "Reports", href: s("st-reports"), icon: FileBarChart, color: "text-blue-600", soon: true },
  placement: { label: "Placement Results", href: s("st-placement"), icon: ListChecks, color: "text-rose-600", soon: true },
  certificates: { label: "Certificates", href: s("st-certificates"), icon: FileCheck2, color: "text-gold-500", soon: true },
  quality: { label: "Teaching Quality", href: s("st-quality"), icon: Star, color: "text-amber-500", soon: true },
  tickets: { label: "Tickets", href: s("st-tickets"), icon: LifeBuoy, color: "text-emerald-600", soon: true },
  system: { label: "System Status", href: s("st-system"), icon: ServerCog, color: "text-slate-600", soon: true },
  settings: { label: "Site Settings", href: s("st-settings"), icon: UserCog, color: "text-slate-600", soon: true },
  teachers: { label: "Teachers & Prices", href: "/staff/teachers/", icon: GraduationCap, color: "text-pink-600" },
  teacherPay: { label: "Teacher Payouts", href: "/staff/payouts/", icon: Wallet, color: "text-teal-600" },
  questions: { label: "Lesson Questions", href: "/staff/questions/", icon: MessageCircle, color: "text-cyan-600" },
  // teacher
  lessons: { label: "Lessons", href: "/staff/lessons/", icon: CalendarDays, color: "text-pink-600" },
  students: { label: "My Students", href: "/staff/students/", icon: Users, color: "text-sky-600" },
  homework: { label: "Assignments", href: "/staff/assignments/", icon: ClipboardList, color: "text-orange-500" },
  availability: { label: "Availability", href: "/staff/availability/", icon: CalendarClock, color: "text-amber-600" },
  earnings: { label: "Earnings", href: "/staff/earnings/", icon: Banknote, color: "text-lime-600" },
  publicProfile: { label: "My Public Profile", href: "/staff/my-profile/", icon: User, color: "text-brand-600" },
} satisfies Record<string, NavItem>;

const common: NavItem[] = [
  { label: "Settings", href: "/settings/", icon: Settings, color: "text-slate-600" },
  { label: "Help & Support", href: "/help/", icon: LifeBuoy, color: "text-emerald-600" },
  { label: "Main Website", href: "/", icon: Home, color: "text-slate-600", external: true },
];

export function staffNav(role: StaffRole | null): NavItem[][] {
  switch (role) {
    case "admin":
      return [
        [it.overview, it.users, it.team, it.teachers, it.enrollments, it.teacherPay],
        [it.courses, it.questions, it.inbox],
        [it.payments, it.reports, it.settings],
        common,
      ];
    case "teacher":
      return [[it.overview, it.lessons, it.students, it.homework, it.questions], [it.availability, it.earnings, it.publicProfile], common];
    case "finance":
      return [[it.overview, it.enrollments, it.teacherPay, it.teachers, it.users], [it.payments, it.coupons, it.refunds, it.reports], common];
    case "academic":
      return [[it.overview, it.courses, it.questions, it.teachers, it.users], [it.placement, it.certificates, it.quality], common];
    case "support":
      return [[it.overview, it.inbox, it.users], [it.tickets, it.system], common];
    default:
      return [[it.overview], common];
  }
}

/** Text for features that need teachers or a server and are not live yet */
export const comingSoon: Record<string, { title: string; icon: LucideIcon; text: string; staff?: boolean }> = {
  "st-instructors": { staff: true, title: "Instructor Profiles", icon: GraduationCap, text: "Add and edit the teachers shown on the public Instructors page — photo, bio, specialties and hourly price." },
  "st-payments": { staff: true, title: "Payments", icon: Receipt, text: "Every payment from the payment gateway, matched to the learner and the course it opened." },
  "st-coupons": { staff: true, title: "Coupons & Pricing", icon: BadgePercent, text: "Change course prices and create discount codes with limits and end dates." },
  "st-refunds": { staff: true, title: "Refunds", icon: RotateCcw, text: "Refund requests, their status, and closing course access after a refund." },
  "st-payouts": { staff: true, title: "Teacher Payouts", icon: Wallet, text: "Hours taught by each teacher, what they are owed, and payment history." },
  "st-reports": { staff: true, title: "Reports", icon: FileBarChart, text: "Monthly sign-ups, sales, active learners and course completion — ready to export." },
  "st-placement": { staff: true, title: "Placement Results", icon: ListChecks, text: "Placement test results of every learner and the level they were placed in." },
  "st-certificates": { staff: true, title: "Certificates", icon: FileCheck2, text: "Issued certificates, a lookup to verify a certificate ID, and revoking a certificate." },
  "st-quality": { staff: true, title: "Teaching Quality", icon: Star, text: "Learner ratings and lesson reviews for each teacher." },
  "st-tickets": { staff: true, title: "Tickets", icon: LifeBuoy, text: "Turn a chat into a ticket, assign it to a team member and track it until it's solved." },
  "st-system": { staff: true, title: "System Status", icon: ServerCog, text: "Site health, database status and recent errors." },
  "st-settings": { staff: true, title: "Site Settings", icon: UserCog, text: "Contact details, social links and payment links — edited here instead of in the code." },
  "t-students": { staff: true, title: "My Students", icon: Users, text: "The learners you teach, their level, their progress in each course and what they find hard." },
  "t-lessons": { staff: true, title: "Private Lessons", icon: GraduationCap, text: "New booking requests: accept, pick a time and add the video-call link." },
  "t-classes": { staff: true, title: "My Classes", icon: Presentation, text: "Your live group classes, attendance and recordings." },
  "t-assignments": { staff: true, title: "Assignments & Grading", icon: ClipboardList, text: "Give homework, listen to speaking recordings, correct writing and send grades with feedback." },
  "t-schedule": { staff: true, title: "Schedule & Availability", icon: CalendarDays, text: "Set the hours you are free; learners can only book inside them." },
  "t-profile": { staff: true, title: "My Public Profile", icon: User, text: "Edit how you appear on the Instructors page: photo, bio, languages, specialties and price." },
  "t-earnings": { staff: true, title: "My Earnings", icon: Banknote, text: "Lessons taught, amounts due and your payment history." },
  classes: { title: "My Classes", icon: Presentation, text: "Live group classes with our teachers. You'll see your class times, join links and recordings here." },
  assignments: { title: "Assignments", icon: ClipboardList, text: "Homework from your teacher — writing tasks and speaking recordings — with feedback and grades." },
  messages: { title: "Messages", icon: Mail, text: "Message your teachers and the Language Leap Center team directly from your account." },
  schedule: { title: "Schedule", icon: CalendarDays, text: "A calendar of your live classes, private lessons and deadlines." },
  emails: { title: "My Emails", icon: MailOpen, text: "Choose which emails you receive: weekly progress reports, reminders and news." },
  invitations: { title: "Invitations", icon: Users, text: "Join a school or company group with an invitation, or invite your students if you're a teacher." },
  chat: { title: "Live Chat", icon: MessageCircle, text: "Chat with our team in real time." },
};
