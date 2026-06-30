"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TaskFilters, Department } from "@/types/task.types";
import type { Profile } from "@/types/user.types";

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (f: TaskFilters) => void;
  departments: Department[];
  users: Profile[];
}

const STATUS_OPTIONS = [
  { value: "all", label: "Todos los estados" },
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En proceso" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

export function TaskFilters({ filters, onChange, departments, users }: TaskFiltersProps) {
  const hasActiveFilters =
    (filters.search && filters.search.length > 0) ||
    (filters.status && filters.status !== "all") ||
    filters.department_id ||
    filters.assignee_id;

  function clear() {
    onChange({ status: "all", department_id: undefined, assignee_id: undefined, search: "" });
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar tarea..."
          className="pl-8"
          value={filters.search ?? ""}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
        />
      </div>

      <Select
        value={filters.status ?? "all"}
        onValueChange={(v) => onChange({ ...filters, status: v as TaskFilters["status"] })}
      >
        <SelectTrigger className="w-full sm:w-[160px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.department_id ?? "all"}
        onValueChange={(v) =>
          onChange({ ...filters, department_id: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Unidad" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas las unidades</SelectItem>
          {departments.map((d) => (
            <SelectItem key={d.id} value={d.id}>
              {d.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.assignee_id ?? "all"}
        onValueChange={(v) =>
          onChange({ ...filters, assignee_id: v === "all" ? undefined : v })
        }
      >
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Responsable" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos los responsables</SelectItem>
          {users.map((u) => (
            <SelectItem key={u.id} value={u.id}>
              {u.full_name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clear} className="shrink-0 gap-1.5">
          <X className="h-3.5 w-3.5" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
