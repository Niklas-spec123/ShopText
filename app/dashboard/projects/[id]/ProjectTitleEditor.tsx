"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export function ProjectTitleEditor({
  initialName,
  projectId,
}: {
  initialName: string;
  projectId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialName);

  const [saving, setSaving] = useState(false); // ⏳ Saving…
  const [saved, setSaved] = useState(false); // ✔ Saved
  const [canUndo, setCanUndo] = useState(false); // ↩️ Undo available

  const previousValue = useRef(initialName); // last saved value
  const router = useRouter();

  async function save() {
    const trimmed = value.trim();

    // Nothing changed → just exit edit mode
    if (!trimmed || trimmed === previousValue.current) {
      setEditing(false);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch("/api/projects/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, newName: trimmed }),
      });

      if (!res.ok) {
        throw new Error("Rename failed");
      }

      // Update last saved value
      previousValue.current = trimmed;
      setCanUndo(true);

      // Show ✔ Saved
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // Refresh server components
      router.refresh();
    } catch (err) {
      console.error("Rename error:", err);
      // Revert on error
      setValue(previousValue.current);
    }

    setSaving(false);
    setEditing(false);
  }

  function startEditing() {
    setEditing(true);
  }

  function undo() {
    setValue(previousValue.current);
    setCanUndo(false);
  }

  return (
    <div className="mt-2 space-y-1">
      {/* VIEW MODE */}
      {!editing ? (
        <div className="flex items-center gap-3">
          <h1
            className="text-3xl font-semibold text-slate-100 hover:text-indigo-300 cursor-pointer"
            onClick={startEditing}
            title="Click to edit project name"
          >
            {value}
          </h1>

          {/* UNDO */}
          {canUndo && (
            <button
              type="button"
              onClick={undo}
              className="text-xs text-slate-400 hover:text-slate-200 underline"
            >
              Undo
            </button>
          )}

          {/* STATUS */}
          {saving && (
            <span className="text-xs text-indigo-400 animate-pulse">
              Saving…
            </span>
          )}

          {!saving && saved && (
            <span className="text-xs text-emerald-400 animate-fadeIn">
              ✔ Saved
            </span>
          )}
        </div>
      ) : (
        /* EDIT MODE */
        <input
          autoFocus
          className="text-3xl font-semibold bg-slate-900 border border-slate-700 p-1 rounded w-full"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") {
              setValue(previousValue.current);
              setEditing(false);
            }
          }}
        />
      )}
    </div>
  );
}
