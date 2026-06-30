import { z } from "zod";

const taskBaseSchema = z.object({
  title: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  origen: z.string().optional(),
  description: z.string().optional(),
  department_id: z.string().uuid("Selecciona un departamento"),
  assignee_ids: z.array(z.string().uuid()).min(1, "Asigna al menos un responsable"),
  status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
  priority: z.enum(["low", "medium", "high", "critical"]),
  progress: z.number().int().min(0).max(100),
  start_date: z.string().optional(),
  plazo_legal: z.string().optional(),
  plazo_interno: z.string().min(1, "La fecha de plazo interno es requerida"),
  responsible_tags: z.array(z.string()).optional(),
  source_ref: z.string().optional(),
});

export const taskSchema = taskBaseSchema.refine(
  (data) => {
    if (data.start_date && data.plazo_interno) {
      return new Date(data.plazo_interno) >= new Date(data.start_date);
    }
    return true;
  },
  {
    message: "El plazo interno debe ser posterior a la fecha de inicio",
    path: ["plazo_interno"],
  }
);

export type TaskFormValues = z.infer<typeof taskSchema>;

// Use base schema for partial updates (avoids .partial() on refined schema)
export const taskUpdateSchema = taskBaseSchema.partial().extend({
  id: z.string().uuid(),
});

export type TaskUpdateValues = z.infer<typeof taskUpdateSchema>;
