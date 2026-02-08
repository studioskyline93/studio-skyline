import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const ALLOWED_EXACT = [
    "production-house/hero/videos",
    "production-house/hero/photos",
    "clients/logos",
  ] as const;
  

function isAllowedFolder(folder: string) {
  // exact allowed folders
  if ((ALLOWED_EXACT as readonly string[]).includes(folder)) return true;

  // allow work/<slug>/videos
  // example: "work/stationery/videos"
  if (!folder.startsWith("work/")) return false;
  if (!folder.endsWith("/videos")) return false;

  const parts = folder.split("/");
  // ["work", "<slug>", "videos"]
  if (parts.length !== 3) return false;

  const slug = parts[1];
  // only allow safe slugs
  if (!/^[a-z0-9-]+$/.test(slug)) return false;

  return true;
}

function safeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-");
}

export async function POST(req: Request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Disabled in production" },
        { status: 403 }
      );
    }

    const form = await req.formData();
    const folder = String(form.get("folder") || "");
    const file = form.get("file");

    if (!isAllowedFolder(folder)) {
      return NextResponse.json({ error: "Folder not allowed" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const filename = safeName(file.name);
    const bytes = Buffer.from(await file.arrayBuffer());

    const lower = filename.toLowerCase();

    const isVideoFolder = folder.endsWith("/videos");
    const isPhotoFolder = folder.includes("/photos");

    const isVideo = isVideoFolder && lower.endsWith(".mp4");
    const isPhoto =
      isPhotoFolder &&
      (lower.endsWith(".jpg") ||
        lower.endsWith(".jpeg") ||
        lower.endsWith(".png") ||
        lower.endsWith(".webp"));

    // work uploads are videos only
    if (folder.startsWith("work/") && !isVideo) {
      return NextResponse.json({ error: "Only .mp4 allowed" }, { status: 400 });
    }

    // production-house can be video or photo
    if (!folder.startsWith("work/") && !isVideo && !isPhoto) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    const absDir = path.join(process.cwd(), "public", folder);
    await fs.mkdir(absDir, { recursive: true });

    const absFile = path.join(absDir, filename);
    await fs.writeFile(absFile, bytes);

    return NextResponse.json({ ok: true, filename });
  } catch (e) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
