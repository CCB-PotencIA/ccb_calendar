import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ taskId: string; followupId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { taskId, followupId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const updateData: { completed?: boolean; notes?: string } = {};
  if (typeof body?.completed === "boolean") updateData.completed = body.completed;
  if (typeof body?.notes === "string") updateData.notes = body.notes;

  const { data, error } = await supabase
    .from("task_followups")
    .update(updateData)
    .eq("id", followupId)
    .eq("task_id", taskId)
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Error al actualizar el seguimiento" }, { status: 500 });
  }

  return NextResponse.json(data);
}
