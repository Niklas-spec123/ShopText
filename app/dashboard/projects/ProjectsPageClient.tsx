"use client";

import { useState } from "react";

import { ProjectCard } from "./ProjectCard";
import { createProjectFromClient } from "../server/actions";

export default function ProjectsPageClient({ projects }: { projects: any[] }) {
  const [showModal, setShowModal] = useState(false);

  async function handleCreateProject(formData: FormData) {
    const name = formData.get("name")?.toString() ?? "";
    await createProjectFromClient(name);
    setShowModal(false); // Close modal after creation
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-100">Projects</h1>

        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm"
        >
          + New project
        </button>
      </div>

      {/* PROJECT LIST */}
      <div className="grid grid-cols-1 gap-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}

        {projects.length === 0 && (
          <p className="text-slate-500 text-center py-10">
            No projects created yet.
          </p>
        )}
      </div>

      {/* MODAL */}
      {showModal && (
        <CreateProjectModal
          close={() => setShowModal(false)}
          onSubmit={handleCreateProject}
        />
      )}
    </div>
  );
}

/* ----------------------------------------------------
   CREATE PROJECT MODAL
---------------------------------------------------- */

function CreateProjectModal({
  close,
  onSubmit,
}: {
  close: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <form
        action={onSubmit}
        className="bg-slate-900 p-6 rounded-xl w-full max-w-md space-y-4 shadow-lg border border-slate-700"
      >
        <h2 className="text-lg font-semibold text-slate-100">
          Create new project
        </h2>

        <input
          name="name"
          type="text"
          placeholder="Project name…"
          required
          className="w-full px-3 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 focus:ring-2 focus:ring-indigo-600"
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={close}
            className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-sm"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-4 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
