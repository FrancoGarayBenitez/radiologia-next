# 🩻 Radiología Mendoza

Sistema web de gestión de solicitudes de estudios radiológicos para profesionales de la salud en Mendoza, Argentina.

## ✨ Descripción

**Radiología Mendoza** permite a médicos matriculados crear, hacer seguimiento y analizar solicitudes de estudios de diagnóstico por imágenes (radiografías, tomografías, etc.) para sus pacientes. Los técnicos radiólogos disponen de su propio panel para gestionar la cola de trabajo y actualizar el estado de cada solicitud.

---

## 🚀 Funcionalidades principales

### Para médicos
- 🔐 Registro e inicio de sesión con validación de número de matrícula
- 👤 Búsqueda y creación de pacientes por DNI
- 📋 Creación de solicitudes de estudios con:
  - Múltiples estudios por solicitud (agrupados por región anatómica)
  - Niveles de urgencia: **Rutina**, **Urgente**, **Emergencia**
  - Proyecciones / incidencias por estudio
  - Lateralidad (izquierdo, derecho, bilateral)
  - Indicación clínica
  - Cálculo de costo total en tiempo real
- 📊 Panel de analítica con KPIs mensuales (solicitudes, facturación estimada, emergencias)
- 🕓 Historial completo de solicitudes con detalle expandible

### Para técnicos
- 📥 Cola de solicitudes pendientes y en proceso, ordenadas por urgencia
- 🔄 Cambio de estado de solicitudes con validaciones de transición
- 📝 Notas del técnico por solicitud

---

## 🛠️ Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| UI | [React 19](https://react.dev/) + [Tailwind CSS 4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) |
| Base de datos | [Supabase](https://supabase.com/) (PostgreSQL + Auth + RLS) |
| Validación | [Zod 4](https://zod.dev/) + [React Hook Form](https://react-hook-form.com/) |
| Íconos | [Lucide React](https://lucide.dev/) |
| Notificaciones | [Sonner](https://sonner.emilkowal.ski/) |
| Lenguaje | TypeScript 5 (modo estricto) |

---

## ⚙️ Instalación y configuración

### 1. Clonar el repositorio

```bash
git clone https://github.com/FrancoGarayBenitez/radiologia-next.git
cd radiologia-next
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto con el siguiente contenido:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<tu-proyecto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<tu-anon-key>

# Código secreto requerido para registrar técnicos
TECNICO_SECRET_CODE=<tu-codigo-secreto>
```

> Puedes obtener `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` desde **Project Settings → API** en el dashboard de Supabase.

### 4. Configurar la base de datos

Ejecuta los siguientes scripts SQL en el editor SQL del dashboard de Supabase, **en este orden**:

```
supabase/schema.sql
supabase/migration_medicos_rls.sql
supabase/migration_proyecciones.sql
supabase/trigger_new_user.sql
```

### 5. Iniciar el servidor de desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. La raíz redirige automáticamente a `/login`.

---

## 📜 Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compilación optimizada para producción |
| `npm run start` | Servidor de producción (requiere build previo) |
| `npm run lint` | Análisis estático con ESLint |

---

## 🗂️ Estructura del proyecto

```
radiologia-next/
├── app/
│   ├── (auth)/            # Páginas de login y registro
│   ├── (dashboard)/       # Panel principal (médico y técnico)
│   │   ├── dashboard/     # KPIs y analítica del médico
│   │   ├── paciente/      # Búsqueda y creación de pacientes
│   │   ├── solicitud/     # Creación de solicitudes de estudios
│   │   ├── historial/     # Historial de solicitudes del médico
│   │   └── tecnico/       # Cola de trabajo del técnico
│   └── actions/           # Server Actions (auth, paciente, solicitud, técnico)
├── components/
│   ├── ui/                # Componentes base de shadcn/ui
│   ├── auth/              # Formularios de autenticación
│   ├── paciente/          # Componentes de paciente
│   ├── solicitud/         # Grilla de estudios y resumen
│   ├── historial/         # Tarjetas de historial
│   ├── tecnico/           # Gestión de cola del técnico
│   ├── skeletons/         # Esqueletos de carga
│   └── shared/            # Navbar y componentes compartidos
├── lib/
│   ├── supabase/          # Clientes Supabase (server y client)
│   ├── validations/       # Esquemas Zod
│   └── utils.ts           # Utilidades (formatPrecio, formatFecha, cn)
├── types/index.ts         # Interfaces TypeScript
└── supabase/              # Migraciones SQL
```

---

## 🔐 Roles y acceso

| Rol | Acceso |
|-----|--------|
| **Médico** | Dashboard, pacientes, solicitudes, historial |
| **Técnico** | Cola de solicitudes (`/tecnico`) |

El registro de técnicos requiere un **código secreto** configurado en la variable de entorno `TECNICO_SECRET_CODE`. Todos los demás registros crean médicos de forma automática.

---

## 🚢 Despliegue

La forma más sencilla de desplegar la aplicación es usando [Vercel](https://vercel.com):

1. Importa el repositorio en Vercel.
2. Configura las variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `TECNICO_SECRET_CODE`).
3. Haz clic en **Deploy**.

Consulta la [documentación de despliegue de Next.js](https://nextjs.org/docs/app/building-your-application/deploying) para otras opciones de hosting.

---

## 📄 Licencia

Este proyecto es de uso privado. Todos los derechos reservados.
