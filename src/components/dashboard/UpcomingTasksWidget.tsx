"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { TaskStatusBadge } from "@/components/tasks/TaskStatusBadge";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import {
  cn,
  getDeadlineStatus,
  getDeadlineTextClass,
  getDeadlineLabel,
  getDaysRemaining,
  formatDate,
} from "@/lib/utils";
import type { TaskWithRelations } from "@/types/task.types";

interface UpcomingTasksWidgetProps {
  tasks: TaskWithRelations[];
}

export function UpcomingTasksWidget({ tasks }: UpcomingTasksWidgetProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | undefined>();

  function handleOpenTask(task: TaskWithRelations) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  const sorted = [...tasks].sort(
    (a, b) =>
      new Date(a.plazo_interno).getTime() - new Date(b.plazo_interno).getTime()
  );

  const overdueTasks = sorted.filter(
    (task) => (task.deadline_status ?? getDeadlineStatus(task.plazo_interno)) === "overdue"
  );
  const upcomingTasks = sorted.filter(
    (task) => (task.deadline_status ?? getDeadlineStatus(task.plazo_interno)) !== "overdue"
  );

  function renderTaskRow(task: TaskWithRelations) {
    const status = task.deadline_status ?? getDeadlineStatus(task.plazo_interno);
    const textClass = getDeadlineTextClass(status);
    const daysLeft = getDaysRemaining(task.plazo_interno);
    return (
      <div
        key={task.id}
        onClick={() => handleOpenTask(task)}
        className="border border-border rounded-lg p-3 space-y-2 cursor-pointer hover:bg-muted/50 transition-colors"
      >
        <p className="text-sm font-medium line-clamp-2 leading-snug">{task.title}</p>

        <div className="flex items-center justify-between gap-2 flex-wrap">
          {task.department && (
            <DepartmentBadge
              name={task.department.name}
              color={task.department.color}
              size="sm"
            />
          )}
          <TaskStatusBadge status={task.status} />
        </div>

        <div className="flex items-center justify-between">
          <div className={cn("text-xs font-medium", textClass)}>
            <span>{formatDate(task.plazo_interno)}</span>
            <span className="ml-1">
              ({daysLeft > 0 ? `${daysLeft}d` : "Vencida"})
            </span>
          </div>

          {task.assignees && task.assignees.length > 0 && (
            <div className="flex -space-x-1">
              {task.assignees.slice(0, 3).map((a) => (
                <div key={a.id} className="ring-1 ring-white rounded-full" title={a.full_name}>
                  <UserAvatar name={a.full_name} avatarUrl={a.avatar_url} size="sm" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          Próximos vencimientos
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {sorted.length === 0 ? (
          <EmptyState
            title="Sin vencimientos próximos"
            description="No hay tareas que venzan en los próximos 30 días"
          />
        ) : (
          <div className="max-h-[520px] overflow-y-auto space-y-4 pr-2 scrollbar-visible">
            {overdueTasks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Vencidas
                </p>
                {overdueTasks.map(renderTaskRow)}
              </div>
            )}

            {upcomingTasks.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Próximas
                </p>
                {upcomingTasks.map(renderTaskRow)}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingTask(undefined);
        }}
        task={editingTask}
      />
    </Card>
  );
}
