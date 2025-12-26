import { createSupabaseServerClient } from "@/lib/supabase-server";
import { redirect, notFound } from "next/navigation";
import { saveProjectSettingsAction } from "./actions";
import Link from "next/link";

export default async function EditProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createSupabaseServerClient();

  /* -------------------- AUTH -------------------- */

  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;
  if (!session) redirect("/login");

  /* -------------------- FETCH PROJECT -------------------- */

  const { data: project, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", session.user.id)
    .single();

  if (!project || error) return notFound();

  /* -------------------- RENDER -------------------- */

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-50">Edit project</h1>

        <Link
          href={`/dashboard/projects/${params.id}`}
          className="text-indigo-400 hover:underline text-sm"
        >
          ← Back to project
        </Link>
      </div>

      <form
        action={saveProjectSettingsAction}
        className="space-y-6 bg-slate-900 border border-slate-800 rounded-xl p-6"
      >
        {/* Hidden project ID */}
        <input type="hidden" name="projectId" value={project.id} />

        {/* PROJECT NAME */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Project name
          </label>
          <input
            name="name"
            defaultValue={project.name ?? ""}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          />
        </div>

        {/* PRODUCT NAME */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Product name <span className="text-slate-500">(optional)</span>
          </label>
          <input
            name="productName"
            defaultValue={project.product_name ?? ""}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">Category</label>
          <select
            name="category"
            defaultValue={project.category ?? ""}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          >
            <option value="">None</option>
            <option value="fashion">Fashion</option>
            <option value="electronics">Electronics</option>
            <option value="home">Home & Interior</option>
            <option value="sports">Sports & Outdoor</option>
            <option value="beauty">Beauty</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* DEFAULT LANGUAGE */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Default language
          </label>
          <select
            name="language"
            defaultValue={project.language ?? "en"}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          >
            <option value="en">English</option>
            <option value="sv">Swedish</option>
          </select>
        </div>

        {/* DEFAULT TONE */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Default tone
          </label>
          <select
            name="tone"
            defaultValue={project.tone ?? "Sales-focused"}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          >
            <option value="Sales-focused">Sales-focused</option>
            <option value="Informative">Informative</option>
            <option value="Inspirational">Inspirational</option>
            <option value="Formal">Formal</option>
            <option value="Casual">Casual</option>
          </select>
        </div>

        {/* DEFAULT AUDIENCE */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Default audience
          </label>
          <select
            name="audience"
            defaultValue={project.audience ?? "Adults"}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          >
            <option value="Adults">Adults</option>
            <option value="Children">Children</option>
            <option value="Seniors">Seniors</option>
            <option value="B2B">B2B</option>
          </select>
        </div>

        {/* NOTES */}
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Project notes
          </label>
          <textarea
            name="notes"
            defaultValue={project.notes ?? ""}
            rows={8}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100"
          />
          <p className="text-xs text-slate-500 mt-1">
            You can write plain text, lists or Markdown.
          </p>
        </div>

        {/* SAVE BUTTON */}
        <button
          type="submit"
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition text-white font-medium py-2 rounded-lg"
        >
          Save project settings
        </button>
      </form>
    </div>
  );
}
