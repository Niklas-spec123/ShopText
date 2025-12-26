import { Suspense } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { DeleteFavoriteButton } from "./DeleteFavoriteButton";

/* -------------------- Skeleton -------------------- */

function FavoritesSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="h-32 rounded-xl bg-slate-800/50 animate-pulse"
        />
      ))}
    </div>
  );
}

/* -------------------- Page -------------------- */

export default async function FavoritesPage() {
  const supabase = createSupabaseServerClient();

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>You are not logged in.</p>;

  const { data: favorites } = await supabase
    .from("favorites")
    .select("id, title, content, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Favorites</h1>
        <p className="text-slate-400 text-sm mt-1">
          Your saved AI-generated copy, ready to reuse.
        </p>
      </div>

      <Suspense fallback={<FavoritesSkeleton />}>
        {!favorites || favorites.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-400 text-sm">
            <p className="font-medium text-slate-300 mb-1">No favorites yet</p>
            <p>
              Save your best AI-generated copy to quickly access it
              later.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {favorites.map((fav) => (
              <div
                key={fav.id}
                className="p-5 rounded-xl border border-slate-800 bg-slate-900"
              >
                <div className="flex justify-between items-start mb-2 gap-4">
                  <h2 className="text-slate-100 font-medium leading-snug">
                    {fav.title || "Untitled copy"}
                  </h2>

                  <div className="flex gap-2 shrink-0">
                    <DeleteFavoriteButton id={fav.id} />
                  </div>
                </div>

                <p className="text-sm text-slate-300">
                  {fav.content
                    ? fav.content.slice(0, 160)
                    : "No content available."}
                  {fav.content && fav.content.length > 160 && "…"}
                </p>
              </div>
            ))}
          </div>
        )}
      </Suspense>
    </div>
  );
}
