"use client";

import Link from "next/link";
import { en } from "@/lib/copy/en";

export default function OverviewQuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Link
        href="/dashboard/generate"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm text-white transition"
      >
        + {en.dashboard.quickActions.generate}
      </Link>

      <Link
        href="/dashboard/projects"
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-100 transition"
      >
        + {en.dashboard.quickActions.newProject}
      </Link>

      <Link
        href="/dashboard/favorites"
        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-slate-100 transition"
      >
        ⭐ {en.dashboard.quickActions.favorites}
      </Link>
    </div>
  );
}
