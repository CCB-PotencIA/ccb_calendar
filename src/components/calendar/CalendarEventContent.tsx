"use client";

import { getDeadlineStatus, getDeadlineColor } from "@/lib/utils";
import { DepartmentBadge } from "@/components/shared/DepartmentBadge";
import type { TaskWithRelations } from "@/types/task.types";

interface CalendarEventContentProps {
  task: TaskWithRelations;
}

export function CalendarEventContent({ task }: CalendarEventContentProps) {
  const deadlineStatus = task.deadline_status ?? getDeadlineStatus(task.plazo_interno);
  const color = getDeadlineColor(deadlineStatus);
  const circumference = 2 * Math.PI * 8;
  const dashOffset = circumference * (1 - task.progress / 100);

  return (
    <div
      className="flex items-start gap-1.5 px-1.5 py-1 rounded text-white overflow-hidden w-full h-full"
      style={{
        borderLeft: `3px solid ${color}`,
        backgroundColor: `${color}dd`,
      }}
    >
      <div className="flex-1 min-w-0">
        {task.department && (
          <div className="mb-0.5">
            <span className="text-[9px] font-semibold opacity-90 truncate block">
              {task.department.name}
            </span>
          </div>
        )}
        <p className="text-[11px] font-semibold leading-snug line-clamp-2">{task.title}</p>
      </div>

      {/* Circular progress indicator */}
      <div className="shrink-0 mt-0.5">
        <svg width="20" height="20" viewBox="0 0 20 20" className="rotate-[-90deg]">
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
