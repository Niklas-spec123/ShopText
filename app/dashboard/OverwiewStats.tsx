"use client";

import { useUsage } from "./usage/UsageContext";
import { en } from "@/lib/copy/en";

type RecentItem = {
  id: string;
  title: string | null;
  created_at: string;
};

type OverviewStatsProps = {
  projectCount: number;
  textCount: number; // server fallback
  favoritesCount: number;
  recent: RecentItem[];
  mostActiveProjects: [string, number][];
};

export default function OverviewStats({
  projectCount,
  textCount,
  favoritesCount,
  recent,
  mostActiveProjects,
}: OverviewStatsProps) {
  // 🔁 Global live usage
  const { usage } = useUsage();

  // ✅ Live count if available, otherwise server value
  const liveTextCount = usage?.used ?? textCount;

  const topProject = mostActiveProjects?.[0]?.[0] ?? en.common.loading;

  const stats = [
    { label: "Projects", value: projectCount },
    { label: "AI generations", value: liveTextCount },
    { label: "Favorites", value: favoritesCount },
    { label: "Most active project", value: topProject },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-slate-900 border border-slate-800 rounded-xl p-5"
        >
          <p className="text-sm text-slate-400">{s.label}</p>
          <p className="text-2xl font-semibold text-slate-100 mt-1">
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
