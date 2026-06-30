import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { getDeadlineStatus } from "@/lib/utils";
import type { TaskWithRelations } from "@/types/task.types";

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

type RawTaskRow = {
  id: string;
  title: string;
  actividad: string | null;
  origen: string | null;
  description: string | null;
  department_id: string;
  created_by: string;
  status: string;
  priority: string;
  progress: number;
  start_date: string | null;
  plazo_legal: string | null;
  plazo_interno: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  departments: { id: string; name: string; color: string; created_at: string } | null;
  task_assignees: Array<{
    profile_id: string;
    profiles: {
      id: string;
      email: string;
      full_name: string;
      avatar_url: string | null;
      role: string;
      department_id: string | null;
      created_at: string;
      updated_at: string;
    };
  }>;
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params;
  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from("tasks")
    .select(`
      *,
      departments(id, name, color, created_at),
      task_assignees(
        profile_id,
        profiles(id, email, full_name, avatar_url, role, department_id, created_at, updated_at)
      )
    `)
    .eq("id", taskId)
    .single();

  if (error || !rawData) {
    notFound();
  }

  const raw = rawData as unknown as RawTaskRow;

  const dept = raw.departments ?? { id: "", name: "Sin unidad", color: "#004c9e", created_at: "" };
  const assignees = (raw.task_assignees ?? []).map((r) => ({
    ...r.profiles,
    role: r.profiles.role as "admin" | "member",
  }));

  const task: TaskWithRelations = {
    id: raw.id,
    title: raw.title,
    actividad: raw.actividad ?? null,
    origen: raw.origen ?? null,
    description: raw.description ?? null,
    department_id: raw.department_id,
    created_by: raw.created_by,
    status: raw.status as TaskWithRelations["status"],
    priority: raw.priority as TaskWithRelations["priority"],
    progress: raw.progress,
    start_date: raw.start_date ?? null,
    plazo_legal: raw.plazo_legal ?? null,
    plazo_interno: raw.plazo_interno,
    completed_at: raw.completed_at ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    department: dept,
    assignees,
    deadline_status: getDeadlineStatus(raw.plazo_interno),
    legal_deadline_warning: raw.plazo_legal
      ? new Date(raw.plazo_legal) < new Date(raw.plazo_interno)
      : false,
  };

  return (
    <div className="max-w-4xl mx-auto">
      <TaskDetail task={task} />
    </div>
  );
}
