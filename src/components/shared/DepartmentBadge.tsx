import { cn } from "@/lib/utils";

interface DepartmentBadgeProps {
  name?: string;
  color?: string;
  size?: "sm" | "default";
  /** Compact "+N" mode — renders a neutral count pill instead of name/color. */
  count?: number;
}

export function DepartmentBadge({ name, color, size = "default", count }: DepartmentBadgeProps) {
  if (count !== undefined) {
    return (
      <span
        className={cn(
          "inline-flex items-center rounded-full font-medium border bg-muted text-muted-foreground border-border",
          size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
        )}
      >
        +{count}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs"
      )}
      style={{
        backgroundColor: `${color}26`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {name}
    </span>
  );
}
