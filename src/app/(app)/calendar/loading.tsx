import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

export default function CalendarLoading() {
  return (
    <div className="space-y-4">
      <div>
        <div className="h-7 w-24 bg-muted rounded animate-pulse" />
        <div className="h-4 w-48 bg-muted rounded mt-1 animate-pulse" />
      </div>
      <div className="bg-card rounded-xl border border-border flex items-center justify-center h-[600px]">
        <LoadingSpinner size="lg" />
      </div>
    </div>
  );
}
