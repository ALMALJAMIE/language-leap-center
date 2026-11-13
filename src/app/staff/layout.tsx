import type { Metadata } from "next";

export const metadata: Metadata = { title: "Team Workspace", robots: { index: false } };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
