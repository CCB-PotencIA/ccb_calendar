-- ============================================================
-- SEED: Vicepresidencias / Unidades — Cámara de Comercio de Barranquilla
-- ============================================================
-- Update these colors to match the actual department branding
insert into public.departments (name, color) values
  ('Vicepresidencia Jurídica',             '#004c9e'),
  ('Vicepresidencia Comercial',            '#009de2'),
  ('Vicepresidencia de Servicios',         '#2D8A4E'),
  ('Vicepresidencia Financiera',           '#E67E22'),
  ('Vicepresidencia de Competitividad',    '#8B5CF6'),
  ('Gerencia de Sistemas',                 '#0891b2'),
  ('Gerencia de Recursos Humanos',         '#db2777'),
  ('Dirección de Comunicaciones',          '#d97706'),
  ('Presidencia',                          '#1a1a2e'),
  ('Secretaría General',                   '#64748b')
on conflict (name) do nothing;

-- ============================================================
-- NOTE: The admin user must be created via Supabase Auth:
--   npx supabase auth signup --email admin@camarabaq.org.co --password <password>
-- Then update their role:
--   update public.profiles set role = 'admin' where email = 'admin@camarabaq.org.co';
-- ============================================================
