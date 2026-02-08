import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED = [
  "production-house/hero/videos",
  "production-house/hero/photos",
] as const;

function isAllowedFolder(folder: string) {
  return (ALLOWED as readonly string[]).includes(folder);
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "");
}

export async function POST(req: Request) {
  try {
    // Safety: dev only
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Delete disabled in production" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const folder = String(body.folder || "");
    const filename = safeName(String(body.filename || ""));

    if (!isAllowedFolder(folder)) {
      return NextResponse.json({ error: "Folder not allowed" }, { status: 400 });
    }

    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const absPath = path.join(process.cwd(), "public", folder, filename);

    await fs.unlink(absPath);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
