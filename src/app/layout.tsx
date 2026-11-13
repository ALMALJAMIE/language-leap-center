import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Language Leap Center | منصة تعلّم اللغة الإنجليزية",
    template: "%s | Language Leap Center",
  },
  description:
    "Language Leap Center — قفزتك نحو إنجليزية بطلاقة. دورات متدرجة من A1 إلى C1، تمارين استماع ونطق، ومراجعة ذكية للمفردات.",
};

export const viewport: Viewport = { themeColor: "#0f4ca7" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen">
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
