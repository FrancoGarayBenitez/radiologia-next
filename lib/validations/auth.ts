import { z } from "zod";

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, "El email es requerido")
        .email("Ingrese un email válido"),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const registroSchema = z.object({
    nombre: z.string().min(1, "El nombre es requerido"),
    apellido: z.string().min(1, "El apellido es requerido"),
    matricula: z
        .string()
        .min(1, "La matrícula es requerida")
        .regex(/^\d+$/, "La matrícula solo debe contener números"),
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    password: z
        .string()
        .min(6, "La contraseña debe tener al menos 6 caracteres"),
    rol: z.enum(["medico", "tecnico"]),
    // Solo requerido en el servidor cuando rol = tecnico
    codigoTecnico: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegistroInput = z.infer<typeof registroSchema>;
