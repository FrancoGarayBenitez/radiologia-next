// ─── Autenticación / Usuarios ────────────────────────────────────────────────

export type Rol = "medico" | "tecnico";

export interface Personal {
    id: string;           // UUID — vinculado a auth.users
    nombre: string;
    apellido: string;
    matricula?: string | null;
    rol: Rol;
    created_at: string;
}

// Alias para compatibilidad
export type Medico = Personal;

// ─── Pacientes ────────────────────────────────────────────────────────────────

export interface Paciente {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    obra_social?: string;
    created_at: string;
}

// ─── Estudios (reemplaza data.json) ──────────────────────────────────────────

export type CategoriaAnatomica =
    | "cabeza"
    | "columna"
    | "torax_abdomen"
    | "miembro_superior"
    | "miembro_inferior";

export type Lateralidad = "izquierdo" | "derecho" | "bilateral" | null;

export interface Estudio {
    id: number;
    region: string;
    precio: number;
    categoria: CategoriaAnatomica;
    imagen_url: string | null;
    activo: boolean;
    requiere_lateralidad: boolean;
    proyecciones: string[];   // incidencias disponibles para este estudio
}

// ─── Solicitudes ──────────────────────────────────────────────────────────────

export type EstadoSolicitud = "pendiente" | "en_proceso" | "completado" | "cancelado";

export type NivelUrgencia = "rutina" | "urgente" | "emergencia";

export interface SolicitudItem {
    id: number;
    solicitud_id: number;
    estudio_id: number;
    estudio?: Estudio;       // join opcional
    cantidad: number;
    precio_unit: number;
    lateralidad: Lateralidad;
    proyecciones: string[];  // incidencias solicitadas
}

export interface Solicitud {
    id: number;
    medico_id: string;
    medico?: Medico;          // join opcional
    paciente_id: number;
    paciente?: Paciente;      // join opcional
    estado: EstadoSolicitud;
    urgencia: NivelUrgencia;
    indicacion_clinica: string | null;
    total: number;
    items?: SolicitudItem[];  // join opcional
    notas_tecnico?: string | null;
    created_at: string;
}

// ─── Carrito (estado local en el cliente) ────────────────────────────────────

export interface ItemCarrito {
    estudio: Estudio;
    cantidad: number;
    lateralidad: Lateralidad;
    proyecciones: string[];  // incidencias seleccionadas al agregar
}
