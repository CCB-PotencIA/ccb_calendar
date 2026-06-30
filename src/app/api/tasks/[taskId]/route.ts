import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { taskSchema } from "@/lib/validations/task.schema";
import { normalizeDepartments, type RawTaskDepartments } from "@/lib/utils";

type Params = { params: Promise<{ taskId: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      department:departments(*),
      assignees:task_assignees(profile:profiles(*)),
      task_departments(department:departments(*)),
      subtasks:task_subtasks(*),
      followups:task_followups(*)
    `)
    .eq("id", taskId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Tarea no encontrada" }, { status: 404 });
  }

  const subtasks = [...(data.subtasks ?? [])].sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const followups = [...(data.followups ?? [])].sort((a, b) =>
    (a.followup_date ?? "").localeCompare(b.followup_date ?? "")
  );

  return NextResponse.json({
    ...data,
    assignees: data.assignees?.map((a: { profile: unknown }) => a.profile) ?? [],
    departments: normalizeDepartments(data as unknown as RawTaskDepartments),
    subtasks,
    followups,
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

  // If the primary department changed, ensure it has a task_departments row
  if (taskData.department_id) {
    await supabase
      .from("task_departments")
      .upsert(
        { task_id: taskId, department_id: taskData.department_id },
        { onConflict: "task_id,department_id" }
      );
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
    .select(`
      *,
      department:departments(*),
      assignees:task_assignees(profile:profiles(*)),
      task_departments(department:departments(*)),
      subtasks:task_subtasks(*),
      followups:task_followups(*)
    `)
    .eq("id", taskId)
    .single();

  const subtasks = [...(full?.subtasks ?? [])].sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const followups = [...(full?.followups ?? [])].sort((a, b) =>
    (a.followup_date ?? "").localeCompare(b.followup_date ?? "")
  );

  return NextResponse.json({
    ...full,
    assignees: full?.assignees?.map((a: { profile: unknown }) => a.profile) ?? [],
    departments: full ? normalizeDepartments(full as unknown as RawTaskDepartments) : [],
    subtasks,
    followups,
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
