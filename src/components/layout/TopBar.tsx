"use client";

import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/shared/UserAvatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/task.types";

interface TopBarProps {
  profile: Profile;
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/calendar": "Calendario",
  "/tasks": "Tareas",
  "/notifications": "Notificaciones",
  "/admin/users": "Gestión de Usuarios",
  "/admin/departments": "Departamentos",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/tasks/")) return "Detalle de Tarea";
  if (pathname.startsWith("/admin/")) return "Administración";
  return "CCB Tareas";
}

export function TopBar({ profile }: TopBarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <header className="h-14 bg-card border-b border-border px-6 flex items-center justify-between shrink-0">
      <h1 className="text-base font-semibold text-foreground">{getPageTitle(pathname)}</h1>

      <div className="flex items-center gap-2">
        <NotificationBell userId={profile.id} />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
              <UserAvatar name={profile.full_name} avatarUrl={profile.avatar_url} size="sm" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-52" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-semibold leading-none">{profile.full_name}</p>
                <p className="text-xs leading-none text-muted-foreground">{profile.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive gap-2">
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
