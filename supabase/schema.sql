-- ============================================================
-- RADIOLOGÍA MENDOZA — Schema completo
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================


-- ─── 1. MÉDICOS (extiende auth.users) ────────────────────────
CREATE TABLE IF NOT EXISTS medicos (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre     TEXT NOT NULL,
  apellido   TEXT NOT NULL,
  matricula  TEXT UNIQUE NOT NULL,
  rol        TEXT NOT NULL DEFAULT 'medico' CHECK (rol IN ('medico', 'tecnico')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: cada médico solo ve y edita su propio perfil
ALTER TABLE medicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "medico_select_own" ON medicos
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "medico_insert_own" ON medicos
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "medico_update_own" ON medicos
  FOR UPDATE USING (auth.uid() = id);


-- ─── 2. ESTUDIOS (reemplaza data.json) ───────────────────────
CREATE TABLE IF NOT EXISTS estudios (
  id                    SERIAL PRIMARY KEY,
  region                TEXT NOT NULL,
  precio                NUMERIC(10,2) NOT NULL,
  categoria             TEXT NOT NULL CHECK (categoria IN (
                          'cabeza', 'columna', 'torax_abdomen',
                          'miembro_superior', 'miembro_inferior'
                        )),
  imagen_url            TEXT,
  activo                BOOLEAN DEFAULT TRUE,
  requiere_lateralidad  BOOLEAN DEFAULT FALSE
);

-- Lectura pública para usuarios autenticados
ALTER TABLE estudios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "estudios_select_auth" ON estudios
  FOR SELECT TO authenticated USING (true);


-- ─── 3. PACIENTES ─────────────────────────────────────────────
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


-- ─── 4. SOLICITUDES ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitudes (
  id                 SERIAL PRIMARY KEY,
  medico_id          UUID NOT NULL REFERENCES medicos(id),
  paciente_id        INT NOT NULL REFERENCES pacientes(id),
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

-- Técnico: ve todas las solicitudes (para la cola de trabajo)
CREATE POLICY "solicitudes_tecnico_all" ON solicitudes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM medicos WHERE id = auth.uid() AND rol = 'tecnico'
    )
  );

CREATE POLICY "solicitudes_tecnico_update" ON solicitudes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM medicos WHERE id = auth.uid() AND rol = 'tecnico'
    )
  );


-- ─── 5. ITEMS DE SOLICITUD ────────────────────────────────────
CREATE TABLE IF NOT EXISTS solicitud_items (
  id            SERIAL PRIMARY KEY,
  solicitud_id  INT NOT NULL REFERENCES solicitudes(id) ON DELETE CASCADE,
  estudio_id    INT NOT NULL REFERENCES estudios(id),
  cantidad      INT NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unit   NUMERIC(10,2) NOT NULL,
  lateralidad   TEXT CHECK (lateralidad IN ('izquierdo', 'derecho', 'bilateral'))
);

ALTER TABLE solicitud_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items_medico_own" ON solicitud_items
  FOR ALL USING (
    solicitud_id IN (
      SELECT id FROM solicitudes WHERE medico_id = auth.uid()
    )
  );

CREATE POLICY "items_tecnico_select" ON solicitud_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM medicos WHERE id = auth.uid() AND rol = 'tecnico'
    )
  );


-- ─── 6. DATOS INICIALES — Estudios ───────────────────────────
INSERT INTO estudios (region, precio, categoria, imagen_url, requiere_lateralidad) VALUES
  -- Cabeza
  ('Cráneo completo',              5000,  'cabeza',           'img_craneoCompleto.png', false),
  ('Huesos propios de la nariz',   2000,  'cabeza',           'img_nariz.png',          false),
  ('Senos paranasales',            2000,  'cabeza',           'img_spn.png',            false),
  ('Panorámica dental',            2000,  'cabeza',           'img_dental.png',         false),
  -- Columna
  ('Columna completa',            10000,  'columna',          'img_columnaCompleta.png',false),
  ('Cervical',                     2500,  'columna',          'img_cervical.png',       false),
  ('Dorsal',                       3500,  'columna',          'img_dorsal.png',         false),
  ('Lumbosacra',                   3000,  'columna',          'img_lumbar.png',         false),
  -- Tórax / Abdomen
  ('Tórax',                        5000,  'torax_abdomen',    'img_torax.png',          false),
  ('Abdomen',                      5000,  'torax_abdomen',    'img_abdomen.png',        false),
  ('Pelvis',                       5000,  'torax_abdomen',    'img_pelvis.png',         false),
  -- Miembro superior
  ('Hombro',                       1500,  'miembro_superior', 'img_hombro.png',         true),
  ('Brazo',                        1000,  'miembro_superior', 'img_brazo.png',          true),
  ('Codo',                         1000,  'miembro_superior', 'img_codo.png',           true),
  ('Antebrazo',                    1000,  'miembro_superior', 'img_antebrazo.png',      true),
  ('Muñeca',                       1000,  'miembro_superior', 'img_muñeca.png',         true),
  ('Mano',                         1000,  'miembro_superior', 'img_mano.png',           true),
  -- Miembro inferior
  ('Fémur',                        1500,  'miembro_inferior', 'img_femur.png',          true),
  ('Rodilla',                      1000,  'miembro_inferior', 'img_rodilla.png',        true),
  ('Pierna',                       1000,  'miembro_inferior', 'img_pierna.png',         true),
  ('Tobillo',                      1000,  'miembro_inferior', 'img_tobillo.png',        true),
  ('Pie',                          1000,  'miembro_inferior', 'img_pie.png',            true);
