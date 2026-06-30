import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { taskSchema } from "@/lib/validations/task.schema";

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const department_id = searchParams.get("department_id");
  const assignee_id = searchParams.get("assignee_id");
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const search = searchParams.get("search");

  let query = supabase
    .from("tasks")
    .select(`
      *,
      department:departments(*),
      assignees:task_assignees(profile:profiles(*))
    `)
    .order("plazo_interno", { ascending: true });

  if (status) query = query.eq("status", status as import("@/types/database.types").TaskStatus);
  if (department_id) query = query.eq("department_id", department_id);
  if (from) query = query.gte("plazo_interno", from);
  if (to) query = query.lte("plazo_interno", to);
  if (search) query = query.ilike("title", `%${search}%`);

  if (assignee_id) {
    const { data: taskIds } = await supabase
      .from("task_assignees")
      .select("task_id")
      .eq("profile_id", assignee_id);

    if (taskIds) {
      query = query.in(
        "id",
        taskIds.map((t) => t.task_id)
      );
    }
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Normalize nested assignees from join
  const tasks = (data ?? []).map((task) => ({
    ...task,
    assignees: task.assignees?.map((a: { profile: unknown }) => a.profile) ?? [],
  }));

  return NextResponse.json(tasks);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 422 }
    );
  }

  const { assignee_ids, ...taskData } = parsed.data;

  const { data: task, error: taskError } = await supabase
    .from("tasks")
    .insert({ ...taskData, created_by: user.id })
    .select()
    .single();

  if (taskError || !task) {
    return NextResponse.json({ error: taskError?.message }, { status: 500 });
  }

  // Insert assignees
  if (assignee_ids.length > 0) {
    await supabase.from("task_assignees").insert(
      assignee_ids.map((profile_id) => ({ task_id: task.id, profile_id }))
    );
  }

  // Create in-app notifications for assignees
  const notifications = assignee_ids
    .filter((id) => id !== user.id)
    .map((uid) => ({
      user_id: uid,
      task_id: task.id,
      type: "task_assigned" as const,
      title: "Nueva tarea asignada",
      body: `Se te asignó: ${task.title}`,
    }));

  if (notifications.length > 0) {
    await supabase.from("notifications").insert(notifications);
  }

  // Return task with relations
  const { data: full } = await supabase
    .from("tasks")
    .select(`*, department:departments(*), assignees:task_assignees(profile:profiles(*))`)
    .eq("id", task.id)
    .single();

  const result = {
    ...full,
    assignees: full?.assignees?.map((a: { profile: unknown }) => a.profile) ?? [],
  };

  return NextResponse.json(result, { status: 201 });
}
