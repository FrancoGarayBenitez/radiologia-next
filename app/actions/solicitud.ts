"use server";

import { createClient } from "@/lib/supabase/server";
import type { NivelUrgencia, Lateralidad } from "@/types";

interface ItemInput {
    estudio_id: number;
    cantidad: number;
    precio_unit: number;
    lateralidad: Lateralidad;
    proyecciones: string[];
}

interface SolicitudInput {
    paciente_id: number;
    urgencia: NivelUrgencia;
    indicacion_clinica: string;
    items: ItemInput[];
}

export async function guardarSolicitudAction(
    data: SolicitudInput
): Promise<{ error?: string; id?: number }> {
    if (!data.items || data.items.length === 0) {
        return { error: "Debe agregar al menos un estudio" };
    }

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return { error: "Sesión expirada. Por favor inicie sesión nuevamente." };
    }

    const total = data.items.reduce(
        (acc, i) => acc + i.cantidad * i.precio_unit,
        0
    );

    // Insertar cabecera de solicitud
    const { data: solicitud, error: solicitudError } = await supabase
        .from("solicitudes")
        .insert({
            medico_id: user.id,
            paciente_id: data.paciente_id,
            urgencia: data.urgencia,
            indicacion_clinica: data.indicacion_clinica || null,
            total,
        })
        .select("id")
        .single();

    if (solicitudError || !solicitud) {
        return { error: "Error al guardar la solicitud. Intente nuevamente." };
    }

    // Insertar ítems
    const { error: itemsError } = await supabase.from("solicitud_items").insert(
        data.items.map((i) => ({
            solicitud_id: solicitud.id,
            estudio_id: i.estudio_id,
            cantidad: i.proyecciones.length,   // nº de incidencias seleccionadas
            precio_unit: i.precio_unit,         // precio por incidencia
            lateralidad: i.lateralidad ?? null,
            proyecciones: i.proyecciones ?? [],
        }))
    );

    if (itemsError) {
        // Rollback manual: eliminar la cabecera si falló el detalle
        await supabase.from("solicitudes").delete().eq("id", solicitud.id);
        return { error: "Error al guardar los estudios. Intente nuevamente." };
    }

    return { id: solicitud.id };
}
