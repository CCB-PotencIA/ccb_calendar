import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { NextResponse } from "next/server";
import type { Database } from "@/types/database.types";

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  // Validate cron secret
  const auth = request.headers.get("authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;
  if (auth !== expected) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Service role client — bypasses RLS
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function addDays(date: Date, days: number): string {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  }

  let sent = 0;
  let skipped = 0;

  for (const triggerDays of [30, 15] as const) {
    const targetDate = addDays(today, triggerDays);

    // Get tasks due on the target date
    const { data: tasks } = await supabase
      .from("tasks")
      .select(`
        id, title, plazo_interno, plazo_legal,
        assignees:task_assignees(profile:profiles(id, email, full_name))
      `)
      .eq("plazo_interno", targetDate)
      .not("status", "in", '("completed","cancelled")');

    if (!tasks?.length) continue;

    for (const task of tasks) {
      const assignees = (task.assignees as Array<{ profile: { id: string; email: string; full_name: string } }>)
        .map((a) => a.profile);

      for (const assignee of assignees) {
        // Check dedup
        const { data: existing } = await supabase
          .from("email_notification_log")
          .select("id")
          .eq("task_id", task.id)
          .eq("user_id", assignee.id)
          .eq("trigger_days", triggerDays)
          .maybeSingle();

        if (existing) { skipped++; continue; }

        // Send email
        const { error: emailError } = await resend.emails.send({
          from: "CCB Tareas <tareas@camarabaq.org.co>",
          to: assignee.email,
          subject: `[CCB] Tarea próxima a vencer en ${triggerDays} días: ${task.title}`,
          html: buildEmailHtml({
            recipientName: assignee.full_name || assignee.email,
            taskTitle: task.title,
            plazoInterno: task.plazo_interno,
            plazoLegal: task.plazo_legal,
            daysUntilDue: triggerDays,
            taskUrl: `${process.env.NEXT_PUBLIC_APP_URL}/tasks/${task.id}`,
          }),
        });

        if (emailError) {
          console.error(`Email failed for task ${task.id} / user ${assignee.id}:`, emailError);
          continue;
        }

        // Log sent email (dedup insert)
        await supabase.from("email_notification_log").insert({
          task_id: task.id,
          user_id: assignee.id,
          trigger_days: triggerDays,
        });

        // Create in-app notification
        await supabase.from("notifications").insert({
          user_id: assignee.id,
          task_id: task.id,
          type: "task_due_soon",
          title: `Tarea vence en ${triggerDays} días`,
          body: task.title,
        });

        sent++;
      }
    }
  }

  return NextResponse.json({ sent, skipped });
}

interface EmailProps {
  recipientName: string;
  taskTitle: string;
  plazoInterno: string;
  plazoLegal: string | null;
  daysUntilDue: number;
  taskUrl: string;
}

function buildEmailHtml({
  recipientName,
  taskTitle,
  plazoInterno,
  plazoLegal,
  daysUntilDue,
  taskUrl,
}: EmailProps): string {
  const urgencyColor = daysUntilDue <= 15 ? "#E67E22" : "#f59e0b";
  const formattedDate = new Date(plazoInterno + "T00:00:00").toLocaleDateString("es-CO", {
    day: "2-digit", month: "long", year: "numeric",
  });

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Recordatorio de tarea</title>
</head>
<body style="margin:0;padding:0;background:#eef1f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px;">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background:#004c9e;padding:32px 40px;">
              <p style="color:#ffffff;font-size:22px;font-weight:700;margin:0;">
                Cámara de Comercio<br>
                <span style="color:#009de2;">de Barranquilla</span>
              </p>
            </td>
          </tr>
          <!-- Alert banner -->
          <tr>
            <td style="background:${urgencyColor};padding:12px 40px;">
              <p style="color:#ffffff;font-size:14px;font-weight:700;margin:0;letter-spacing:0.5px;">
                ⏰ TAREA PRÓXIMA A VENCER — ${daysUntilDue} DÍAS
              </p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#1a1a2e;font-size:16px;margin:0 0 8px;">Hola, <strong>${recipientName}</strong></p>
              <p style="color:#4a5568;font-size:14px;line-height:1.6;margin:0 0 28px;">
                Tienes una tarea asignada que vence en <strong>${daysUntilDue} días</strong>.
              </p>
              <!-- Task card -->
              <div style="background:#f7f9fc;border:1px solid #e2e8f0;border-left:4px solid ${urgencyColor};border-radius:8px;padding:24px;margin-bottom:28px;">
                <p style="color:#4a5568;font-size:11px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;margin:0 0 8px;">Tarea</p>
                <p style="color:#1a1a2e;font-size:18px;font-weight:700;margin:0 0 16px;">${taskTitle}</p>
                <table width="100%">
                  <tr>
                    <td width="50%">
                      <p style="color:#4a5568;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;">Plazo Interno</p>
                      <p style="color:${urgencyColor};font-size:14px;font-weight:700;margin:0;">${formattedDate}</p>
                    </td>
                    ${plazoLegal ? `
                    <td width="50%">
                      <p style="color:#4a5568;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;margin:0 0 4px;">Plazo Legal</p>
                      <p style="color:#1a1a2e;font-size:14px;margin:0;">${new Date(plazoLegal + "T00:00:00").toLocaleDateString("es-CO", { day: "2-digit", month: "long", year: "numeric" })}</p>
                    </td>
                    ` : ""}
                  </tr>
                </table>
              </div>
              <!-- CTA -->
              <a href="${taskUrl}" style="display:inline-block;background:#004c9e;color:#ffffff;padding:14px 32px;border-radius:8px;font-size:15px;font-weight:700;text-decoration:none;">
                Ver tarea →
              </a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f7f9fc;padding:20px 40px;border-top:1px solid #e2e8f0;">
              <p style="color:#718096;font-size:12px;margin:0;">
                Este es un mensaje automático del sistema de gestión de tareas de la CCB.<br>
                Por favor no responda a este correo.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
