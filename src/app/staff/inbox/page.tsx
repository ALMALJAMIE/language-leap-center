"use client";

import { useState } from "react";
import { CheckCircle2, Headset, Inbox, Loader2, RotateCcw } from "lucide-react";
import { supabase } from "@/lib/auth";
import { isUnread, useConversations } from "@/lib/chat";
import { ConversationView } from "@/components/chat/ChatPanel";
import { StaffShell } from "@/components/staff/StaffShell";

type Filter = "open" | "closed" | "all";

export default function SupportInboxPage() {
  return (
    <StaffShell page="/staff/inbox/" title="Support Inbox" wide>
      <SupportInbox />
    </StaffShell>
  );
}

function SupportInbox() {
  const { list, error, loading } = useConversations(true);
  const [active, setActive] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("open");

  const shown = list.filter((c) => filter === "all" || c.status === filter);
  const current = list.find((c) => c.id === active) ?? null;
  const setStatus = async (id: string, status: "open" | "closed") => {
    await supabase.from("conversations").update({ status }).eq("id", id);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold"><Headset className="h-6 w-6 text-gold-500" /> Support Inbox</h1>
          <p className="text-sm text-slate-500">Reply to visitors and learners. New messages appear instantly.</p>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm">
          {(["open", "closed", "all"] as Filter[]).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`rounded-lg px-3 py-1.5 font-semibold capitalize ${filter === f ? "bg-white text-brand-700 shadow-sm" : "text-slate-500"}`}>
              {f} ({list.filter((c) => f === "all" || c.status === f).length})
            </button>
          ))}
        </div>
      </div>

      <div className="grid h-[calc(100vh-220px)] min-h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white md:grid-cols-[340px_1fr]">
        <div className={`overflow-y-auto border-r border-slate-100 ${current ? "hidden md:block" : ""}`}>
          {loading && list.length === 0 && <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}
          {error && <p className="p-4 text-sm text-red-600">{error}</p>}
          {!loading && shown.length === 0 && (
            <div className="py-16 text-center text-slate-400"><Inbox className="mx-auto h-8 w-8" /><p className="mt-2 text-sm">No conversations</p></div>
          )}
          {shown.map((c) => (
            <button key={c.id} onClick={() => setActive(c.id)} className={`flex w-full items-start gap-3 border-b border-slate-50 px-4 py-3 text-left ${c.id === active ? "bg-brand-50" : "hover:bg-slate-50"}`}>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold-50 font-bold text-gold-700">{(c.visitor_name ?? "V")[0].toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex justify-between gap-2">
                  <span className="truncate text-sm font-semibold">{c.visitor_name ?? "Visitor"}</span>
                  <span className="shrink-0 text-[11px] text-slate-400">{new Date(c.updated_at).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</span>
                </span>
                <span className="block truncate text-xs text-slate-400">{c.visitor_email ?? "no email"}</span>
                <span className="mt-0.5 flex items-center gap-2">
                  <span className="flex-1 truncate text-xs text-slate-600">{c.last_from_staff ? "You: " : ""}{c.last_message ?? "No messages yet"}</span>
                  {isUnread(c, true) && <span className="h-2 w-2 rounded-full bg-red-500" />}
                </span>
              </span>
            </button>
          ))}
        </div>

        <div className={`flex min-h-0 flex-col ${current ? "" : "hidden md:flex"}`}>
          {current ? (
            <>
              <div className="flex items-center justify-end gap-2 border-b border-slate-100 px-4 py-2 text-sm">
                {current.status === "open" ? (
                  <button onClick={() => setStatus(current.id, "closed")} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50"><CheckCircle2 className="h-4 w-4" /> Mark as resolved</button>
                ) : (
                  <button onClick={() => setStatus(current.id, "open")} className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reopen</button>
                )}
              </div>
              <div className="min-h-0 flex-1">
                <ConversationView key={current.id} c={current} onBack={() => setActive(null)} onClose={() => setActive(null)} staffView />
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center text-slate-400"><p>Select a conversation</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
