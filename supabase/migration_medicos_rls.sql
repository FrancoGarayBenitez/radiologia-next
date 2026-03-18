-- ============================================================
-- FIX: Permitir que el técnico lea datos de otros médicos
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- ============================================================

-- El técnico necesita ver nombre/apellido del médico solicitante
-- en su cola de trabajo. La política actual solo permite que cada
-- médico vea su propio registro.

-- Ampliar la política de lectura usando los metadatos del JWT
-- (no genera recursión en RLS).
CREATE POLICY "medicos_tecnico_read_all" ON medicos
  FOR SELECT USING (
    (auth.jwt() -> 'user_metadata' ->> 'rol') = 'tecnico'
  );
