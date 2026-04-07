-- ============================================================
-- RADIOLOGÍA MENDOZA — Schema definitivo
-- Base de datos desde cero. Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================


-- ─── 1. PERSONAL (extiende auth.users) ──────────────────────
--   Almacena tanto médicos como técnicos.
--   matricula es opcional: solo aplica a médicos.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS personal (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  apellido   TEXT NOT NULL,
  matricula  TEXT UNIQUE,                   -- NULL para técnicos
  rol        TEXT NOT NULL DEFAULT 'medico' CHECK (rol IN ('medico', 'tecnico')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE personal ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo ve y edita su propio perfil
CREATE POLICY "personal_select_own" ON personal
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "personal_insert_own" ON personal
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "personal_update_own" ON personal
  FOR UPDATE USING (auth.uid() = id);

-- El técnico necesita leer el perfil del médico solicitante (cola de trabajo)
CREATE POLICY "personal_tecnico_read_all" ON personal
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'rol') = 'tecnico'
  );


-- ─── 2. ESTUDIOS ─────────────────────────────────────────────
--   precio = valor por incidencia individual.
--   proyecciones = lista de incidencias disponibles para el estudio.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS estudios (
  id                   SERIAL PRIMARY KEY,
  region               TEXT NOT NULL,
  precio               NUMERIC(10,2) NOT NULL,
  categoria            TEXT NOT NULL CHECK (categoria IN (
                         'cabeza', 'columna', 'torax_abdomen',
                         'miembro_superior', 'miembro_inferior'
                       )),
  imagen_url           TEXT,
  activo               BOOLEAN DEFAULT TRUE,
  requiere_lateralidad BOOLEAN DEFAULT FALSE,
  proyecciones         JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE estudios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estudios_select_auth" ON estudios
  FOR SELECT TO authenticated USING (true);


-- ─── 3. PACIENTES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS pacientes (
  id          SERIAL PRIMARY KEY,
  nombre      TEXT NOT NULL,
  apellido    TEXT NOT NULL,
  dni         TEXT NOT NULL UNIQUE,
  obra_social TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pacientes_select_auth" ON pacientes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "pacientes_insert_auth" ON pacientes
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "pacientes_update_auth" ON pacientes
  FOR UPDATE TO authenticated USING (true);


-- ─── 4. SOLICITUDES ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitudes (
  id                 SERIAL PRIMARY KEY,
  medico_id          UUID NOT NULL REFERENCES personal(id),
  paciente_id        INT  NOT NULL REFERENCES pacientes(id),
  estado             TEXT NOT NULL DEFAULT 'pendiente'
                       CHECK (estado IN ('pendiente', 'en_proceso', 'completado', 'cancelado')),
  urgencia           TEXT NOT NULL DEFAULT 'rutina'
                       CHECK (urgencia IN ('rutina', 'urgente', 'emergencia')),
  indicacion_clinica TEXT,
  notas_tecnico      TEXT,
  total              NUMERIC(10,2) NOT NULL,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE solicitudes ENABLE ROW LEVEL SECURITY;

-- Médico: solo ve sus propias solicitudes
CREATE POLICY "solicitudes_medico_own" ON solicitudes
  FOR ALL USING (auth.uid() = medico_id);

-- Técnico: ve y actualiza todas las solicitudes (cola de trabajo)
CREATE POLICY "solicitudes_tecnico_all" ON solicitudes
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM personal WHERE id = auth.uid() AND rol = 'tecnico')
  );

CREATE POLICY "solicitudes_tecnico_update" ON solicitudes
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM personal WHERE id = auth.uid() AND rol = 'tecnico')
  );


-- ─── 5. ITEMS DE SOLICITUD ───────────────────────────────────
--   proyecciones = incidencias concretas solicitadas en este item.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitud_items (
  id            SERIAL PRIMARY KEY,
  solicitud_id  INT  NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  estudio_id    INT  NOT NULL REFERENCES estudios(id),
  cantidad      INT  NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unit   NUMERIC(10,2) NOT NULL,
  lateralidad   TEXT CHECK (lateralidad IN ('izquierdo', 'derecho', 'bilateral')),
  proyecciones  JSONB NOT NULL DEFAULT '[]'
);

ALTER TABLE solicitud_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_medico_own" ON solicitud_items
  FOR ALL USING (
    solicitud_id IN (SELECT id FROM solicitudes WHERE medico_id = auth.uid())
  );

CREATE POLICY "items_tecnico_select" ON solicitud_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM personal WHERE id = auth.uid() AND rol = 'tecnico')
  );


-- ─── 6. TRIGGER — nuevo usuario ──────────────────────────────
--   Crea el registro en personal automáticamente al registrarse.
--   matricula se almacena solo si viene en los metadatos (médicos).
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.personal (id, nombre, apellido, matricula, rol)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nombre',
    NEW.raw_user_meta_data->>'apellido',
    NULLIF(NEW.raw_user_meta_data->>'matricula', ''),
    COALESCE(NEW.raw_user_meta_data->>'rol', 'medico')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ─── 7. PERMISOS — roles de Supabase ────────────────────────
--   Sin estos GRANTs, el cliente browser (rol authenticated) recibe 403
--   aunque las políticas RLS sean correctas.
-- ─────────────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE        ON personal          TO authenticated;
GRANT SELECT                        ON estudios          TO authenticated;
GRANT SELECT, INSERT, UPDATE        ON pacientes         TO authenticated;
GRANT SELECT, INSERT, UPDATE        ON solicitudes       TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON solicitud_items  TO authenticated;

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;


-- ─── 8. DATOS INICIALES — Catálogo de estudios ───────────────
--   precio = valor por incidencia.
--   proyecciones = incidencias radiológicas disponibles.
-- ─────────────────────────────────────────────────────────────
INSERT INTO estudios (region, precio, categoria, requiere_lateralidad, proyecciones) VALUES

  -- ─── CABEZA ────────────────────────────────────────────────
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

  -- ─── COLUMNA ───────────────────────────────────────────────
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

  -- ─── TÓRAX / ABDOMEN ───────────────────────────────────────
  ('Tórax', 1500, 'torax_abdomen', false,
   '["PA (posteroanterior)", "Lateral izquierdo", "AP (portátil / decúbito)", "Lordótico (ápices)"]'),

  ('Abdomen', 1500, 'torax_abdomen', false,
   '["AP de pie", "AP decúbito dorsal", "Decúbito lateral (Kovats)"]'),

  ('Pelvis', 3000, 'torax_abdomen', false,
   '["AP"]'),

  ('Sacroilíacas', 1000, 'torax_abdomen', false,
   '["AP", "Oblicua derecha", "Oblicua izquierda"]'),

  -- ─── MIEMBRO SUPERIOR ──────────────────────────────────────
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

  -- ─── MIEMBRO INFERIOR ──────────────────────────────────────
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
