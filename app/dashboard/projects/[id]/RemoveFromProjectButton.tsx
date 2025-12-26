"use client";

import { useTransition } from "react";
import { removeItemFromProject } from "../../server/actions";

export function RemoveFromProjectButton({
  itemId,
  projectId,
}: {
  itemId: string;
  projectId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(() => removeItemFromProject(formData));
      }}
    >
      <input type="hidden" name="itemId" value={itemId} />
      <input type="hidden" name="projectId" value={projectId} />

      <button
        type="submit"
        disabled={pending}
        className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-lg border border-red-500/30"
      >
        {pending ? "Tar bort…" : "Ta bort"}
      </button>
    </form>
  );
}
