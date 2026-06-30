"use client";

import { useQuery } from "@tanstack/react-query";
import { keys } from "@/lib/react-query/keys";
import type { Profile } from "@/types/user.types";

async function fetchUsers(): Promise<Profile[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Error al cargar los usuarios");
  return res.json();
}

export function useUsers() {
  return useQuery({
    queryKey: keys.users.list(),
    queryFn: fetchUsers,
    staleTime: 5 * 60 * 1000,
  });
}
