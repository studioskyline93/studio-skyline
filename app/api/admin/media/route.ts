import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

function isSafeSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug);
}

function validateFolder(folder: string) {
  // exact allowed folders (local fs for now)
  if (
    folder === "production-house/hero/videos" ||
    folder === "production-house/hero/photos"
  ) {
    return { ok: true as const, kind: "static" as const };
  }

  // dynamic: work/<slug>/videos (Supabase Storage)
  const parts = folder.split("/"); // ["work","packaging","videos"]
  if (parts.length === 3 && parts[0] === "work" && parts[2] === "videos") {
    const slug = parts[1];
    if (!isSafeSlug(slug)) return { ok: false as const };
    return { ok: true as const, kind: "work" as const, slug };
  }

  return { ok: false as const };
}

function allowedExtsForFolder(folder: string) {
  if (folder === "production-house/hero/photos") {
    return [".jpg", ".jpeg", ".png", ".webp"];
  }
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

  // ✅ WORK: list from Supabase Storage bucket "work"
  if (valid.kind === "work") {
    try {
      const supabase = supabaseAdmin();
      const prefix = `${valid.slug}/videos`;

      const { data, error } = await supabase.storage.from("work").list(prefix, {
        limit: 200,
        sortBy: { column: "name", order: "desc" },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Keep your current behavior: return filenames only
      const files = (data || [])
        .map((x) => x.name)
        .filter((name) => name.toLowerCase().endsWith(".mp4"));

      return NextResponse.json({ files });
    } catch (e) {
      return NextResponse.json({ files: [] });
    }
  }

  // ✅ STATIC: keep old local filesystem behavior for now
  try {
    const dir = path.join(process.cwd(), "public", folder);
    const files = await fs.readdir(dir);

    const allowedExts = allowedExtsForFolder(folder);
    const filtered = files.filter((f) =>
      allowedExts.some((ext) => f.toLowerCase().endsWith(ext))
    );

    return NextResponse.json({ files: filtered });
  } catch (err) {
    return NextResponse.json({ files: [] });
  }
}
