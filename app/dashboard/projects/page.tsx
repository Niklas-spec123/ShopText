import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { deleteProjectAction } from "../server/actions";
import { CreateProjectButton } from "./CreateProjectButton";

export default async function ProjectsPage() {
  const supabase = createSupabaseServerClient();

  // --- AUTH ---
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) return <p>Not signed in.</p>;

  // --- FETCH PROJECTS + ITEM COUNT ---
  const { data: projects } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      created_at,
      project_items ( history_id )
    `
    )
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  // --- EMPTY STATE ---
  if (!projects || projects.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-16 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-100">
          No projects yet
        </h1>

        <p className="text-slate-400">
          Organize your AI-generated copy into projects — perfect if you work
          with multiple products, brands, or clients.
        </p>

        <div className="flex justify-center">
          <CreateProjectButton />
        </div>
      </div>
    );
  }

  // --- NORMAL VIEW ---
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-slate-100">Projects</h1>
        <CreateProjectButton />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {projects.map((p) => {
          const itemCount = p.project_items?.length ?? 0;

          return (
            <div
              key={p.id}
              className="relative bg-slate-950 border border-slate-800 rounded-xl p-5 hover:bg-slate-900 transition"
            >
              {/* PROJECT LINK */}
              <Link
                href={`/dashboard/projects/${p.id}`}
                className="block group"
              >
                <h2 className="font-semibold text-lg text-slate-100 group-hover:text-indigo-400 transition">
                  {p.name}
                </h2>

                <p className="text-xs text-slate-500 mt-1">
                  Created {new Date(p.created_at).toLocaleString("en-US")}
                </p>

                <p className="text-sm text-slate-400 mt-3">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </Link>

              {/* DELETE */}
              <form
                className="absolute top-3 right-3"
                action={async () => {
                  "use server";
                  await deleteProjectAction(p.id);
                }}
              >
                <button
                  type="submit"
                  className="text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded"
                >
                  Delete
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
