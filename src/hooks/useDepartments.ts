"use client";

import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/react-query/keys";
import type { Department } from "@/types/task.types";

async function fetchDepartments(): Promise<Department[]> {
  const res = await fetch("/api/departments");
  if (!res.ok) throw new Error("Error al cargar las unidades");
  return res.json();
}

export function useDepartments() {
  return useQuery({
    queryKey: keys.departments.list(),
    queryFn: fetchDepartments,
    staleTime: Infinity,
  });
}
