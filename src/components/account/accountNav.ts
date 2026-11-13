import { Award, BarChart3, BookOpen, Gauge, User } from "lucide-react";

/** Items in the account menu of the public-site header */
export const accountNav = [
  { href: "/dashboard/", label: "Learner Dashboard", icon: Gauge },
  { href: "/profile/", label: "Profile", icon: User },
  { href: "/my-courses/", label: "My Courses", icon: BookOpen },
  { href: "/certificates/", label: "Certificates", icon: Award },
  { href: "/progress/", label: "Progress", icon: BarChart3 },
];
