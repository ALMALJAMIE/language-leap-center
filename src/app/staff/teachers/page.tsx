"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Plus, Save, UserPlus } from "lucide-react";
import { supabase } from "@/lib/auth";
import { rpcError, useRole } from "@/lib/roles";
import { loadTeachers, money, slugify, type TeacherRow } from "@/lib/teaching";
import { InstructorAvatar } from "@/components/Instructors";
import { ErrorNote, StaffShell } from "@/components/staff/StaffShell";
import { Empty } from "@/components/teaching/ui";

interface Account { user_id: string; email: string; full_name: string; has_profile: boolean }

export default function TeachersAdminPage() {
  return (
    <StaffShell page="/staff/teachers/" title="Teachers & Prices" subtitle="Publish teacher profiles and set what learners pay and what each teacher earns per hour">
      <Teachers />
    </StaffShell>
  );
}

function Teachers() {
  const role = useRole((s) => s.role);
  const canMoney = role === "admin" || role === "finance";
  const [rows, setRows] = useState<TeacherRow[] | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const [t, a] = await Promise.all([supabase.from("teachers").select("*").order("created_at"), supabase.rpc("teacher_accounts")]);
    setErr(rpcError(t.error ?? a.error));
    setRows((t.data as TeacherRow[]) ?? []);
    setAccounts((a.data as Account[]) ?? []);
  }, []);
  useEffect(() => {
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
  }, [load]);

  const createFor = async (a: Account) => {
    const { error } = await supabase.from("teachers").insert({ user_id: a.user_id, name: a.full_name, slug: `${slugify(a.full_name)}-${a.user_id.slice(0, 4)}`, title: "English teacher" });
    if (error) return setErr(rpcError(error));
    load();
  };

  if (rows === null) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  const missing = accounts.filter((a) => !a.has_profile);

  return (
    <>
      <ErrorNote text={err} />
      {missing.length > 0 && (
        <div className="mb-6 rounded-3xl border border-gold-200 bg-gold-50/50 p-5">
          <h2 className="flex items-center gap-2 font-bold"><UserPlus className="h-5 w-5 text-gold-600" /> Teacher accounts without a profile</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {missing.map((a) => (
              <button key={a.user_id} onClick={() => createFor(a)} className="flex items-center gap-2 rounded-xl border border-gold-300 bg-white px-3 py-2 text-sm font-semibold hover:border-gold-500">
                <Plus className="h-4 w-4" /> {a.full_name} <span className="font-normal text-slate-500">({a.email})</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">The teacher can also create it from “My Public Profile”. To add a new teacher, give their account the Teacher role in Team & Roles.</p>
        </div>
      )}
      {rows.length === 0 ? (
        <Empty icon={UserPlus} title="No teacher profiles yet" text="Give an account the Teacher role, then create the profile here or let the teacher fill it in." />
      ) : (
        <div className="space-y-4">{rows.map((t) => <Row key={t.user_id} t={t} canMoney={canMoney} onSaved={() => { load(); loadTeachers(true); }} />)}</div>
      )}
    </>
  );
}

function Row({ t, canMoney, onSaved }: { t: TeacherRow; canMoney: boolean; onSaved: () => void }) {
  const [price, setPrice] = useState(String(t.lesson_price));
  const [pay, setPay] = useState(String(t.hourly_pay));
  const [published, setPublished] = useState(t.published);
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const [err, setErr] = useState("");
  const dirty = price !== String(t.lesson_price) || pay !== String(t.hourly_pay) || published !== t.published;

  const save = async () => {
    setState("saving");
    const patch: Partial<TeacherRow> = { published };
    if (canMoney) Object.assign(patch, { lesson_price: Number(price), hourly_pay: Number(pay) });
    const { error } = await supabase.from("teachers").update(patch).eq("user_id", t.user_id);
    if (error) {
      setState("");
      return setErr(rpcError(error));
    }
    setState("saved");
    onSaved();
  };

  const profileOk = !!(t.title && t.bio);
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-wrap items-center gap-5">
        <div className="h-16 w-16 shrink-0 overflow-hidden"><div className="origin-top-left scale-[0.57]"><InstructorAvatar t={{ ...t, photo: t.photo ?? undefined, country: t.country ?? undefined, specialties: [], privateLessons: true, verified: t.published }} /></div></div>
        <div className="min-w-48 flex-1">
          <b className="block">{t.name}</b>
          <span className="line-clamp-1 text-sm text-slate-500">{t.title || "No headline yet"}</span>
          <span className="mt-1 flex gap-3 text-xs">
            {!profileOk && <span className="text-amber-600">Profile incomplete</span>}
            {!t.meeting_link && <span className="text-amber-600">No lesson link</span>}
            {t.published && <Link href={`/instructors/profile/?id=${t.slug}`} className="flex items-center gap-1 font-semibold text-brand-700 hover:underline">Public page <ExternalLink className="h-3 w-3" /></Link>}
          </span>
        </div>
        <label className="text-xs font-semibold text-slate-500">Learner pays / hour
          <span className="mt-1 flex items-center rounded-xl border border-slate-300 px-2"><span className="text-slate-400">$</span>
            <input type="number" min={0} step={0.5} value={price} disabled={!canMoney} onChange={(e) => { setPrice(e.target.value); setState(""); }} className="w-20 py-2 pl-1 text-sm font-bold text-ink outline-none disabled:bg-transparent" />
          </span>
        </label>
        <label className="text-xs font-semibold text-slate-500">Teacher earns / hour
          <span className="mt-1 flex items-center rounded-xl border border-slate-300 px-2"><span className="text-slate-400">$</span>
            <input type="number" min={0} step={0.5} value={pay} disabled={!canMoney} onChange={(e) => { setPay(e.target.value); setState(""); }} className="w-20 py-2 pl-1 text-sm font-bold text-ink outline-none disabled:bg-transparent" />
          </span>
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <button type="button" onClick={() => { setPublished(!published); setState(""); }} className={`h-6 w-11 rounded-full p-0.5 transition ${published ? "bg-emerald-500" : "bg-slate-200"}`} aria-pressed={published}>
            <span className={`block h-5 w-5 rounded-full bg-white shadow transition ${published ? "translate-x-5" : ""}`} />
          </button>
          Published
        </label>
        <button onClick={save} disabled={!dirty || state === "saving"} className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-40">
          {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {state === "saved" ? "Saved" : "Save"}
        </button>
      </div>
      <p className="mt-3 text-xs text-slate-500">
        A 60-minute lesson: learner pays <b>{money(Number(price))}</b>, teacher earns <b>{money(Number(pay))}</b>, platform keeps <b>{money(Number(price) - Number(pay))}</b>.
      </p>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}
