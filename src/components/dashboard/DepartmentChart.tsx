"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { Building2 } from "lucide-react";
import type { DepartmentTaskCount } from "@/types/task.types";

interface DepartmentChartProps {
  data: DepartmentTaskCount[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: DepartmentTaskCount }> }) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-sm">
      <p className="font-semibold text-foreground">{item.department_name}</p>
      <p className="text-muted-foreground">
        {item.count} {item.count === 1 ? "tarea" : "tareas"}
      </p>
    </div>
  );
}

export function DepartmentChart({ data }: DepartmentChartProps) {
  return (
    <Card className="border-border h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Tareas por Unidad
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState
            icon={<Building2 className="h-10 w-10" />}
            title="Sin datos"
            description="No hay tareas registradas por unidad"
          />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="department_name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                innerRadius={50}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.department_id} fill={entry.department_color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => (
                  <span className="text-xs text-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
