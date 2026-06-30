"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import { keys } from "@/lib/react-query/keys";
import type { NotificationWithTask } from "@/types/notification.types";

async function fetchNotifications(userId: string): Promise<NotificationWithTask[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) throw new Error("Error al cargar notificaciones");
  return res.json();
}

async function markAllRead(): Promise<void> {
  const res = await fetch("/api/notifications/read-all", { method: "POST" });
  if (!res.ok) throw new Error("Error al marcar como leídas");
}

async function markOneRead(id: string): Promise<void> {
  const res = await fetch(`/api/notifications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ read: true }),
  });
  if (!res.ok) throw new Error("Error al actualizar notificación");
}

export function useNotifications(userId: string) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: keys.notifications.list(userId),
    queryFn: () => fetchNotifications(userId),
    enabled: Boolean(userId),
  });

  // Supabase Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: keys.notifications.list(userId),
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  const unreadCount =
    query.data?.filter((n) => !n.read).length ?? 0;

  return { ...query, unreadCount };
}

export function useMarkAllRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.notifications.list(userId),
      });
    },
  });
}

export function useMarkOneRead(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markOneRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: keys.notifications.list(userId),
      });
    },
  });
}
