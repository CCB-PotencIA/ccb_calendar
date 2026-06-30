import { cn, getStatusLabel, getStatusBadgeClass } from "@/lib/utils";
import type { TaskStatus } from "@/types/task.types";

interface TaskStatusBadgeProps {
  status: TaskStatus;
}

export function TaskStatusBadge({ status }: TaskStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border",
        getStatusBadgeClass(status)
      )}
    >
      {getStatusLabel(status)}
    </span>
  );
}
