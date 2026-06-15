import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrecio } from "@/lib/utils";
import type { EstadoSolicitud, NivelUrgencia } from "@/types";

export const dynamic = "force-dynamic";

const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    completado: "Completado",
    cancelado: "Cancelado",
};

const ESTADO_COLORS: Record<EstadoSolicitud, string> = {
    pendiente: "text-yellow-600 bg-yellow-50 border-yellow-200",
    en_proceso: "text-blue-600 bg-blue-50 border-blue-200",
    completado: "text-green-600 bg-green-50 border-green-200",
    cancelado: "text-slate-500 bg-white border-slate-200",
};

const URGENCIA_LABELS: Record<NivelUrgencia, string> = {
    rutina: "Rutina",
    urgente: "Urgente",
    emergencia: "Emergencia",
};

const ESTADO_BAR_COLORS: Record<EstadoSolicitud, string> = {
    pendiente: "bg-yellow-500",
    en_proceso: "bg-blue-500",
    completado: "bg-green-500",
    cancelado: "bg-slate-300",
};

const URGENCIA_COLORS: Record<NivelUrgencia, string> = {
    rutina: "text-green-600 bg-green-50 border-green-200",
    urgente: "text-yellow-600 bg-yellow-50 border-yellow-200",
    emergencia: "text-red-600 bg-red-50 border-red-200",
};

const URGENCIA_BAR_COLORS: Record<NivelUrgencia, string> = {
    rutina: "bg-green-500",
    urgente: "bg-yellow-500",
    emergencia: "bg-red-500",
};

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: medico } = await supabase
        .from("personal")
        .select("nombre, apellido, rol")
        .eq("id", user.id)
        .single();

    if (medico?.rol === "tecnico") redirect("/tecnico");

    // Inicio y fin del mes actual
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1).toISOString();
    const inicioMesAnterior = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1).toISOString();

    // Solicitudes del mes actual
    const { data: solicitudesMes } = await supabase
        .from("solicitudes")
        .select("id, estado, urgencia, total, created_at")
        .eq("medico_id", user.id)
        .gte("created_at", inicioMes);

    // Solicitudes del mes anterior (para comparar)
    const { data: solicitudesMesAnterior } = await supabase
        .from("solicitudes")
        .select("id")
        .eq("medico_id", user.id)
        .gte("created_at", inicioMesAnterior)
        .lt("created_at", inicioMes);

    // Últimas 5 solicitudes (para tabla reciente)
    const { data: ultimas } = await supabase
        .from("solicitudes")
        .select("id, estado, urgencia, total, created_at, paciente:pacientes(nombre, apellido), solicitud_items(estudio:estudios(region))")
        .eq("medico_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

    const mes = solicitudesMes ?? [];
    const anterior = solicitudesMesAnterior ?? [];

    const totalMes = mes.length;
    const totalAnterior = anterior.length;
    const variacion = totalAnterior > 0
        ? Math.round(((totalMes - totalAnterior) / totalAnterior) * 100)
        : null;

    const facturacionMes = mes.reduce((acc, s) => acc + (s.total ?? 0), 0);

    const emergencias = mes.filter((s) => s.urgencia === "emergencia").length;

    // Conteos por estado
    const porEstado = (["pendiente", "en_proceso", "completado", "cancelado"] as EstadoSolicitud[])
        .map((e) => ({ estado: e, count: mes.filter((s) => s.estado === e).length }));

    // Conteos por urgencia
    const porUrgencia = (["rutina", "urgente", "emergencia"] as NivelUrgencia[])
        .map((u) => ({ urgencia: u, count: mes.filter((s) => s.urgencia === u).length }));

    const nombreMes = ahora.toLocaleString("es-AR", { month: "long", year: "numeric" });

    return (
        <div className="py-8 space-y-8">
            {/* Encabezado */}
            <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        Bienvenido, {medico ? (medico.nombre.toLowerCase().endsWith("a") ? "Dra." : "Dr.") : ""} {medico?.nombre} {medico?.apellido}
                    </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Resumen de actividad — {nombreMes}
                </p>
            </div>

            {/* KPIs principales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs text-slate-600 font-medium">
                        Solicitudes del mes
                    </p>
                    <p className="text-3xl font-bold text-slate-800">{totalMes}</p>
                    {variacion !== null && (
                        <p className={`text-xs font-medium ${variacion >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {variacion >= 0 ? "▲" : "▼"} {Math.abs(variacion)}% vs mes anterior
                        </p>
                    )}
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs text-slate-600 font-medium">
                        Facturación estimada
                    </p>
                    <p className="text-3xl font-bold text-slate-800">{formatPrecio(facturacionMes)}</p>
                    <p className="text-xs text-slate-500">Suma de totales del mes</p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs text-slate-600 font-medium">
                        Emergencias del mes
                    </p>
                    <p className={`text-3xl font-bold ${emergencias > 0 ? "text-red-600" : "text-slate-500"}`}>
                        {emergencias}
                    </p>
                    <p className="text-xs text-slate-500">
                        {porUrgencia.map((u) => `${u.count} ${URGENCIA_LABELS[u.urgencia].toLowerCase()}`).join(" · ")}
                    </p>
                </div>
            </div>

            {/* Desglose estado + urgencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Por estado */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Por estado</h2>
                    <div className="space-y-2">
                        {porEstado.map(({ estado, count }) => (
                            <div key={estado} className="flex items-center justify-between">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 w-24 text-center ${ESTADO_COLORS[estado]}`}>
                                    {ESTADO_LABELS[estado]}
                                </span>
                                <div className="flex items-center gap-2 flex-1 mx-3">
                                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        {count > 0 && (
                                            <div
                                                className={`h-full rounded-full transition-all ${ESTADO_BAR_COLORS[estado]}`}
                                                style={{ width: `${(count / totalMes) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Por urgencia */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Por urgencia</h2>
                    <div className="space-y-2">
                        {porUrgencia.map(({ urgencia, count }) => (
                            <div key={urgencia} className="flex items-center justify-between">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border shrink-0 w-24 text-center ${URGENCIA_COLORS[urgencia]}`}>
                                    {URGENCIA_LABELS[urgencia]}
                                </span>
                                <div className="flex items-center gap-2 flex-1 mx-3">
                                    <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                        {count > 0 && (
                                            <div
                                                className={`h-full rounded-full transition-all ${URGENCIA_BAR_COLORS[urgencia]}`}
                                                style={{ width: `${(count / totalMes) * 100}%` }}
                                            />
                                        )}
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Últimas solicitudes */}
            {ultimas && ultimas.length > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Últimas solicitudes</h2>

                    {/* Encabezados */}
                    <div className="hidden sm:grid grid-cols-12 gap-3 px-1 pb-2 text-xs font-medium text-slate-500 uppercase tracking-wide">
                        <span className="col-span-3">Paciente</span>
                        <span className="col-span-5">Estudios</span>
                        <span className="col-span-2 text-center">Estado</span>
                        <span className="col-span-2 text-right">Monto</span>
                    </div>

                    <div className="divide-y divide-slate-100">
                        {ultimas.map((s) => {
                            const pac = s.paciente as unknown as { nombre: string; apellido: string } | null;
                            const items = s.solicitud_items as unknown as { estudio: { region: string } }[] | null;
                            const estudios = items?.map((i) => i.estudio.region).join(", ") ?? "";
                            return (
                                <div key={s.id} className="grid grid-cols-12 gap-3 py-2.5 text-sm items-center">
                                    <span className="col-span-3 text-slate-700 font-medium truncate">
                                        {pac?.apellido}, {pac?.nombre}
                                    </span>
                                    <span className="col-span-5 text-slate-500 truncate text-xs" title={estudios}>
                                        {estudios}
                                    </span>
                                    <span className={`col-span-2 text-center text-xs px-2 py-0.5 rounded-md border justify-self-center ${ESTADO_COLORS[s.estado as EstadoSolicitud]}`}>
                                        {ESTADO_LABELS[s.estado as EstadoSolicitud]}
                                    </span>
                                    <span className="col-span-2 text-right text-slate-500">{formatPrecio(s.total)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
