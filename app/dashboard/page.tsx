import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { en } from "@/lib/copy/en";

import OverviewStats from "./OverwiewStats";
import OverviewQuickActions from "./OverwiewQuickActions";
import OverviewChart from "./OverwiewChart";
import OverviewProjectPreview from "./OverwiewProjectPreview";
import OverviewTimeline from "./OverviewTimeline";
import OverviewFavorites from "./OverviewFavorites";
import OverviewEmptyState from "./OverviewEmptyState";

/* -------------------- Skeletons -------------------- */

function StatSkeleton() {
  return <div className="h-24 rounded-xl bg-slate-800/50 animate-pulse" />;
}

function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <div className={`rounded-xl bg-slate-800/40 animate-pulse ${height}`} />
  );
}

/* -------------------- Page -------------------- */

export default async function DashboardPremium() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>Not logged in.</p>;

  const userId = session.user.id;

  const [
    { count: projectCount },
    { count: textCount },
    { count: favoritesCount },
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("history")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("favorites")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  const { data: recentRaw } = await supabase
    .from("history")
    .select("id, title, created_at, project_id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  const recent =
    recentRaw?.map((r) => ({
      id: r.id,
      title: r.title ?? "Untitled",
      created_at: r.created_at,
      project_id: r.project_id ?? null,
    })) ?? [];

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data: lastWeek } = await supabase
    .from("history")
    .select("created_at")
    .eq("user_id", userId)
    .gt("created_at", sevenDaysAgo.toISOString());

  const hasGenerations = (textCount ?? 0) > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold text-slate-100">
          {en.dashboard.title}
        </h1>
        <p className="text-slate-400 mt-1">{en.dashboard.subtitle}</p>
      </div>

      {/* 🟦 GLOBAL EMPTY STATE */}
      {!hasGenerations && (
        <OverviewEmptyState
          title={en.dashboard.empty.noActivityTitle}
          description={en.dashboard.empty.noActivityDescription}
          ctaLabel={en.generate.submit}
          ctaHref="/dashboard/generate"
        />
      )}

      {/* 🟩 FULL DASHBOARD */}
      {hasGenerations && (
        <>
          {/* STATS */}
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatSkeleton />
                <StatSkeleton />
                <StatSkeleton />
              </div>
            }
          >
            <OverviewStats
              projectCount={projectCount ?? 0}
              textCount={textCount ?? 0}
              favoritesCount={favoritesCount ?? 0}
              recent={recent}
              mostActiveProjects={[]}
            />
          </Suspense>

          <OverviewQuickActions />

          {/* FAVORITES */}
          <Suspense fallback={<SectionSkeleton height="h-40" />}>
            {favoritesCount === 0 ? (
              <OverviewEmptyState
                title={en.dashboard.empty.noFavoritesTitle}
                description={en.dashboard.empty.noFavoritesDescription}
              />
            ) : (
              <OverviewFavorites items={recent.slice(0, 3)} />
            )}
          </Suspense>

          {/* CHART */}
          <Suspense fallback={<SectionSkeleton />}>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-3">
                {en.dashboard.chart.title}
              </h2>

              {!lastWeek || lastWeek.length === 0 ? (
                <OverviewEmptyState
                  title={en.dashboard.chart.emptyTitle}
                  description={en.dashboard.chart.emptyDescription}
                  ctaLabel={en.dashboard.chart.cta}
                  ctaHref="/dashboard/generate"
                />
              ) : (
                <OverviewChart history={lastWeek} />
              )}
            </div>
          </Suspense>

          {/* PROJECT PREVIEW */}
          <Suspense fallback={<SectionSkeleton height="h-40" />}>
            {projectCount === 0 ? (
              <OverviewEmptyState
                title={en.dashboard.empty.noProjectsTitle}
                description={en.dashboard.empty.noProjectsDescription}
              />
            ) : (
              <OverviewProjectPreview mostActiveProjects={[]} />
            )}
          </Suspense>

          {/* TIMELINE */}
          <Suspense fallback={<SectionSkeleton height="h-64" />}>
            {recent.length === 0 ? (
              <OverviewEmptyState
                title={en.dashboard.chart.emptyTitle}
                description={en.dashboard.chart.emptyDescription}
              />
            ) : (
              <OverviewTimeline
                items={recent.map((r) => ({
                  id: r.id,
                  title: r.title,
                  created_at: r.created_at,
                  project: r.project_id ? String(r.project_id) : null,
                }))}
              />
            )}
          </Suspense>
        </>
      )}
    </div>
  );
}
