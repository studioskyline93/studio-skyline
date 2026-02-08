import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

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

    // If empty or wrong shape, return the expected shape
    if (!payload || typeof payload !== "object" || !Array.isArray((payload as any).collections)) {
      return NextResponse.json({ collections: [] });
    }

    return NextResponse.json(payload);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to read work content" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // keep your sanity check
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
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save work content" },
      { status: 500 }
    );
  }
}
