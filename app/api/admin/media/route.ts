import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

function validateFolder(folder: string) {
  // exact allowed folders
  if (
    folder === "production-house/hero/videos" ||
    folder === "production-house/hero/photos"
  ) {
    return { ok: true as const, kind: "static" as const };
  }

  // dynamic: work/<slug>/videos
  const parts = folder.split("/"); // e.g. ["work","packaging","videos"]
  if (parts.length === 3 && parts[0] === "work" && parts[2] === "videos") {
    const slug = parts[1];
    if (!isSafeSlug(slug)) return { ok: false as const };
    return { ok: true as const, kind: "work" as const };
  }

  return { ok: false as const };
}

function allowedExtsForFolder(folder: string) {
  if (folder === "production-house/hero/photos") {
    return [".jpg", ".jpeg", ".png", ".webp"];
  }
  // production-house videos + work videos
  return [".mp4"];
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const folder = searchParams.get("folder");

  if (!folder) {
    return NextResponse.json({ error: "Missing folder" }, { status: 400 });
  }

  if (folder.includes("..")) {
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  const valid = validateFolder(folder);
  if (!valid.ok) {
    return NextResponse.json({ error: "Folder not allowed" }, { status: 403 });
  }

  try {
    const dir = path.join(process.cwd(), "public", folder);
    const files = await fs.readdir(dir);

    const allowedExts = allowedExtsForFolder(folder);
    const filtered = files.filter((f) =>
      allowedExts.some((ext) => f.toLowerCase().endsWith(ext))
    );

    // return filenames only (no folder prefix) to match your current behavior
    return NextResponse.json({ files: filtered });
  } catch (err) {
    // If folder doesn't exist yet, return empty list (nicer admin UX)
    return NextResponse.json({ files: [] });
  }
}
