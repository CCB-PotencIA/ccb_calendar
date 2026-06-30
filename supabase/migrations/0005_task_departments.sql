create table public.task_departments (
  task_id uuid not null references public.tasks(id) on delete cascade,
  department_id uuid not null references public.departments(id) on delete cascade,
  primary key (task_id, department_id)
);

create index task_departments_department_id_idx on public.task_departments(department_id);

alter table public.task_departments enable row level security;

create policy "task_departments_select" on public.task_departments
  for select to authenticated using (true);

create policy "task_departments_insert" on public.task_departments
  for insert to authenticated
  with check (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

create policy "task_departments_delete" on public.task_departments
  for delete to authenticated
  using (
    exists (
      select 1 from public.tasks
      where id = task_id
        and (created_by = auth.uid() or public.is_admin())
    )
  );

insert into public.task_departments (task_id, department_id)
select id, department_id from public.tasks
on conflict do nothing;
