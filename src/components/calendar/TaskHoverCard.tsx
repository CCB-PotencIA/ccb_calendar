"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  cn,
  getDeadlineStatus,
  getDeadlineTextClass,
  getDeadlineLabel,
  getDaysRemaining,
  formatDate,
} from "@/lib/utils";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { TaskPriorityBadge } from "@/components/tasks/TaskPriorityBadge";
import { TaskProgressBar } from "@/components/tasks/TaskProgressBar";
import type { TaskWithRelations } from "@/types/task.types";

interface TaskHoverCardProps {
  task: TaskWithRelations;
  x: number;
  y: number;
  placement: "above" | "below";
}

export function TaskHoverCard({ task, x, y, placement }: TaskHoverCardProps) {
  const deadlineStatus = task.deadline_status ?? getDeadlineStatus(task.plazo_interno);
  const deadlineTextClass = getDeadlineTextClass(deadlineStatus);
  const daysRemaining = getDaysRemaining(task.plazo_interno);

  return (
    <Card
      className="fixed z-50 w-[280px] max-w-[320px] pointer-events-none shadow-lg border-border bg-card"
      style={{
        left: x,
        top: y,
        transform: placement === "above" ? "translateY(-100%)" : undefined,
      }}
    >
      <CardContent className="p-3">
        <h3 className="font-semibold text-sm text-foreground leading-snug mb-2">
          {task.title}
        </h3>

        {task.departments && task.departments.length > 0 ? (
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <DepartmentBadge
              name={task.departments[0].name}
              color={task.departments[0].color}
              size="sm"
            />
            {task.departments.length > 2 && (
              <DepartmentBadge count={task.departments.length - 1} size="sm" />
            )}
            {task.departments.length === 2 && (
              <DepartmentBadge
                name={task.departments[1].name}
                color={task.departments[1].color}
                size="sm"
              />
            )}
          </div>
        ) : (
          task.department && (
            <div className="mb-2">
              <DepartmentBadge
                name={task.department.name}
                color={task.department.color}
                size="sm"
              />
            </div>
          )
        )}

        <div className="flex items-center gap-2 mb-2">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>

        <div className="mb-2">
          <TaskProgressBar progress={task.progress} deadlineStatus={deadlineStatus} showLabel />
        </div>

        <div className={cn("text-xs font-medium mb-2", deadlineTextClass)}>
          <span>{getDeadlineLabel(deadlineStatus)}: </span>
          <span>{formatDate(task.plazo_interno)}</span>
          {daysRemaining !== 0 && (
            <span className="ml-1">
              ({daysRemaining > 0 ? `${daysRemaining}d` : `${Math.abs(daysRemaining)}d vencida`})
            </span>
          )}
        </div>

        {task.assignees && task.assignees.length > 0 && (
          <div className="flex -space-x-1.5 mb-2">
            {task.assignees.slice(0, 3).map((assignee) => (
              <div key={assignee.id} className="ring-1 ring-white rounded-full" title={assignee.full_name}>
                <UserAvatar name={assignee.full_name} avatarUrl={assignee.avatar_url} size="sm" />
              </div>
            ))}
            {task.assignees.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted border border-border flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground font-medium">
                  +{task.assignees.length - 3}
                </span>
              </div>
            )}
          </div>
        )}

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
        )}
      </CardContent>
    </Card>
  );
}
