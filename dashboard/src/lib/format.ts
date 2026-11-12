export function inr(n: unknown, opts: { compact?: boolean } = {}): string {
  const v = Number(n) || 0;
  if (opts.compact && Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(v >= 1000000 ? 1 : 2).replace(/\.0+$/, "")}L`;
  if (opts.compact && Math.abs(v) >= 1000) return `₹${(v / 1000).toFixed(1).replace(/\.0$/, "")}K`;
  return "₹" + Math.round(v).toLocaleString("en-IN");
}

export const orderNo = (id: number | string) => "#ORD-" + String(id).padStart(6, "0");

export function dateTime(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function dateShort(d: string | Date | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short" });
}

export function timeAgo(d: string | Date): string {
  const s = Math.round((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 86400 * 7) return `${Math.floor(s / 86400)} d ago`;
  return dateShort(d);
}

/** Start of an IST calendar day, `days` from today, as a timestamp. */
export function istDayStart(days = 0): number {
  const IST = 5.5 * 3600 * 1000;
  const now = new Date(Date.now() + IST);
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + days) - IST;
}

/** Indian mobile number → wa.me format (91XXXXXXXXXX), or null. */
export function waNumber(phone?: string | null): string | null {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  return null;
}

export function waLink(phone: string | null | undefined, text: string): string | null {
  const n = waNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

export function pctChange(cur: number, prev: number): number | null {
  if (!prev) return cur ? null : 0;
  return Math.round(((cur - prev) / prev) * 100);
}

/** Old Cloudinary accounts are disabled; their images never load. */
export function usableImage(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null;
  if (/res\.cloudinary\.com\/(techsrow|ifm9ihwo)\//.test(url)) return null;
  return url;
}

/** Small resized copy of a product photo (served by the store's /api/thumb). */
export function thumbUrl(url: string, width: number): string {
  if (!/^https:\/\/api\.khatooncollection\.in\//.test(url)) return url;
  return `https://khatooncollection.in/api/thumb?w=${width}&url=${encodeURIComponent(url)}`;
}
