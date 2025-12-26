"use client";

import { useState, useEffect } from "react";

export function ProjectSelector({
  projects,
  onChange,
}: {
  projects: { id: string; name: string }[];
  onChange: (projectId: string | null) => void;
}) {
  const [selected, setSelected] = useState<string>("");

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value || "";
    setSelected(value);
    onChange(value || null);
  }

  return (
    <div className="space-y-1">
      <label className="text-sm text-slate-300">Projekt</label>
      <select
        value={selected}
        onChange={handleChange}
        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2"
      >
        <option value="">— Inget projekt valt —</option>

        {projects.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  );
}
