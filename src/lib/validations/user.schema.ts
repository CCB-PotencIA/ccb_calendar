import { z } from "zod";

export const inviteUserSchema = z.object({
  email: z.string().email("Email inválido"),
  full_name: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  department_id: z.string().uuid("Selecciona una vicepresidencia/unidad").optional(),
  role: z.enum(["admin", "member"]).default("member"),
});

export type InviteUserValues = z.infer<typeof inviteUserSchema>;

export const updateProfileSchema = z.object({
  full_name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").optional(),
  department_id: z.string().uuid().nullable().optional(),
});

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
