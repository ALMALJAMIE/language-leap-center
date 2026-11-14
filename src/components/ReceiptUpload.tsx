"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { supabase, useAuth } from "@/lib/auth";
import { rpcError } from "@/lib/roles";

/** Learner uploads a payment receipt (photo or PDF) for a course request or a placement booking */
export function ReceiptUpload({ kind, id, path, onDone }: { kind: "course" | "placement"; id: number; path: string | null; onDone: () => void }) {
  const uid = useAuth((s) => s.user?.id);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const upload = async (file: File | undefined) => {
    if (!file || !uid) return;
    if (file.size > 8 * 1024 * 1024) return setErr("The file is too big (max 8 MB).");
    setBusy(true);
    setErr("");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
    const p = `${uid}/${kind}-${id}-${Date.now()}.${ext}`;
    const up = await supabase.storage.from("receipts").upload(p, file, { contentType: file.type || undefined });
    if (up.error) {
      setBusy(false);
      return setErr(up.error.message);
    }
    const { error } = await supabase.rpc("attach_receipt", { p_kind: kind, p_id: id, p_path: p });
    setBusy(false);
    if (error) return setErr(rpcError(error));
    onDone();
  };

  return (
    <div>
      {path ? (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> Receipt received — we will confirm it soon.
          <label className="ml-auto cursor-pointer text-xs font-bold underline">Replace<input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} /></label>
        </div>
      ) : (
        <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-brand-300 bg-white px-4 py-3.5 text-sm font-bold text-brand-700 hover:bg-brand-50 ${busy ? "pointer-events-none opacity-60" : ""}`}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload the payment receipt
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      )}
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
    </div>
  );
}

/** Finance: open a receipt in a new tab */
export async function openReceipt(path: string) {
  const { data } = await supabase.storage.from("receipts").createSignedUrl(path, 600);
  if (data?.signedUrl) window.open(data.signedUrl, "_blank", "noopener");
}
