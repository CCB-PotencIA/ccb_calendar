"use client";

import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import { getDeadlineStatus, getDeadlineColor } from "@/lib/utils";
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

  return (
    <>
      <div className="bg-card rounded-xl border border-border p-4 shadow-sm">
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
