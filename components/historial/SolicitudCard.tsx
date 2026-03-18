"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatFecha, formatPrecio } from "@/lib/utils";
import type { Solicitud, EstadoSolicitud, NivelUrgencia } from "@/types";

const ESTADO_STYLES: Record<EstadoSolicitud, string> = {
    pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
    en_proceso: "bg-blue-100 text-blue-700 border-blue-300",
    completado: "bg-green-100 text-green-700 border-green-300",
    cancelado: "bg-slate-100 text-slate-500 border-slate-300",
};

const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    completado: "Completado",
    cancelado: "Cancelado",
};

const URGENCIA_STYLES: Record<NivelUrgencia, string> = {
    rutina: "bg-green-100 text-green-700 border-green-300",
    urgente: "bg-yellow-100 text-yellow-700 border-yellow-300",
    emergencia: "bg-red-100 text-red-700 border-red-300",
};

const URGENCIA_ICONS: Record<NivelUrgencia, string> = {
    rutina: "🟢",
    urgente: "🟡",
    emergencia: "🔴",
};

interface Props {
    solicitud: Solicitud;
    onVerDetalle: (solicitud: Solicitud) => void;
}

export function SolicitudCard({ solicitud, onVerDetalle }: Props) {
    const paciente = solicitud.paciente;
    const itemsCount = solicitud.items?.length ?? 0;

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                {/* Bloque principal */}
                <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Paciente */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">
                            {paciente?.apellido}, {paciente?.nombre}
                        </span>
                        <span className="text-slate-400 text-sm">DNI: {paciente?.dni}</span>
                        {paciente?.obra_social && (
                            <span className="text-xs text-slate-500 bg-slate-100 rounded px-1.5 py-0.5">
                                {paciente.obra_social}
                            </span>
                        )}
                    </div>

                    {/* Fecha + urgencia + estado */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-500">
                            {formatFecha(solicitud.created_at)}
                        </span>
                        <span className="text-slate-300">·</span>
                        <Badge
                            variant="outline"
                            className={`text-xs border ${URGENCIA_STYLES[solicitud.urgencia]}`}
                        >
                            {URGENCIA_ICONS[solicitud.urgencia]}{" "}
                            {solicitud.urgencia.charAt(0).toUpperCase() + solicitud.urgencia.slice(1)}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`text-xs border ${ESTADO_STYLES[solicitud.estado]}`}
                        >
                            {ESTADO_LABELS[solicitud.estado]}
                        </Badge>
                    </div>

                    {/* Indicación clínica */}
                    {solicitud.indicacion_clinica && (
                        <p className="text-sm text-slate-500 italic truncate">
                            &ldquo;{solicitud.indicacion_clinica}&rdquo;
                        </p>
                    )}

                    {/* Resumen de ítems */}
                    {solicitud.items && solicitud.items.length > 0 && (
                        <p className="text-xs text-slate-500">
                            {itemsCount} estudio{itemsCount !== 1 ? "s" : ""}:{" "}
                            {solicitud.items
                                .slice(0, 3)
                                .map((i) => i.estudio?.region ?? "—")
                                .join(", ")}
                            {itemsCount > 3 && ` +${itemsCount - 3} más`}
                        </p>
                    )}
                </div>

                {/* Precio total + botón */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 sm:shrink-0">
                    <span className="font-bold text-slate-800 text-base">
                        {formatPrecio(solicitud.total)}
                    </span>
                    <Button
                        size="sm"
                        variant="outline"
                        className="text-xs h-7 px-3"
                        onClick={() => onVerDetalle(solicitud)}
                    >
                        Ver detalle
                    </Button>
                </div>
            </div>
        </div>
    );
}
