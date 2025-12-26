"use client";

import { useState } from "react";
import { createProjectAction } from "../server/actions";

export function CreateProjectForm() {
  const [name, setName] = useState("");

  return (
    <form
      action={async (formData: FormData) => {
        const projectName = formData.get("name")?.toString().trim();

        if (!projectName) return;

        await createProjectAction(projectName);
        setName("");
      }}
      className="flex gap-2"
    >
      <input
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New project…"
        className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-sm flex-1"
        required
      />

      <button
        type="submit"
        className="px-4 py-2 bg-indigo-600 rounded-lg text-white text-sm"
      >
        Create
      </button>
    </form>
  );
}
