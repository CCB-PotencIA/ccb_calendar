import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { differenceInCalendarDays, format, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import type { Department } from "@/types/task.types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Parses a Postgres `date` column ("YYYY-MM-DD") as a local calendar date.
 * `new Date("YYYY-MM-DD")` parses as UTC midnight, which shifts a day
 * earlier in negative-UTC-offset timezones (e.g. Colombia, UTC-5) once
 * compared against local "today" — this keeps date-only values pinned
 * to their intended calendar day regardless of timezone.
 */
function parseDateOnly(value: string | Date): Date {
  if (value instanceof Date) return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return new Date(value);
  const [, year, month, day] = match;
  return new Date(Number(year), Number(month) - 1, Number(day));
}

export type RawTaskDepartments = {
  department_id: string;
  department: Department | null;
  task_departments?: Array<{ department: Department | null }>;
};

/**
 * Build the ordered, deduped department list for a task: primary
 * department first, followed by the rest of task_departments.
 */
export function normalizeDepartments(task: RawTaskDepartments): Department[] {
  const seen = new Set<string>();
  const departments: Department[] = [];

  if (task.department) {
    departments.push(task.department);
    seen.add(task.department.id);
  }

  for (const row of task.task_departments ?? []) {
    const dept = row.department;
    if (dept && !seen.has(dept.id)) {
      departments.push(dept);
      seen.add(dept.id);
    }
  }

  return departments;
}

export type DeadlineStatus = "overdue" | "due_soon_15" | "due_soon_30" | "on_track";

export function getDeadlineStatus(plazaInterno: string | Date): DeadlineStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseDateOnly(plazaInterno);
  due.setHours(0, 0, 0, 0);
  const diff = differenceInCalendarDays(due, today);

  if (diff < 0) return "overdue";
  if (diff <= 15) return "due_soon_15";
  if (diff <= 30) return "due_soon_30";
  return "on_track";
}

export function getDeadlineColor(status: DeadlineStatus): string {
  switch (status) {
    case "overdue": return "#C0392B";
    case "due_soon_15": return "#E67E22";
    case "due_soon_30": return "#f59e0b";
    case "on_track": return "#2D8A4E";
  }
}

export function getDeadlineTextClass(status: DeadlineStatus): string {
  switch (status) {
    case "overdue": return "text-red-600";
    case "due_soon_15": return "text-orange-500";
    case "due_soon_30": return "text-amber-500";
    case "on_track": return "text-green-600";
  }
}

export function getDeadlineBgClass(status: DeadlineStatus): string {
  switch (status) {
    case "overdue": return "bg-red-50 text-red-700 border-red-200";
    case "due_soon_15": return "bg-orange-50 text-orange-700 border-orange-200";
    case "due_soon_30": return "bg-amber-50 text-amber-700 border-amber-200";
    case "on_track": return "bg-green-50 text-green-700 border-green-200";
  }
}

export function getDeadlineLabel(status: DeadlineStatus): string {
  switch (status) {
    case "overdue": return "Vencida";
    case "due_soon_15": return "Urgente";
    case "due_soon_30": return "Próxima";
    case "on_track": return "A tiempo";
  }
}

export function getDaysRemaining(plazaInterno: string | Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = parseDateOnly(plazaInterno);
  due.setHours(0, 0, 0, 0);
  return differenceInCalendarDays(due, today);
}

export function formatDate(date: string | Date, fmt = "dd/MM/yyyy"): string {
  return format(parseDateOnly(date), fmt, { locale: es });
}

export function formatRelativeDate(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En proceso",
    completed: "Completada",
    cancelled: "Cancelada",
  };
  return labels[status] ?? status;
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    low: "Baja",
    medium: "Media",
    high: "Alta",
    critical: "Crítica",
  };
  return labels[priority] ?? priority;
}

export function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "pending": return "bg-gray-100 text-gray-700 border-gray-200";
    case "in_progress": return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed": return "bg-green-50 text-green-700 border-green-200";
    case "cancelled": return "bg-red-50 text-red-600 border-red-200";
    default: return "bg-gray-100 text-gray-700";
  }
}

export function getPriorityBadgeClass(priority: string): string {
  switch (priority) {
    case "low": return "bg-gray-100 text-gray-600";
    case "medium": return "bg-blue-50 text-blue-700";
    case "high": return "bg-orange-50 text-orange-700";
    case "critical": return "bg-red-50 text-red-700";
    default: return "bg-gray-100 text-gray-600";
  }
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}
