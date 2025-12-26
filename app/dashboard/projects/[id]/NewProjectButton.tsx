"use client";

import { useTransition } from "react";
import { createProjectAction } from "../../server/actions";

export function NewProjectButton() {
  const [isPending, start] = useTransition();

  return (
    <form action={(formData) => start(() => createProjectAction(formData))}>
      <input type="hidden" name="projectName" value="Nytt projekt" />
      <button
        disabled={isPending}
        className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700"
      >
        + Nytt projekt
      </button>
    </form>
  );
}
