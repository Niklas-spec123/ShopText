// app/dashboard/generate/components/AddToProjectButton.tsx
"use client";

import { useEffect, useState } from "react";

type Project = {
  id: string;
  title: string;
};

export function AddToProjectButton({
  historyId,
}: {
  historyId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  // Om vi inte har historyId (inte inloggad / ej sparad) – visa inget
  if (!historyId) return null;

  async function loadProjects() {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/projects/list");
      if (!res.ok) {
        throw new Error("Kunde inte hämta projekt");
      }

      const data = await res.json();
      setProjects(data.projects ?? []);
    } catch (err) {
      console.error(err);
      setError("Kunde inte hämta projekt.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open && projects.length === 0 && !loading) {
      void loadProjects();
    }
  }, [open, projects.length, loading]);

  async function handleAdd(projectId: string) {
    try {
      setAddingId(projectId);
      setError(null);
      setDone(false);

      const res = await fetch("/api/projects/add-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, historyId }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Något gick fel");
      }

      setDone(true);
      // stäng efter lyckad add
      setTimeout(() => setOpen(false), 600);
    } catch (err) {
      console.error(err);
      setError("Kunde inte lägga till i projekt.");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setDone(false);
          setError(null);
        }}
        className="text-xs px-3 py-1 rounded-full border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-100"
      >
        {done ? "Tillagd i projekt ✓" : "Lägg till i projekt"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl border border-slate-800 bg-slate-950 shadow-lg z-20 p-3 text-xs text-slate-100">
          {loading && <p className="text-slate-400">Laddar projekt...</p>}

          {!loading && projects.length === 0 && (
            <p className="text-slate-400">
              Inga projekt ännu. Gå till{" "}
              <span className="font-medium">Projekt</span>-fliken för att skapa
              ett.
            </p>
          )}

          {!loading && projects.length > 0 && (
            <ul className="space-y-1">
              {projects.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => handleAdd(p.id)}
                    disabled={addingId === p.id}
                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-800 disabled:opacity-60"
                  >
                    {addingId === p.id ? "Lägger till..." : p.title}
                  </button>
                </li>
              ))}
            </ul>
          )}

          {error && <p className="mt-2 text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}
