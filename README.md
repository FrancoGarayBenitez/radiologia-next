# 🩻 Radiología Mendoza

Aplicación web fullstack para la gestión de solicitudes de estudios radiológicos, con paneles diferenciados para médicos y técnicos.

## 🛠️ Stack

**Next.js 16** · **React 19** · **TypeScript 5** · **Tailwind CSS 4** · **shadcn/ui** · **Supabase (PostgreSQL + Auth + RLS)** · **Zod** · **React Hook Form**

## ✨ Funcionalidades

**Médicos**
- Autenticación con validación de matrícula profesional
- Gestión de pacientes (búsqueda por DNI, creación y edición)
- Creación de solicitudes de estudios: múltiples estudios por solicitud, niveles de urgencia, proyecciones, lateralidad, indicación clínica y cálculo de costo en tiempo real
- Dashboard con KPIs mensuales (solicitudes, facturación estimada, emergencias)
- Historial de solicitudes con detalle expandible

**Técnicos**
- Cola de trabajo ordenada por urgencia (emergencia → urgente → rutina)
- Actualización de estado con validación de transiciones y notas

## 🚀 Cómo ejecutarlo

**1. Clonar e instalar**
```bash
git clone https://github.com/FrancoGarayBenitez/radiologia-next.git
cd radiologia-next
npm install
```

**2. Variables de entorno** — crear `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>
TECNICO_SECRET_CODE=<codigo-secreto>
```

**3. Base de datos** — ejecutar en el editor SQL de Supabase (en orden):
```
supabase/schema.sql
supabase/migration_medicos_rls.sql
supabase/migration_proyecciones.sql
supabase/trigger_new_user.sql
```

**4. Iniciar**
```bash
npm run dev   # http://localhost:3000
```
