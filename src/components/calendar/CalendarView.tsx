"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getDeadlineStatus, getDeadlineColor, getDeadlineLabel } from "@/lib/utils";
import type { DeadlineStatus } from "@/lib/utils";
import { useTasks } from "@/hooks/useTasks";
import { CalendarEventContent } from "./CalendarEventContent";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { TaskWithRelations } from "@/types/task.types";
import type { EventClickArg } from "@fullcalendar/core";

interface CalendarViewProps {
  initialTasks?: TaskWithRelations[];
}

export function CalendarView({ initialTasks }: CalendarViewProps) {
  const [selectedTask, setSelectedTask] = useState<TaskWithRelations | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: tasks = initialTasks ?? [], isLoading } = useTasks();

  const events = tasks.map((task) => {
    const status = task.deadline_status ?? getDeadlineStatus(task.plazo_interno);
    const color = getDeadlineColor(status);
    return {
      id: task.id,
      title: task.title,
      start: task.plazo_interno,
      backgroundColor: color,
      borderColor: color,
      extendedProps: { task },
    };
  });

  function handleEventClick(arg: EventClickArg) {
    const task = arg.event.extendedProps.task as TaskWithRelations;
    setSelectedTask(task);
    setDialogOpen(true);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const legendStatuses: DeadlineStatus[] = ["overdue", "due_soon_15", "due_soon_30", "on_track"];

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">Colores por vigencia:</span>
          {legendStatuses.map((status) => (
            <span key={status} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: getDeadlineColor(status) }}
              />
              {getDeadlineLabel(status)}
            </span>
          ))}
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale={esLocale}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,listWeek",
          }}
          events={events}
          eventContent={(eventInfo) => (
            <CalendarEventContent task={eventInfo.event.extendedProps.task as TaskWithRelations} />
          )}
          eventClick={handleEventClick}
          height="auto"
          dayMaxEvents={3}
          nowIndicator
        />
      </div>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setSelectedTask(undefined);
        }}
        task={selectedTask}
      />
    </>
  );
}
