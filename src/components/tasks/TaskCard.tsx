"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskProgressBar } from "./TaskProgressBar";
import type { TaskWithRelations } from "@/types/task.types";

interface TaskCardProps {
  task: TaskWithRelations;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const deadlineStatus = task.deadline_status ?? getDeadlineStatus(task.plazo_interno);
  const deadlineTextClass = getDeadlineTextClass(deadlineStatus);
  const daysRemaining = getDaysRemaining(task.plazo_interno);

  return (
    <Card className="hover:shadow-md transition-shadow duration-200 bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm text-foreground line-clamp-2 leading-snug">
              {task.title}
            </h3>
            {task.actividad && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{task.actividad}</p>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary"
                onClick={(e) => { e.stopPropagation(); onEdit(); }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {task.department && (
          <div className="mb-2">
            <DepartmentBadge
              name={task.department.name}
              color={task.department.color}
              size="sm"
            />
          </div>
        )}

        <div className="flex items-center gap-2 mb-3">
          <TaskStatusBadge status={task.status} />
          <TaskPriorityBadge priority={task.priority} />
        </div>

        <div className="mb-3">
          <TaskProgressBar
            progress={task.progress}
            deadlineStatus={deadlineStatus}
            showLabel
          />
        </div>

        <div className="flex items-center justify-between">
          <div className={cn("text-xs font-medium", deadlineTextClass)}>
            <span>{getDeadlineLabel(deadlineStatus)}: </span>
            <span>{formatDate(task.plazo_interno)}</span>
            {daysRemaining !== 0 && (
              <span className="ml-1">
                ({daysRemaining > 0 ? `${daysRemaining}d` : `${Math.abs(daysRemaining)}d vencida`})
              </span>
            )}
          </div>

          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1.5">
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
        </div>
      </CardContent>
    </Card>
  );
}
