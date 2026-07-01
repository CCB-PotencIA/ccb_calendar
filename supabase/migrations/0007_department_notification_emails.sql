-- ============================================================
-- DEPARTMENT NOTIFICATION EMAILS
-- Recipients who get deadline-reminder emails for a department's
-- tasks without needing a login account.
-- ============================================================
create table public.department_notification_emails (
  id            uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete cascade,
  full_name     text not null,
  email         text not null,
  created_at    timestamptz not null default now(),
  unique (department_id, email)
);

create index department_notification_emails_department_idx
  on public.department_notification_emails (department_id);

alter table public.department_notification_emails enable row level security;

create policy "department_notification_emails_select" on public.department_notification_emails
  for select to authenticated using (true);

create policy "department_notification_emails_insert" on public.department_notification_emails
  for insert to authenticated with check (public.is_admin());

create policy "department_notification_emails_update" on public.department_notification_emails
  for update to authenticated using (public.is_admin());

create policy "department_notification_emails_delete" on public.department_notification_emails
  for delete to authenticated using (public.is_admin());

-- ============================================================
-- Dedup log for department-list emails (separate from
-- email_notification_log, which requires a real profile user_id)
-- ============================================================
create table public.department_email_notification_log (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  email        text not null,
  trigger_days integer not null check (trigger_days in (15, 30)),
  sent_at      timestamptz not null default now(),
  unique (task_id, email, trigger_days)
);

alter table public.department_email_notification_log enable row level security;

create policy "department_email_notification_log_select" on public.department_email_notification_log
  for select to authenticated using (true);
