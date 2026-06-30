import type { Database, TaskStatus, TaskPriority } from "./database.types";

export type { TaskStatus, TaskPriority };

export type Task = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskInsert = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskUpdate = Database["public"]["Tables"]["tasks"]["Update"];
export type Department = Database["public"]["Tables"]["departments"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type DeadlineStatus = "overdue" | "due_soon_15" | "due_soon_30" | "on_track";

export interface TaskWithRelations extends Task {
  department: Department;
  assignees: Profile[];
  deadline_status: DeadlineStatus;
  legal_deadline_warning: boolean;
}

export interface TaskFilters {
  status?: TaskStatus | "all";
  department_id?: string;
  assignee_id?: string;
  from?: string;
  to?: string;
  search?: string;
  [key: string]: unknown;
}

export interface DashboardStats {
  total: number;
  pending: number;
  in_progress: number;
  completed: number;
  overdue: number;
}

export interface DepartmentTaskCount {
  department_id: string;
  department_name: string;
  department_color: string;
  count: number;
}
