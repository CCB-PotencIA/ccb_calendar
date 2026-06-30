import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: string } | null; error: unknown };

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1 text-xs text-muted-foreground">
        <span>Administración</span>
      </nav>
      {children}
    </div>
  );
}
