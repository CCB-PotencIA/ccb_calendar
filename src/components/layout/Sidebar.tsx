"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Calendar,
  CheckSquare,
  Bell,
  Users,
  Building2,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types/task.types";

interface SidebarProps {
  profile: Profile;
}

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendario", icon: Calendar },
  { href: "/tasks", label: "Tareas", icon: CheckSquare },
  { href: "/notifications", label: "Notificaciones", icon: Bell },
];

const ADMIN_NAV_ITEMS = [
  { href: "/admin/users", label: "Usuarios", icon: Users },
  { href: "/admin/departments", label: "Departamentos", icon: Building2 },
];

export function Sidebar({ profile }: SidebarProps) {
  const pathname = usePathname();
  const isAdmin = profile.role === "admin";

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <aside className="w-64 bg-[#004c9e] flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#009de2] flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">CCB</p>
            <p className="text-[#009de2] text-xs font-semibold leading-none mt-0.5">Tareas</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
              isActive(href)
                ? "bg-white/10 text-white border-l-2 border-[#009de2] rounded-l-none pl-[10px]"
                : "text-white/60 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        ))}

        {isAdmin && (
          <>
            <div className="pt-3 pb-1">
              <Separator className="bg-white/10" />
              <p className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mt-3 px-3">
                Administración
              </p>
            </div>
            {ADMIN_NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive(href)
                    ? "bg-white/10 text-white border-l-2 border-[#009de2] rounded-l-none pl-[10px]"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            ))}
          </>
        )}
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#009de2] flex items-center justify-center shrink-0">
            <span className="text-white text-xs font-bold">
              {profile.full_name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{profile.full_name}</p>
            <p className="text-white/50 text-[10px] truncate">{profile.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
