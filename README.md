# CCB Tareas

Internal task management system for the **Cámara de Comercio de Barranquilla (CCB)** — replaces the previous Excel-based tracking with a web app featuring a task board, calendar view, dashboard metrics, and automated deadline notifications.

**Live app:** https://ccbcalendar.vercel.app

## Tech stack

- **Framework:** Next.js 15 (App Router, Server Components)
- **Database / Auth:** Supabase (Postgres, Row Level Security, Auth)
- **UI:** shadcn/ui, Tailwind CSS v4, Radix primitives
- **Data fetching:** TanStack React Query
- **Forms:** react-hook-form + zod
- **Calendar:** FullCalendar
- **Charts:** Recharts
- **Email:** Resend
- **Hosting:** Vercel

## Features

- **Tasks** with title, description, origin, legal/internal deadlines, status, priority, and manual or auto-computed progress.
- **Multi-department tasks**: a task can belong to several Vicepresidencias/Unidades. Each linked department gets full credit in dashboard KPIs; the calendar still renders exactly one event per task.
- **Multiple assignees** (real system users) plus free-text "other mentions" tags for committees/roles that aren't system accounts.
- **Subtasks** — a checklist per task; when subtasks exist, `tasks.progress` is auto-computed from the completion ratio via a DB trigger.
- **Follow-ups** — a per-task checklist of review checkpoints with notes.
- **Calendar view** — color-coded by deadline urgency (overdue / due in 15d / due in 30d / on track), with a hover preview card and a click-through detail dialog.
- **Dashboard** — KPI cards, tasks-per-department chart, and an upcoming-deadlines widget.
- **Admin** — manage departments (Vicepresidencia/Unidad) and invite users.
- **Notifications** — in-app notifications for real assignees, plus scheduled email reminders (15/30 days before a deadline) via a Vercel Cron job + Resend. Email reminders also go to per-department recipient lists (`department_notification_emails`) for people who don't need a login account.

## Getting started

### Prerequisites

- Node.js 20+
- A Supabase project (or the Supabase CLI for local development)

### Environment variables

Copy `.env.local.example` (or create `.env.local`) with:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_APP_URL=
CRON_SECRET=
RESEND_API_KEY=
```

### Install & run

```bash
npm install
npm run dev
```

### Database

Migrations live in `supabase/migrations/`, applied in order:

| File | Purpose |
|---|---|
| `0001_initial_schema.sql` | Core tables: departments, profiles, tasks, task_assignees, notifications |
| `0002_rls_policies.sql` | Row Level Security policies |
| `0003_functions_triggers.sql` | `handle_new_user`, `handle_updated_at`, `tasks_with_status` view |
| `0004_security_hardening.sql` | `security_invoker` on views, pinned `search_path` on functions |
| `0005_task_departments.sql` | Many-to-many department support |
| `0006_subtasks_followups_tags.sql` | Subtasks (+ auto-progress trigger), follow-ups, `responsible_tags`, `source_ref` |
| `0007_department_notification_emails.sql` | Email-only notification recipients per department (no login account needed) |

Seed data (the 8 real Vicepresidencias/Unidades) is in `supabase/seed.sql`.

If using the Supabase CLI locally: `supabase db push` applies pending migrations against your linked project.

### Scripts

- `scripts/import-matriz-elecciones.mjs` — one-off importer for a specific CSV format (the "Matriz Interna de Elecciones" spreadsheet). Dry-run by default; pass `--csv=<path> --apply` to write to the database. Useful as a reference for building similar bulk imports, not a generic CSV importer.

## Deployment

- **Hosting:** Vercel, linked to this repo's `main` branch (auto-deploys on push).
- **Cron:** `vercel.json` schedules `/api/cron/notify` daily to send deadline-reminder emails.
- Supabase Auth's **Site URL** and **Redirect URLs** must include the production domain (`.../accept-invite`, `.../api/auth/callback`) for login/invite flows to work.

## Project structure

```
src/
  app/
    (auth)/            Login, accept-invite
    (app)/             Dashboard, tasks, calendar, admin, notifications
    api/                REST-style route handlers (tasks, users, departments, notifications, cron)
  components/
    tasks/              TaskCard, TaskForm, TaskDetail, TaskDialog, badges
    calendar/           CalendarView, CalendarEventContent, TaskHoverCard
    dashboard/          KpiGrid, DepartmentChart, UpcomingTasksWidget
    layout/             AppShell, Sidebar, TopBar
  hooks/                React Query hooks (useTasks, useTask, useDepartments, useUsers)
  lib/
    supabase/           Client/server Supabase clients
    validations/        zod schemas
    utils.ts            Deadline status, date parsing, department normalization
  types/                Database + domain types
supabase/
  migrations/
  seed.sql
scripts/
```

## Documentation

- [GUIA_DE_USO.md](./GUIA_DE_USO.md) — end-user guide (Spanish) for CCB staff using the app day to day.
