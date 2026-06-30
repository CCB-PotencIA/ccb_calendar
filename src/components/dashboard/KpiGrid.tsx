import {
  LayoutDashboard,
  Clock,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { KpiCard } from "./KpiCard";
import type { DashboardStats } from "@/types/task.types";

interface KpiGridProps {
  stats: DashboardStats;
}

export function KpiGrid({ stats }: KpiGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      <KpiCard
        label="Total"
        value={stats.total}
        icon={<LayoutDashboard className="h-5 w-5" />}
        color="#004c9e"
        description="Tareas registradas"
      />
      <KpiCard
        label="Pendientes"
        value={stats.pending}
        icon={<Clock className="h-5 w-5" />}
        color="#64748b"
        description="Sin iniciar"
      />
      <KpiCard
        label="En proceso"
        value={stats.in_progress}
        icon={<Loader className="h-5 w-5" />}
        color="#009de2"
        description="En ejecución"
      />
      <KpiCard
        label="Completadas"
        value={stats.completed}
        icon={<CheckCircle className="h-5 w-5" />}
        color="#2D8A4E"
        description="Finalizadas"
      />
      <KpiCard
        label="Vencidas"
        value={stats.overdue}
        icon={<AlertCircle className="h-5 w-5" />}
        color="#C0392B"
        description="Fuera de plazo"
      />
    </div>
  );
}
