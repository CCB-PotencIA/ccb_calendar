import { createClient } from "@/lib/supabase/server";
import { KpiGrid } from "@/components/dashboard/KpiGrid";
import { DepartmentChart } from "@/components/dashboard/DepartmentChart";
import { UpcomingTasksWidget } from "@/components/dashboard/UpcomingTasksWidget";
import { TaskListPanel } from "@/components/dashboard/TaskListPanel";
import { getDeadlineStatus, normalizeDepartments } from "@/lib/utils";
import type { DashboardStats, DepartmentTaskCount, TaskWithRelations } from "@/types/task.types";

type RawDept = { id: string; name: string; color: string };

type RawTask = {
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
};

type RawStatTask = {
  id: string;
  status: string;
  department_id: string;
  plazo_interno: string;
  departments: RawDept | null;
  task_departments: Array<{ department: RawDept | null }>;
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const [tasksResult, upcomingResult] = await Promise.all([
    supabase
      .from("tasks")
      .select(`
        id, status, department_id, plazo_interno,
        departments!tasks_department_id_fkey(id, name, color),
        task_departments(department:departments(id, name, color))
      `),
    supabase
      .from("tasks")
      .select(`
        *,
        departments!tasks_department_id_fkey!inner(id, name, color),
        task_departments(department:departments(id, name, color)),
        task_assignees(profile_id, profiles(id, email, full_name, avatar_url, role, department_id, created_at, updated_at))
      `)
      .not("status", "in", "(completed,cancelled)")
      .lte("plazo_interno", thirtyDaysFromNow.toISOString().split("T")[0])
      .order("plazo_interno", { ascending: true })
      .limit(10),
  ]);

  const allTasks = (tasksResult.data ?? []) as unknown as RawStatTask[];

  const stats: DashboardStats = {
    total: allTasks.length,
    pending: allTasks.filter((t) => t.status === "pending").length,
    in_progress: allTasks.filter((t) => t.status === "in_progress").length,
    completed: allTasks.filter((t) => t.status === "completed").length,
    overdue: allTasks.filter((t) => {
      if (t.status === "completed" || t.status === "cancelled") return false;
      return getDeadlineStatus(t.plazo_interno) === "overdue";
    }).length,
  };

  const deptMap = new Map<
    string,
    { department_id: string; department_name: string; department_color: string; count: number }
  >();

  for (const task of allTasks) {
    const departments = normalizeDepartments({
      department_id: task.department_id,
      department: task.departments as unknown as import("@/types/task.types").Department | null,
      task_departments: task.task_departments as unknown as Array<{
        department: import("@/types/task.types").Department | null;
      }>,
    });

    for (const dept of departments) {
      const existing = deptMap.get(dept.id);
      if (existing) {
        existing.count += 1;
      } else {
        deptMap.set(dept.id, {
          department_id: dept.id,
          department_name: dept.name,
          department_color: dept.color,
          count: 1,
        });
      }
    }
  }

  const deptData: DepartmentTaskCount[] = Array.from(deptMap.values());

  const upcomingRaw = (upcomingResult.data ?? []) as unknown as RawTask[];
  const upcomingTasks: TaskWithRelations[] = upcomingRaw.map((t) => {
    const dept = t.departments ?? { id: "", name: "", color: "#004c9e", created_at: "" };
    const fullDepartment = {
      id: dept.id,
      name: dept.name,
      color: dept.color,
      created_at: (dept as { created_at?: string }).created_at ?? "",
    };
    const departments = normalizeDepartments({
      department_id: t.department_id,
      department: fullDepartment,
      task_departments: (t.task_departments ?? []).map((row) => ({
        department: row.department
          ? { ...row.department, created_at: "" }
          : null,
      })),
    });
    const assignees = (t.task_assignees ?? []).map((r) => ({
      ...r.profiles,
      role: r.profiles.role as "admin" | "member",
    }));

    return {
      id: t.id,
      title: t.title,
      origen: t.origen ?? null,
      description: t.description ?? null,
      department_id: t.department_id,
      created_by: t.created_by,
      status: t.status as TaskWithRelations["status"],
      priority: t.priority as TaskWithRelations["priority"],
      progress: t.progress,
      start_date: t.start_date ?? null,
      plazo_legal: t.plazo_legal ?? null,
      plazo_interno: t.plazo_interno,
      completed_at: t.completed_at ?? null,
      responsible_tags: t.responsible_tags ?? [],
      source_ref: t.source_ref ?? null,
      created_at: t.created_at,
      updated_at: t.updated_at,
      department: fullDepartment,
      departments,
      assignees,
      subtasks: [],
      followups: [],
      deadline_status: getDeadlineStatus(t.plazo_interno),
      legal_deadline_warning: t.plazo_legal
        ? new Date(t.plazo_legal) < new Date(t.plazo_interno)
        : false,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Resumen de actividades y plazos</p>
      </div>

      <KpiGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DepartmentChart data={deptData} />
        </div>
        <div>
          <UpcomingTasksWidget tasks={upcomingTasks} />
        </div>
      </div>

      <TaskListPanel />
    </div>
  );
}
