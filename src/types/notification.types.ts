import type { Database } from "./database.types";
import type { Task } from "./task.types";

export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationType = Database["public"]["Tables"]["notifications"]["Row"]["type"];

export interface NotificationWithTask extends Notification {
  task: Pick<Task, "id" | "title"> | null;
}
