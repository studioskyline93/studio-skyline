import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = supabaseAdmin();

    const { data, error } = await supabase
      .from("content")
      .select("data")
      .eq("key", "site")
      .single();

    if (error) throw error;

    return NextResponse.json(data?.data ?? {});
  } catch (e) {
    return NextResponse.json({ error: "Failed to read site content" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const supabase = supabaseAdmin();

    const { error } = await supabase
      .from("content")
      .upsert({ key: "site", data: body, updated_at: new Date().toISOString() });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to save site content" }, { status: 500 });
  }
}
