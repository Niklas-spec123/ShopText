import { createSupabaseServerClient } from "@/lib/supabase-server";
import { PLAN_LIMITS } from "@/lib/planLimits";
import { getEffectivePlan } from "@/lib/getEffectivePlan";

type Feature = "generation" | "favorites" | "projects";

export async function requirePlan(feature: Feature) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, current_period_end")
    .eq("id", user.id)
    .single();

  const effectivePlan = getEffectivePlan(profile);
  const limits = PLAN_LIMITS[effectivePlan];

  switch (feature) {
    case "generation":
      if (limits.generationsPerMonth === Infinity) return;
      return; // usage check happens elsewhere

    case "favorites":
      if (limits.maxFavorites === Infinity) return;
      throw new Error("PLAN_LIMIT_REACHED");

    case "projects":
      if (limits.maxProjects === Infinity) return;
      throw new Error("PLAN_LIMIT_REACHED");
  }
}
