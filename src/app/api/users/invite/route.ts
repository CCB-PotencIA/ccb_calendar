import { createClient, createServiceClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { inviteUserSchema } from "@/lib/validations/user.schema";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Only admins can invite
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = inviteUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const { email, full_name, department_id, role } = parsed.data;

  const serviceClient = await createServiceClient();
  const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: { full_name, role, department_id },
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite`,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Update profile with department if provided (trigger creates the row)
  if (department_id && data.user) {
    await supabase
      .from("profiles")
      .update({ department_id, role })
      .eq("id", data.user.id);
  }

  return NextResponse.json({ success: true, email }, { status: 201 });
}
