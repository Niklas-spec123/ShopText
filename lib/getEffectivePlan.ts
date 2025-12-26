export type Plan = "free" | "pro";

export type ProfileLike = {
  plan: Plan;
  current_period_end: string | null;
};

/**
 * Single source of truth for what plan the user actually has.
 *
 * Rules:
 * - free is always free
 * - pro without period_end is still pro (new or syncing subscription)
 * - pro becomes free ONLY when period_end exists AND is in the past
 */
export function getEffectivePlan(profile: ProfileLike | null): Plan {
  // 🚫 No profile → always free
  if (!profile) return "free";

  // 🟢 Free is always free
  if (profile.plan === "free") {
    return "free";
  }

  // 🟡 Pro with no period end yet → still Pro
  if (!profile.current_period_end) {
    return "pro";
  }

  const periodEnd = new Date(profile.current_period_end);
  const now = new Date();

  // ⛔ Pro expired
  if (periodEnd < now) {
    return "free";
  }

  // ✅ Active Pro
  return "pro";
}
