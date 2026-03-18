-- ============================================================
-- MIGRACIÓN: Incidencias/proyecciones radiológicas por estudio
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- ─── 1. Agregar columna proyecciones a estudios ───────────────
ALTER TABLE estudios ADD COLUMN IF NOT EXISTS proyecciones JSONB NOT NULL DEFAULT '[]';

-- ─── 2. Agregar columna proyecciones a solicitud_items ────────
ALTER TABLE solicitud_items ADD COLUMN IF NOT EXISTS proyecciones JSONB NOT NULL DEFAULT '[]';

-- ─── 3. Reemplazar catálogo de estudios ──────────────────────
--       (TRUNCATE cascade elimina solicitud_items y solicitudes)
TRUNCATE estudios CASCADE;

-- Reiniciar secuencia
ALTER SEQUENCE estudios_id_seq RESTART WITH 1;

-- ─── 4. Insertar estudios actualizados con técnicas ──────────
-- NOTA: precio = valor por incidencia individual.
-- El total de un estudio = precio × cantidad de incidencias seleccionadas.
INSERT INTO estudios (region, precio, categoria, requiere_lateralidad, proyecciones) VALUES

  -- ─── CABEZA ─────────────────────────────────────────────────
  ('Cráneo completo', 1500, 'cabeza', false,
   '["PA (Caldwell)", "Lateral", "Towne (occipito-frontal 30°)"]'),

  ('Huesos propios de la nariz', 1000, 'cabeza', false,
   '["Lateral", "Waters (occipitomentoniana)"]'),

  ('Senos paranasales', 800, 'cabeza', false,
   '["Waters (occipitomentoniana)", "Caldwell", "Lateral", "Hirtz (submentovertex)"]'),

  ('Órbitas', 800, 'cabeza', false,
   '["Caldwell", "Waters (occipitomentoniana)", "Rhese (canal óptico)"]'),

  ('ATM (Articulación temporomandibular)', 1500, 'cabeza', false,
   '["Transcraneal boca cerrada", "Transcraneal boca abierta"]'),

  ('Panorámica dental (OPG)', 2000, 'cabeza', false,
   '["Panorámica ortogonal"]'),

  -- ─── COLUMNA ────────────────────────────────────────────────
  ('Columna completa', 5000, 'columna', false,
   '["AP bipedestación", "Lateral bipedestación"]'),

  ('Cervical', 700, 'columna', false,
   '["AP", "Lateral", "Oblicua derecha", "Oblicua izquierda", "AP boca abierta (odontoides)", "Flexión lateral", "Extensión lateral"]'),

  ('Dorsal', 1500, 'columna', false,
   '["AP", "Lateral"]'),

  ('Lumbosacra', 700, 'columna', false,
   '["AP", "Lateral", "Oblicua derecha (L-L)", "Oblicua izquierda (L-L)", "Flexión lateral", "Extensión lateral", "Ferguson (L5-S1)"]'),

  ('Sacro', 1000, 'columna', false,
   '["AP angulada", "Lateral"]'),

  ('Coxis', 1000, 'columna', false,
   '["AP", "Lateral"]'),

  -- ─── TÓRAX / ABDOMEN ────────────────────────────────────────
  ('Tórax', 1500, 'torax_abdomen', false,
   '["PA (posteroanterior)", "Lateral izquierdo", "AP (portátil / decúbito)", "Lordótico (ápices)"]'),

  ('Abdomen', 1500, 'torax_abdomen', false,
   '["AP de pie", "AP decúbito dorsal", "Decúbito lateral (Kovats)"]'),

  ('Pelvis', 3000, 'torax_abdomen', false,
   '["AP"]'),

  ('Sacroilíacas', 1000, 'torax_abdomen', false,
   '["AP", "Oblicua derecha", "Oblicua izquierda"]'),

  -- ─── MIEMBRO SUPERIOR ───────────────────────────────────────
  ('Hombro', 600, 'miembro_superior', true,
   '["AP rotación interna", "AP rotación externa", "Axial (transaxilar)", "Perfil en Y (Neer / escápula)", "Outlet"]'),

  ('Escápula', 700, 'miembro_superior', true,
   '["AP", "Lateral en Y"]'),

  ('Clavícula', 500, 'miembro_superior', true,
   '["AP", "AP angulada 15° cefálico"]'),

  ('Brazo', 500, 'miembro_superior', true,
   '["AP", "Lateral"]'),

  ('Codo', 400, 'miembro_superior', true,
   '["AP", "Lateral", "Oblicua interna", "Oblicua externa"]'),

  ('Antebrazo', 500, 'miembro_superior', true,
   '["AP", "Lateral"]'),

  ('Muñeca', 400, 'miembro_superior', true,
   '["AP", "Lateral", "Oblicua (semipronación)", "Escafoides (desviación cubital)"]'),

  ('Mano', 400, 'miembro_superior', true,
   '["AP (dorsopalmar)", "Oblicua", "Lateral"]'),

  ('Dedos (mano)', 350, 'miembro_superior', true,
   '["AP", "Lateral", "Oblicua"]'),

  -- ─── MIEMBRO INFERIOR ───────────────────────────────────────
  ('Cadera', 600, 'miembro_inferior', true,
   '["AP", "Axial (Lauenstein / posición de rana)", "Falso perfil (Lequesne)"]'),

  ('Fémur', 700, 'miembro_inferior', true,
   '["AP", "Lateral"]'),

  ('Rodilla', 400, 'miembro_inferior', true,
   '["AP", "Lateral", "Axial de rótula (Merchant / Sunrise)", "Túnel intercondíleo (Rosenberg / Notch)"]'),

  ('Pierna', 500, 'miembro_inferior', true,
   '["AP", "Lateral"]'),

  ('Tobillo', 400, 'miembro_inferior', true,
   '["AP", "Lateral", "Oblicua (mortaja / 20° oblicuo)"]'),

  ('Pie', 400, 'miembro_inferior', true,
   '["AP", "Oblicua (45°)", "Lateral"]'),

  ('Pie con carga', 500, 'miembro_inferior', true,
   '["AP con carga bipodal", "AP con carga monopodal", "Lateral con carga"]'),

  ('Calcáneo', 500, 'miembro_inferior', true,
   '["Axial (Harris / plantar)", "Lateral"]'),

  ('Dedos (pie)', 350, 'miembro_inferior', true,
   '["AP", "Lateral", "Oblicua"]');
