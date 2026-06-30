-- ============================================================
-- TASK SUBTASKS
-- ============================================================
create table public.task_subtasks (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger task_subtasks_updated_at
  before update on public.task_subtasks
  for each row execute function public.handle_updated_at();

alter table public.task_subtasks enable row level security;

create policy "task_subtasks_select" on public.task_subtasks
  for select to authenticated using (true);

create policy "task_subtasks_insert" on public.task_subtasks
  for insert to authenticated
  with check (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

create policy "task_subtasks_update" on public.task_subtasks
  for update to authenticated
  using (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

create policy "task_subtasks_delete" on public.task_subtasks
  for delete to authenticated
  using (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- AUTO-RECOMPUTE task progress from subtasks
-- ============================================================
create or replace function public.recompute_task_progress()
returns trigger as $$
declare
  affected_task_id uuid;
  total_count integer;
  completed_count integer;
begin
  affected_task_id := coalesce(NEW.task_id, OLD.task_id);

  select count(*), count(*) filter (where completed)
    into total_count, completed_count
    from public.task_subtasks
    where task_id = affected_task_id;

  if total_count > 0 then
    update public.tasks
      set progress = round(100.0 * completed_count / total_count)
      where id = affected_task_id;
  end if;

  return coalesce(NEW, OLD);
end;
$$ language plpgsql set search_path = public;

create trigger task_subtasks_recompute_progress
  after insert or update or delete on public.task_subtasks
  for each row execute function public.recompute_task_progress();

-- ============================================================
-- TASK FOLLOWUPS
-- ============================================================
create table public.task_followups (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  label text not null,
  followup_date date,
  completed boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger task_followups_updated_at
  before update on public.task_followups
  for each row execute function public.handle_updated_at();

alter table public.task_followups enable row level security;

create policy "task_followups_select" on public.task_followups
  for select to authenticated using (true);

create policy "task_followups_insert" on public.task_followups
  for insert to authenticated
  with check (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

create policy "task_followups_update" on public.task_followups
  for update to authenticated
  using (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

create policy "task_followups_delete" on public.task_followups
  for delete to authenticated
  using (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

-- ============================================================
-- TASKS: new columns
-- ============================================================
alter table public.tasks add column responsible_tags text[] not null default '{}';

alter table public.tasks add column source_ref text;

-- ============================================================
-- TASKS: drop redundant column (replaced by title)
-- ============================================================
-- tasks_with_status (0003) selects t.* and depends on this column;
-- drop and recreate the view so it picks up the new shape.
drop view public.tasks_with_status;

alter table public.tasks drop column actividad;

create view public.tasks_with_status as
select
  t.*,
  case
    when t.plazo_interno < current_date
      and t.status not in ('completed', 'cancelled') then 'overdue'
    when t.plazo_interno <= current_date + interval '15 days'
      and t.status not in ('completed', 'cancelled') then 'due_soon_15'
    when t.plazo_interno <= current_date + interval '30 days'
      and t.status not in ('completed', 'cancelled') then 'due_soon_30'
    else 'on_track'
  end::text as deadline_status,
  -- Warn if legal deadline is earlier than internal deadline
  (
    t.plazo_legal is not null
    and t.plazo_legal < t.plazo_interno
  ) as legal_deadline_warning,
  array_agg(distinct ta.profile_id)
    filter (where ta.profile_id is not null) as assignee_ids
from public.tasks t
left join public.task_assignees ta on t.id = ta.task_id
group by t.id;

alter view public.tasks_with_status set (security_invoker = true);

grant select on public.tasks_with_status to authenticated;
