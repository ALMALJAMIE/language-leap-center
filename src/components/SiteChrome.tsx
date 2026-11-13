"use client";

import { usePathname, useRouter } from "next/navigation";
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
import { basePath } from "@/lib/site";
import { isPortal, useUI } from "@/lib/ui";
import { staffPublicAllowed, useRole } from "@/lib/roles";

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
  const role = useRole((s) => s.role);
  const router = useRouter();
  // team accounts don't use the learner-facing site: send them to their workspace
  const staffBlocked = !!role && !isPortal(path) && !staffPublicAllowed.some((p) => path === p || path?.startsWith(p + "/"));
  useEffect(() => {
    if (staffBlocked) router.replace("/staff/");
  }, [staffBlocked, router]);

  return (
    <>
      {isPortal(path) ? (
        <PortalChrome>{children}</PortalChrome>
      ) : (
        <>
          {!lesson && <TopBar />}
          {!lesson && <Header />}
          {role && !lesson && !staffBlocked && (
            <div className="no-print bg-brand-950 px-4 py-2 text-center text-sm text-brand-100">
              Team preview — this is what learners see.{" "}
              <a href={`${basePath}/staff/`} className="font-bold text-gold-300 hover:underline">Back to workspace</a>
            </div>
          )}
          <main>{staffBlocked ? <div className="min-h-[60vh]" /> : children}</main>
          {!lesson && <Footer />}
        </>
      )}
      {!lesson && !role && <FloatingHelp />}
      <SearchPalette open={searchOpen} onClose={() => setSearch(false)} />
      <AuthModal />
      <ChatPanel />
    </>
  );
}
