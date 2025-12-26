"use client";

import { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { OutputSection } from "./OutputSection";
import type { AiResult } from "../types";
import {
  markFavoriteAction,
  addHistoryToProjectAction,
} from "../server/actions";

type ProductData = {
  productName: string;
  details: string;
  tone: string;
};

type OutputTabsProps = {
  result: AiResult | null;
  historyId: string | null;
  isFavorite: boolean;
  productData: ProductData;
  projects?: { id: string; name: string }[];
  hideActions?: boolean;
  onUpgrade?: (reason: "favorites" | "projects" | "generation") => void;
  onRegenerate?: () => void;
};

export function OutputTabs({
  result,
  historyId,
  isFavorite = false,
  productData,
  projects = [],
  hideActions = false,
  onUpgrade,
  onRegenerate,
}: OutputTabsProps) {
  const [localResult, setLocalResult] = useState<AiResult | null>(result);
  const [selectedProject, setSelectedProject] = useState("");
  const [favorite, setFavorite] = useState(isFavorite);

  useEffect(() => {
    setLocalResult(result);
    setFavorite(isFavorite);
    setSelectedProject("");
  }, [result, isFavorite]);

  if (!localResult) {
    return null;
  }

  /* ============================
     FORMATTING
     ============================ */
  const bulletText = localResult.bullets.map((b) => `• ${b}`).join("\n");

  const adsText = localResult.ads
    .map((ad, i) => `Ad ${i + 1}:\n${ad}`)
    .join("\n\n");

  const seoText = [
    "SEO title:",
    localResult.seoTitle,
    "",
    "Meta description:",
    localResult.metaDescription,
    "",
    "Keywords:",
    localResult.keywords.join(", "),
  ].join("\n");

  const allText = [
    "Short description:",
    localResult.short,
    "",
    "Long description:",
    localResult.long,
    "",
    "Bullet points:",
    bulletText,
    "",
    "SEO:",
    seoText,
    "",
    "Social caption:",
    localResult.instagram,
    "",
    "Ads:",
    adsText,
  ].join("\n\n");

  /* ============================
     ACTIONS
     ============================ */
  async function toggleFavorite() {
    if (!historyId || favorite) return;

    const res = await markFavoriteAction(historyId);

    if (res?.code === "FAVORITE_LIMIT_REACHED") {
      onUpgrade?.("favorites");
      return;
    }

    if (res?.success) {
      setFavorite(true);
    }
  }

  async function addToProject() {
    if (!historyId || !selectedProject) return;
    await addHistoryToProjectAction(historyId, selectedProject);
    setSelectedProject("");
  }

  return (
    <div className="space-y-4">
      {!hideActions && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="px-3 py-2 rounded text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white"
              >
                🔁 Generate a new version
              </button>
            )}

            <button
              onClick={toggleFavorite}
              disabled={favorite}
              className={`px-3 py-2 rounded text-sm font-medium transition ${
                favorite
                  ? "bg-slate-700 text-slate-300"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              ⭐ {favorite ? "Saved" : "Save"}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <select
              className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">Add to project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            <button
              onClick={addToProject}
              disabled={!selectedProject}
              className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 rounded text-sm disabled:opacity-40"
            >
              Add to project
            </button>
          </div>
        </div>
      )}

      <Tabs
        initial="short"
        tabs={[
          {
            id: "short",
            label: "Short",
            content: (
              <OutputSection
                title="Short description"
                type="short"
                content={localResult.short}
                productData={productData}
                hasContent
                onUpdate={(v) => setLocalResult({ ...localResult, short: v })}
              />
            ),
          },
          {
            id: "long",
            label: "Long",
            content: (
              <OutputSection
                title="Long description"
                type="long"
                content={localResult.long}
                productData={productData}
                hasContent
                onUpdate={(v) => setLocalResult({ ...localResult, long: v })}
              />
            ),
          },
          {
            id: "bullets",
            label: "Bullets",
            content: (
              <OutputSection
                title="Bullet points"
                type="bullets"
                content={bulletText}
                productData={productData}
                hasContent
                onUpdate={(v) =>
                  setLocalResult({
                    ...localResult,
                    bullets: Array.isArray(v) ? v : [v],
                  })
                }
              />
            ),
          },
          {
            id: "seo",
            label: "SEO",
            content: (
              <OutputSection
                title="SEO"
                type="seo"
                content={seoText}
                productData={productData}
                hasContent
                onUpdate={() => {}}
              />
            ),
          },
          {
            id: "social",
            label: "Social",
            content: (
              <OutputSection
                title="Social caption"
                type="instagram"
                content={localResult.instagram}
                productData={productData}
                hasContent
                onUpdate={(v) =>
                  setLocalResult({ ...localResult, instagram: v })
                }
              />
            ),
          },
          {
            id: "ads",
            label: "Ads",
            content: (
              <OutputSection
                title="Ad copy"
                type="ads"
                content={adsText}
                productData={productData}
                hasContent
                onUpdate={() => {}}
              />
            ),
          },
          {
            id: "all",
            label: "All",
            content: (
              <OutputSection
                title="All copy"
                type="all"
                content={allText}
                productData={productData}
                hasContent
                onUpdate={() => {}}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
