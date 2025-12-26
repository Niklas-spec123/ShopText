"use client";

import Link from "next/link";
import { en } from "@/lib/copy/en";

type FavoriteItem = {
  id: string;
  title: string;
  created_at: string;
};

export default function OverviewFavorites({
  items,
}: {
  items: FavoriteItem[];
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-slate-100 mb-4">
        {en.dashboard.favorites.title}
      </h2>

      {items.length === 0 ? (
        <div className="text-sm text-slate-400">
          <p className="font-medium text-slate-300 mb-1">
            {en.dashboard.favorites.emptyTitle}
          </p>
          <p className="mb-4">{en.dashboard.favorites.emptyDescription}</p>

          <Link
            href="/dashboard/favorites"
            className="inline-flex items-center rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700 transition"
          >
            {en.dashboard.favorites.cta}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((f) => (
            <div
              key={f.id}
              className="rounded-lg bg-slate-800/60 px-4 py-3 hover:bg-slate-800 transition"
            >
              <p className="font-medium text-slate-100">{f.title}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(f.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
