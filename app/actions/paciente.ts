"use server";

import { createClient } from "@/lib/supabase/server";
import { pacienteSchema } from "@/lib/validations/paciente";
import { redirect } from "next/navigation";
import type { Paciente } from "@/types";

// ─── Buscar paciente por DNI ──────────────────────────────────────────────────

export async function buscarPacientePorDNI(dni: string): Promise<Paciente | null> {
    if (!dni || dni.length < 7) return null;

    const supabase = await createClient();
    const { data } = await supabase
        .from("pacientes")
        .select("*")
        .eq("dni", dni.trim())
        .maybeSingle();

    return data;
}

// ─── Guardar / actualizar paciente y redirigir a solicitud ───────────────────

export async function guardarPacienteAction(formData: FormData) {
    const raw = {
        nombre: formData.get("nombre") as string,
        apellido: formData.get("apellido") as string,
        dni: formData.get("dni") as string,
        obra_social: (formData.get("obra_social") as string) || undefined,
    };

    const result = pacienteSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const supabase = await createClient();

    // Upsert: inserta si el DNI no existe, actualiza si ya existe
    const { data: paciente, error: upsertError } = await supabase
        .from("pacientes")
        .upsert(
            {
                nombre: result.data.nombre,
                apellido: result.data.apellido,
                dni: result.data.dni,
                obra_social: result.data.obra_social || null,
            },
            { onConflict: "dni" }
        )
        .select("id")
        .single();

    if (upsertError || !paciente) {
        return { error: "Error al guardar los datos del paciente. Intente nuevamente." };
    }

    redirect(`/solicitud?pid=${paciente.id}`);
}
