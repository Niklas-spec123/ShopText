"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { en } from "@/lib/copy/en";

type UpgradeReason = "generation" | "favorites" | "projects";

type UpgradeModalProps = {
  open: boolean;
  onClose: () => void;
  reason?: UpgradeReason;
  onUpgrade?: () => void; // future Stripe / analytics hook
};

export function UpgradeModal({
  open,
  onClose,
  reason = "generation",
  onUpgrade,
}: UpgradeModalProps) {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Ensure portal only renders on client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!open || !mounted) return null;

  const contentByReason = {
    generation: {
      title: "Want to keep generating?",
      description:
        "You’ve used your free generations. Upgrade to Pro to keep writing product copy — without limits.",
      highlights: [
        "Unlimited product copy",
        "SEO, ads & social captions included",
        "Save and reuse your copy anytime",
      ],
      cta: "Upgrade to Pro",
    },
    favorites: {
      title: "Want to save more copy?",
      description:
        "Your favorites are full. Upgrade to save all your best copy in one place.",
      highlights: [
        "Unlimited favorites",
        "Organize copy by projects",
        "Reuse saved copy anytime",
      ],
      cta: "Upgrade unlimited favorites",
    },
    projects: {
      title: "Need more room to organize?",
      description:
        "You’ve reached the project limit. Upgrade to organize multiple products and brands.",
      highlights: [
        "Unlimited projects",
        "Keep copy organized per product",
        "Manage multiple products in one place",
      ],
      cta: "Upgrade unlimited projects",
    },
  } as const;

  const content = contentByReason[reason];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
    >
      <Card className="w-full max-w-md p-6 space-y-5 relative">
        {/* Title */}
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          {content.title}
        </h2>

        {/* Description */}
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {content.description}
        </p>

        {/* Value props */}
        <ul className="text-sm text-slate-700 dark:text-slate-300 space-y-2">
          {content.highlights.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-indigo-500">✓</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Button
          className="w-full"
          onClick={() => {
            if (onUpgrade) {
              onUpgrade();
            } else {
              router.push("/pricing");
            }
          }}
        >
          {content.cta}
        </Button>

        {/* Price / reassurance */}
        <p className="text-xs text-slate-500 text-center">
          $15/month · Cancel anytime · No commitment
        </p>

        {/* Soft escape */}
        <button
          onClick={() => router.push("/pricing")}
          className="block w-full text-xs text-slate-400 hover:text-slate-300 text-center"
        >
          View full pricing details
        </button>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
          aria-label={en.common.close}
        >
          ✕
        </button>
      </Card>
    </div>,
    document.body
  );
}
