import { NextResponse } from "next/server";
import { createHash } from "crypto";
import fs from "fs/promises";
import os from "os";
import path from "path";

// Small, cached thumbnails of product photos (the admin panel lists hundreds of
// products; the originals are full-size phone photos of 0.4–2 MB each).
// GET /api/thumb?url=<photo on api.khatooncollection.in>&w=<64–800>

export const runtime = "nodejs";

const ALLOWED_HOSTS = new Set(["api.khatooncollection.in"]);
const CACHE_DIR = path.join(os.tmpdir(), "kc-thumbs");
const CACHE_HEADERS = { "Content-Type": "image/webp", "Cache-Control": "public, max-age=2592000, immutable" };

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const src = params.get("url") || "";
  const width = Math.min(800, Math.max(64, Math.round(Number(params.get("w")) || 160)));

  let target: URL;
  try {
    target = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }
  if (target.protocol !== "https:" || !ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 400 });
  }

  const file = path.join(CACHE_DIR, `${createHash("sha1").update(`${target.href}|${width}`).digest("hex")}.webp`);
  try {
    return new NextResponse(new Uint8Array(await fs.readFile(file)), { headers: CACHE_HEADERS });
  } catch {
    // not cached yet
  }

  try {
    const res = await fetch(target.href, { signal: AbortSignal.timeout(20000) });
    if (!res.ok || !(res.headers.get("content-type") || "").startsWith("image/")) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 });
    }
    const sharp = (await import("sharp")).default;
    const out = await sharp(Buffer.from(await res.arrayBuffer()))
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 72 })
      .toBuffer();
    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(file, out).catch(() => {});
    return new NextResponse(new Uint8Array(out), { headers: CACHE_HEADERS });
  } catch (error) {
    console.error("thumb failed:", target.href, error);
    return NextResponse.redirect(target.href, 302);
  }
}
