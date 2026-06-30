import { cn } from "@/lib/utils";

interface DepartmentBadgeProps {
  name: string;
  color: string;
  size?: "sm" | "default";
}

export function DepartmentBadge({ name, color, size = "default" }: DepartmentBadgeProps) {
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
