"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { ChevronDown, ChevronLeft, ExternalLink, LogIn, LogOut, Mail, Menu, Search, X } from "lucide-react";
import mark from "@/assets/logo-mark-t.png";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { displayName, signOut, supabase, useAuth } from "@/lib/auth";
import { dueCards, useMounted, useProgress } from "@/lib/store";
import { usePortalPrefs, useUI } from "@/lib/ui";
import { NotificationBell } from "./Notifications";
import { UserAvatar } from "@/components/account/UserAvatar";
import { useChatUI } from "@/lib/chat";
import { portalNav, staffNav, type NavItem } from "./nav";
import { roleInfo, staffAlsoAllowed, useRole } from "@/lib/roles";
import { site } from "@/lib/site";

function NavLink({ item, collapsed, onNavigate }: { item: NavItem; collapsed: boolean; onNavigate: () => void }) {
  const path = usePathname();
  const mounted = useMounted();
  const { cards } = useProgress();
  const openChat = useChatUI((s) => s.setOpen);
  const [open, setOpen] = useState(!!item.children && !!path?.startsWith("/my-courses"));
  const base = item.href.split("?")[0].replace(/\/$/, "");
  const active =
    !item.external && base !== "/coming-soon" && base !== "/staff/soon" && !!path && (base === "/staff" ? path.replace(/\/$/, "") === base : path === base || path.startsWith(base + "/"));
  const due = item.badge === "due" && mounted ? dueCards(cards).length : 0;
  const Icon = item.icon;
  const subs = item.children ?? [];

  const cls = `group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] transition ${
    active ? "bg-brand-50 font-semibold text-brand-800 after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:rounded-full after:bg-brand-700" : "text-slate-700 hover:bg-slate-50"
  } ${collapsed ? "justify-center" : ""}`;

  const inner = (
    <>
      <Icon className={`h-[18px] w-[18px] shrink-0 ${item.color}`} />
      {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
      {!collapsed && item.soon && <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-400">Soon</span>}
      {!collapsed && item.external && item.href !== "/" && <span className="text-[10px] font-bold uppercase text-emerald-600">Online</span>}
      {!collapsed && item.href === "/" && <ExternalLink className="h-3.5 w-3.5 text-slate-400" />}
      {due > 0 && <span className={`grid h-5 min-w-5 place-items-center rounded-full bg-gold-400 px-1 text-[11px] font-bold text-brand-900 ${collapsed ? "absolute right-1 top-1" : ""}`}>{due}</span>}
      {!collapsed && subs.length > 0 && (
        <span className="rounded p-0.5">
          <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
        </span>
      )}
    </>
  );

  if (item.action === "chat")
    return (
      <li>
        <button type="button" onClick={() => { onNavigate(); openChat(true); }} className={`${cls} w-full text-left`} title={collapsed ? item.label : undefined}>
          {inner}
        </button>
      </li>
    );

  return (
    <li>
      {item.external && item.href.startsWith("http") ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={cls} title={collapsed ? item.label : undefined}>
          {inner}
        </a>
      ) : subs.length > 0 && !collapsed ? (
        <button type="button" onClick={() => setOpen(!open)} className={`${cls} w-full text-left`} aria-expanded={open}>
          {inner}
        </button>
      ) : (
        <Link href={item.href} onClick={onNavigate} className={cls} title={collapsed ? item.label : undefined}>
          {inner}
        </Link>
      )}
      {!collapsed && open && subs.length > 0 && <SubLinks subs={subs} onNavigate={onNavigate} />}
    </li>
  );
}

function SubLinksInner({ subs, onNavigate }: { subs: NonNullable<NavItem["children"]>; onNavigate: () => void }) {
  const path = usePathname();
  const tab = useSearchParams().get("tab") ?? "all";
  return (
    <ul className="ml-4 mt-1 space-y-0.5">
      {subs.map(({ label, href, icon: Icon }) => {
        const on = path?.startsWith("/my-courses") && href.endsWith(`tab=${tab}`);
        return (
          <li key={href}>
            <Link href={href} onClick={onNavigate} className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${on ? "font-semibold text-brand-800" : "text-slate-600 hover:bg-slate-50 hover:text-ink"}`}>
              <Icon className="h-4 w-4 text-slate-500" /> {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function SubLinks(props: { subs: NonNullable<NavItem["children"]>; onNavigate: () => void }) {
  return (
    <Suspense>
      <SubLinksInner {...props} />
    </Suspense>
  );
}

function Sidebar({ collapsed, onNavigate }: { collapsed: boolean; onNavigate: () => void }) {
  const path = usePathname();
  const role = useRole((s) => s.role);
  const staffArea = !!role || !!path?.startsWith("/staff");
  const nav = staffArea ? staffNav(role) : portalNav;
  return (
    <nav className="flex-1 overflow-y-auto px-3 pb-6">
      {staffArea && !collapsed && (
        <div className="mb-3 rounded-xl bg-gradient-to-r from-brand-900 to-brand-700 px-3 py-2.5 text-white">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gold-300">Team Workspace</div>
          <div className="text-sm font-semibold">{role ? roleInfo[role].label : "Team"}</div>
        </div>
      )}
      {nav.map((group, gi) => (
        <ul key={gi} className={`space-y-0.5 ${gi > 0 ? "mt-3 border-t border-slate-200 pt-3" : ""}`}>
          {group.map((item) => (
            <NavLink key={item.label} item={item} collapsed={collapsed} onNavigate={onNavigate} />
          ))}
        </ul>
      ))}
    </nav>
  );
}

function UserBlock() {
  const { user, ready, openModal } = useAuth();
  const role = useRole((s) => s.role);
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!ready) return <div className="h-10 w-40" />;
  if (!user)
    return (
      <button onClick={() => openModal("signin")} className="flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2 text-sm font-bold hover:border-brand-400">
        <LogIn className="h-4 w-4" /> Sign In
      </button>
    );

  const name = displayName(user);
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(!open)} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-slate-50">
        <UserAvatar name={name} />
        <span className="hidden text-left sm:block">
          <span className="block max-w-[160px] truncate text-sm font-semibold text-ink">{name}</span>
          <span className="block text-xs text-slate-500">{role ? roleInfo[role].label : "Learner"}</span>
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-14 z-50 w-56 overflow-hidden rounded-2xl border border-slate-200 bg-white py-2 shadow-xl">
          <div className="border-b border-slate-100 px-4 pb-2 pt-1 text-xs text-slate-500">{user.email}</div>
          {(role
            ? [["Team Workspace", "/staff/"], ...(role === "teacher" ? [["My Public Profile", "/staff/my-profile/"]] : []), ["Settings", "/settings/"], ["Help & Support", "/help/"]]
            : [["My Profile", "/profile/"], ["Settings", "/settings/"], ["Help & Support", "/help/"], ["Main Website", "/"]]
          ).map(([l, h]) => (
            <Link key={h} href={h} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
              {l}
            </Link>
          ))}
          <div className="my-1 border-t border-slate-100" />
          <button onClick={() => signOut()} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>
      )}
    </div>
  );
}

/** Team accounts only use the workspace: learner pages send them to /staff/ */
function useStaffOnly() {
  const path = usePathname() ?? "";
  const router = useRouter();
  const role = useRole((s) => s.role);
  const blocked = !!role && !path.startsWith("/staff") && !staffAlsoAllowed.some((p) => path === p || path.startsWith(p + "/"));
  useEffect(() => {
    if (blocked) router.replace("/staff/");
  }, [blocked, router]);
  return { role, blocked };
}

export function PortalChrome({ children }: { children: React.ReactNode }) {
  const { role, blocked } = useStaffOnly();
  const mounted = useMounted();
  const { collapsed: collapsedPref, toggleCollapsed } = usePortalPrefs();
  const collapsed = mounted && collapsedPref;
  const { drawer, setDrawer, setSearch } = useUI();
  const openChatTop = useChatUI((s) => s.setOpen);

  return (
    <div className="min-h-screen bg-slate-50/60">
      {/* Desktop sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-slate-200 bg-white transition-[width] lg:flex ${collapsed ? "w-[76px]" : "w-[260px]"}`}>
        <div className={`flex h-[72px] shrink-0 items-center border-b border-slate-200 ${collapsed ? "justify-center" : "px-5"}`}>
          <Link href={role ? "/staff/" : "/"} aria-label={role ? "Workspace" : "Main website"}>
            {collapsed ? <Image src={mark} alt="LLC" className="h-9 w-auto" /> : <Logo />}
          </Link>
        </div>
        <button
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="absolute -right-3 top-[86px] z-10 grid h-6 w-6 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm hover:text-ink"
        >
          <ChevronLeft className={`h-3.5 w-3.5 transition ${collapsed ? "rotate-180" : ""}`} />
        </button>
        <div className="h-4 shrink-0" />
        <Sidebar collapsed={collapsed} onNavigate={() => {}} />
      </aside>

      {/* Mobile drawer */}
      {drawer && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setDrawer(false)}>
          <aside className="flex h-full w-[280px] flex-col bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-16 items-center justify-between border-b border-slate-200 px-4">
              <Logo />
              <button onClick={() => setDrawer(false)} aria-label="Close menu"><X /></button>
            </div>
            <div className="h-3" />
            <Sidebar collapsed={false} onNavigate={() => setDrawer(false)} />
          </aside>
        </div>
      )}

      <div className={`transition-[padding] ${collapsed ? "lg:pl-[76px]" : "lg:pl-[260px]"}`}>
        <header className="no-print sticky top-0 z-30 flex h-[72px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 lg:hidden" onClick={() => setDrawer(true)} aria-label="Menu">
              <Menu />
            </button>
            <button onClick={() => setSearch(true)} className="flex items-center gap-2 rounded-xl px-2 py-2 text-slate-500 hover:bg-slate-50">
              <Search className="h-5 w-5" />
              <span className="hidden text-sm sm:inline">Search</span>
              <kbd className="hidden rounded-md border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[11px] text-slate-500 sm:inline">Ctrl+K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            {!role && <NotificationBell />}
            {!role && (
              <button onClick={() => openChatTop(true)} aria-label="Messages" className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100">
                <Mail className="h-5 w-5" />
              </button>
            )}
            <UserBlock />
          </div>
        </header>
        <main className="min-h-[calc(100vh-72px-57px)]">{blocked ? null : children}</main>
        <footer className="no-print flex flex-wrap items-center justify-center gap-6 border-t border-slate-200 bg-white px-4 py-4 text-sm text-slate-500">
          <Link href="/about/" className="hover:text-ink">About</Link>
          <a href={`mailto:${site.email}`} className="hover:text-ink">Contact</a>
          <Link href="/help/" className="hover:text-ink">Help</Link>
          <span className="text-slate-400">© {new Date().getFullYear()} Language Leap Center</span>
        </footer>
      </div>
    </div>
  );
}
