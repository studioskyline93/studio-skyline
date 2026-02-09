import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic'; // ← ADD THIS LINE
export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("content")
      .select("data")
      .eq("key", "work")
      .single();

    if (error) throw error;

    const payload = data?.data;

    if (
      !payload ||
      typeof payload !== "object" ||
      !Array.isArray((payload as any).collections)
    ) {
      return NextResponse.json({ collections: [] });
    }

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ collections: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || !Array.isArray(body.collections)) {
      return NextResponse.json(
        { error: "Invalid work format: expected { collections: [] }" },
        { status: 400 }
      );
    }

    const supabase = supabaseAdmin();

    const { error } = await supabase
      .from("content")
      .upsert({ key: "work", data: body, updated_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save work content" }, { status: 500 });
  }
}