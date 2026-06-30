"use client";

import { useState } from "react";
import { Plus, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { useTasks, useDeleteTask } from "@/hooks/useTasks";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";
import { toast } from "sonner";
import type { TaskFilters as TTaskFilters, TaskWithRelations } from "@/types/task.types";

export function TaskListPanel() {
  const [filters, setFilters] = useState<TTaskFilters>({ status: "all" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskWithRelations | undefined>();

  const { data: tasks = [], isLoading } = useTasks(filters);
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const deleteTask = useDeleteTask();

  async function handleDelete(id: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar esta tarea?")) return;
    try {
      await deleteTask.mutateAsync(id);
      toast.success("Tarea eliminada");
    } catch {
      toast.error("Error al eliminar la tarea");
    }
  }

  function handleEdit(task: TaskWithRelations) {
    setEditingTask(task);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditingTask(undefined);
    setDialogOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-base font-semibold text-foreground">Lista de tareas</h2>
        <Button onClick={handleNew} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nueva tarea
        </Button>
      </div>

      <TaskFilters
        filters={filters}
        onChange={setFilters}
        departments={departments}
        users={users}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-12 w-12" />}
          title="Sin tareas"
          description="No hay tareas que coincidan con los filtros aplicados"
          action={
            <Button size="sm" onClick={handleNew} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Crear primera tarea
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => handleEdit(task)}
              onDelete={() => handleDelete(task.id)}
            />
          ))}
        </div>
      )}

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setEditingTask(undefined);
        }}
        task={editingTask}
      />
    </div>
  );
}
