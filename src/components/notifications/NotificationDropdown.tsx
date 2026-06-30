"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { NotificationItem } from "./NotificationItem";
import { useNotifications, useMarkAllRead, useMarkOneRead } from "@/hooks/useNotifications";

interface NotificationDropdownProps {
  userId: string;
  onClose: () => void;
}

export function NotificationDropdown({ userId, onClose }: NotificationDropdownProps) {
  const { data: notifications = [], isLoading } = useNotifications(userId);
  const markAll = useMarkAllRead(userId);
  const markOne = useMarkOneRead(userId);

  const displayed = notifications.slice(0, 10);
  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="w-80 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="font-semibold text-sm">Notificaciones</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 px-2"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            Marcar todas leídas
          </Button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner size="sm" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No tienes notificaciones
          </div>
        ) : (
          <div className="divide-y divide-border">
            {displayed.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onRead={(id) => {
                  markOne.mutate(id);
                  onClose();
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Separator />
      <div className="px-4 py-2">
        <Link
          href="/notifications"
          onClick={onClose}
          className="block text-center text-xs text-primary hover:underline py-1"
        >
          Ver todas las notificaciones
        </Link>
      </div>
    </div>
  );
}
