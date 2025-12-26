"use client";

import { useState, useTransition } from "react";
import { createProjectInlineAction } from "../generate/server/actions";
import { UpgradeModal } from "../generate/components/UpgradeModal";

export function CreateProjectButton() {
  const [name, setName] = useState("");
  const [pending, startTransition] = useTransition();
  const [showUpgrade, setShowUpgrade] = useState(false);

  function handleCreate() {
    if (!name.trim()) return;

    startTransition(async () => {
      const res = await createProjectInlineAction(name);

      if (!res.success && res.code === "PROJECT_LIMIT_REACHED") {
        setShowUpgrade(true);
        return;
      }

      if (res.success) {
        setName("");
        window.location.reload();
      }
    });
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nytt projekt"
          className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-sm"
        />

        <button
          onClick={handleCreate}
          disabled={pending}
          className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm disabled:opacity-50"
        >
          Create
        </button>
      </div>

      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason="projects"
      />
    </>
  );
}
