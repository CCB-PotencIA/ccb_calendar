"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useNotifications, useMarkAllRead, useMarkOneRead } from "@/hooks/useNotifications";

export default function NotificationsPage() {
  const { profile } = useCurrentUser();
  const userId = profile?.id ?? "";

  const { data: notifications = [], isLoading } = useNotifications(userId);
  const markAll = useMarkAllRead(userId);
  const markOne = useMarkOneRead(userId);

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {notifications.length} notificaciones
            {hasUnread && ` · ${notifications.filter((n) => !n.read).length} sin leer`}
          </p>
        </div>
        {hasUnread && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            {markAll.isPending ? "Marcando..." : "Marcar todas leídas"}
          </Button>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <LoadingSpinner size="md" />
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={<Bell className="h-12 w-12" />}
            title="Sin notificaciones"
            description="No tienes notificaciones por el momento"
          />
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => markOne.mutate(id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
