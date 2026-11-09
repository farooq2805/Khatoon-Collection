import type { ReactNode } from "react";
import { Loader2, Package } from "lucide-react";
import { usableImage } from "../lib/format";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-brand-900 sm:text-[28px]">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const TONES: Record<string, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/15",
  blue: "bg-sky-50 text-sky-700 ring-sky-600/15",
  violet: "bg-violet-50 text-violet-700 ring-violet-600/15",
  gray: "bg-neutral-100 text-neutral-600 ring-neutral-500/15",
};

export function Badge({ tone = "gray", children }: { tone?: keyof typeof TONES | string; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${TONES[tone] || TONES.gray}`}>
      {children}
    </span>
  );
}

export function statusTone(status: string): string {
  return (
    {
      Pending: "amber",
      Confirmed: "blue",
      Shipped: "violet",
      Delivered: "green",
      Cancelled: "red",
      Paid: "green",
      Failed: "red",
      Created: "amber",
      Refunded: "gray",
    } as Record<string, string>
  )[status] || "gray";
}

export function StatusBadge({ status }: { status: string }) {
  return <Badge tone={statusTone(status)}>{status}</Badge>;
}

export function Thumb({ src, alt, size = 40 }: { src?: string | null; alt: string; size?: number }) {
  const url = usableImage(src);
  return (
    <div
      className="flex flex-none items-center justify-center overflow-hidden rounded-lg bg-brand-50 ring-1 ring-line"
      style={{ width: size, height: Math.round(size * 1.25) }}
    >
      {url ? (
        <img src={url} alt={alt} loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
      ) : (
        <Package className="h-4 w-4 text-brand-200" />
      )}
    </div>
  );
}

export function Spinner({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-16 text-sm text-neutral-500">
      <Loader2 className="h-4 w-4 animate-spin" /> {label}
    </div>
  );
}

export function Empty({ icon, title, text }: { icon?: ReactNode; title: string; text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {icon && <div className="mb-3 text-brand-200">{icon}</div>}
      <p className="font-semibold text-neutral-800">{title}</p>
      {text && <p className="mt-1 max-w-sm text-sm text-neutral-500">{text}</p>}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }) {
  return <div className="card border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
}) {
  return (
    <div className="flex gap-1 overflow-x-auto [scrollbar-width:none]">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${
            value === o.value ? "bg-brand-800 text-white" : "text-neutral-600 hover:bg-white"
          }`}
        >
          {o.label}
          {o.count !== undefined && (
            <span className={`rounded-full px-1.5 text-[11px] ${value === o.value ? "bg-white/20" : "bg-neutral-200/70"}`}>{o.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
