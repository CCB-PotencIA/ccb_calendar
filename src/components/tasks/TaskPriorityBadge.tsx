import { cn, getPriorityLabel, getPriorityBadgeClass } from "@/lib/utils";
import type { TaskPriority } from "@/types/task.types";

interface TaskPriorityBadgeProps {
  priority: TaskPriority;
}

export function TaskPriorityBadge({ priority }: TaskPriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        getPriorityBadgeClass(priority)
      )}
    >
      {getPriorityLabel(priority)}
    </span>
  );
}
