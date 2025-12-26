import { createSupabaseServerClient } from "./supabase-server";
import { getEffectivePlan, Plan } from "@/lib/getEffectivePlan";

export type UserProfile = {
  id: string;

  // Raw Stripe / DB values
  plan: Plan;
  current_period_end: string | null;

  // Effective app plan (source of truth)
  effectivePlan: Plan;

  generations_this_month: number;
  favorites_count: number;
  projects_count: number;
  onboarding_completed: boolean;
};

export async function getUserProfile(): Promise<UserProfile | null> {
  const supabase = createSupabaseServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const userId = session.user.id;

  // 🔍 Fetch profile
  const { data: profile } = await supabase
    .from("profiles")
    .select(
      `
        id,
        plan,
        current_period_end,
        generations_this_month,
        favorites_count,
        projects_count,
        onboarding_completed
      `
    )
    .eq("id", userId)
    .single();

  // ✅ Profile exists
  if (profile) {
    return {
      ...profile,
      onboarding_completed: profile.onboarding_completed ?? true,
      effectivePlan: getEffectivePlan(profile),
    };
  }

  // 🧠 PROFILE MISSING → CREATE SAFE DEFAULT
  const { data: newProfile, error } = await supabase
    .from("profiles")
    .insert({
      id: userId,
      plan: "free",
      current_period_end: null,
      generations_this_month: 0,
      favorites_count: 0,
      projects_count: 0,
      onboarding_completed: false,
    })
    .select()
    .single();

  if (error || !newProfile) {
    console.error("Failed to create profile:", error);
    return null;
  }

  return {
    ...newProfile,
    onboarding_completed: newProfile.onboarding_completed ?? false,
    effectivePlan: "free",
  };
}
