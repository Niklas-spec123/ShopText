"use client";

import { useTransition } from "react";
import { createProjectAction } from "@/app/dashboard/server/actions";

export function NewProjectButton() {
  const [isPending, start] = useTransition();

  function handleCreate() {
    start(async () => {
      await createProjectAction("Nytt projekt");
    });
  }

  return (
    <button
      type="button"
      onClick={handleCreate}
      disabled={isPending}
      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-sm"
    >
      {isPending ? "Skapar…" : "Nytt projekt"}
    </button>
  );
}
