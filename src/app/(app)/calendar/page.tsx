"use client";

import dynamic from "next/dynamic";

const CalendarView = dynamic(
  () => import("@/components/calendar/CalendarView").then((m) => m.CalendarView),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center"><span className="text-muted-foreground text-sm">Cargando calendario...</span></div> }
);

export default function CalendarPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold text-foreground">Calendario</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Vista de plazos y vencimientos por mes
        </p>
      </div>
      <CalendarView />
    </div>
  );
}
