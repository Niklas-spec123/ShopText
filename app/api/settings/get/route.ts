import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) return NextResponse.json({ settings: null });

  const { data } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", session.user.id)
    .single();

  return NextResponse.json({ settings: data ?? null });
}
