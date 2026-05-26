/* eslint-disable @typescript-eslint/no-explicit-any */
export function getCategorySlug(cat: any): string {
  if (!cat) return "";

  if (typeof cat === "string") return cat.toLowerCase();
  if (typeof cat === "number") return String(cat);

  if (typeof cat === "object") {
    return (
      cat.slug ??
      cat.name?.toLowerCase?.() ??
      String(cat.id ?? "")
    );
  }

  return "";
}
