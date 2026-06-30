import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TaskDetail } from "@/components/tasks/TaskDetail";
import { getDeadlineStatus, normalizeDepartments } from "@/lib/utils";
import type { TaskWithRelations, Subtask, Followup } from "@/types/task.types";

interface TaskPageProps {
  params: Promise<{ taskId: string }>;
}

type RawDept = { id: string; name: string; color: string; created_at: string };

type RawTaskRow = {
  id: string;
  title: string;
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
  responsible_tags: string[];
  source_ref: string | null;
  created_at: string;
  updated_at: string;
  departments: RawDept | null;
  task_departments: Array<{ department: RawDept | null }>;
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
  task_subtasks: Subtask[];
  task_followups: Followup[];
};

export default async function TaskPage({ params }: TaskPageProps) {
  const { taskId } = await params;
  const supabase = await createClient();

  const { data: rawData, error } = await supabase
    .from("tasks")
    .select(`
      *,
      departments(id, name, color, created_at),
      task_departments(department:departments(id, name, color, created_at)),
      task_assignees(
        profile_id,
        profiles(id, email, full_name, avatar_url, role, department_id, created_at, updated_at)
      ),
      task_subtasks(*),
      task_followups(*)
    `)
    .eq("id", taskId)
    .single();

  if (error || !rawData) {
    notFound();
  }

  const raw = rawData as unknown as RawTaskRow;

  const dept = raw.departments ?? { id: "", name: "Sin unidad", color: "#004c9e", created_at: "" };
  const departments = normalizeDepartments({
    department_id: raw.department_id,
    department: dept,
    task_departments: raw.task_departments,
  });
  const assignees = (raw.task_assignees ?? []).map((r) => ({
    ...r.profiles,
    role: r.profiles.role as "admin" | "member",
  }));
  const subtasks = [...(raw.task_subtasks ?? [])].sort(
    (a, b) =>
      a.position - b.position ||
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const followups = [...(raw.task_followups ?? [])].sort((a, b) =>
    (a.followup_date ?? "").localeCompare(b.followup_date ?? "")
  );

  const task: TaskWithRelations = {
    id: raw.id,
    title: raw.title,
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
    responsible_tags: raw.responsible_tags ?? [],
    source_ref: raw.source_ref ?? null,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    department: dept,
    departments,
    assignees,
    subtasks,
    followups,
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
