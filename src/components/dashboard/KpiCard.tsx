import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: number;
  icon: ReactNode;
  color?: string;
  description?: string;
}

export function KpiCard({ label, value, icon, color = "#004c9e", description }: KpiCardProps) {
  return (
    <Card className="border-border hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-3xl font-bold mt-1" style={{ color }}>
              {value}
            </p>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </div>
          <div
            className="p-2.5 rounded-lg"
            style={{ backgroundColor: `${color}18`, color }}
          >
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
