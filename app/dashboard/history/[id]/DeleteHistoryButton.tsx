"use client";

import { useTransition } from "react";
import { deleteHistoryAction } from "../actions";

export function DeleteHistoryButton({ id }: { id: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <form action={(fd) => startTransition(() => deleteHistoryAction(fd))}>
      <input type="hidden" name="historyId" value={id} />

      <button
        type="submit"
        disabled={pending}
        className="text-red-400 hover:text-red-300 text-xs border border-red-400/40 px-3 py-1 rounded-lg"
      >
        Ta bort
      </button>
    </form>
  );
}
