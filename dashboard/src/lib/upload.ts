import { API_BASE, ApiError, TOKEN_KEY } from "./api";

const MAX_EDGE = 1800; // px, longest side after resizing
const RESIZE_ABOVE = 1.2 * 1024 * 1024; // only touch files bigger than ~1.2 MB

/** Shrinks big photos in the browser so product pages stay fast. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.size <= RESIZE_ABOVE) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob: Blob | null = await new Promise((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

/** Uploads one file to the store's media library and returns its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  const body = new FormData();
  body.append("file", await shrink(file));
  body.append("folder", folder);
  body.append("type", "IMAGE");
  const token = localStorage.getItem(TOKEN_KEY);
  const res = await fetch(`${API_BASE}/media/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.success === false) throw new ApiError(json?.message || `Upload failed (${res.status})`, res.status);
  const data = json?.data?.data || json?.data;
  const url = data?.secureUrl || data?.url;
  if (!url) throw new Error("Upload failed: no URL returned");
  return url;
}
