"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function saveProjectSettingsAction(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return redirect("/login");

  const projectId = formData.get("projectId") as string;

  await supabase
    .from("projects")
    .update({
      name: formData.get("name"),
      product_name: formData.get("productName"),
      category: formData.get("category"),
      language: formData.get("language"),
      tone: formData.get("tone"),
      audience: formData.get("audience"),
      notes: formData.get("notes"),
    })
    .eq("id", projectId)
    .eq("user_id", session.user.id);

  // 🔥 Next.js 14: revalidatePath kommer från next/cache
  revalidatePath(`/dashboard/projects/${projectId}`);

  redirect(`/dashboard/projects/${projectId}`);
}
