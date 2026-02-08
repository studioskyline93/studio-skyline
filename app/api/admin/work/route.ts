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

    if (
      !payload ||
      typeof payload !== "object" ||
      !Array.isArray((payload as any).collections)
    ) {
      return NextResponse.json({ collections: [] });
    }

    return NextResponse.json(payload, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { collections: [], error: e?.message || "Failed to load work" },
      { status: 200 }
    );
  }
}
