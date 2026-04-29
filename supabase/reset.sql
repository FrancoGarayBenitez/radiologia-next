-- ============================================================
-- RADIOLOGÍA MENDOZA — Reset completo de base de datos
-- ⚠️  DESTRUYE TODOS LOS DATOS. Usar solo en entornos de prueba.
--
-- Pasos recomendados luego del reset:
--   1. reset.sql          ← este archivo
--   2. schema.sql         ← recrea tablas, RLS, catálogo de estudios
--   3. seed_demo.sql      ← usuarios demo
-- ============================================================


-- ─── 1. Limpiar tablas del schema public (orden por FK) ──────
TRUNCATE TABLE
  public.solicitud_items,
  public.solicitudes,
  public.personal,
  public.pacientes,
  public.estudios
RESTART IDENTITY CASCADE;


-- ─── 2. Eliminar usuarios existentes en auth.users ───────────
--   Incluye los dos usuarios de prueba previos:
--     · demo-medico@mail.com   (25692332-3ece-4f05-8484-515f45ca4598)
--     · demo-tecnico@mail.com  (7b9b1b42-066f-4120-900e-437052285fb6)
--   y cualquier otro usuario registrado.
--
--   La FK personal.id → auth.users ON DELETE CASCADE ya eliminó
--   los registros de personal en el paso anterior; aquí limpiamos
--   la tabla de autenticación completa.
DELETE FROM auth.users;


-- ─── 3. Verificación ─────────────────────────────────────────
SELECT 'auth.users'      AS tabla, COUNT(*) AS filas FROM auth.users
UNION ALL
SELECT 'personal',        COUNT(*) FROM public.personal
UNION ALL
SELECT 'pacientes',       COUNT(*) FROM public.pacientes
UNION ALL
SELECT 'estudios',        COUNT(*) FROM public.estudios
UNION ALL
SELECT 'solicitudes',     COUNT(*) FROM public.solicitudes
UNION ALL
SELECT 'solicitud_items', COUNT(*) FROM public.solicitud_items;
-- Todas las filas deben ser 0 antes de continuar con schema.sql
