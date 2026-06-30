"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Check, ChevronsUpDown, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { taskSchema, type TaskFormValues } from "@/lib/validations/task.schema";
import { useCreateTask } from "@/hooks/useTasks";
import { useUpdateTask } from "@/hooks/useTask";
import { useDepartments } from "@/hooks/useDepartments";
import { useUsers } from "@/hooks/useUsers";
import type { TaskWithRelations } from "@/types/task.types";

interface TaskFormProps {
  task?: TaskWithRelations;
  onSuccess: () => void;
}

export function TaskForm({ task, onSuccess }: TaskFormProps) {
  const [assigneePopoverOpen, setAssigneePopoverOpen] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const { data: departments = [] } = useDepartments();
  const { data: users = [] } = useUsers();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask(task?.id ?? "");

  const isEditing = Boolean(task);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? "",
      origen: task?.origen ?? "",
      description: task?.description ?? "",
      department_id: task?.department_id ?? "",
      assignee_ids: task?.assignees?.map((a) => a.id) ?? [],
      status: task?.status ?? "pending",
      priority: task?.priority ?? "medium",
      progress: task?.progress ?? 0,
      start_date: task?.start_date ?? "",
      plazo_interno: task?.plazo_interno ?? "",
      plazo_legal: task?.plazo_legal ?? "",
      responsible_tags: task?.responsible_tags ?? [],
      source_ref: task?.source_ref ?? "",
    },
  });

  async function onSubmit(values: TaskFormValues) {
    try {
      if (isEditing) {
        await updateTask.mutateAsync(values);
        toast.success("Tarea actualizada correctamente");
      } else {
        await createTask.mutateAsync(values);
        toast.success("Tarea creada correctamente");
      }
      onSuccess();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar la tarea");
    }
  }

  const selectedAssigneeIds = form.watch("assignee_ids") ?? [];
  const selectedTags = form.watch("responsible_tags") ?? [];
  const isSubmitting = createTask.isPending || updateTask.isPending;

  function toggleAssignee(userId: string) {
    const current = form.getValues("assignee_ids") ?? [];
    if (current.includes(userId)) {
      form.setValue("assignee_ids", current.filter((id) => id !== userId), {
        shouldValidate: true,
      });
    } else {
      form.setValue("assignee_ids", [...current, userId], { shouldValidate: true });
    }
  }

  function addTag(rawTag: string) {
    const trimmed = rawTag.trim();
    if (!trimmed) return;
    const current = form.getValues("responsible_tags") ?? [];
    if (current.includes(trimmed)) return;
    form.setValue("responsible_tags", [...current, trimmed], { shouldValidate: true });
  }

  function removeTag(tag: string) {
    const current = form.getValues("responsible_tags") ?? [];
    form.setValue(
      "responsible_tags",
      current.filter((t) => t !== tag),
      { shouldValidate: true }
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre de la tarea *</FormLabel>
              <FormControl>
                <Input placeholder="Ingresa el nombre de la tarea" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="origen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <FormControl>
                  <Input placeholder="Origen de la tarea" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="source_ref"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Referencia externa</FormLabel>
                <FormControl>
                  <Input placeholder="Referencia externa" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                  placeholder="Descripción detallada de la tarea..."
                  {...field}
                  value={field.value ?? ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="department_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad / Vicepresidencia *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una unidad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="assignee_ids"
            render={() => (
              <FormItem>
                <FormLabel>Responsables *</FormLabel>
                <Popover open={assigneePopoverOpen} onOpenChange={setAssigneePopoverOpen}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-between font-normal"
                        type="button"
                      >
                        <span className="text-muted-foreground truncate">
                          {selectedAssigneeIds.length > 0
                            ? `${selectedAssigneeIds.length} seleccionado${selectedAssigneeIds.length > 1 ? "s" : ""}`
                            : "Seleccionar responsables"}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar usuario..." />
                      <CommandList>
                        <CommandEmpty>Sin resultados.</CommandEmpty>
                        <CommandGroup>
                          {users.map((user) => (
                            <CommandItem
                              key={user.id}
                              value={user.full_name}
                              onSelect={() => toggleAssignee(user.id)}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedAssigneeIds.includes(user.id)
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{user.full_name}</span>
                                <span className="text-xs text-muted-foreground">{user.email}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedAssigneeIds.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {selectedAssigneeIds.map((id) => {
                      const user = users.find((u) => u.id === id);
                      if (!user) return null;
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
                        >
                          {user.full_name}
                          <button
                            type="button"
                            onClick={() => toggleAssignee(id)}
                            className="hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="responsible_tags"
          render={() => (
            <FormItem>
              <FormLabel>Etiquetas de responsables</FormLabel>
              <FormControl>
                <Input
                  placeholder="Escribe y presiona Enter para agregar"
                  value={tagDraft}
                  onChange={(e) => setTagDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === ",") {
                      e.preventDefault();
                      addTag(tagDraft);
                      setTagDraft("");
                    }
                  }}
                />
              </FormControl>

              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {departments.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => addTag(d.name)}
                    className="text-xs px-2 py-0.5 rounded-full border border-input text-muted-foreground hover:bg-secondary hover:text-secondary-foreground"
                  >
                    {d.name}
                  </button>
                ))}
              </div>

              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="start_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha inicio</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plazo_interno"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo interno *</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="plazo_legal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plazo legal</FormLabel>
                <FormControl>
                  <Input type="date" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">Pendiente</SelectItem>
                    <SelectItem value="in_progress">En proceso</SelectItem>
                    <SelectItem value="completed">Completada</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridad *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Baja</SelectItem>
                    <SelectItem value="medium">Media</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="critical">Crítica</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Progreso (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
            {isSubmitting
              ? "Guardando..."
              : isEditing
              ? "Actualizar tarea"
              : "Crear tarea"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
