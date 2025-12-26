"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type OverviewEmptyStateProps = {
  title: string;
  description: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export default function OverviewEmptyState({
  title,
  description,
  ctaLabel,
  ctaHref,
}: OverviewEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <p className="text-sm font-medium text-slate-200 mb-2">{title}</p>

      <p className="text-sm text-slate-400 mb-4 max-w-sm">{description}</p>

      {ctaLabel && ctaHref && (
        <Link href={ctaHref}>
          <Button>{ctaLabel}</Button>
        </Link>
      )}
    </div>
  );
}
