import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const SITE_PATH = path.join(process.cwd(), "content", "site.json");

export async function GET() {
  try {
    const raw = await fs.readFile(SITE_PATH, "utf8");
    const json = JSON.parse(raw);
    return NextResponse.json(json);
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to read content/site.json" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();


    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    await fs.writeFile(SITE_PATH, JSON.stringify(body, null, 2) + "\n", "utf8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to save content/site.json" },
      { status: 500 }
    );
  }
}
