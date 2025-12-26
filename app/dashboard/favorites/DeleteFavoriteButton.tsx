"use client";

import { useTransition } from "react";
import { deleteFavoriteAction } from "@/app/dashboard/history/actions";

export function DeleteFavoriteButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(fd) => startTransition(() => deleteFavoriteAction(fd))}
      className="inline"
    >
      <input type="hidden" name="favoriteId" value={id} />

      <button
        type="submit"
        disabled={pending}
        className="text-red-400 hover:text-red-300 text-xs"
      >
        Delete
      </button>
    </form>
  );
}
