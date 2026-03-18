"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { EstadoSolicitud } from "@/types";

const TRANSICIONES_VALIDAS: Record<EstadoSolicitud, EstadoSolicitud[]> = {
    pendiente: ["en_proceso", "cancelado"],
    en_proceso: ["completado", "cancelado"],
    completado: [],
    cancelado: [],
};

const updateSchema = z.object({
    solicitudId: z.coerce.number().int().positive(),
    estado: z.enum(["pendiente", "en_proceso", "completado", "cancelado"]),
    notas: z.string().max(500).optional(),
});

export async function actualizarEstadoAction(formData: FormData) {
    const raw = {
        solicitudId: formData.get("solicitudId"),
        estado: formData.get("estado"),
        notas: formData.get("notas") ?? undefined,
    };

    const parsed = updateSchema.safeParse(raw);
    if (!parsed.success) return { error: "Datos inválidos." };

    const { solicitudId, estado, notas } = parsed.data;

    const supabase = await createClient();

    // Verificar sesión y rol
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return { error: "No autenticado." };

    const { data: medico } = await supabase
        .from("medicos")
        .select("rol")
        .eq("id", user.id)
        .single();

    if (medico?.rol !== "tecnico") return { error: "Sin permisos." };

    // Verificar transición válida
    const { data: actual } = await supabase
        .from("solicitudes")
        .select("estado")
        .eq("id", solicitudId)
        .single();

    if (!actual) return { error: "Solicitud no encontrada." };

    const permitidos = TRANSICIONES_VALIDAS[actual.estado as EstadoSolicitud];
    if (!permitidos.includes(estado)) {
        return { error: `No se puede pasar de "${actual.estado}" a "${estado}".` };
    }

    // Actualizar
    const update: { estado: EstadoSolicitud; notas_tecnico?: string } = { estado };
    if (notas?.trim()) update.notas_tecnico = notas.trim();

    const { error } = await supabase
        .from("solicitudes")
        .update(update)
        .eq("id", solicitudId);

    if (error) return { error: error.message };

    revalidatePath("/tecnico");
    revalidatePath("/historial");
    return { success: true };
}
