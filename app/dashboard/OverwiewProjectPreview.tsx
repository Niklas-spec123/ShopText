"use client";

import Link from "next/link";
import { en } from "@/lib/copy/en";

export default function OverviewProjectPreview({
  mostActiveProjects,
}: {
  mostActiveProjects: [string, number][];
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
        {en.dashboard.projectPreview.title}
      </h2>

      {mostActiveProjects.length === 0 ? (
        <div className="text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-1">
            {en.dashboard.projectPreview.emptyTitle}
          </p>
          <p className="mb-4">{en.dashboard.projectPreview.emptyDescription}</p>

          <Link
            href="/dashboard/projects"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            {en.dashboard.projectPreview.cta}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {mostActiveProjects.map(([name, count]) => (
            <div
              key={name}
              className="flex items-center justify-between rounded-lg bg-slate-800/60 px-4 py-3"
            >
              <span className="font-medium text-slate-100">{name}</span>
              <span className="text-xs text-slate-400">
                {count} generations
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
