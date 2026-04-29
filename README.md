# 🩻 Radiología Mendoza

Aplicación web fullstack para la gestión de solicitudes de estudios radiológicos, con paneles diferenciados para médicos y técnicos.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/FrancoGarayBenitez/radiologia-next)

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

---

## 🚀 Despliegue en Vercel

### 1. Supabase — configurar proyecto

1. Crear un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecutar los scripts en este orden:
   ```
   supabase/schema.sql      ← tablas, RLS, trigger, catálogo completo
   supabase/seed_demo.sql   ← usuarios de prueba (opcional)
   ```
3. Copiar **Project URL** y **anon public key** desde _Settings → API_.

> **Reset:** si necesitás limpiar la base antes de ejecutar schema.sql, corré primero `supabase/reset.sql`. Elimina todos los datos (incluyendo `auth.users`) y reinicia las secuencias.

> `trigger_new_user.sql` es solo una copia de referencia del trigger; ya está incluido en `schema.sql`. No es necesario ejecutarlo.

### 2. Vercel — importar repositorio

1. Ir a [vercel.com/new](https://vercel.com/new) e importar el repositorio de GitHub.
2. Framework: **Next.js** (detectado automáticamente).
3. En **Environment Variables**, agregar:

| Variable                        | Valor                                    |
| ------------------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key del proyecto Supabase           |
| `TECNICO_SECRET_CODE`           | Código secreto para registro de técnicos |

4. Hacer clic en **Deploy**.

---

## 👤 Usuarios demo

Después de ejecutar `supabase/seed_demo.sql`, los siguientes usuarios están disponibles:

### Médico — Dr. Gregory House _(House M.D.)_

| Campo      | Valor                                            |
| ---------- | ------------------------------------------------ |
| Email      | `house@demo.com`                                 |
| Contraseña | `Demo1234!`                                      |
| Matrícula  | `4077`                                           |
| Panel      | `/dashboard` — solicitudes, historial, pacientes |

### Técnico — Marty McFly _(Back to the Future)_

| Campo      | Valor                                          |
| ---------- | ---------------------------------------------- |
| Email      | `marty@demo.com`                               |
| Contraseña | `Demo1234!`                                    |
| Panel      | `/tecnico` — cola de trabajo, cambio de estado |

> Los usuarios demo se crean con `email_confirmed_at` ya establecido, por lo que no requieren confirmación de email.

---

## 💻 Desarrollo local

**1. Clonar e instalar**

```bash
git clone https://github.com/FrancoGarayBenitez/radiologia-next.git
cd radiologia-next
npm install
```

**2. Variables de entorno** — copiar y completar:

```bash
cp .env.example .env.local
```

**3. Base de datos** — ejecutar en el editor SQL de Supabase:

```
supabase/schema.sql
supabase/seed_demo.sql   ← opcional, usuarios de prueba
```

**4. Iniciar**

```bash
npm run dev   # http://localhost:3000
```
