import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HistorialClient } from "@/components/historial/HistorialClient";
import type { Solicitud } from "@/types";

export const dynamic = "force-dynamic";

export default async function HistorialPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data, error } = await supabase
        .from("solicitudes")
        .select(
            `*,
            paciente:pacientes(*),
            items:solicitud_items(
                *,
                estudio:estudios(*)
            )`
        )
        .eq("medico_id", user.id)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error cargando historial:", error.message);
    }

    const solicitudes = (data ?? []) as Solicitud[];

    return (
        <div className="py-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Historial de solicitudes</h1>
                <p className="text-slate-500 text-sm mt-1">
                    Todas las solicitudes generadas por vos.
                </p>
            </div>

            {solicitudes.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                    <p className="text-5xl mb-4">📂</p>
                    <p className="text-lg font-medium text-slate-500">Sin solicitudes aún</p>
                    <p className="text-sm">
                        Una vez que generes tu primer solicitud, aparecerá aquí.
                    </p>
                </div>
            ) : (
                <HistorialClient solicitudes={solicitudes} />
            )}
        </div>
    );
}
