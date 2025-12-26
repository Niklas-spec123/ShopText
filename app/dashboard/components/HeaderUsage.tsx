"use client";

import { useUsage } from "../usage/UsageContext";
import { UsagePill } from "../generate/components/usage-pill";

export function HeaderUsage() {
  const { usage } = useUsage();

  if (!usage) return null;

  return <UsagePill used={usage.used} limit={usage.limit} />;
}
