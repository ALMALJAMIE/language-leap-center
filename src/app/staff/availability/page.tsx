"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CalendarClock, CheckCircle2, Copy, Eraser, Loader2, Save, Video } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";
import { CELLS, cellLabel, cellsToSlots, loadMyTeacher, providerName, slotsToCells, timeZone, useMyTeacher, type Slot, type TeacherRow } from "@/lib/teaching";
import { ErrorNote, StaffShell } from "@/components/staff/StaffShell";

const days = [1, 2, 3, 4, 5, 6, 0]; // Monday first
const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AvailabilityPage() {
  return (
    <StaffShell page="/staff/availability/" title="Availability" subtitle="When learners can book you, and where the lesson happens">
      <Gate />
    </StaffShell>
  );
}

function Gate() {
  const user = useAuth((s) => s.user)!;
  const { profile, loaded } = useMyTeacher();
  useEffect(() => {
    loadMyTeacher(user.id);
  }, [user.id]);
  if (!loaded) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;
  if (!profile)
    return (
      <div className="rounded-3xl border border-brand-200 bg-brand-50 p-6 text-brand-900">
        Create your teacher profile first. <Link href="/staff/my-profile/" className="font-bold underline">Create profile</Link>
      </div>
    );
  return (
    <div className="space-y-6">
      <Meeting key={profile.user_id} profile={profile} />
      <Week teacherId={profile.user_id} />
    </div>
  );
}

function Meeting({ profile }: { profile: TeacherRow }) {
  const [provider, setProvider] = useState(profile.meeting_provider);
  const [link, setLink] = useState(profile.meeting_link ?? "");
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const [err, setErr] = useState("");
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (link && !/^https:\/\//.test(link.trim())) return setErr("The link must start with https://");
    setState("saving");
    setErr("");
    const { error } = await supabase.from("teachers").update({ meeting_provider: provider, meeting_link: link.trim() || null }).eq("user_id", profile.user_id);
    if (error) {
      setState("");
      return setErr(rpcError(error));
    }
    setState("saved");
    loadMyTeacher(profile.user_id);
  };
  return (
    <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6">
      <h2 className="flex items-center gap-2 font-bold"><Video className="h-5 w-5 text-brand-600" /> Your lesson room</h2>
      <p className="mt-1 text-sm text-slate-500">Your personal Zoom or Google Meet link. It is added to every lesson you confirm (you can still change it for a single lesson), and the learner sees a “Join” button 15 minutes before the start.</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[180px_1fr_auto]">
        <select value={provider} onChange={(e) => setProvider(e.target.value as TeacherRow["meeting_provider"])} className="rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm">
          {(Object.keys(providerName) as (keyof typeof providerName)[]).map((p) => <option key={p} value={p}>{providerName[p]}</option>)}
        </select>
        <input value={link} onChange={(e) => { setLink(e.target.value); setState(""); }} placeholder={provider === "meet" ? "https://meet.google.com/abc-defg-hij" : "https://us05web.zoom.us/j/123456789?pwd=…"} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand-500" />
        <button className="btn-primary flex items-center justify-center gap-2 px-5 py-2.5 text-sm">{state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} {state === "saved" ? "Saved" : "Save"}</button>
      </div>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <p className="mt-3 text-xs text-slate-500">
        Tip: in Zoom use your <b>Personal Meeting Room</b> link; in Google Meet create a meeting “for later” and keep its link.
      </p>
    </form>
  );
}

function Week({ teacherId }: { teacherId: string }) {
  const [cells, setCells] = useState<Set<string> | null>(null);
  const [night, setNight] = useState(false);
  const [state, setState] = useState<"" | "saving" | "saved">("");
  const [err, setErr] = useState("");
  const paint = useRef<null | boolean>(null);

  useEffect(() => {
    supabase.from("availability").select("weekday,start_min,end_min").eq("teacher_id", teacherId).then(({ data, error }) => {
      setErr(rpcError(error));
      const c = slotsToCells((data as Slot[]) ?? []);
      setCells(c);
      if ([...c].some((k) => Number(k.split("-")[1]) < 12)) setNight(true);
    });
  }, [teacherId]);
  useEffect(() => {
    const up = () => (paint.current = null);
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  if (!cells) return <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-300" />;

  const toggle = (key: string, add: boolean) => {
    setCells((prev) => {
      const n = new Set(prev);
      if (add) n.add(key);
      else n.delete(key);
      return n;
    });
    setState("");
  };
  const copyMonday = () => {
    const n = new Set([...cells].filter((k) => !["2", "3", "4", "5"].includes(k.split("-")[0])));
    for (const k of cells) if (k.startsWith("1-")) for (const d of [2, 3, 4, 5]) n.add(`${d}-${k.split("-")[1]}`);
    setCells(n);
    setState("");
  };
  const save = async () => {
    setState("saving");
    const { error } = await supabase.rpc("set_availability", { p_slots: cellsToSlots(cells) });
    if (error) {
      setState("");
      return setErr(rpcError(error));
    }
    setErr("");
    setState("saved");
  };

  const rows = Array.from({ length: CELLS }, (_, i) => i).filter((i) => night || i >= 12);
  const hours = cells.size / 2;

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 font-bold"><CalendarClock className="h-5 w-5 text-gold-600" /> Weekly hours</h2>
          <p className="mt-1 text-sm text-slate-500">Click or drag over the times you can teach every week. Times are in <b>{timeZone()}</b>; learners see them in their own time zone.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button type="button" onClick={copyMonday} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 font-semibold hover:border-brand-400"><Copy className="h-4 w-4" /> Copy Monday to Tue–Fri</button>
          <button type="button" onClick={() => { setCells(new Set()); setState(""); }} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 font-semibold hover:border-red-300"><Eraser className="h-4 w-4" /> Clear</button>
        </div>
      </div>
      <ErrorNote text={err} />

      <div className="mt-5 max-h-[560px] overflow-auto rounded-2xl border border-slate-200 select-none" style={{ touchAction: "none" }}>
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-white">
            <tr>
              <th className="w-16 border-b border-slate-200 p-2" />
              {days.map((d) => <th key={d} className="border-b border-slate-200 p-2 font-bold text-slate-600">{dayName[d]}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((i) => (
              <tr key={i}>
                <td className={`pr-2 text-right align-top text-[11px] text-slate-400 ${i % 2 ? "" : "border-t border-slate-100"}`}>{i % 2 ? "" : cellLabel(i)}</td>
                {days.map((d) => {
                  const key = `${d}-${i}`;
                  const on = cells.has(key);
                  return (
                    <td
                      key={key}
                      onPointerDown={(e) => { e.preventDefault(); paint.current = !on; toggle(key, !on); }}
                      onPointerEnter={() => paint.current !== null && toggle(key, paint.current)}
                      className={`h-5 cursor-pointer border-l border-slate-100 transition-colors ${i % 2 ? "" : "border-t"} ${on ? "bg-emerald-400 hover:bg-emerald-500" : "hover:bg-brand-50"}`}
                      title={`${dayName[d]} ${cellLabel(i)}`}
                    />
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-slate-600"><input type="checkbox" checked={night} onChange={(e) => setNight(e.target.checked)} /> Show hours before 06:00</label>
        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500"><b className="text-ink">{hours}</b> hours / week</span>
          <button type="button" onClick={save} className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm">{state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />} {state === "saved" ? "Saved" : "Save hours"}</button>
        </div>
      </div>
    </section>
  );
}
