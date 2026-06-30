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
