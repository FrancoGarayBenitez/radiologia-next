import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SolicitudClient } from "@/components/solicitud/SolicitudClient";
import type { Estudio, Paciente } from "@/types";

export default async function SolicitudPage({
    searchParams,
}: {
    searchParams: Promise<{ pid?: string }>;
}) {
    const { pid } = await searchParams;
    if (!pid) redirect("/paciente");

    const supabase = await createClient();

    // Fetch paciente
    const { data: paciente } = await supabase
        .from("pacientes")
        .select("*")
        .eq("id", pid)
        .single();

    if (!paciente) redirect("/paciente");

    // Fetch estudios activos ordenados por categoría y región
    const { data: estudios } = await supabase
        .from("estudios")
        .select("*")
        .eq("activo", true)
        .order("categoria")
        .order("region");

    // Estudios solicitados para este paciente en los últimos 30 días
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentSolicitudes } = await supabase
        .from("solicitudes")
        .select("id")
        .eq("paciente_id", pid)
        .gte("created_at", thirtyDaysAgo.toISOString());

    let recentEstudioIds: number[] = [];
    const recentIds = recentSolicitudes?.map((s) => s.id) ?? [];
    if (recentIds.length > 0) {
        const { data: recentItems } = await supabase
            .from("solicitud_items")
            .select("estudio_id")
            .in("solicitud_id", recentIds);
        recentEstudioIds = [...new Set(recentItems?.map((i) => i.estudio_id) ?? [])];
    }

    return (
        <SolicitudClient
            estudios={(estudios as Estudio[]) ?? []}
            paciente={paciente as Paciente}
            recentEstudioIds={recentEstudioIds}
        />
    );
}
