"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Headset, Inbox, Loader2, MessagesSquare, Search, Send, X } from "lucide-react";
import { useAuth, displayName } from "@/lib/auth";
import { friendlyChatError, isUnread, markSeen, sendMessage, startConversation, useChatUI, useConversations, useMessages, type Conversation } from "@/lib/chat";
import { site } from "@/lib/site";
import { WhatsAppIcon } from "../BrandIcons";

const time = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
const day = (iso: string) => {
  const d = new Date(iso);
  const t = new Date();
  return d.toDateString() === t.toDateString() ? time(iso) : d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

const header = "bg-[linear-gradient(110deg,#061a37_0%,#0b326d_55%,#845b13_100%)] text-white";

function ConversationView({ c, onBack, onClose, staffView }: { c: Conversation; onBack: () => void; onClose: () => void; staffView?: boolean }) {
  const { messages, error, setMessages } = useMessages(c.id);
  const sessionUserId = useAuth((s) => s.sessionUserId);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ behavior: "smooth" });
    markSeen(c.id);
  }, [messages, c.id]);

  const send = async () => {
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    setErr(null);
    try {
      await sendMessage(c.id, body, !!staffView);
      setText("");
      // show it immediately even before the realtime event arrives
      setMessages((m) => (m.some((x) => x.body === body && x.sender_id === sessionUserId && Date.now() - new Date(x.created_at).getTime() < 5000) ? m : [...m, { id: -Date.now(), conversation_id: c.id, sender_id: sessionUserId ?? "", from_staff: !!staffView, body, created_at: new Date().toISOString() }]));
    } catch (e) {
      setErr(friendlyChatError((e as Error).message));
    }
    setBusy(false);
  };

  const shown = useMemo(() => messages.filter((m, i, a) => m.id > 0 || !a.some((x) => x.id > 0 && x.body === m.body && x.sender_id === m.sender_id)), [messages]);

  return (
    <div className="flex h-full flex-col">
      <div className={`flex items-center gap-3 px-4 py-4 ${header}`}>
        <button onClick={onBack} aria-label="Back" className="rounded-lg p-1 hover:bg-white/10"><ArrowLeft className="h-5 w-5" /></button>
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold">{c.subject}</div>
          <div className="text-xs text-white/70">{staffView ? c.visitor_email ?? "Visitor" : "Support Chat"}</div>
        </div>
        <button onClick={onClose} aria-label="Close" className="rounded-lg p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-4 py-5">
        {!staffView && (
          <div className="mx-auto max-w-[85%] rounded-xl bg-white px-3 py-2 text-center text-xs text-slate-500 shadow-sm">
            Hi! Send us your question and the Language Leap Center team will reply here. We usually answer within a few hours.
          </div>
        )}
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        {shown.map((m) => {
          const mine = staffView ? m.from_staff : !m.from_staff;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${mine ? "rounded-br-md bg-[linear-gradient(110deg,#061a37,#0b326d_60%,#845b13)] text-white" : "rounded-bl-md bg-white text-ink"}`}>
                {!mine && <div className="mb-0.5 text-[11px] font-bold text-gold-600">{m.from_staff ? "LLC Team" : c.visitor_name ?? "Visitor"}</div>}
                <div className="whitespace-pre-wrap break-words">{m.body}</div>
                <div className={`mt-1 text-right text-[10px] ${mine ? "text-white/60" : "text-slate-400"}`}>{time(m.created_at)}</div>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>

      <div className="border-t border-slate-200 bg-white p-3">
        {err && <p className="mb-2 text-xs text-red-600">{err}</p>}
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500"
          />
          <button onClick={send} disabled={!text.trim() || busy} aria-label="Send" className="grid h-10 w-12 place-items-center rounded-xl bg-[linear-gradient(110deg,#061a37,#845b13)] text-white disabled:opacity-50">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

function StartForm({ onStarted, onCancel }: { onStarted: (c: Conversation) => void; onCancel: () => void }) {
  const user = useAuth((s) => s.user);
  const [name, setName] = useState(displayName(user));
  const [email, setEmail] = useState(user?.email ?? "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      onStarted(await startConversation(name.trim() || "Visitor", email.trim() || null));
    } catch (er) {
      setErr(friendlyChatError((er as Error).message));
    }
    setBusy(false);
  };

  return (
    <form onSubmit={go} className="space-y-4 p-5">
      <p className="text-sm text-slate-600">Tell us who you are so we can reply to you.</p>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Your name</span>
        <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand-500" />
      </label>
      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email <span className="text-slate-400">(so we can follow up)</span></span>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 px-3 py-2.5 outline-none focus:border-brand-500" />
      </label>
      {err && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {err}
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-1.5 font-bold text-emerald-700"><WhatsAppIcon className="h-4 w-4" /> Open WhatsApp</a>
        </div>
      )}
      <div className="flex gap-2">
        <button disabled={busy} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-950 py-3 font-bold text-white disabled:opacity-60">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Start chat
        </button>
        <button type="button" onClick={onCancel} className="rounded-xl px-4 text-sm text-slate-500">Cancel</button>
      </div>
    </form>
  );
}

export function ChatPanel() {
  const { open, active, setOpen, setActive } = useChatUI();
  const { list, error, loading } = useConversations(open);
  const [q, setQ] = useState("");
  const [starting, setStarting] = useState(false);
  const [fresh, setFresh] = useState<Conversation | null>(null);

  const all = fresh && !list.some((c) => c.id === fresh.id) ? [fresh, ...list] : list;
  const current = all.find((c) => c.id === active) ?? null;
  const filtered = all.filter((c) => !q || `${c.subject} ${c.last_message ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const close = () => setOpen(false);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] bg-black/20" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={close}>
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute inset-y-0 right-0 flex w-full max-w-[420px] flex-col bg-white shadow-2xl"
          >
            {current ? (
              <ConversationView c={current} onBack={() => setActive(null)} onClose={close} />
            ) : (
              <>
                <div className={`px-4 pb-4 pt-4 ${header}`}>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 font-bold"><MessagesSquare className="h-5 w-5" /> Messages</span>
                    <button onClick={close} aria-label="Close" className="rounded-lg p-1 hover:bg-white/10"><X className="h-5 w-5" /></button>
                  </div>
                  <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search conversations..." className="w-full rounded-xl bg-white/15 py-2.5 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/60 focus:bg-white/20" />
                  </div>
                </div>

                {starting ? (
                  <StartForm
                    onCancel={() => setStarting(false)}
                    onStarted={(c) => {
                      setFresh(c);
                      setStarting(false);
                      setActive(c.id);
                    }}
                  />
                ) : (
                  <>
                    <div className="border-b border-slate-100 p-3">
                      <button onClick={() => setStarting(true)} className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold-300 bg-gold-50 py-2.5 font-bold text-gold-700 hover:bg-gold-100">
                        <Headset className="h-4 w-4" /> Contact Support
                      </button>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {loading && all.length === 0 && <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}
                      {error && <p className="p-4 text-center text-sm text-red-600">{error}</p>}
                      {!loading && filtered.length === 0 && (
                        <div className="py-12 text-center text-slate-400">
                          <Inbox className="mx-auto h-8 w-8" />
                          <p className="mt-2 text-sm">No conversations yet</p>
                        </div>
                      )}
                      {filtered.map((c) => (
                        <button key={c.id} onClick={() => setActive(c.id)} className="flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left hover:bg-slate-50">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-700"><Headset className="h-5 w-5" /></span>
                          <span className="min-w-0 flex-1">
                            <span className="flex justify-between gap-2">
                              <span className="truncate text-sm font-semibold">{c.subject}</span>
                              <span className="shrink-0 text-[11px] text-slate-400">{day(c.updated_at)}</span>
                            </span>
                            <span className="mt-0.5 flex items-center gap-2">
                              <span className="flex-1 truncate text-xs text-slate-500">{c.last_message ?? "No messages yet"}</span>
                              {isUnread(c) && <span className="h-2 w-2 rounded-full bg-red-500" />}
                            </span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { ConversationView };
