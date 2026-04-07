import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SolicitudRow } from "@/components/tecnico/SolicitudRow";
import type { Solicitud } from "@/types";

export const dynamic = "force-dynamic";

export default async function TecnicoPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    // Verificar rol
    const { data: medico } = await supabase
        .from("personal")
        .select("rol, nombre, apellido")
        .eq("id", user.id)
        .single();

    if (medico?.rol !== "tecnico") redirect("/paciente");

    // Traer solicitudes activas (pendiente + en_proceso) con todos los joins
    const { data, error } = await supabase
        .from("solicitudes")
        .select(
            `*,
            paciente:pacientes(*),
            medico:personal(nombre, apellido, matricula),
            items:solicitud_items(
                *,
                estudio:estudios(*)
            )`
        )
        .in("estado", ["pendiente", "en_proceso"])
        .order("urgencia", { ascending: true })   // emergencia primero (e < p < r)
        .order("created_at", { ascending: true }); // más antiguas primero

    if (error) {
        console.error("Error cargando cola técnico:", error.message);
    }

    const solicitudes = (data ?? []) as Solicitud[];

    // Contadores para el resumen
    const pendientes = solicitudes.filter((s) => s.estado === "pendiente").length;
    const enProceso = solicitudes.filter((s) => s.estado === "en_proceso").length;
    const emergencias = solicitudes.filter((s) => s.urgencia === "emergencia").length;

    return (
        <div className="py-8 space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Cola de trabajo</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Técnico: {medico?.nombre} {medico?.apellido}
                    </p>
                </div>
                <div className="flex gap-3 text-center">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
                        <p className="text-xl font-bold text-yellow-600">{pendientes}</p>
                        <p className="text-xs text-yellow-600">Pendientes</p>
                    </div>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                        <p className="text-xl font-bold text-blue-600">{enProceso}</p>
                        <p className="text-xs text-blue-600">En proceso</p>
                    </div>
                    {emergencias > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                            <p className="text-xl font-bold text-red-600">{emergencias}</p>
                            <p className="text-xs text-red-600">Emergencias</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Lista */}
            {solicitudes.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <p className="text-5xl mb-4">✅</p>
                    <p className="text-lg font-medium text-slate-500">Cola vacía</p>
                    <p className="text-sm">No hay solicitudes pendientes ni en proceso.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {solicitudes.map((s) => (
                        <SolicitudRow key={s.id} solicitud={s} />
                    ))}
                </div>
            )}
        </div>
    );
}
