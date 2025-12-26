import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getPlanLimits } from "@/lib/planLimits";
import { getUserProfile } from "@/lib/getProfile";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  const { historyId } = await req.json();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

  const profile = await getUserProfile();
  if (!profile) {
    return NextResponse.json({ success: false }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("history_id", historyId)
    .eq("user_id", session.user.id)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    return NextResponse.json({ success: true, favorite: false });
  }

  const limits = getPlanLimits(profile.effectivePlan);
  if (limits.maxFavorites !== Infinity) {
    const { count } = await supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    if ((count ?? 0) >= limits.maxFavorites) {
      return NextResponse.json(
        { code: "FAVORITE_LIMIT_REACHED" },
        { status: 403 }
      );
    }
  }

  const { data: historyItem } = await supabase
    .from("history")
    .select("title, content")
    .eq("id", historyId)
    .eq("user_id", session.user.id)
    .single();

  if (!historyItem) {
    return NextResponse.json(
      { error: "History item not found" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("favorites").insert({
    history_id: historyId,
    user_id: session.user.id,
    title: historyItem.title,
    content: historyItem.content,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, favorite: true });
}
