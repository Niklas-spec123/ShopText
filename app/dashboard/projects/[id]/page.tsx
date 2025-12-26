import { createSupabaseServerClient } from "@/lib/supabase-server";
import Link from "next/link";
import { deleteProjectAction } from "../../server/actions";
import { ProjectTitleEditor } from "./ProjectTitleEditor";
import { SortableProjectList } from "./SortableProjectList";

/**
 * Lightweight history item type used inside projects
 */
type HistoryLite = {
  id: string;
  title: string | null;
  created_at: string;
};

/**
 * Project type including linked history items
 */
type ProjectWithItems = {
  id: string;
  name: string;
  created_at: string;
  project_items: {
    history_id: string;
    history: HistoryLite | null;
  }[];
};

export default async function ProjectDetailPage({
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

  /* -------------------- FETCH PROJECT -------------------- */

  const { data: project, error } = await supabase
    .from("projects")
    .select(
      `
      id,
      name,
      created_at,
      project_items (
        history_id,
        history:history_id (
          id,
          title,
          created_at
        )
      )
    `
    )
    .eq("id", params.id)
    .eq("user_id", userId)
    .single<ProjectWithItems>();

  if (error) {
    console.error("PROJECT DETAIL ERROR:", error);
  }

  if (!project) {
    return (
      <p className="text-slate-400 mt-10 text-center">
        This project could not be found.
      </p>
    );
  }

  const items = project.project_items ?? [];

  /* -------------------- RENDER -------------------- */

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-start">
        <div>
          {/* 🔥 Inline project name editing */}
          <ProjectTitleEditor
            initialName={project.name}
            projectId={project.id}
          />

          <p className="text-slate-400 text-sm mt-1">
            Created{" "}
            {new Date(project.created_at).toLocaleString("en-US", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>

          <p className="text-slate-400 text-sm mt-1">
            {items.length} {items.length === 1 ? "item" : "items"}
          </p>
        </div>

        {/* DELETE PROJECT */}
        <form
          action={async () => {
            "use server";
            await deleteProjectAction(project.id);
          }}
        >
          <button className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-sm text-white">
            Delete project
          </button>
        </form>
      </div>

      {/* LIST OF ITEMS */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-100">
          Project content
        </h2>

        {items.length === 0 ? (
          <p className="text-slate-500">
            No generated copy has been added to this project yet.
          </p>
        ) : (
          <SortableProjectList projectId={project.id} items={items} />
        )}
      </div>
    </div>
  );
}
