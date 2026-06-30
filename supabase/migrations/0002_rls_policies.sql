-- Enable RLS on all tables
alter table public.departments          enable row level security;
alter table public.profiles             enable row level security;
alter table public.tasks                enable row level security;
alter table public.task_assignees       enable row level security;
alter table public.notifications        enable row level security;
alter table public.email_notification_log enable row level security;

-- ============================================================
-- HELPER: is_admin()
-- ============================================================
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================================
-- DEPARTMENTS
-- ============================================================
create policy "departments_select" on public.departments
  for select to authenticated using (true);

create policy "departments_insert" on public.departments
  for insert to authenticated with check (public.is_admin());

create policy "departments_update" on public.departments
  for update to authenticated using (public.is_admin());

create policy "departments_delete" on public.departments
  for delete to authenticated using (public.is_admin());

-- ============================================================
-- PROFILES
-- ============================================================
create policy "profiles_select" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update" on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin());

create policy "profiles_insert" on public.profiles
  for insert to authenticated
  with check (id = auth.uid() or public.is_admin());

-- ============================================================
-- TASKS
-- ============================================================
create policy "tasks_select" on public.tasks
  for select to authenticated using (true);

create policy "tasks_insert" on public.tasks
  for insert to authenticated
  with check (created_by = auth.uid() or public.is_admin());

create policy "tasks_update" on public.tasks
  for update to authenticated
  using (
    created_by = auth.uid()
    or public.is_admin()
    or exists (
      select 1 from public.task_assignees
      where task_id = tasks.id and profile_id = auth.uid()
    )
  );

create policy "tasks_delete" on public.tasks
  for delete to authenticated
  using (created_by = auth.uid() or public.is_admin());

-- ============================================================
-- TASK ASSIGNEES
-- ============================================================
create policy "task_assignees_select" on public.task_assignees
  for select to authenticated using (true);

create policy "task_assignees_insert" on public.task_assignees
  for insert to authenticated
  with check (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

create policy "task_assignees_delete" on public.task_assignees
  for delete to authenticated
  using (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create policy "notifications_select" on public.notifications
  for select to authenticated using (user_id = auth.uid());

create policy "notifications_update" on public.notifications
  for update to authenticated using (user_id = auth.uid());

-- Inserts only via service role (cron, server actions bypass RLS)
