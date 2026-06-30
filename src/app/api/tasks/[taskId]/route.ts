import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { taskSchema } from "@/lib/validations/task.schema";

type Params = { params: Promise<{ taskId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("tasks")
    .select(`*, department:departments(*), assignees:task_assignees(profile:profiles(*))`)
    .eq("id", taskId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  return NextResponse.json({
    ...data,
    assignees: data.assignees?.map((a: { profile: unknown }) => a.profile) ?? [],
  });
}

export async function PATCH(request: Request, { params }: Params) {
  const { taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = taskSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { assignee_ids, ...taskData } = parsed.data;

  // Auto-set completed_at when marking completed
  const updateData = {
    ...taskData,
    ...(taskData.status === "completed"
      ? { completed_at: new Date().toISOString(), progress: 100 }
      : {}),
  };

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .select()
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: taskError?.message }, { status: 500 });
  }

  // Sync assignees if provided
  if (assignee_ids !== undefined) {
    await supabase.from("task_assignees").delete().eq("task_id", taskId);
    if (assignee_ids.length > 0) {
      await supabase.from("task_assignees").insert(
        assignee_ids.map((profile_id) => ({ task_id: taskId, profile_id }))
      );
    }
  }

  // Notify assignees of update
  const notifTargets = assignee_ids ?? [];
  const updateNotifs = notifTargets
    .filter((id) => id !== user.id)
    .map((uid) => ({
      user_id: uid,
      task_id: taskId,
      type: "task_updated" as const,
      title: "Tarea actualizada",
      body: `Se actualizó: ${task.title}`,
    }));

  if (updateNotifs.length > 0) {
    await supabase.from("notifications").insert(updateNotifs);
  }

  const { data: full } = await supabase
    .from("tasks")
    .select(`*, department:departments(*), assignees:task_assignees(profile:profiles(*))`)
    .eq("id", taskId)
    .single();

  return NextResponse.json({
    ...full,
    assignees: full?.assignees?.map((a: { profile: unknown }) => a.profile) ?? [],
  });
}

export async function DELETE(_req: Request, { params }: Params) {
  const { taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase.from("tasks").delete().eq("id", taskId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
