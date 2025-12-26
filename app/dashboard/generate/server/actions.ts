"use server";
import { getUserProfile } from "@/lib/getProfile";
import { getPlanLimits } from "@/lib/planLimits";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { GenerateInput } from "../types";

export async function generateTextAction(input: GenerateInput) {
  const supabase = createSupabaseServerClient();
  const profile = await getUserProfile();

  if (!profile) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const limits = getPlanLimits(profile.effectivePlan);

  // 🔢 Räkna generationer denna månad
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .gte("created_at", startOfMonth.toISOString());

  if (
    limits.generationsPerMonth !== Infinity &&
    (count ?? 0) >= limits.generationsPerMonth
  ) {
    return {
      success: false,
      code: "GENERATION_LIMIT_REACHED",
    } as const;
  }

  // ⬇️ här fortsätter din befintliga genereringslogik
}

export async function updateProjectSortOrderAction(
  projectId: string,
  orderedHistoryIds: string[]
) {
  const supabase = createSupabaseServerClient();

  // Uppdatera varje item i turordning
  for (let i = 0; i < orderedHistoryIds.length; i++) {
    const historyId = orderedHistoryIds[i];

    await supabase
      .from("project_items")
      .update({ sort_order: i })
      .eq("project_id", projectId)
      .eq("history_id", historyId);
  }

  return { success: true };
}

export async function renameProjectAction(projectId: string, newName: string) {
  const supabase = createSupabaseServerClient();

  if (!projectId || !newName.trim()) return;

  const { error } = await supabase
    .from("projects")
    .update({ name: newName.trim() })
    .eq("id", projectId);

  if (error) {
    console.error("RENAME PROJECT ERROR:", error);
    throw new Error("Kunde inte byta namn på projektet");
  }

  return { success: true };
}

export async function addHistoryToProjectAction(
  historyId: string,
  projectId: string
) {
  const supabase = createSupabaseServerClient();

  if (!historyId || !projectId) return;

  // 🔥 Hämta högsta sort_order från projektet
  const { data: maxRow } = await supabase
    .from("project_items")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextSort = (maxRow?.sort_order ?? -1) + 1;

  // 🔥 Lägg in korrekt sort_order
  const { error } = await supabase.from("project_items").insert({
    history_id: historyId,
    project_id: projectId,
    sort_order: nextSort,
  });

  if (error) {
    console.error("ADD TO PROJECT ERROR:", error);
    throw new Error("Kunde inte lägga till i projekt");
  }

  return { success: true };
}

export async function removeHistoryFromProjectAction(
  historyId: string,
  projectId: string
) {
  const supabase = createSupabaseServerClient();

  if (!historyId || !projectId) return;

  const { error } = await supabase
    .from("project_items")
    .delete()
    .eq("history_id", historyId)
    .eq("project_id", projectId);

  if (error) {
    console.error("REMOVE FROM PROJECT ERROR:", error);
    throw new Error("Kunde inte ta bort text från projektet");
  }

  // Uppdatera projekt-sidan
  // så listan direkt visar resultatet
  return { success: true };
}

export async function markFavoriteAction(historyId: string) {
  const supabase = createSupabaseServerClient();

  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const limits = getPlanLimits(profile.effectivePlan);

  if (limits.maxFavorites !== Infinity) {
    const { count } = await supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", profile.id);

    if ((count ?? 0) >= limits.maxFavorites) {
      return { error: true, code: "FAVORITE_LIMIT_REACHED" };
    }
  }

  const { data: historyItem } = await supabase
    .from("history")
    .select("title, content")
    .eq("id", historyId)
    .eq("user_id", profile.id)
    .single();

  if (!historyItem) {
    return { error: true };
  }

  const { error } = await supabase.from("favorites").insert({
    history_id: historyId,
    user_id: profile.id,
    title: historyItem.title,
    content: historyItem.content,
  });

  if (error) {
    throw error;
  }

  return { success: true };
}

type CreateProjectResult =
  | { success: true; project: { id: string; name: string } }
  | { success: false; code: "PROJECT_LIMIT_REACHED" };

export async function createProjectInlineAction(
  name: string
): Promise<CreateProjectResult> {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized");
  }

  const profile = await getUserProfile();
  if (!profile) {
    throw new Error("Unauthorized");
  }

  const limits = getPlanLimits(profile.effectivePlan);

  if (limits.maxProjects !== Infinity) {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("user_id", session.user.id);

    if ((count ?? 0) >= limits.maxProjects) {
      return { success: false, code: "PROJECT_LIMIT_REACHED" };
    }
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      user_id: session.user.id,
      name,
    })
    .select("id, name")
    .single();

  if (error || !project) {
    throw new Error("Could not create project");
  }

  return {
    success: true,
    project,
  };
}
