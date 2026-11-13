"use client";

import { useCallback, useEffect, useState } from "react";
import { create } from "zustand";
import { useRole } from "./roles";
import { displayName, supabase, useAuth } from "./auth";

export interface Conversation {
  id: string;
  user_id: string;
  subject: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  last_message: string | null;
  last_from_staff: boolean;
  updated_at: string;
  created_at: string;
}

export interface Message {
  id: number;
  conversation_id: string;
  sender_id: string;
  from_staff: boolean;
  body: string;
  created_at: string;
}

/** Chat panel state, shared by every button that opens it */
export const useChatUI = create<{ open: boolean; active: string | null; setOpen: (v: boolean) => void; setActive: (id: string | null) => void }>()((set) => ({
  open: false,
  active: null,
  setOpen: (open) => set({ open }),
  setActive: (active) => set({ active }),
}));

const seenKey = "llc-chat-seen";
export function markSeen(id: string) {
  try {
    const m = JSON.parse(localStorage.getItem(seenKey) ?? "{}");
    m[id] = new Date().toISOString();
    localStorage.setItem(seenKey, JSON.stringify(m));
  } catch {}
}
export function isUnread(c: Conversation, staffView = false) {
  const fromOther = staffView ? !c.last_from_staff : c.last_from_staff;
  if (!fromOther || !c.last_message) return false;
  try {
    const seen = JSON.parse(localStorage.getItem(seenKey) ?? "{}")[c.id];
    return !seen || seen < c.updated_at;
  } catch {
    return true;
  }
}

export function friendlyChatError(msg: string) {
  if (/anonymous/i.test(msg)) return "Chat for visitors isn't switched on yet. Please sign in, or message us on WhatsApp.";
  if (/relation|does not exist|schema cache/i.test(msg)) return "Chat isn't set up yet. Please message us on WhatsApp for now.";
  return msg;
}

/** Make sure there is a session to chat with: the learner's account, or an anonymous visitor session */
export async function ensureChatSession(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user.id;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error || !anon.user) throw new Error(error?.message ?? "Could not start chat");
  return anon.user.id;
}

export async function startConversation(name: string, email: string | null): Promise<Conversation> {
  const uid = await ensureChatSession();
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: uid, subject: `Support Request from ${name}`, visitor_name: name, visitor_email: email })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Conversation;
}

export async function sendMessage(conversationId: string, body: string, fromStaff = false) {
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) throw new Error("Not signed in");
  const { error } = await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: uid, body: body.trim(), from_staff: fromStaff });
  if (error) throw new Error(error.message);
}

/** Conversations visible to the current session (own ones, or all for staff), kept live */
export function useConversations(enabled: boolean) {
  const sessionUserId = useAuth((s) => s.sessionUserId);
  const [list, setList] = useState<Conversation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!sessionUserId) {
      setList([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.from("conversations").select("*").order("updated_at", { ascending: false }).limit(200);
    setLoading(false);
    if (error) setError(friendlyChatError(error.message));
    else {
      setError(null);
      setList((data ?? []) as Conversation[]);
    }
  }, [sessionUserId]);

  useEffect(() => {
    if (!enabled) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    if (!sessionUserId) return;
    const ch = supabase
      .channel(`conversations-${sessionUserId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [enabled, load, sessionUserId]);

  return { list, error, loading, reload: load };
}

/** Messages of one conversation, kept live */
export function useMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!conversationId) return;
    let alive = true;
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at")
      .then(({ data, error }) => {
        if (!alive) return;
        if (error) setError(friendlyChatError(error.message));
        else setMessages((data ?? []) as Message[]);
      });
    const ch = supabase
      .channel(`messages-${conversationId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (p) => {
        const m = p.new as Message;
        setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
      })
      .subscribe();
    return () => {
      alive = false;
      supabase.removeChannel(ch);
    };
  }, [conversationId]);

  return { messages, error, setMessages };
}

/** Is the current user on the support team? */
/** true for team members who answer the support inbox (support + admin) */
export function useIsStaff() {
  const user = useAuth((s) => s.user);
  const role = useRole((s) => s.role);
  return !!user && (role === "admin" || role === "support");
}

export const chatName = (u: ReturnType<typeof useAuth.getState>["user"]) => displayName(u);
