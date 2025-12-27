"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  plan: "free" | "pro";
};

export function SubscriptionButton({ plan }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      if (!res.ok) {
        // Försök läsa error från backend, annars fallback
        const error = await res.json().catch(() => null);

        alert(error?.error ?? "You don’t have an active subscription yet.");
        return;
      }

      const { url } = await res.json();

      if (!url) {
        throw new Error("Missing portal URL");
      }

      window.location.href = url;
    } catch (err) {
      console.error("Manage subscription error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push("/pricing");
  };

  // ✅ PRO → Billing Portal
  if (plan === "pro") {
    return (
      <Button onClick={handleManageSubscription} disabled={loading}>
        {loading ? "Opening billing portal..." : "Manage subscription"}
      </Button>
    );
  }

  // ✅ FREE → Checkout / Pricing
  return <Button onClick={handleUpgrade}>Upgrade to Pro</Button>;
}
