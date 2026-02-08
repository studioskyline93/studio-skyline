import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const slug = String(body.slug || "").trim();
    const filename = String(body.filename || "").trim();
    const contentType = String(body.contentType || "video/mp4");

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
    }
    if (!filename) {
      return NextResponse.json({ error: "Missing filename" }, { status: 400 });
    }

    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `${slug}/videos/${Date.now()}-${safeFilename}`;

    const supabase = supabaseAdmin();

    // creates a signed URL you can PUT the file to
    const { data, error } = await supabase.storage
      .from("work")
      .createSignedUploadUrl(objectPath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // also return the public URL (bucket is public)
    const { data: pub } = supabase.storage.from("work").getPublicUrl(objectPath);

    return NextResponse.json({
      ok: true,
      path: objectPath,
      token: data.token,
      signedUrl: data.signedUrl,
      src: pub.publicUrl,
      contentType,
    });
  } catch (e) {
    return NextResponse.json({ error: "Failed to create upload URL" }, { status: 500 });
  }
}
