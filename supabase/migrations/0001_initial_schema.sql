-- Enable extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================
-- DEPARTMENTS (Vicepresidencias / Unidades CCB)
-- ============================================================
create table public.departments (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  color      text not null default '#004c9e',
  created_at timestamptz not null default now()
);

-- ============================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================
create table public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null unique,
  full_name     text not null default '',
  department_id uuid references public.departments(id) on delete set null,
  role          text not null default 'member' check (role in ('admin', 'member')),
  avatar_url    text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create type task_status   as enum ('pending', 'in_progress', 'completed', 'cancelled');
create type task_priority as enum ('low', 'medium', 'high', 'critical');

create table public.tasks (
  id            uuid primary key default gen_random_uuid(),
  -- From Excel: Tarea
  title         text not null,
  -- From Excel: Actividades (parent activity/project)
  actividad     text,
  -- From Excel: Origen
  origen        text,
  description   text,
  department_id uuid not null references public.departments(id) on delete restrict,
  created_by    uuid not null references public.profiles(id) on delete restrict,
  status        task_status   not null default 'pending',
  priority      task_priority not null default 'medium',
  -- Manual progress 0-100
  progress      integer not null default 0 check (progress >= 0 and progress <= 100),
  start_date    date,
  -- From Excel: Plazo Legal (normative, informational)
  plazo_legal   date,
  -- From Excel: Plazo Interno (main deadline — drives colors and notifications)
  plazo_interno date not null,
  completed_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ============================================================
-- TASK ASSIGNEES (many-to-many)
-- ============================================================
create table public.task_assignees (
  task_id     uuid not null references public.tasks(id) on delete cascade,
  profile_id  uuid not null references public.profiles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (task_id, profile_id)
);

-- ============================================================
-- IN-APP NOTIFICATIONS
-- ============================================================
create type notification_type as enum (
  'task_assigned',
  'task_updated',
  'task_due_soon',
  'task_overdue',
  'task_completed'
);

create table public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  task_id    uuid references public.tasks(id) on delete cascade,
  type       notification_type not null,
  title      text not null,
  body       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- EMAIL NOTIFICATION LOG (dedup guard)
-- ============================================================
create table public.email_notification_log (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  trigger_days integer not null check (trigger_days in (15, 30)),
  sent_at      timestamptz not null default now(),
  unique (task_id, user_id, trigger_days)
);

-- ============================================================
-- INDEXES
-- ============================================================
create index tasks_plazo_interno_idx   on public.tasks (plazo_interno);
create index tasks_plazo_legal_idx     on public.tasks (plazo_legal) where plazo_legal is not null;
create index tasks_status_idx          on public.tasks (status);
create index tasks_department_idx      on public.tasks (department_id);
create index tasks_created_by_idx      on public.tasks (created_by);
create index task_assignees_profile_idx on public.task_assignees (profile_id);
create index notifications_user_unread_idx on public.notifications (user_id, read)
  where read = false;
create index email_log_dedup_idx on public.email_notification_log (task_id, user_id, trigger_days);
