-- ============================================================
-- SEED: Vicepresidencias / Unidades — Cámara de Comercio de Barranquilla
-- ============================================================
-- Update these colors to match the actual department branding
insert into public.departments (name, color) values
  ('Secretaría General', '#004c9e'),
  ('Conexiones', '#009de2'),
  ('Control Interno', '#6366f1'),
  ('Comunicaciones', '#db2777'),
  ('Financiera', '#8B5CF6'),
  ('Administrativa', '#0891b2'),
  ('Compras', '#a16207'),
  ('VP Registro y TD', '#64748b')
on conflict (name) do nothing;

-- ============================================================
-- NOTE: The admin user must be created via Supabase Auth:
--   npx supabase auth signup --email admin@camarabaq.org.co --password <password>
-- Then update their role:
--   update public.profiles set role = 'admin' where email = 'admin@camarabaq.org.co';
-- ============================================================
