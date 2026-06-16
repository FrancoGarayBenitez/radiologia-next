-- ============================================================
-- RADIOLOGÍA MENDOZA — Pacientes y solicitudes demo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- REQUISITO: ejecutar schema.sql y seed_demo.sql primero
--
-- Crea 5 pacientes famosos y 6 solicitudes demo con distintos
-- estados, urgencias e indicaciones clínicas.
-- 100% idempotente (usa ON CONFLICT).
-- ============================================================

-- ─── 1. PACIENTES ────────────────────────────────────────────
INSERT INTO pacientes (nombre, apellido, dni, obra_social) VALUES
  ('Ricardo', 'Darín',      '18234567', 'OSDE'),
  ('Mirtha',  'Legrand',    '09876543', 'PAMI'),
  ('José',    'Argento',    '23987123', 'OSEP'),
  ('Rick',    'Sánchez',    '30112233', 'Galeno'),
  ('Guille',  'Francella',  '27555444', 'Particular')
ON CONFLICT (dni) DO NOTHING;

-- ─── 2. SOLICITUDES ──────────────────────────────────────────
DO $$
DECLARE
  medico_id  UUID := 'a1000000-0000-0000-0000-000000000001';
  pac1_id INT; -- Ricardo Darín
  pac2_id INT; -- Mirtha Legrand
  pac3_id INT; -- Pepe Argento
  pac4_id INT; -- Rick Sánchez
  pac5_id INT; -- Guille Francella
  sol1_id INT; sol2_id INT; sol3_id INT;
  sol4_id INT; sol5_id INT; sol6_id INT;
BEGIN
  -- Obtener IDs de pacientes
  SELECT id INTO pac1_id FROM pacientes WHERE dni = '18234567';
  SELECT id INTO pac2_id FROM pacientes WHERE dni = '09876543';
  SELECT id INTO pac3_id FROM pacientes WHERE dni = '23987123';
  SELECT id INTO pac4_id FROM pacientes WHERE dni = '30112233';
  SELECT id INTO pac5_id FROM pacientes WHERE dni = '27555444';

  -- ─── Solicitud 1 ────────────────────────────────────────────
  -- Mirtha Legrand — Lumbosacra — emergencia — pendiente
  INSERT INTO solicitudes
    (medico_id, paciente_id, estado, urgencia, indicacion_clinica, total, created_at)
  VALUES
    (medico_id, pac2_id, 'pendiente', 'emergencia',
     'Dolor lumbar agudo con irradiación a miembro inferior izquierdo. Sospecha de hernia de disco.',
     700, NOW() - INTERVAL '30 minutes')
  RETURNING id INTO sol1_id;

  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol1_id, 10, 1, 700, NULL, '["AP", "Lateral"]');

  -- ─── Solicitud 2 ────────────────────────────────────────────
  -- Pepe Argento — Tórax + Abdomen — urgente — pendiente
  INSERT INTO solicitudes
    (medico_id, paciente_id, estado, urgencia, indicacion_clinica, total, created_at)
  VALUES
    (medico_id, pac3_id, 'pendiente', 'urgente',
     'Dolor torácico y distensión abdominal. Descartar compromiso pleuropulmonar.',
     3000, NOW() - INTERVAL '2 hours')
  RETURNING id INTO sol2_id;

  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol2_id, 13, 1, 1500, NULL, '["PA (posteroanterior)", "Lateral izquierdo"]');
  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol2_id, 14, 1, 1500, NULL, '["AP de pie"]');

  -- ─── Solicitud 3 ────────────────────────────────────────────
  -- Rick Sánchez — Hombro derecho — en_proceso — rutina
  INSERT INTO solicitudes
    (medico_id, paciente_id, estado, urgencia, indicacion_clinica, total, created_at)
  VALUES
    (medico_id, pac4_id, 'en_proceso', 'rutina',
     'Limitación funcional y dolor en hombro derecho post caída. Evaluar lesión de manguito rotador.',
     600, NOW() - INTERVAL '1 day')
  RETURNING id INTO sol3_id;

  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol3_id, 17, 1, 600, 'derecho', '["AP rotación externa", "Axial (transaxilar)"]');

  -- ─── Solicitud 4 ────────────────────────────────────────────
  -- Ricardo Darín — Cráneo completo — completado — rutina
  INSERT INTO solicitudes
    (medico_id, paciente_id, estado, urgencia, indicacion_clinica, total, created_at)
  VALUES
    (medico_id, pac1_id, 'completado', 'rutina',
     'Cefaleas crónicas de evolución tórpida. Control imagenológico de rutina.',
     1500, NOW() - INTERVAL '3 days')
  RETURNING id INTO sol4_id;

  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol4_id, 1, 1, 1500, NULL, '["PA (Caldwell)", "Lateral", "Towne (occipito-frontal 30°)"]');

  -- ─── Solicitud 5 ────────────────────────────────────────────
  -- Guille Francella — Rodilla izquierda — pendiente — rutina
  INSERT INTO solicitudes
    (medico_id, paciente_id, estado, urgencia, indicacion_clinica, total, created_at)
  VALUES
    (medico_id, pac5_id, 'pendiente', 'rutina',
     'Gonalgia izquierda post deportiva con derrame. Descartar lesión meniscal.',
     400, NOW() - INTERVAL '1 hour')
  RETURNING id INTO sol5_id;

  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol5_id, 28, 1, 400, 'izquierdo', '["AP", "Lateral"]');

  -- ─── Solicitud 6 ────────────────────────────────────────────
  -- Pepe Argento — Cervical — urgente — pendiente (segunda solicitud)
  INSERT INTO solicitudes
    (medico_id, paciente_id, estado, urgencia, indicacion_clinica, total, created_at)
  VALUES
    (medico_id, pac3_id, 'pendiente', 'urgente',
     'Cervicalgia postural con parestesias en miembro superior derecho. Evaluación de conductos neurales.',
     700, NOW() - INTERVAL '1 day')
  RETURNING id INTO sol6_id;

  INSERT INTO solicitud_items (solicitud_id, estudio_id, cantidad, precio_unit, lateralidad, proyecciones)
  VALUES (sol6_id, 8, 1, 700, NULL, '["AP", "Lateral", "Oblicua derecha", "Oblicua izquierda"]');
END $$;
