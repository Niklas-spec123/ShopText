import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getPlanLimits } from "@/lib/planLimits";
import { getUserProfile } from "@/lib/getProfile";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  }

  const profile = await getUserProfile();
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 403 });
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

  const body = await req.json();
  const { historyId, title, content } = body;

  let resolvedTitle = title ?? "";
  let resolvedContent = content ?? "";
  let resolvedHistoryId: string | null = historyId ?? null;

  if (historyId) {
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

    resolvedTitle = historyItem.title ?? resolvedTitle;
    resolvedContent = historyItem.content ?? resolvedContent;
  }

  if (!resolvedTitle && !resolvedContent) {
    return NextResponse.json(
      { error: "Missing favorite content" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: session.user.id,
    history_id: resolvedHistoryId,
    title: resolvedTitle,
    content: resolvedContent,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
