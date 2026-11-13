import {
  Award, BarChart3, CircleCheck, CirclePlay, Heart, LayoutGrid, BookOpen, BookMarked, Brain, CalendarDays, ClipboardCheck, ClipboardList, Crown, Gauge, Gift, GraduationCap, Home,
  LifeBuoy, Mail, MailOpen, MessageCircle, MessagesSquare, Presentation, Search, Settings, SlidersHorizontal, Trophy, User, UserPlus, Users,
  type LucideIcon,
} from "lucide-react";
import { site } from "@/lib/site";

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
    { label: "Assignments", href: soon("assignments"), icon: ClipboardList, color: "text-orange-500", soon: true },
    { label: "Certificates", href: "/certificates/", icon: Award, color: "text-gold-500" },
    { label: "Messages", href: soon("messages"), icon: Mail, color: "text-blue-500", soon: true },
    { label: "Live Chat", href: site.whatsapp, icon: MessagesSquare, color: "text-cyan-600", external: true },
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

/** Text for features that need teachers or a server and are not live yet */
export const comingSoon: Record<string, { title: string; icon: LucideIcon; text: string }> = {
  classes: { title: "My Classes", icon: Presentation, text: "Live group classes with our teachers. You'll see your class times, join links and recordings here." },
  assignments: { title: "Assignments", icon: ClipboardList, text: "Homework from your teacher — writing tasks and speaking recordings — with feedback and grades." },
  messages: { title: "Messages", icon: Mail, text: "Message your teachers and the Language Leap Center team directly from your account." },
  schedule: { title: "Schedule", icon: CalendarDays, text: "A calendar of your live classes, private lessons and deadlines." },
  emails: { title: "My Emails", icon: MailOpen, text: "Choose which emails you receive: weekly progress reports, reminders and news." },
  invitations: { title: "Invitations", icon: Users, text: "Join a school or company group with an invitation, or invite your students if you're a teacher." },
  chat: { title: "Live Chat", icon: MessageCircle, text: "Chat with our team in real time." },
};
