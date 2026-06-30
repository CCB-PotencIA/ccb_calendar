"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import type { Profile } from "@/types/task.types";

interface AppShellProps {
  children: ReactNode;
  profile: Profile;
}

export function AppShell({ children, profile }: AppShellProps) {
  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar profile={profile} />
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <TopBar profile={profile} />
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
