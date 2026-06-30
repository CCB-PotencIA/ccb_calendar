"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/react-query/keys";
import type { TaskFilters, TaskWithRelations } from "@/types/task.types";
import type { TaskFormValues } from "@/lib/validations/task.schema";

async function fetchTasks(filters: TaskFilters = {}): Promise<TaskWithRelations[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status", filters.status);
  if (filters.department_id) params.set("department_id", filters.department_id);
  if (filters.assignee_id) params.set("assignee_id", filters.assignee_id);
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.search) params.set("search", filters.search);

  const res = await fetch(`/api/tasks?${params.toString()}`);
  if (!res.ok) throw new Error("Error al cargar las tareas");
  return res.json();
}

async function createTask(data: TaskFormValues): Promise<TaskWithRelations> {
  const res = await fetch("/api/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al crear la tarea");
  }
  return res.json();
}

async function deleteTask(id: string): Promise<void> {
  const res = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Error al eliminar la tarea");
}

export function useTasks(filters: TaskFilters = {}) {
  return useQuery({
    queryKey: keys.tasks.list(filters),
    queryFn: () => fetchTasks(filters),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.all });
      queryClient.invalidateQueries({ queryKey: keys.dashboard.all });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.all });
      queryClient.invalidateQueries({ queryKey: keys.dashboard.all });
    },
  });
}
