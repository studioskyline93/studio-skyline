import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_PREFIXES = ["work/", "production-house/hero/"];

function allowed(folder: string) {
  return ALLOWED_PREFIXES.some((p) => folder.startsWith(p));
}

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json({ error: "Disabled in production" }, { status: 403 });
    }

    const { folder, filename } = await req.json();

    if (!folder || !filename) {
      return NextResponse.json({ error: "Missing folder/filename" }, { status: 400 });
    }

    if (!allowed(folder)) {
      return NextResponse.json({ error: "Folder not allowed" }, { status: 400 });
    }

    const abs = path.join(process.cwd(), "public", folder, filename);
    await fs.unlink(abs);

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
