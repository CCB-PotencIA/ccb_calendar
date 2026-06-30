import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { DeadlineStatus } from "@/types/task.types";

interface TaskProgressBarProps {
  progress: number;
  deadlineStatus?: DeadlineStatus;
  showLabel?: boolean;
}

function getProgressColor(deadlineStatus?: DeadlineStatus): string {
  switch (deadlineStatus) {
    case "overdue":
      return "[&>div]:bg-red-500";
    case "due_soon_15":
      return "[&>div]:bg-orange-500";
    case "due_soon_30":
      return "[&>div]:bg-amber-500";
    case "on_track":
      return "[&>div]:bg-green-600";
    default:
      return "[&>div]:bg-primary";
  }
}

export function TaskProgressBar({
  progress,
  deadlineStatus,
  showLabel = false,
}: TaskProgressBarProps) {
  return (
    <div className="flex items-center gap-2">
      <Progress
        value={progress}
        className={cn("h-2 flex-1", getProgressColor(deadlineStatus))}
      />
      {showLabel && (
        <span className="text-xs text-muted-foreground w-8 text-right shrink-0">
          {progress}%
        </span>
      )}
    </div>
  );
}
