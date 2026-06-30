"use client";

import { useRouter } from "next/navigation";
import {
  CheckCircle,
  ClipboardList,
  AlertCircle,
  Clock,
  Bell,
} from "lucide-react";
import { cn, formatRelativeDate } from "@/lib/utils";
import type { NotificationWithTask } from "@/types/notification.types";

interface NotificationItemProps {
  notification: NotificationWithTask;
  onRead: (id: string) => void;
}

function NotificationIcon({ type }: { type: string }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "task_assigned":
      return <ClipboardList className={cn(cls, "text-blue-500")} />;
    case "task_completed":
      return <CheckCircle className={cn(cls, "text-green-500")} />;
    case "task_overdue":
      return <AlertCircle className={cn(cls, "text-red-500")} />;
    case "task_due_soon":
      return <Clock className={cn(cls, "text-orange-500")} />;
    case "task_updated":
      return <Bell className={cn(cls, "text-primary")} />;
    default:
      return <Bell className={cn(cls, "text-muted-foreground")} />;
  }
}

export function NotificationItem({ notification, onRead }: NotificationItemProps) {
  const router = useRouter();

  function handleClick() {
    if (!notification.read) {
      onRead(notification.id);
    }
    if (notification.task_id) {
      router.push(`/tasks/${notification.task_id}`);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-muted/50 transition-colors",
        !notification.read && "bg-blue-50/50"
      )}
    >
      <div className="mt-0.5">
        <NotificationIcon type={notification.type} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm leading-snug", !notification.read ? "font-semibold" : "font-medium")}>
          {notification.title}
        </p>
        {notification.body && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.body}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {formatRelativeDate(notification.created_at)}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
      )}
    </button>
  );
}
