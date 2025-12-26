"use client";

import { useTransition } from "react";
import { removeItemFromProject } from "@/app/dashboard/server/actions";

type Props = {
  projectId: string;
  itemId: string;
};

export function RemoveFromProjectButton({ projectId, itemId }: Props) {
  const [isPending, start] = useTransition();

  function handleRemove() {
    start(async () => {
      await removeItemFromProject(projectId, itemId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleRemove}
      disabled={isPending}
      className="text-xs text-slate-400 hover:text-slate-300"
    >
      {isPending ? "Tar bort…" : "Ta bort"}
    </button>
  );
}
