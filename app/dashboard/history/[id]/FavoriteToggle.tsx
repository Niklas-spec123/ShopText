"use client";

import { useState, useTransition } from "react";
import { toggleFavoriteAction } from "../actions";

type FavoriteToggleProps = {
  historyId: string;
  isFavorite: boolean;
  size?: "sm" | "md" | "lg";
  onUpgrade?: (reason: "favorites") => void;
};

export function FavoriteToggle({
  historyId,
  isFavorite,
  size = "sm",
  onUpgrade,
}: FavoriteToggleProps) {
  const [pending, startTransition] = useTransition();
  const [favorite, setFavorite] = useState(isFavorite);

  const starSize =
    size === "lg" ? "text-3xl" : size === "md" ? "text-2xl" : "text-xl";

  function handleToggle() {
    if (pending || favorite) return;

    startTransition(async () => {
      const res = await toggleFavoriteAction(historyId);

      if (res?.code === "FAVORITE_LIMIT_REACHED") {
        onUpgrade?.("favorites");
        return;
      }

      if (res?.success) {
        setFavorite(true);
      }
    });
  }

  return (
    <button
      type="button"
      disabled={pending || favorite}
      onClick={handleToggle}
      className={`
        ${starSize}
        transition
        ${favorite ? "text-yellow-400" : "text-slate-500"}
        hover:text-yellow-300
        disabled:opacity-60
      `}
      aria-label="Spara som favorit"
    >
      ★
    </button>
  );
}
