"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AddToProjectDropdown({ historyId }: { historyId: string }) {
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [open, setOpen] = useState(false);

  // Inline create project
  const [creatingNew, setCreatingNew] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    async function loadProjects() {
      const { data } = await supabase
        .from("projects")
        .select("id, name")
        .order("created_at", { ascending: true });

      setProjects(data ?? []);
      setLoading(false);
    }

    loadProjects();
  }, []);

  async function addToProject(projectId: string) {
    setAdding(true);

    await supabase.from("project_items").insert({
      project_id: projectId,
      history_id: historyId,
    });

    setAdding(false);
    setOpen(false);
  }

  async function createProject() {
    if (!newProjectName.trim()) return;

    setCreating(true);

    const { data, error } = await supabase
      .from("projects")
      .insert({ name: newProjectName.trim() })
      .select()
      .single();

    setCreating(false);

    if (error) return;

    // Add new project to list immediately
    setProjects((prev) => [...prev, data]);
    setNewProjectName("");
    setCreatingNew(false);
  }

  return (
    <div className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs px-2 py-1 rounded-lg border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800 transition"
      >
        📁 Add to project
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-xl z-20 p-2 space-y-1">
          {/* Project list */}
          {loading && (
            <p className="text-xs text-slate-500 px-2 py-1">
              Loading projects…
            </p>
          )}

          {!loading && projects.length === 0 && (
            <p className="text-xs text-slate-500 px-2 py-1">No projects yet.</p>
          )}

          {!loading &&
            projects.map((project) => (
              <button
                key={project.id}
                disabled={adding}
                onClick={() => addToProject(project.id)}
                className="w-full text-left text-xs px-2 py-1 rounded-lg hover:bg-slate-800 text-slate-200"
              >
                {project.name}
              </button>
            ))}

          <div className="border-t border-slate-700 my-1" />

          {/* Inline create new project */}
          {!creatingNew ? (
            <button
              onClick={() => setCreatingNew(true)}
              className="w-full text-left text-xs px-2 py-1 rounded-lg text-indigo-300 hover:bg-slate-800"
            >
              ➕ Create new project
            </button>
          ) : (
            <div className="p-2 space-y-2">
              <input
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name…"
                className="w-full text-xs px-2 py-1 rounded bg-slate-800 border border-slate-600 text-slate-200"
              />

              <div className="flex gap-2">
                <button
                  onClick={createProject}
                  disabled={creating}
                  className="flex-1 text-xs px-2 py-1 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  {creating ? "Creating…" : "Create"}
                </button>

                <button
                  onClick={() => {
                    setCreatingNew(false);
                    setNewProjectName("");
                  }}
                  className="text-xs px-2 py-1 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
