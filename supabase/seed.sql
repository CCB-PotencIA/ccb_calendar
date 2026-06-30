-- ============================================================
-- SEED: Vicepresidencias / Unidades — Cámara de Comercio de Barranquilla
-- ============================================================
-- Update these colors to match the actual department branding
insert into public.departments (name) values
  ('Secretaría General'),
  ('Conexiones'),
  ('Control Interno'),
  ('Comunicaciones'),
  ('Financiera'),
  ('Administrativa'),
  ('Compras'),
  ('VP Registro y TD')
on conflict (name) do nothing;

-- ============================================================
-- NOTE: The admin user must be created via Supabase Auth:
--   npx supabase auth signup --email admin@camarabaq.org.co --password <password>
-- Then update their role:
--   update public.profiles set role = 'admin' where email = 'admin@camarabaq.org.co';
-- ============================================================
