import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { FavoriteToggle } from "./[id]/FavoriteToggle";
import { deleteHistoryAction } from "./actions";

/* -------------------- Skeleton -------------------- */

function HistorySkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-xl bg-slate-800/50 animate-pulse"
        />
      ))}
    </div>
  );
}

/* -------------------- Page -------------------- */

export default async function HistoryPage() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>You are not logged in.</p>;

  const { data: rows } = await supabase
    .from("history")
    .select(`id, title, created_at, content, favorites ( id )`)
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  /* -------------------- Empty state -------------------- */

  if (!rows || rows.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-100">
          No history yet
        </h1>
        <p className="text-slate-400 text-sm">
          Your generated AI copy will appear here once you start creating
          content.
        </p>
        <Link
          href="/dashboard/generate"
          className="inline-block text-indigo-400 hover:underline text-sm font-medium"
        >
          Generate your first product description →
        </Link>
      </div>
    );
  }

  /* -------------------- Content -------------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">History</h1>
          <p className="text-sm text-slate-400">
            All your previously generated AI copy.
          </p>
        </div>

        <form action={deleteHistoryAction}>
          <button
            type="submit"
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
          >
            Clear history
          </button>
        </form>
      </div>

      <Suspense fallback={<HistorySkeleton />}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rows.map((item: any) => {
            const isFavorite = item.favorites?.length > 0;

            return (
              <Link
                key={item.id}
                href={`/dashboard/history/${item.id}`}
                className="relative block border border-slate-800 rounded-xl p-4 bg-slate-950 hover:bg-slate-900 transition"
              >
                <div className="absolute top-3 right-3">
                  <FavoriteToggle
                    historyId={item.id}
                    isFavorite={isFavorite}
                    size="sm"
                  />
                </div>

                <h2 className="font-semibold text-slate-100 pr-6">
                  {item.title || "Untitled copy"}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  {new Date(item.created_at).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </Link>
            );
          })}
        </div>
      </Suspense>
    </div>
  );
}
