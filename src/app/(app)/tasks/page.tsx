import { TaskListPanel } from "@/components/dashboard/TaskListPanel";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Tareas</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gestión de todas las tareas y actividades
        </p>
      </div>
      <TaskListPanel />
    </div>
  );
}
