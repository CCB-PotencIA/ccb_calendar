-- Fix security_definer_view: make the view run with the querying user's
-- permissions so RLS on underlying tables is respected.
alter view public.tasks_with_status set (security_invoker = true);

-- Fix function_search_path_mutable: pin search_path to prevent hijacking.
alter function public.is_admin() set search_path = public;
alter function public.handle_updated_at() set search_path = public;
alter function public.handle_new_user() set search_path = public, auth;
