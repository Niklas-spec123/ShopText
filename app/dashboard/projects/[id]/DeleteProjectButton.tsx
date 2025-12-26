"use client";

import { useTransition } from "react";
import { deleteProjectAction } from "@/app/dashboard/server/actions";

export function DeleteProjectButton({ id }: { id: string }) {
  const [isPending, start] = useTransition();

  return (
    <form
      action={(formData) =>
        start(async () => {
          formData.append("projectId", id);
          await deleteProjectAction(formData);
        })
      }
    >
      <button
        type="submit"
        disabled={isPending}
        className="text-red-400 hover:text-red-300"
      >
        {isPending ? "Tar bort…" : "Ta bort projekt"}
      </button>
    </form>
  );
}
