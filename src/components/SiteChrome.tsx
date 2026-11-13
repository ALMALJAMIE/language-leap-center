"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Header } from "./Header";
import { TopBar } from "./TopBar";
import { Footer } from "./Footer";
import { SearchPalette } from "./SearchPalette";
import { AuthModal } from "./auth/AuthModal";
import { PortalChrome } from "./portal/PortalChrome";
import { FloatingHelp } from "./FloatingHelp";
import { ChatPanel } from "./chat/ChatPanel";
import { startAuth } from "@/lib/auth";
import { isPortal, useUI } from "@/lib/ui";

/** Chooses the public-site layout or the learner-portal layout for each page */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { searchOpen, setSearch } = useUI();

  useEffect(() => {
    startAuth();
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [setSearch]);

  const lesson = path?.startsWith("/learn/");

  return (
    <>
      {isPortal(path) ? (
        <PortalChrome>{children}</PortalChrome>
      ) : (
        <>
          {!lesson && <TopBar />}
          {!lesson && <Header />}
          <main>{children}</main>
          {!lesson && <Footer />}
        </>
      )}
      {!lesson && <FloatingHelp />}
      <SearchPalette open={searchOpen} onClose={() => setSearch(false)} />
      <AuthModal />
      <ChatPanel />
    </>
  );
}
