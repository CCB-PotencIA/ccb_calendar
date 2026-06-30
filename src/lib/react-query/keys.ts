export const keys = {
  tasks: {
    all: ["tasks"] as const,
    lists: () => [...keys.tasks.all, "list"] as const,
    list: (filters: Record<string, unknown>) =>
      [...keys.tasks.lists(), filters] as const,
    details: () => [...keys.tasks.all, "detail"] as const,
    detail: (id: string) => [...keys.tasks.details(), id] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (userId: string) => [...keys.notifications.all, userId] as const,
    unreadCount: (userId: string) =>
      [...keys.notifications.all, "unread", userId] as const,
  },
  users: {
    all: ["users"] as const,
    list: () => [...keys.users.all, "list"] as const,
  },
  departments: {
    all: ["departments"] as const,
    list: () => [...keys.departments.all, "list"] as const,
  },
  dashboard: {
    all: ["dashboard"] as const,
    stats: () => [...keys.dashboard.all, "stats"] as const,
    upcoming: () => [...keys.dashboard.all, "upcoming"] as const,
    byDepartment: () => [...keys.dashboard.all, "byDepartment"] as const,
  },
};
