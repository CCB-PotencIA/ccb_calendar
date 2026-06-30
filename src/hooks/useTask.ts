"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { keys } from "@/lib/react-query/keys";
import type { TaskWithRelations } from "@/types/task.types";
import type { TaskFormValues } from "@/lib/validations/task.schema";

async function fetchTask(id: string): Promise<TaskWithRelations> {
  const res = await fetch(`/api/tasks/${id}`);
  if (!res.ok) throw new Error("Tarea no encontrada");
  return res.json();
}

async function updateTask(
  id: string,
  data: Partial<TaskFormValues>
): Promise<TaskWithRelations> {
  const res = await fetch(`/api/tasks/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al actualizar la tarea");
  }
  return res.json();
}

export function useTask(id: string) {
  return useQuery({
    queryKey: keys.tasks.detail(id),
    queryFn: () => fetchTask(id),
    enabled: Boolean(id),
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Partial<TaskFormValues>) => updateTask(id, data),
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: keys.tasks.detail(id) });
      const previous = queryClient.getQueryData<TaskWithRelations>(
        keys.tasks.detail(id)
      );
      if (previous) {
        queryClient.setQueryData(keys.tasks.detail(id), {
          ...previous,
          ...newData,
        });
      }
      return { previous };
    },
    onError: (_err, _newData, context) => {
      if (context?.previous) {
        queryClient.setQueryData(keys.tasks.detail(id), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: keys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: keys.dashboard.all });
    },
  });
}

async function addSubtask(taskId: string, title: string) {
  const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al crear la subtarea");
  }
  return res.json();
}

async function updateSubtask(
  taskId: string,
  subtaskId: string,
  data: { completed?: boolean; title?: string }
) {
  const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al actualizar la subtarea");
  }
  return res.json();
}

async function deleteSubtask(taskId: string, subtaskId: string) {
  const res = await fetch(`/api/tasks/${taskId}/subtasks/${subtaskId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al eliminar la subtarea");
  }
  return res.json();
}

async function updateFollowup(
  taskId: string,
  followupId: string,
  data: { completed?: boolean; notes?: string }
) {
  const res = await fetch(`/api/tasks/${taskId}/followups/${followupId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Error al actualizar el seguimiento");
  }
  return res.json();
}

export function useAddSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (title: string) => addSubtask(taskId, title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: keys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: keys.dashboard.all });
    },
  });
}

export function useUpdateSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      subtaskId,
      data,
    }: {
      subtaskId: string;
      data: { completed?: boolean; title?: string };
    }) => updateSubtask(taskId, subtaskId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: keys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: keys.dashboard.all });
    },
  });
}

export function useDeleteSubtask(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (subtaskId: string) => deleteSubtask(taskId, subtaskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: keys.tasks.lists() });
      queryClient.invalidateQueries({ queryKey: keys.dashboard.all });
    },
  });
}

export function useUpdateFollowup(taskId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      followupId,
      data,
    }: {
      followupId: string;
      data: { completed?: boolean; notes?: string };
    }) => updateFollowup(taskId, followupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.tasks.detail(taskId) });
    },
  });
}
