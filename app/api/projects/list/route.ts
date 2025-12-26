import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) {
    return NextResponse.json([], { status: 401 });
  }

  const { data, error } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("PROJECT LIST ERROR", error);
    return NextResponse.json([], { status: 500 });
  }

  return NextResponse.json(data ?? []);
}
