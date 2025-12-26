import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function POST() {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { count } = await supabase
    .from("history")
    .select("id", { count: "exact", head: true })
    .eq("user_id", session.user.id);

  if (!count) {
    return NextResponse.json(
      { error: "Onboarding not completed" },
      { status: 409 }
    );
  }

  await supabase
    .from("profiles")
    .update({ onboarding_completed: true })
    .eq("id", session.user.id);

  return NextResponse.json({ success: true });
}
