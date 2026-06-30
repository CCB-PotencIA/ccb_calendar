-- ============================================================
-- AUTO-UPDATE updated_at
-- ============================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ============================================================
-- AUTO-CREATE PROFILE when auth.users row is inserted
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'member')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- VIEW: tasks_with_status
-- Computes deadline_status based on plazo_interno
-- ============================================================
create or replace view public.tasks_with_status as
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

-- Grant read access to authenticated users
grant select on public.tasks_with_status to authenticated;
