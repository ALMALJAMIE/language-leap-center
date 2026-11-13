import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Language Leap Center | Learn English Online",
    template: "%s | Language Leap Center",
  },
  description:
    "Language Leap Center — your leap to fluent English. Courses from A1 to C1, listening and speaking practice, and smart vocabulary review.",
};

export const viewport: Viewport = { themeColor: "#0f4ca7" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" dir="ltr">
      <body className="min-h-screen">
        <TopBar />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
