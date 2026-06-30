import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

type Params = { params: Promise<{ taskId: string }> };

export async function POST(request: Request, { params }: Params) {
  const { taskId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) {
    return NextResponse.json({ error: "El título es requerido" }, { status: 422 });
  }

  const { data, error } = await supabase
    .from("task_subtasks")
    .insert({ task_id: taskId, title })
    .select()
    .single();

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Error al crear la subtarea" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
