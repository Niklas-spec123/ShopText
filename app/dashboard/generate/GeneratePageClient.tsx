"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { GenerateForm } from "./components/GenerateForm";
import { OutputTabs } from "./components/OutputTabs";
import type { AiResult } from "./types";
import { UpgradeModal } from "./components/UpgradeModal";
import { useUsage } from "../usage/UsageContext";

type GeneratePageProps = {
  defaultTone: string;
  projects: { id: string; name: string }[];
  isOnboarding: boolean;
};

export default function GeneratePageClient({
  defaultTone,
  projects,
  isOnboarding,
}: GeneratePageProps) {
  const router = useRouter();

  // ----------------------------------
  // Usage (server truth, optimistic)
  // ----------------------------------
  const { increment, rollback } = useUsage();

  // ----------------------------------
  // Result / output
  // ----------------------------------
  const [result, setResult] = useState<AiResult | null>(null);
  const [historyId, setHistoryId] = useState<string | null>(null);

  // ----------------------------------
  // UI state
  // ----------------------------------
  const [locked, setLocked] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);

  // ----------------------------------
  // Upgrade modal
  // ----------------------------------
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<
    "generation" | "favorites" | "projects"
  >("generation");

  function openUpgrade(reason: "generation" | "favorites" | "projects") {
    setUpgradeReason(reason);
    setShowUpgrade(true);
  }

  // ----------------------------------
  // Last input (for regenerate + context)
  // ----------------------------------
  const [lastInput, setLastInput] = useState<{
    productName: string;
    details: string;
    tone: string;
  } | null>(null);

  // ----------------------------------
  // Generate handler (SERVER IS TRUTH)
  // ----------------------------------
  async function handleGenerate(input: {
    productName: string;
    details: string;
    tone: string;
    projectId: string | null;
  }) {
    if (locked) return;

    setLocked(true);
    setHasGenerated(true);
    setLastInput({
      productName: input.productName,
      details: input.details,
      tone: input.tone,
    });

    // ⭐ optimistic usage
    increment();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });

      const data = await res.json();

      // ❌ SERVER SAYS NO → SHOW UPGRADE + RESYNC SERVER STATE
      if (!res.ok) {
        rollback();

        if (data.code === "GENERATION_LIMIT_REACHED") {
          openUpgrade("generation");

          // 🔑 CRITICAL FIX:
          // resync server truth so usage pill stays maxed (red)
          router.refresh();
        }

        setLocked(false);
        return;
      }

      // ✅ SUCCESS
      setResult(data.result);
      setHistoryId(data.historyId);

      // 🔑 onboarding just completed → rerun layout/providers
      if (isOnboarding) {
        router.refresh();
      }
    } catch (err) {
      rollback();
      console.error(err);
    }

    setLocked(false);
  }

  // ----------------------------------
  // Product context for OutputTabs
  // ----------------------------------
  const productData = {
    productName: lastInput?.productName ?? "",
    details: lastInput?.details ?? "",
    tone: lastInput?.tone ?? defaultTone,
  };

  // ----------------------------------
  // Render
  // ----------------------------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-50 mb-1">
          Write product copy
        </h1>
        <p className="text-sm text-slate-400">
          Enter a product name and details. We’ll handle the writing.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[0.9fr_1.4fr] items-start">
        {/* FORM */}
        <Card className="p-6">
          <GenerateForm
            onGenerate={handleGenerate}
            onUpgrade={openUpgrade}
            disabled={locked}
            defaultTone={defaultTone}
            projects={projects}
            isOnboarding={isOnboarding}
          />
        </Card>

        {/* OUTPUT */}
        <Card className="p-6 relative min-h-[240px]">
          {/* Loading overlay */}
          {locked && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center text-white text-sm rounded-xl">
              Writing product copy…
            </div>
          )}

          {/* BEFORE FIRST GENERATION */}
          {!hasGenerated && !locked && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-300 space-y-2">
              <p className="font-medium text-slate-200">
                Write product copy in seconds
              </p>
              <p className="text-slate-400">
                Start with just a product name. Add details if you want.
              </p>
            </div>
          )}

          {/* AFTER FIRST GENERATION */}
          {hasGenerated && !locked && result && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Success onboarding hint */}
              <div className="rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-4 text-sm text-slate-200">
                <p className="font-medium mb-1">
                  Your product copy is ready 🎉
                </p>
                <ul className="mt-2 text-slate-300 text-xs space-y-1">
                  <li>• ⭐ Save it as a favorite</li>
                  <li>• 📁 Add it to a project</li>
                  <li>• Copy and reuse it later</li>
                </ul>
              </div>

              <OutputTabs
                result={result}
                historyId={historyId}
                isFavorite={false}
                productData={productData}
                projects={projects}
                onUpgrade={openUpgrade}
                hideActions={isOnboarding}
                onRegenerate={
                  isOnboarding || !lastInput
                    ? undefined
                    : () =>
                        handleGenerate({
                          productName: lastInput.productName,
                          details: lastInput.details,
                          tone: lastInput.tone,
                          projectId: null,
                        })
                }
              />
            </div>
          )}
        </Card>
      </div>

      {/* UPGRADE MODAL */}
      <UpgradeModal
        open={showUpgrade}
        onClose={() => setShowUpgrade(false)}
        reason={upgradeReason}
      />
    </div>
  );
}
