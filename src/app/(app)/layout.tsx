import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ReactQueryProvider } from "@/lib/react-query/provider";
import { Toaster } from "@/components/ui/sonner";
import { AppShell } from "@/components/layout/AppShell";
import type { ReactNode } from "react";

export default async function AppLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return (
    <ReactQueryProvider>
      <AppShell profile={profile}>{children}</AppShell>
      <Toaster />
    </ReactQueryProvider>
  );
}
