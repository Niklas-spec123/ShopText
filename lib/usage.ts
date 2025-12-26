import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserProfile } from "@/lib/getProfile";
import { getPlanLimits } from "@/lib/planLimits";

export type UsageInfo = {
  used: number;
  limit: number;
};

export async function getGenerationUsage(): Promise<UsageInfo | null> {
  const supabase = createSupabaseServerClient();
  const profile = await getUserProfile();

  if (!profile) return null;

  const limits = getPlanLimits(profile.effectivePlan);

  // 🔢 Första dagen denna månad
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("history")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .gte("created_at", startOfMonth.toISOString());

  if (error) {
    console.error("USAGE COUNT ERROR:", error);
    return null;
  }

  return {
    used: count ?? 0,
    limit: limits.generationsPerMonth,
  };
}
