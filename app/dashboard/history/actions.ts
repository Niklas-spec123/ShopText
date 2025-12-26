"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserProfile } from "@/lib/getProfile";
import { getPlanLimits } from "@/lib/planLimits";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

/** Delete one history item */
export async function deleteHistoryItem(id: string) {
  const supabase = createSupabaseServerClient();

  await supabase.from("history").delete().eq("id", id);

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/favorites");
}

/** Delete all history items */
export async function clearHistory() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) throw new Error("Unauthorized");

  await supabase.from("history").delete().eq("user_id", user.id);

  revalidatePath("/dashboard/history");
  redirect("/dashboard/history");
}

export async function toggleFavoriteAction(historyId: string) {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return { error: true, code: "NOT_AUTHENTICATED" };
  }

  const profile = await getUserProfile();
  if (!profile) {
    return { error: true, code: "NOT_AUTHENTICATED" };
  }

  const limits = getPlanLimits(profile.effectivePlan);

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", session.user.id)
    .eq("history_id", historyId)
    .maybeSingle();

  if (existing) {
    return { success: true, alreadyFavorite: true };
  }

  if (limits.maxFavorites !== Infinity) {
    const { count } = await supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    if ((count ?? 0) >= limits.maxFavorites) {
      return { error: true, code: "FAVORITE_LIMIT_REACHED" };
    }
  }

  const { data: historyItem } = await supabase
    .from("history")
    .select("title, content")
    .eq("id", historyId)
    .eq("user_id", session.user.id)
    .single();

  if (!historyItem) {
    return { error: true };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: session.user.id,
    history_id: historyId,
    title: historyItem.title,
    content: historyItem.content,
  });

  if (error) {
    console.error(error);
    return { error: true };
  }

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/favorites");
  revalidatePath(`/dashboard/history/${historyId}`);

  return { success: true };
}

/** Delete history item */
export async function deleteHistoryAction(formData: FormData) {
  const historyId = formData.get("historyId") as string;
  if (!historyId) return;

  const supabase = createSupabaseServerClient();

  await supabase.from("history").delete().eq("id", historyId);

  revalidatePath("/dashboard/history");
  revalidatePath("/dashboard/favorites");
}

/** Delete favorite */
export async function deleteFavoriteAction(formData: FormData) {
  const favoriteId = formData.get("favoriteId") as string;
  if (!favoriteId) return;

  const supabase = createSupabaseServerClient();

  await supabase.from("favorites").delete().eq("id", favoriteId);

  revalidatePath("/dashboard/favorites");
}
