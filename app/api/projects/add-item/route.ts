import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { requirePlan } from "@/lib/requirePlan";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();

  // 🔐 AUTH
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const userId = session.user.id;

  // 🔒 PLAN GUARD (PROJECTS)
  try {
    await requirePlan("projects");
  } catch {
    return NextResponse.json({ code: "UPGRADE_REQUIRED" }, { status: 403 });
  }

  // 🔽 INPUT
  const body = await req.json();
  const { projectId, historyId } = body;

  if (!projectId || !historyId) {
    return NextResponse.json(
      { error: "projectId and historyId are required" },
      { status: 400 }
    );
  }

  // 💾 ADD ITEM TO PROJECT
  const { error } = await supabase.from("project_items").insert({
    project_id: projectId,
    history_id: historyId,
    user_id: userId,
  });

  if (error) {
    console.error("projects/add-item error:", error);
    return NextResponse.json(
      { error: "Could not add item to project" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
