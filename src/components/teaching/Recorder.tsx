"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, RotateCcw, Square } from "lucide-react";
import { supabase } from "@/lib/auth";

/** Record a short voice answer in the browser (MediaRecorder) */
export function Recorder({ onReady }: { onReady: (blob: Blob | null) => void }) {
  const [state, setState] = useState<"idle" | "rec" | "done">("idle");
  const [url, setUrl] = useState<string | null>(null);
  const [secs, setSecs] = useState(0);
  const [err, setErr] = useState("");
  const rec = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
    rec.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  const start = async () => {
    setErr("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const r = new MediaRecorder(stream);
      const parts: Blob[] = [];
      r.ondataavailable = (e) => parts.push(e.data);
      r.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(parts, { type: r.mimeType || "audio/webm" });
        setUrl(URL.createObjectURL(blob));
        setState("done");
        onReady(blob);
      };
      r.start();
      rec.current = r;
      setSecs(0);
      setState("rec");
      timer.current = setInterval(() => setSecs((s) => {
        if (s >= 299) rec.current?.stop();
        return s + 1;
      }), 1000);
    } catch {
      setErr("We couldn't use your microphone. Allow microphone access in your browser and try again.");
    }
  };
  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    rec.current?.stop();
  };
  const reset = () => {
    setUrl(null);
    setState("idle");
    onReady(null);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {state === "idle" && (
        <button type="button" onClick={start} className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700"><Mic className="h-4 w-4" /> Start recording</button>
      )}
      {state === "rec" && (
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-sm font-semibold text-rose-600"><span className="h-3 w-3 animate-pulse rounded-full bg-rose-600" /> Recording… {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</span>
          <button type="button" onClick={stop} className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2 text-sm font-bold text-white"><Square className="h-4 w-4" /> Stop</button>
        </div>
      )}
      {state === "done" && url && (
        <div className="flex flex-wrap items-center gap-3">
          <audio src={url} controls className="h-10 max-w-full" />
          <button type="button" onClick={reset} className="flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-ink"><RotateCcw className="h-4 w-4" /> Record again</button>
        </div>
      )}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <p className="mt-2 text-xs text-slate-500">Up to 5 minutes. Speak clearly, close to the microphone.</p>
    </div>
  );
}

/** Plays a recording stored in the private "recordings" bucket */
export function Recording({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    supabase.storage.from("recordings").createSignedUrl(path, 3600).then(({ data }) => setUrl(data?.signedUrl ?? null));
  }, [path]);
  if (!url) return <span className="text-xs text-slate-400">Loading recording…</span>;
  return <audio src={url} controls className="h-10 max-w-full" />;
}
