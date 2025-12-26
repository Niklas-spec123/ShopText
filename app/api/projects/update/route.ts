import { NextResponse } from "next/server";
import { renameProjectAction } from "@/app/dashboard/generate/server/actions";

export async function PUT(req: Request) {
  const { projectId, newName } = await req.json();

  if (!projectId || !newName?.trim()) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  await renameProjectAction(projectId, newName.trim());

  return NextResponse.json({ success: true });
}
