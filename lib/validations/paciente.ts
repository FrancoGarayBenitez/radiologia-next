import { z } from "zod";

export const pacienteSchema = z.object({
    nombre: z
        .string()
        .min(1, "El nombre es requerido")
        .max(100, "Nombre demasiado largo"),
    apellido: z
        .string()
        .min(1, "El apellido es requerido")
        .max(100, "Apellido demasiado largo"),
    dni: z
        .string()
        .min(7, "DNI inválido")
        .max(8, "DNI inválido")
        .regex(/^\d+$/, "El DNI solo debe contener números"),
    obra_social: z.string().optional(),
});

export type PacienteInput = z.infer<typeof pacienteSchema>;
