"use client";

import { useState } from "react";
import { Plus, Shield, User } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { useUsers } from "@/hooks/useUsers";
import { useDepartments } from "@/hooks/useDepartments";
import { inviteUserSchema, type InviteUserValues } from "@/lib/validations/user.schema";

export default function UsersAdminPage() {
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  const { data: users = [], isLoading, refetch } = useUsers();
  const { data: departments = [] } = useDepartments();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<InviteUserValues>({
    resolver: zodResolver(inviteUserSchema) as any,
    defaultValues: { email: "", full_name: "", department_id: undefined, role: "member" },
  });

  async function onInvite(values: InviteUserValues) {
    setInviting(true);
    try {
      const res = await fetch("/api/users/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error ?? "Error al invitar usuario");
      }
      toast.success(`Invitación enviada a ${values.email}`);
      form.reset();
      setInviteOpen(false);
      refetch();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al enviar invitación");
    } finally {
      setInviting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Gestión de Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {users.length} usuario{users.length !== 1 ? "s" : ""} registrado{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button onClick={() => setInviteOpen(true)} size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Invitar usuario
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={<User className="h-12 w-12" />}
          title="Sin usuarios"
          description="Invita al primer usuario para comenzar"
        />
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {users.map((user) => {
                const dept = departments.find((d) => d.id === user.department_id);
                return (
                  <div
                    key={user.id}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <UserAvatar name={user.full_name} avatarUrl={user.avatar_url} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold truncate">{user.full_name}</p>
                        {user.role === "admin" && (
                          <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                            <Shield className="h-3 w-3" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    {dept && (
                      <DepartmentBadge name={dept.name} color={dept.color} size="sm" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Invitar usuario</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onInvite)} className="space-y-4">
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="usuario@camarabaq.org.co" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidad</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar unidad" />
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
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rol</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="member">Miembro</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                  disabled={inviting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? "Enviando..." : "Enviar invitación"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
