import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const reels = body.reels;

    if (!Array.isArray(reels)) {
      return NextResponse.json(
        { success: false, error: "Invalid reels payload. Expected an array." },
        { status: 400 }
      );
    }

    // Write to public/instagram-reels.json
    const filePath = path.join(process.cwd(), "public", "instagram-reels.json");
    fs.writeFileSync(filePath, JSON.stringify(reels, null, 2), "utf8");

    console.log("✅ Successfully updated public/instagram-reels.json via API route!");

    return NextResponse.json({ success: true, count: reels.length });
  } catch (error: any) {
    console.error("Error writing instagram-reels.json:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to save configuration." },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "instagram-reels.json");
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }
    const data = fs.readFileSync(filePath, "utf8");
    return NextResponse.json(JSON.parse(data));
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load configuration." },
      { status: 500 }
    );
  }
}
