"use server";

import { createSupabaseServerClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveSettingsAction(formData: FormData) {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return;

  await supabase.from("user_settings").upsert({
    user_id: session.user.id,
    display_name: formData.get("display_name"),
    default_language: formData.get("default_language"),
    default_tone: formData.get("default_tone"),
    default_audience: formData.get("default_audience"),
  });

  // Uppdatera cachen
  revalidatePath("/dashboard/settings");

  // 🚀 Skicka användaren direkt till Generate-sidan
  redirect("/dashboard/generate");
}
