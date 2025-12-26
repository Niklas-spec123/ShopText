import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserProfile } from "@/lib/getProfile";
import GeneratePageClient from "./GeneratePageClient";

export default async function GeneratePage() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>Inte inloggad.</p>;

  const profile = await getUserProfile();
  if (!profile) return <p>Inte inloggad.</p>;

  // 📁 Projects
  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // ⚙️ Defaults (kan senare komma från user_settings)
  const defaultTone = "Sales-focused";

  const isOnboarding = profile.onboarding_completed === false;

  return (
    <GeneratePageClient
      defaultTone={defaultTone}
      projects={projects ?? []}
      isOnboarding={isOnboarding}
    />
  );
}
