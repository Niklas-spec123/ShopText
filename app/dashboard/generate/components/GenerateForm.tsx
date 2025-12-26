"use client";

import { toastSuccess, toastError, toastInfo } from "@/lib/toast";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { createProjectInlineAction } from "../server/actions";
import { LockedOverlay } from "./LockedOverlay";
import { en } from "@/lib/copy/en";

type GenerateValues = {
  productName: string;
  details: string;
  tone: string;
  projectId: string | null;
};

type GenerationUsage = {
  used: number;
  limit: number;
};

type GenerateFormProps = {
  onGenerate: (values: GenerateValues) => Promise<any>;
  onUpgrade?: (reason: "projects" | "generation") => void;
  disabled?: boolean;
  defaultTone: string;
  projects: { id: string; name: string }[];
  generationUsage?: GenerationUsage | null;
  isOnboarding?: boolean;
};

export function GenerateForm({
  onGenerate,
  onUpgrade,
  disabled,
  defaultTone,
  projects: initialProjects = [],
  generationUsage,
  isOnboarding = false,
}: GenerateFormProps) {
  // --------------------
  // Form state
  // --------------------
  const [productName, setProductName] = useState("");
  const [details, setDetails] = useState("");
  const [tone, setTone] = useState(defaultTone);

  const [projects, setProjects] = useState(initialProjects);
  const [projectId, setProjectId] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  // --------------------
  // Onboarding prefill
  // --------------------
  useEffect(() => {
    if (!isOnboarding) return;

    setProductName("Black oversized hoodie");
    setDetails("Unisex, 100% cotton, streetwear fit, everyday comfort");
    setTone("Sales-focused");
  }, [isOnboarding]);

  // --------------------
  // Project creation
  // --------------------
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // --------------------
  // Pending states
  // --------------------
  const [isGenerating, startGenerate] = useTransition();
  const [isCreatingProject, startCreateProject] = useTransition();

  // --------------------
  // Validation
  // --------------------
  const productNameError = useMemo(() => {
    if (!productName.trim()) return "Product name is required";
    if (productName.trim().length < 2) return "Product name is too short";
    return null;
  }, [productName]);

  const isAtGenerationLimit =
    generationUsage &&
    generationUsage.limit !== Infinity &&
    generationUsage.used >= generationUsage.limit;

  const canGenerate =
    !disabled && !isGenerating && !productNameError && !isAtGenerationLimit;

  // --------------------
  // Helpers
  // --------------------
  async function refreshProjects() {
    const res = await fetch("/api/projects/list", { cache: "no-store" });
    if (!res.ok) return;
    setProjects(await res.json());
  }

  function handleCreateProject() {
    if (!newProjectName.trim()) return;

    startCreateProject(async () => {
      try {
        const res = await createProjectInlineAction(newProjectName.trim());

        if (!res.success) {
          if (res.code === "PROJECT_LIMIT_REACHED") {
            toastError(
              en.projects.limitReached,
              "Upgrade to Pro for unlimited projects"
            );
            onUpgrade?.("projects");
          }
          return;
        }

        await refreshProjects();
        setProjectId(res.project.id);
        setNewProjectName("");
        setShowNewProject(false);

        toastSuccess("Project created", `"${res.project.name}" selected`);
      } catch {
        toastError(en.common.error, "Please try again shortly");
      }
    });
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canGenerate) return;

    const formData = new FormData(e.currentTarget);
    const submittedProductName =
      String(formData.get("productName") ?? "").trim();
    const submittedDetails = String(formData.get("details") ?? "");
    const submittedTone = String(formData.get("tone") ?? "") || tone;
    const submittedProjectId =
      String(formData.get("projectId") ?? "") || null;

    toastInfo("Writing product copy", "This usually takes a few seconds");

    startGenerate(async () => {
      try {
        const res = await onGenerate({
          productName: submittedProductName,
          details: submittedDetails,
          tone: submittedTone,
          projectId: submittedProjectId,
        });

        // Complete onboarding after first success
        if (isOnboarding && res?.historyId) {
          await fetch("/api/onboarding/complete", { method: "POST" });
        }

        if (res?.code === "GENERATION_LIMIT_REACHED") {
          toastError(
            "Generation limit reached",
            "Upgrade to Pro for unlimited generations"
          );
          onUpgrade?.("generation");
        }
      } catch {
        toastError("Generation failed", "Please try again shortly");
      }
    });
  }

  // Cmd / Ctrl + Enter to submit
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        if (canGenerate) {
          formRef.current?.requestSubmit();
        }
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [canGenerate]);


  // --------------------
  // Render
  // --------------------
  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-4 relative">
      <input type="hidden" name="projectId" value={projectId ?? ""} />
      {isAtGenerationLimit && <LockedOverlay />}

      {/* Product name */}
      <div>
        <label className="text-sm text-slate-300">Product name</label>
        <input
          autoFocus
          type="text"
          name="productName"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="w-full p-2 rounded bg-slate-900 border border-slate-700"
          placeholder="e.g. Organic cotton hoodie"
        />
        {productNameError && (
          <p className="mt-1 text-xs text-red-400">{productNameError}</p>
        )}
      </div>

      {/* Details */}
      <div>
        <label className="text-sm text-slate-300">
          Product details <span className="text-slate-500">(optional)</span>
        </label>
        <textarea
          name="details"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          rows={4}
          className="w-full p-2 rounded bg-slate-900 border border-slate-700"
        />
      </div>

      {/* Tone */}
      <div>
        <label className="text-sm text-slate-300">Tone</label>
        <select
          name="tone"
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="w-full p-2 rounded bg-slate-900 border border-slate-700"
        >
          <option value="Sales-focused">Sales-focused</option>
          <option value="Informative">Informative</option>
          <option value="Inspirational">Inspirational</option>
        </select>
      </div>

      {/* Onboarding hint */}
      {isOnboarding && (
        <p className="text-xs text-slate-400 text-center">
          This is just an example — change anything or generate as-is
        </p>
      )}

      {/* Submit */}
      <button
        disabled={!canGenerate}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
      >
        {isGenerating ? "Writing…" : "Write product copy"}
      </button>
    </form>
  );
}
