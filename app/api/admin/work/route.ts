import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const WORK_PATH = path.join(process.cwd(), "content", "work.json");

export async function GET() {
  try {
    const raw = await fs.readFile(WORK_PATH, "utf-8");
    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to read content/work.json" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Basic sanity check (keep lightweight)
    if (!data || typeof data !== "object" || !Array.isArray(data.collections)) {
      return NextResponse.json(
        { error: "Invalid work.json format: expected { collections: [] }" },
        { status: 400 }
      );
    }

    await fs.writeFile(WORK_PATH, JSON.stringify(data, null, 2) + "\n", "utf-8");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to write content/work.json" },
      { status: 500 }
    );
  }
}
