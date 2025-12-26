import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { deleteHistoryItem } from "../actions";

import { HistoryDetailClient } from "./ClientPage";

import type { AiResult } from "../../generate/types";

export default async function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  /* -------------------- AUTH -------------------- */

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>You are not logged in.</p>;

  const userId = session.user.id;

  /* -------------------- FETCH HISTORY ITEM -------------------- */

  const { data: item } = await supabase
    .from("history")
    .select(
      `
      id,
      title,
      content,
      json,
      created_at,
      favorites ( id )
      `
    )
    .eq("id", params.id)
    .single();

  if (!item) {
    return <p>This entry could not be found.</p>;
  }

  const isFavorite = item.favorites && item.favorites.length > 0;

  /* -------------------- JSON FALLBACK -------------------- */

  let parsedJson: AiResult | null = null;

  if (item.json) {
    parsedJson = item.json as AiResult;
  } else {
    parsedJson = {
      short: "",
      long: "",
      bullets: [],
      seoTitle: "",
      metaDescription: "",
      keywords: [],
      instagram: "",
      ads: [],
    };
  }

  /* -------------------- FETCH USER PROJECTS -------------------- */

  const { data: projects } = await supabase
    .from("projects")
    .select("id, name")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  /* -------------------- PRODUCT DATA (HISTORY IS PARTIAL) -------------------- */

  const productData = {
    productName: item.title ?? "",
    features: "",
    tone: "",
    audience: "",
    language: "en",
  };

  /* -------------------- RENDER -------------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">
            {item.title || "Untitled copy"}
          </h1>
          <p className="text-slate-400 text-sm">
            {new Date(item.created_at).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>

        <Link
          href="/dashboard/history"
          className="text-indigo-400 hover:underline text-sm"
        >
          ← Back to history
        </Link>
      </div>

      {/* ACTION BAR */}
      <div className="flex items-center gap-3">
        {/* DELETE */}
        <form
          action={async () => {
            "use server";
            await deleteHistoryItem(item.id);
          }}
        >
          <button
            type="submit"
            className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white"
          >
            Delete
          </button>
        </form>

        <HistoryDetailClient
          item={{ ...item, json: parsedJson }}
          isFavorite={isFavorite}
          projects={projects ?? []}
        />
      </div>

      {/* LEGACY FALLBACK */}
      {!item.json && (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
          <h2 className="text-lg font-semibold mb-2">
            Original content (legacy format)
          </h2>
          <pre className="whitespace-pre-wrap text-slate-300 text-sm">
            {item.content}
          </pre>
        </div>
      )}
    </div>
  );
}
