# AGENTS.md — Radiología Mendoza

## Stack

**Next.js 16.1.6** · **React 19** · **TypeScript 5** · **Tailwind CSS 4** · **shadcn/ui** · **Supabase (PostgreSQL + Auth + RLS)** · **Zod** · **React Hook Form**

## Arquitectura

App Router con dos route groups:

- `(auth)` — páginas públicas (`/login`, `/registro`) con fondo degradado oscuro
- `(dashboard)` — páginas protegidas con `<Navbar>` y layout contenedor

Patrón **Server Components** para fetching de datos; **Client Components** para interactividad.
Server Actions en `app/actions/` para mutations.

## Rutas

| Ruta            | Rol    | Descripción                         |
| --------------- | ------ | ----------------------------------- |
| `/login`        | —      | Inicio de sesión                    |
| `/registro`     | —      | Registro (médico con matrícula, técnico con código secreto) |
| `/dashboard`    | médico | KPIs mensuales, últimas solicitudes |
| `/paciente`     | médico | Búsqueda/creación de paciente       |
| `/solicitud`    | médico | Pedido de estudios (query: `?pid=`) |
| `/historial`    | médico | Historial de solicitudes (realtime) |
| `/tecnico`      | técnico| Cola de trabajo, cambio de estado   |

## Base de datos (Supabase)

6 tablas con RLS por rol:

- **`personal`** — extiende `auth.users` (id FK, rol, matrícula opcional)
- **`estudios`** — catálogo radiológico con precios, proyecciones (JSONB), lateralidad
- **`pacientes`** — pacientes (DNI único, obra_social TEXT)
- **`obras_sociales`** — catálogo de obras sociales (15 valores semilla, usado por combobox)
- **`solicitudes`** — cabecera de pedido (medico_id FK, paciente_id FK, estado, urgencia, total)
- **`solicitud_items`** — ítems del pedido (estudio_id FK, cantidad, lateralidad, proyecciones)

Trigger `handle_new_user()`: crea registro en `personal` al registrarse desde `raw_user_meta_data`.

## Tipos (`types/index.ts`)

Definiciones principales: `Personal`, `Medico`, `Paciente`, `Estudio`, `Solicitud`, `SolicitudItem`, `ItemCarrito`.
Tipos de unión: `Rol`, `CategoriaAnatomica`, `EstadoSolicitud`, `NivelUrgencia`, `Lateralidad`.

## Validaciones (`lib/validations/`)

- `auth.ts` — `loginSchema`, `registroSchema` (incluye validación de matrícula, código técnico)
- `paciente.ts` — `pacienteSchema`

## Componentes

- `ObraSocialCombobox` — combobox con búsqueda (shadcn Popover + Command) para seleccionar obra social

## Server Actions (`app/actions/`)

| Archivo | Acción |
|---------|--------|
| `auth.ts` | `loginAction`, `registroAction`, `logoutAction` |
| `paciente.ts` | `buscarPacientePorDNI`, `guardarPacienteAction`, `obtenerObrasSociales` |

## Hooks personalizados

- `useCarrito()` — carrito de compras local (items, total, agregar/eliminar/limpiar)
- `useSession()` — sesión + perfil con `onAuthStateChange`
- `useHistorialRealtime(initial)` — suscripción Supabase Realtime a cambios en `solicitudes`

## Autenticación

- `proxy.ts` — middleware que refresca sesión, redirige según rol, protege rutas
- `loginAction`, `registroAction`, `logoutAction` en `app/actions/auth.ts`
- Registro de técnico requiere `TECNICO_SECRET_CODE` (variable de entorno)
- El trigger `handle_new_user()` inserta en `personal` automáticamente

## Convenciones

- Preferir Server Components; solo usar `"use client"` cuando sea necesario
- Server Actions tipadas con zod (`safeParse`)
- CSS: Tailwind v4 con `@import "tailwindcss"` en `globals.css` (no archivo `tailwind.config`)
- shadcn/ui con variantes vía `cva()`
- `@/` alias para imports absolutos
- Nomenclatura: PascalCase para componentes, camelCase para funciones/variables
- Loading UI en cada ruta del dashboard con `SolicitudSkeleton`, etc.

## Variables de entorno

| Variable                       | Descripción                            |
| ------------------------------ | -------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`     | URL base de Supabase (sin `/rest/v1/`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`| Anon key pública                       |
| `TECNICO_SECRET_CODE`          | Código para registrar técnicos         |

## Comandos

```bash
npm run dev        # http://localhost:3000 (Turbopack)
npm run build      # Producción
npm run lint       # ESLint
```

## Scripts SQL (ejecutar en Supabase SQL Editor en orden)

1. `supabase/schema.sql` — tablas, RLS, trigger, catálogo de 33 estudios, obras sociales
   (100% idempotente — `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY`)
2. `supabase/seed_demo.sql` — usuarios de prueba (opcional)
3. `supabase/seed_pacientes_solicitudes.sql` — 5 pacientes + 6 solicitudes demo (opcional, famosos argentinos y ficción)

Para reset: `supabase/reset.sql` (destructivo — trunca datos + auth.users), luego schema + seeds.

## Usuarios demo

| Rol     | Email           | Contraseña | Matrícula / Código |
|---------|----------------|------------|-------------------|
| Médico  | house@demo.com  | Demo1234!  | 4077              |
| Técnico | marty@demo.com  | Demo1234!  | tec2026           |

## Pacientes demo

Después de ejecutar `supabase/seed_pacientes_solicitudes.sql`:

| Nombre | Apellido | DNI | Obra social | Inspirado en |
|---|---|---|---|---|
| Ricardo | Darín | 18234567 | OSDE | Actor argentino |
| Mirtha | Legrand | 09876543 | PAMI | Conductora argentina |
| José | Argento | 23987123 | OSEP | Pepe Argento (*Los Simuladores*) |
| Rick | Sánchez | 30112233 | Galeno | *Rick & Morty* |
| Guille | Francella | 27555444 | Particular | Actor argentino |

Incluye 6 solicitudes demo en distintos estados (pendiente, en_proceso, completado) con variadas urgencias e indicaciones clínicas.
