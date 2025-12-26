"use client";

import { en } from "@/lib/copy/en";

type TimelineItem = {
  id: string;
  title: string;
  created_at: string;
  project: string | null;
};

export default function OverviewTimeline({ items }: { items: TimelineItem[] }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
        {en.dashboard.timeline.title}
      </h2>

      {items.length === 0 ? (
        <div className="text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-1">
            {en.dashboard.timeline.emptyTitle}
          </p>
          <p>{en.dashboard.timeline.emptyDescription}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 rounded-lg bg-slate-800/60 p-3"
            >
              <div className="mt-1 h-2 w-2 rounded-full bg-indigo-400 shrink-0" />

              <div className="flex-1">
                <p className="font-medium text-slate-100">
                  {item.title || "Untitled"}
                </p>

                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                  <span>
                    {new Date(item.created_at).toLocaleDateString("en-US")}
                  </span>

                  <span>
                    {en.dashboard.timeline.projectLabel}:{" "}
                    {item.project ?? en.dashboard.timeline.noProject}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
