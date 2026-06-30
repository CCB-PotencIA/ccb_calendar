"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TaskForm } from "./TaskForm";
import type { TaskWithRelations } from "@/types/task.types";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: TaskWithRelations;
}

export function TaskDialog({ open, onOpenChange, task }: TaskDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? "Editar tarea" : "Nueva tarea"}</DialogTitle>
        </DialogHeader>
        <TaskForm task={task} onSuccess={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}
