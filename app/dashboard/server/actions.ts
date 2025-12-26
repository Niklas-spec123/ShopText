"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProjectFromClient(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const { supabase, session } = await requireSession();

  await supabase.from("projects").insert({
    name: trimmed,
    user_id: session.user.id,
  });

  revalidatePath("/dashboard/projects");
}

/* -----------------------------------------------------------
   HELPERS
----------------------------------------------------------- */

async function requireSession() {
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  const session = data.session;

  if (!session) {
    redirect("/auth/login");
  }

  return { supabase, session };
}

/* -----------------------------------------------------------
   CREATE PROJECT (normal create from Projects page)
----------------------------------------------------------- */
export async function createProjectAction(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return;

  const supabase = createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) return;

  await supabase.from("projects").insert({
    name: trimmed,
    user_id: session.user.id,
  });

  revalidatePath("/dashboard/projects");
}

/* -----------------------------------------------------------
   CREATE PROJECT INLINE (Generate Page)
----------------------------------------------------------- */

export async function createProjectInlineAction(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return null;

  const { supabase, session } = await requireSession();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: trimmed,
      user_id: session.user.id,
    })
    .select("id, name, created_at")
    .single();

  if (error) {
    console.error("INLINE PROJECT CREATE ERROR:", error);
    return null;
  }

  revalidatePath("/dashboard/projects");
  return data;
}

// ------------------------------
// Byta namn på projekt  (tar emot FormData)
// ------------------------------
export async function renameProjectAction(formData: FormData) {
  "use server";

  const projectId = formData.get("projectId")?.toString();
  const newName = formData.get("newName")?.toString();

  if (!projectId || !newName) return;

  const supabase = createSupabaseServerClient();
  await supabase.from("projects").update({ name: newName }).eq("id", projectId);

  revalidatePath("/dashboard/projects");
}

/* -----------------------------------------------------------
   DELETE PROJECT
----------------------------------------------------------- */

export async function deleteProjectAction(projectId: string) {
  if (!projectId) return;

  const { supabase, session } = await requireSession();

  await supabase
    .from("projects")
    .delete()
    .eq("id", projectId)
    .eq("user_id", session.user.id);

  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
}

/* -----------------------------------------------------------
   REORDER PROJECT ITEMS
----------------------------------------------------------- */

export async function reorderProjectItemAction(
  projectId: string,
  orderedIds: string[]
) {
  if (!projectId || !Array.isArray(orderedIds)) {
    return { success: false, error: "Invalid input" };
  }

  const { supabase, session } = await requireSession();

  const updates = orderedIds.map((id, index) => ({
    id,
    project_id: projectId,
    user_id: session.user.id,
    sort_index: index,
  }));

  const { error } = await supabase.from("project_items").upsert(updates);

  if (error) {
    console.error("REORDER ERROR:", error);
    return { success: false, error: "Could not save ordering" };
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
  return { success: true };
}

/* -----------------------------------------------------------
   REMOVE ITEM FROM PROJECT
----------------------------------------------------------- */

export async function removeItemFromProject(itemId: string, projectId: string) {
  if (!itemId || !projectId) return;

  const { supabase, session } = await requireSession();

  const { error } = await supabase
    .from("project_items")
    .delete()
    .eq("id", itemId)
    .eq("project_id", projectId)
    .eq("user_id", session.user.id);

  if (error) {
    console.error("REMOVE ITEM ERROR:", error);
    return;
  }

  revalidatePath(`/dashboard/projects/${projectId}`);
}
