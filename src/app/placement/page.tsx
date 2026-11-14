"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { ClipboardCheck, Clock, Hourglass, Loader2, Mic, Play, Wallet } from "lucide-react";
import type { Level } from "@/lib/types";
import { courseHref, courses, levels } from "@/data/courses";
import { supabase, useAuth, displayName } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { site } from "@/lib/site";
import { useMounted, useProgress } from "@/lib/store";
import { SignInPrompt } from "@/components/account/AccountShell";
import { WhatsAppIcon } from "@/components/BrandIcons";
import { ExamRunner, type ExamResult } from "@/components/exam/ExamRunner";
import { ReceiptUpload } from "@/components/ReceiptUpload";
import type { Attempt, Exam } from "@/lib/exams";

const order: Level[] = ["A1", "A2", "B1", "B2", "C1"];
interface Ticket { id: number; status: "pending" | "paid" | "used"; amount: number; created_at: string; receipt_path?: string | null }

export default function Placement() {
  const mounted = useMounted();
  const { user, ready } = useAuth();
  const setPlacement = useProgress((s) => s.setPlacement);
  const [exam, setExam] = useState<Exam | null | undefined>(undefined);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [taking, setTaking] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from("exams").select("*").eq("kind", "placement").eq("published", true).order("id").limit(1);
    if (error) setErr(rpcError(error));
    const e = (data?.[0] as Exam) ?? null;
    setExam(e);
    if (!e || !user) return;
    const [t, a] = await Promise.all([
      supabase.from("placement_tickets").select("*").eq("exam_id", e.id).eq("user_id", user.id).order("id", { ascending: false }),
      supabase.from("exam_attempts").select("*").eq("exam_id", e.id).eq("user_id", user.id).order("id", { ascending: false }),
    ]);
    setTickets((t.data as Ticket[]) ?? []);
    const at = (a.data as Attempt[]) ?? [];
    setAttempts(at);
    const g = at.find((x) => x.status === "graded" && x.result_level);
    if (g) setPlacement(g.result_level!, Number(g.score ?? 0), Number(g.total ?? 0));
  }, [user, setPlacement]);
  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [ready, load]);

  if (!mounted || !ready || exam === undefined) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="h-7 w-7 animate-spin text-slate-300" /></div>;

  if (taking && exam)
    return <ExamRunner examId={exam.id} onDone={(r: ExamResult) => { setTaking(false); if (r.level) setPlacement(r.level, Number(r.score ?? 0), Number(r.total ?? 0)); load(); }} />;

  const running = attempts.find((a) => a.status === "in_progress");
  const last = attempts.find((a) => a.status === "graded" && a.result_level);
  const paid = tickets.find((t) => t.status === "paid");
  const pending = tickets.find((t) => t.status === "pending");
  const fee = Number(exam?.fee ?? 0);

  const book = async () => {
    if (!exam) return;
    setBusy(true);
    const { error } = await supabase.rpc("request_placement", { p_exam: exam.id });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    load();
  };
  const waText = encodeURIComponent(`Hello, I want to pay the placement test fee ($${fee}). Name: ${user ? displayName(user) : ""} · Email: ${user?.email ?? ""}`);

  return (
    <div className="mx-auto max-w-2xl px-6 py-14">
      {last && <LevelResult a={last} />}

      <div className={`text-center ${last ? "mt-12 border-t border-slate-200 pt-10" : ""}`}>
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-brand-100 text-brand-700"><ClipboardCheck className="h-10 w-10" /></div>
        <h1 className="mt-6 text-3xl font-extrabold">{last ? "Take the placement test again" : "Placement test"}</h1>
        {!exam ? (
          <p className="mt-4 leading-8 text-slate-600">The placement test opens soon. Message us on WhatsApp and we will help you choose your level.</p>
        ) : (
          <>
            <p className="mt-4 leading-8 text-slate-600">{exam.instructions}</p>
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {order.map((l) => <span key={l} className="rounded-xl bg-mist px-3 py-2 text-sm font-bold text-brand-700">{l}</span>)}
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm text-slate-600">
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Clock className="h-4 w-4" /> {exam.minutes} minutes</span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Wallet className="h-4 w-4" /> {fee > 0 ? `Fee $${fee}` : "Free"}</span>
              <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5"><Mic className="h-4 w-4" /> + short speaking test</span>
            </div>
          </>
        )}
        {err && <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800">{err}</p>}

        <div className="mt-8">
          {!exam ? (
            <a href={site.whatsapp} target="_blank" rel="noopener" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5"><WhatsAppIcon className="h-5 w-5" /> Message us</a>
          ) : !user ? (
            <SignInPrompt text="Create a free account or sign in to book your placement test." />
          ) : running ? (
            <button onClick={() => setTaking(true)} className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg"><Play className="h-5 w-5" /> Continue the test</button>
          ) : paid ? (
            <>
              <p className="mb-4 text-sm font-semibold text-emerald-700">Payment confirmed — you can start whenever you are ready.</p>
              <button onClick={() => { if (confirm(`The timer (${exam.minutes} minutes) starts now. Ready?`)) setTaking(true); }} className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg"><Play className="h-5 w-5" /> Start the test</button>
            </>
          ) : pending ? (
            <div className="rounded-3xl border border-gold-200 bg-gold-50/60 p-6">
              <Hourglass className="mx-auto h-8 w-8 text-gold-600" />
              <h2 className="mt-2 font-extrabold">Waiting for your payment</h2>
              <p className="mt-1 text-sm text-slate-600">Pay the fee (${fee}) and upload the receipt. When our finance team confirms it, the “Start the test” button appears here.</p>
              <div className="mx-auto mt-4 max-w-sm"><ReceiptUpload kind="placement" id={pending.id} path={pending.receipt_path ?? null} onDone={load} /></div>
              <a href={`${site.whatsapp}?text=${waText}`} target="_blank" rel="noopener" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-700"><WhatsAppIcon className="h-4 w-4" /> Ask for payment details on WhatsApp</a>
            </div>
          ) : (
            <button onClick={book} disabled={busy} className="btn-primary inline-flex items-center gap-2 px-10 py-4 text-lg disabled:opacity-50">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Wallet className="h-5 w-5" />} {fee > 0 ? `Book the test · $${fee}` : "Book the test"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function LevelResult({ a }: { a: Attempt }) {
  const lv = a.result_level!;
  const rec = courses.find((c) => c.program === "GE" && c.level === lv) ?? courses[0];
  return (
    <div className="text-center">
      <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mx-auto grid h-36 w-36 place-items-center rounded-full brand-gradient shadow-2xl shadow-brand-900/30">
        <span className="text-5xl font-extrabold text-gold-300">{lv}</span>
      </motion.div>
      <h1 className="mt-6 text-3xl font-extrabold">Your level: {levels[lv].name}</h1>
      <p className="mt-2 text-slate-600">You answered {Number(a.score ?? 0)} of {Number(a.total ?? 0)} questions correctly.</p>
      <p className="mx-auto mt-4 max-w-md rounded-2xl bg-mist p-4 text-sm text-slate-600">Next step: our academic team contacts you for a short speaking test, then places you in a class.</p>
      {rec && (
        <div className="mt-6 rounded-3xl border border-slate-200 p-6 text-left">
          <div className="text-sm font-bold text-gold-600">Recommended course</div>
          <div className="mt-1 text-xl font-bold">{rec.title}</div>
          <p className="mt-2 text-sm text-slate-600">{rec.description}</p>
          <Link href={courseHref(rec.slug)} className="btn-primary mt-5 inline-block px-6 py-3">Go to the course</Link>
        </div>
      )}
    </div>
  );
}
