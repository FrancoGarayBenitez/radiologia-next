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
    cancelado: "text-slate-500 bg-slate-50 border-slate-200",
};

const URGENCIA_LABELS: Record<NivelUrgencia, string> = {
    rutina: "🟢 Rutina",
    urgente: "🟡 Urgente",
    emergencia: "🔴 Emergencia",
};

export default async function DashboardPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) redirect("/login");

    const { data: medico } = await supabase
        .from("medicos")
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
        .select("id, estado, urgencia, total, created_at, paciente:pacientes(nombre, apellido)")
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
                    Bienvenido/a, Dr/a. {medico?.nombre} {medico?.apellido}
                </h1>
                <p className="text-slate-500 text-sm mt-1 capitalize">
                    Resumen de actividad — {nombreMes}
                </p>
            </div>

            {/* KPIs principales */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                        Solicitudes del mes
                    </p>
                    <p className="text-3xl font-bold text-slate-800">{totalMes}</p>
                    {variacion !== null && (
                        <p className={`text-xs font-medium ${variacion >= 0 ? "text-green-600" : "text-red-500"}`}>
                            {variacion >= 0 ? "▲" : "▼"} {Math.abs(variacion)}% vs mes anterior
                        </p>
                    )}
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                        Facturación estimada
                    </p>
                    <p className="text-3xl font-bold text-slate-800">{formatPrecio(facturacionMes)}</p>
                    <p className="text-xs text-slate-400">Suma de totales del mes</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">
                        Emergencias del mes
                    </p>
                    <p className="text-3xl font-bold text-red-600">
                        {mes.filter((s) => s.urgencia === "emergencia").length}
                    </p>
                    <p className="text-xs text-slate-400">
                        {mes.filter((s) => s.urgencia === "urgente").length} urgentes
                    </p>
                </div>
            </div>

            {/* Desglose estado + urgencia */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Por estado */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Por estado</h2>
                    <div className="space-y-2">
                        {porEstado.map(({ estado, count }) => (
                            <div key={estado} className="flex items-center justify-between">
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-md border ${ESTADO_COLORS[estado]}`}>
                                    {ESTADO_LABELS[estado]}
                                </span>
                                <div className="flex items-center gap-2 flex-1 mx-3">
                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-slate-400 rounded-full transition-all"
                                            style={{ width: totalMes > 0 ? `${(count / totalMes) * 100}%` : "0%" }}
                                        />
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-slate-700 w-6 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Por urgencia */}
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Por urgencia</h2>
                    <div className="space-y-2">
                        {porUrgencia.map(({ urgencia, count }) => (
                            <div key={urgencia} className="flex items-center justify-between">
                                <span className="text-xs font-medium w-28">{URGENCIA_LABELS[urgencia]}</span>
                                <div className="flex items-center gap-2 flex-1 mx-3">
                                    <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full transition-all"
                                            style={{ width: totalMes > 0 ? `${(count / totalMes) * 100}%` : "0%" }}
                                        />
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
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                    <h2 className="text-sm font-semibold text-slate-700 mb-4">Últimas solicitudes</h2>
                    <div className="divide-y divide-slate-100">
                        {ultimas.map((s) => {
                            const pac = s.paciente as unknown as { nombre: string; apellido: string } | null;
                            return (
                                <div key={s.id} className="flex items-center justify-between py-2.5 gap-3 text-sm">
                                    <span className="text-slate-700 font-medium min-w-0 truncate">
                                        {pac?.apellido}, {pac?.nombre}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-md border shrink-0 ${ESTADO_COLORS[s.estado as EstadoSolicitud]}`}>
                                        {ESTADO_LABELS[s.estado as EstadoSolicitud]}
                                    </span>
                                    <span className="text-slate-500 shrink-0">{formatPrecio(s.total)}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
