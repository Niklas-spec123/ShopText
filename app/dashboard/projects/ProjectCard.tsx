"use client";

import { useState } from "react";
import { deleteProjectAction } from "../server/actions";
import { useFormStatus } from "react-dom";

export function ProjectCard({ project }: { project: any }) {
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    await deleteProjectAction(project.id);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative">
      {/* Project Name */}
      <h2 className="text-lg font-semibold text-slate-100">{project.name}</h2>

      <p className="text-xs text-slate-500 mt-1">
        {new Date(project.created_at).toLocaleString("sv-SE")}
      </p>

      {/* Delete Button */}
      <form action={handleDelete}>
        <DeleteButton isDeleting={isDeleting} />
      </form>
    </div>
  );
}

/* ----------------------------------------------------
   Delete Button (loading state via useFormStatus)
---------------------------------------------------- */

function DeleteButton({ isDeleting }: { isDeleting: boolean }) {
  const { pending } = useFormStatus();
  const loading = pending || isDeleting;

  return (
    <button
      type="submit"
      disabled={loading}
      className="absolute top-3 right-3 px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs disabled:opacity-50"
    >
      {loading ? "Tar bort..." : "Ta bort"}
    </button>
  );
}
