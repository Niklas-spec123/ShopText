"use client";

import { useTransition } from "react";
import { deleteProjectAction } from "@/app/dashboard/server/actions";

export function DeleteProjectButton({ id }: { id: string }) {
  const [isPending, start] = useTransition();

  function handleDelete() {
    start(async () => {
      await deleteProjectAction(id);
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-400 hover:text-red-300"
    >
      {isPending ? "Deleting…" : "Delete project"}
    </button>
  );
}
