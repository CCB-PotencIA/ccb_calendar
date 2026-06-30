import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ taskId: string; subtaskId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { taskId, subtaskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const updateData: { completed?: boolean; title?: string } = {};
  if (typeof body?.completed === "boolean") updateData.completed = body.completed;
  if (typeof body?.title === "string") updateData.title = body.title.trim();

  const { data, error } = await supabase
    .from("task_subtasks")
    .update(updateData)
    .eq("id", subtaskId)
    .eq("task_id", taskId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Error al actualizar la subtarea" }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { taskId, subtaskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase
    .from("task_subtasks")
    .delete()
    .eq("id", subtaskId)
    .eq("task_id", taskId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
