import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Accept:
    // { path: "slug/videos/file.mp4" }
    // or { paths: ["slug/videos/a.mp4", ...] }
    const paths: string[] = Array.isArray(body?.paths)
      ? body.paths
      : body?.path
      ? [body.path]
      : [];

    if (!paths.length) {
      return NextResponse.json({ error: "Missing path(s)" }, { status: 400 });
    }

    // Safety: only allow deletes inside "<slug>/videos/"
    for (const p of paths) {
      if (!/^[a-z0-9-]+\/videos\/.+$/i.test(p)) {
        return NextResponse.json({ error: "Path not allowed" }, { status: 400 });
      }
    }

    const supabase = supabaseAdmin();

    const { error } = await supabase.storage.from("work").remove(paths);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
