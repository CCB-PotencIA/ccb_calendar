"use client";

import { useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useDepartments } from "@/hooks/useDepartments";
import { keys } from "@/lib/react-query/keys";
import type { Department } from "@/types/task.types";

const deptSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color inválido (usa formato #RRGGBB)"),
});

type DeptFormValues = z.infer<typeof deptSchema>;

const PRESET_COLORS = [
  "#004c9e", "#009de2", "#2D8A4E", "#E67E22", "#8B5CF6",
  "#C0392B", "#16A085", "#2C3E50", "#F39C12", "#1ABC9C",
];

export default function DepartmentsAdminPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | undefined>();
  const [saving, setSaving] = useState(false);

  const { data: departments = [], isLoading } = useDepartments();
  const queryClient = useQueryClient();

  const form = useForm<DeptFormValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: { name: "", color: "#004c9e" },
  });

  function openCreate() {
    setEditingDept(undefined);
    form.reset({ name: "", color: "#004c9e" });
    setDialogOpen(true);
  }

  function openEdit(dept: Department) {
    setEditingDept(dept);
    form.reset({ name: dept.name, color: dept.color });
    setDialogOpen(true);
  }

  async function onSubmit(values: DeptFormValues) {
    setSaving(true);
    try {
      const url = editingDept
        ? `/api/departments?id=${editingDept.id}`
        : "/api/departments";
      const method = editingDept ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al guardar");
      }

      toast.success(editingDept ? "Departamento actualizado" : "Departamento creado");
      queryClient.invalidateQueries({ queryKey: keys.departments.list() });
      setDialogOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Vicepresidencia/Unidad</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {departments.length} unidad{departments.length !== 1 ? "es" : ""} registrada{departments.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={openCreate} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nuevo departamento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded-xl" />
          ))}
        </div>
      ) : departments.length === 0 ? (
        <EmptyState
          title="Sin departamentos"
          description="Crea el primer departamento para comenzar"
          action={
            <Button size="sm" onClick={openCreate} className="gap-1.5">
              <Plus className="h-4 w-4" />
              Crear departamento
            </Button>
          }
        />
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center gap-4 px-4 py-3"
                >
                  <div
                    className="w-4 h-4 rounded-full shrink-0"
                    style={{ backgroundColor: dept.color }}
                  />
                  <div className="flex-1">
                    <DepartmentBadge name={dept.name} color={dept.color} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-primary"
                    onClick={() => openEdit(dept)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>
              {editingDept ? "Editar departamento" : "Nuevo departamento"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la unidad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            className="w-6 h-6 rounded-full border-2 transition-all"
                            style={{
                              backgroundColor: c,
                              borderColor: field.value === c ? "#1a1a2e" : "transparent",
                            }}
                            onClick={() => form.setValue("color", c, { shouldValidate: true })}
                          />
                        ))}
                      </div>
                      <FormControl>
                        <Input type="text" placeholder="#004c9e" {...field} />
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Guardando..." : editingDept ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
