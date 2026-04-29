-- ============================================================
-- RADIOLOGÍA MENDOZA — Usuarios demo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- REQUISITO: ejecutar schema.sql primero
--
-- Crea dos usuarios de prueba:
--   · house@demo.com    (rol: médico, matrícula: 4077)
--   · marty@demo.com    (rol: técnico)
-- Contraseña de ambos: Demo1234!
--
-- El trigger on_auth_user_created se encarga de poblar
-- automáticamente la tabla personal con los metadatos.
-- ============================================================

-- IDs fijos para poder referenciarlos o eliminarlos fácilmente
DO $$
DECLARE
  medico_id  UUID := 'a1000000-0000-0000-0000-000000000001';
  tecnico_id UUID := 'a2000000-0000-0000-0000-000000000002';
BEGIN

  -- ─── Médico demo — Dr. Gregory House ───────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'house@demo.com') THEN
    INSERT INTO auth.users (
      id, instance_id,
      aud, role,
      email, encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      medico_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'house@demo.com',
      crypt('Demo1234!', gen_salt('bf')),
      NOW(),
      '{"nombre":"Gregory","apellido":"House","matricula":"4077","rol":"medico"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );
  END IF;

  -- ─── Técnico demo — Marty McFly ────────────────────────────
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'marty@demo.com') THEN
    INSERT INTO auth.users (
      id, instance_id,
      aud, role,
      email, encrypted_password,
      email_confirmed_at,
      raw_user_meta_data,
      created_at, updated_at,
      confirmation_token, email_change,
      email_change_token_new, recovery_token
    ) VALUES (
      tecnico_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'marty@demo.com',
      crypt('Demo1234!', gen_salt('bf')),
      NOW(),
      '{"nombre":"Marty","apellido":"McFly","rol":"tecnico"}'::jsonb,
      NOW(), NOW(),
      '', '', '', ''
    );
  END IF;

END $$;
