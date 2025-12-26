"use client";

import { Button } from "@/components/ui/button";

export function ManageSubscriptionButton() {
  const handleClick = async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Something went wrong");
    }
  };

  return <Button onClick={handleClick}>Manage subscription</Button>;
}
