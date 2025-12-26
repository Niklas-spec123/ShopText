"use client";

import { useState } from "react";
import { FavoriteToggle } from "./FavoriteToggle";
import { OutputTabs } from "../../generate/components/OutputTabs";
import { UpgradeModal } from "../../generate/components/UpgradeModal";
import type { AiResult } from "../../generate/types";

type ClientPageProps = {
  item: {
    id: string;
    title: string;
    json: AiResult | null;
  };
  isFavorite: boolean;
  projects: { id: string; name: string }[];
};

export function HistoryDetailClient({
  item,
  isFavorite,
  projects,
}: ClientPageProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<
    "favorites" | "generation" | "projects"
  >("favorites");

  const productData = {
    productName: item.title ?? "",
    details: "",
    tone: "",
  };

  function openUpgrade(reason: "favorites" | "generation" | "projects") {
    setUpgradeReason(reason);
    setShowUpgrade(true);
  }

  return (
    <>
      {/* ACTION BAR */}
      <div className="flex items-center gap-3">
        <FavoriteToggle
          historyId={item.id}
          isFavorite={isFavorite}
          size="md"
          onUpgrade={openUpgrade}
        />
      </div>

      {/* OUTPUT (read-only, inga actions här) */}
      <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
        <OutputTabs
          result={item.json}
          historyId={item.id}
          isFavorite={isFavorite}
          productData={productData}
          projects={projects}
          hideActions
        />
      </div>

      {/* UPGRADE MODAL */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
      />
    </>
  );
}
