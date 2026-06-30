"use client";

import { useState } from "react";
import { AlertTriangle, Calendar, Building2, User, FileText, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  cn,
  getDeadlineStatus,
  getDeadlineTextClass,
  getDeadlineBgClass,
  getDeadlineLabel,
  getDaysRemaining,
  formatDate,
} from "@/lib/utils";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { TaskStatusBadge } from "./TaskStatusBadge";
import { TaskPriorityBadge } from "./TaskPriorityBadge";
import { TaskProgressBar } from "./TaskProgressBar";
import { TaskDialog } from "./TaskDialog";
import type { TaskWithRelations } from "@/types/task.types";

interface TaskDetailProps {
  task: TaskWithRelations;
}

export function TaskDetail({ task }: TaskDetailProps) {
  const [editOpen, setEditOpen] = useState(false);
  const deadlineStatus = task.deadline_status ?? getDeadlineStatus(task.plazo_interno);
  const deadlineTextClass = getDeadlineTextClass(deadlineStatus);
  const deadlineBgClass = getDeadlineBgClass(deadlineStatus);
  const daysRemaining = getDaysRemaining(task.plazo_interno);

  const hasLegalWarning =
    task.legal_deadline_warning ||
    (task.plazo_legal &&
      new Date(task.plazo_legal) < new Date(task.plazo_interno));

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold text-foreground leading-tight">{task.title}</h1>
            {task.actividad && (
              <p className="text-sm text-muted-foreground mt-1">{task.actividad}</p>
            )}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <TaskStatusBadge status={task.status} />
              <TaskPriorityBadge priority={task.priority} />
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpen(true)}
            className="shrink-0 gap-1.5"
          >
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
        </div>

        {/* Legal deadline warning */}
        {hasLegalWarning && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Alerta: Plazo legal anterior al plazo interno</p>
              <p className="text-xs mt-0.5">
                El plazo legal ({formatDate(task.plazo_legal!)}) vence antes que el plazo interno (
                {formatDate(task.plazo_interno)}). Revisa las fechas.
              </p>
            </div>
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Department */}
          {task.department && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Unidad</span>
                </div>
                <DepartmentBadge name={task.department.name} color={task.department.color} />
              </CardContent>
            </Card>
          )}

          {/* Plazo interno */}
          <Card className={cn("border", deadlineBgClass.replace("bg-", "bg-").split(" ")[0])}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Plazo interno</span>
              </div>
              <p className={cn("font-semibold text-sm", deadlineTextClass)}>
                {formatDate(task.plazo_interno)}
              </p>
              <p className={cn("text-xs mt-0.5", deadlineTextClass)}>
                {getDeadlineLabel(deadlineStatus)}
                {daysRemaining !== 0 && (
                  <span>
                    {" "}
                    — {daysRemaining > 0
                      ? `${daysRemaining} días restantes`
                      : `${Math.abs(daysRemaining)} días vencida`}
                  </span>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Plazo legal */}
          {task.plazo_legal && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Plazo legal</span>
                </div>
                <p className={cn("font-semibold text-sm", hasLegalWarning ? "text-red-600" : "text-foreground")}>
                  {formatDate(task.plazo_legal)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Start date */}
          {task.start_date && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Fecha inicio</span>
                </div>
                <p className="font-semibold text-sm">{formatDate(task.start_date)}</p>
              </CardContent>
            </Card>
          )}

          {/* Origen */}
          {task.origen && (
            <Card className="border-border">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  <span>Origen</span>
                </div>
                <p className="text-sm font-medium">{task.origen}</p>
              </CardContent>
            </Card>
          )}

          {/* Progress */}
          <Card className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>Progreso</span>
                <span className="font-semibold text-foreground">{task.progress}%</span>
              </div>
              <TaskProgressBar
                progress={task.progress}
                deadlineStatus={deadlineStatus}
              />
            </CardContent>
          </Card>
        </div>

        {/* Assignees */}
        {task.assignees && task.assignees.length > 0 && (
          <Card className="border-border">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Responsables ({task.assignees.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex flex-wrap gap-3">
                {task.assignees.map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-2">
                    <UserAvatar
                      name={assignee.full_name}
                      avatarUrl={assignee.avatar_url}
                      size="sm"
                    />
                    <div>
                      <p className="text-sm font-medium">{assignee.full_name}</p>
                      <p className="text-xs text-muted-foreground">{assignee.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Description */}
        {task.description && (
          <Card className="border-border">
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Descripción
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <TaskDialog open={editOpen} onOpenChange={setEditOpen} task={task} />
    </>
  );
}
