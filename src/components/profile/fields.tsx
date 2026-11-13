"use client";

import { Check, ChevronDown, X } from "lucide-react";

export const inputCls =
  "w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-[15px] outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-100";

export function Label({ children, required, hint, icon }: { children: React.ReactNode; required?: boolean; hint?: string; icon?: React.ReactNode }) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700">
      {icon}
      {children}
      {required && <span className="text-red-500">*</span>}
      {hint && <span className="text-xs font-normal text-slate-400">({hint})</span>}
    </span>
  );
}

export function TextInput({
  label, value, onChange, placeholder, type = "text", required, icon, prefix, hint,
}: {
  label: string; value?: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean; icon?: React.ReactNode; prefix?: React.ReactNode; hint?: string;
}) {
  return (
    <label className="block">
      <Label required={required} icon={icon} hint={hint}>{label}</Label>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">{prefix}</span>}
        <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${inputCls} ${prefix ? "pl-10" : ""}`} />
      </span>
    </label>
  );
}

export function Select({
  label, value, onChange, options, placeholder = "Select…", icon,
}: {
  label: string; value?: string; onChange: (v: string) => void; options: (string | [string, string])[]; placeholder?: string; icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <Label icon={icon}>{label}</Label>
      <span className="relative block">
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={`${inputCls} appearance-none pr-10`}>
          <option value="">{placeholder}</option>
          {options.map((o) => {
            const [v, l] = Array.isArray(o) ? o : [o, o];
            return <option key={v} value={v}>{l}</option>;
          })}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </span>
    </label>
  );
}

export function TextArea({ label, value, onChange, placeholder, max, icon, hint }: { label: string; value?: string; onChange: (v: string) => void; placeholder?: string; max?: number; icon?: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <Label icon={icon} hint={hint}>{label}</Label>
      <textarea value={value ?? ""} maxLength={max} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4} className={`${inputCls} resize-y`} />
      {max && <span className="mt-1 flex justify-between text-xs text-slate-400"><span>Maximum {max} characters</span><span>{(value ?? "").length}/{max}</span></span>}
    </label>
  );
}

/** Grid of checkbox tiles (select all that apply) */
export function CheckGrid({ label, hint, options, value = [], onChange }: { label: string; hint?: string; options: string[]; value?: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <div className="mb-2.5 text-sm font-semibold text-slate-700">
        {label} {hint && <span className="text-xs font-normal text-slate-400">({hint})</span>}
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <button
              type="button"
              key={o}
              onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${on ? "border-brand-400 bg-brand-50 text-brand-800" : "border-slate-200 text-slate-700 hover:border-slate-300"}`}
            >
              <span className={`grid h-4 w-4 shrink-0 place-items-center rounded border ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300"}`}>{on && <Check className="h-3 w-3" />}</span>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function Chip({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 py-1 pl-3 pr-1.5 text-sm text-brand-800">
      {children}
      <button type="button" onClick={onRemove} aria-label="Remove" className="rounded-full p-0.5 hover:bg-brand-100"><X className="h-3.5 w-3.5" /></button>
    </span>
  );
}

export function AddButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 rounded-xl bg-gold-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gold-600">
      + {children}
    </button>
  );
}

export function SectionCard({ icon, title, children, action }: { icon: React.ReactNode; title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-bold text-ink">{icon} {title}</h3>
        {action}
      </div>
      <div className="space-y-5">{children}</div>
    </div>
  );
}
