# 🩻 Radiología Mendoza

Aplicación web fullstack para la gestión de solicitudes de estudios radiológicos, con paneles diferenciados para médicos y técnicos.

## 🛠️ Stack

**Next.js 16** · **React 19** · **TypeScript 5** · **Tailwind CSS 4** · **shadcn/ui** · **Supabase (PostgreSQL + Auth + RLS)** · **Zod** · **React Hook Form**

## ✨ Funcionalidades

**Médicos**

- Autenticación con validación de matrícula profesional
- Gestión de pacientes (búsqueda por DNI, obra social con autocompletado, creación y edición)
- Creación de solicitudes de estudios: múltiples estudios por solicitud, niveles de urgencia, proyecciones, lateralidad, indicación clínica y cálculo de costo en tiempo real
- Dashboard con KPIs mensuales (solicitudes, facturación estimada, emergencias)
- Historial de solicitudes con detalle expandible

**Técnicos**

- Cola de trabajo ordenada por urgencia (emergencia → urgente → rutina)
- Actualización de estado con validación de transiciones y notas

## 👤 Datos demo

Después de ejecutar `supabase/seed_demo.sql` y `supabase/seed_pacientes_solicitudes.sql`:

### Médico — Dr. Gregory House _(House M.D.)_

| Campo      | Valor                                            |
| ---------- | ------------------------------------------------ |
| Email      | `house@demo.com`                                 |
| Contraseña | `Demo1234!`                                      |
| Matrícula  | `4077`                                           |
| Panel      | `/dashboard` — solicitudes, historial, pacientes |

### Técnico — Marty McFly _(Back to the Future)_

| Campo          | Valor                                          |
| -------------- | ---------------------------------------------- |
| Email          | `marty@demo.com`                               |
| Contraseña     | `Demo1234!`                                    |
| Código técnico | `tec2026` — requerido al registrarse           |
| Panel          | `/tecnico` — cola de trabajo, cambio de estado |

> Los usuarios demo se crean con `email_confirmed_at` ya establecido, por lo que no requieren confirmación de email.

### Pacientes demo

| Nombre | Apellido | DNI | Obra social |
|---|---|---|---|
| Ricardo | Darín | 18234567 | OSDE |
| Mirtha | Legrand | 09876543 | PAMI |
| José | Argento | 23987123 | OSEP |
| Rick | Sánchez | 30112233 | Galeno |
| Guille | Francella | 27555444 | Particular |

Incluye 6 solicitudes demo en distintos estados (pendiente, en_proceso, completado) con variadas urgencias e indicaciones clínicas.

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
supabase/schema.sql                    ← idempotente, se puede re-ejecutar sin errores
supabase/seed_demo.sql                 ← opcional, usuarios de prueba
supabase/seed_pacientes_solicitudes.sql ← opcional, pacientes y solicitudes demo
```

**4. Iniciar**

```bash
npm run dev   # http://localhost:3000
```
