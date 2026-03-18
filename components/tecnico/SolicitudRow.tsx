"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatFecha, formatPrecio } from "@/lib/utils";
import { CambiarEstadoForm } from "./CambiarEstadoForm";
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

const URGENCIA_BORDER: Record<NivelUrgencia, string> = {
    rutina: "border-l-green-400",
    urgente: "border-l-yellow-400",
    emergencia: "border-l-red-500",
};

const URGENCIA_ICONS: Record<NivelUrgencia, string> = {
    rutina: "🟢",
    urgente: "🟡",
    emergencia: "🔴",
};

const LATERALIDAD_LABELS: Record<string, string> = {
    izquierdo: "Izq.",
    derecho: "Der.",
    bilateral: "Bil.",
};

interface Props {
    solicitud: Solicitud;
}

export function SolicitudRow({ solicitud }: Props) {
    const [expanded, setExpanded] = useState(false);
    const paciente = solicitud.paciente;
    const medico = solicitud.medico;

    return (
        <div
            className={`bg-white border border-slate-200 border-l-4 ${URGENCIA_BORDER[solicitud.urgencia]} rounded-xl overflow-hidden shadow-sm`}
        >
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                <div className="flex-1 min-w-0 space-y-1">
                    {/* Paciente */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-slate-800">
                            {paciente?.apellido}, {paciente?.nombre}
                        </span>
                        <span className="text-slate-400 text-sm">DNI: {paciente?.dni}</span>
                        {paciente?.obra_social && (
                            <span className="text-xs bg-slate-100 text-slate-500 rounded px-1.5 py-0.5">
                                {paciente.obra_social}
                            </span>
                        )}
                    </div>
                    {/* Médico + fecha */}
                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                        <span>
                            Dr/a. {medico?.apellido}, {medico?.nombre}
                        </span>
                        <span className="text-slate-300">·</span>
                        <span>{formatFecha(solicitud.created_at)}</span>
                        <span className="text-slate-300">·</span>
                        <span>
                            {URGENCIA_ICONS[solicitud.urgencia]}{" "}
                            {solicitud.urgencia.charAt(0).toUpperCase() + solicitud.urgencia.slice(1)}
                        </span>
                    </div>
                    {/* Indicación */}
                    {solicitud.indicacion_clinica && (
                        <p className="text-xs text-slate-500 italic truncate">
                            &ldquo;{solicitud.indicacion_clinica}&rdquo;
                        </p>
                    )}
                </div>

                {/* Estado + total + expandir */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <Badge
                        variant="outline"
                        className={`text-xs border ${ESTADO_STYLES[solicitud.estado]}`}
                    >
                        {ESTADO_LABELS[solicitud.estado]}
                    </Badge>
                    <span className="font-bold text-slate-800">{formatPrecio(solicitud.total)}</span>
                    {solicitud.estado !== "completado" && solicitud.estado !== "cancelado" && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 px-3"
                            onClick={() => setExpanded((v) => !v)}
                        >
                            {expanded ? "Cerrar" : "Gestionar"}
                        </Button>
                    )}
                </div>
            </div>

            {/* Detalle expandido */}
            {expanded && (
                <>
                    <Separator />
                    <div className="p-4 bg-slate-50 space-y-4">
                        {/* Lista de estudios */}
                        <div>
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                                Estudios
                            </p>
                            <ul className="space-y-2">
                                {solicitud.items?.map((item) => (
                                    <li key={item.id} className="text-sm text-slate-700">
                                        <div className="flex justify-between items-start gap-2">
                                            <div className="min-w-0">
                                                <span className="font-medium capitalize">
                                                    {item.estudio?.region}
                                                </span>
                                                {item.lateralidad && (
                                                    <span className="text-blue-500 ml-1 text-xs">
                                                        ({LATERALIDAD_LABELS[item.lateralidad] ?? item.lateralidad})
                                                    </span>
                                                )}
                                                {/* Incidencias a realizar */}
                                                {item.proyecciones?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.proyecciones.map((p) => (
                                                            <span
                                                                key={p}
                                                                className="inline-block text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded px-1.5 py-0.5 leading-tight font-medium"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="font-medium shrink-0">
                                                {formatPrecio(item.precio_unit)}
                                            </span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Formulario de cambio de estado */}
                        <CambiarEstadoForm solicitud={solicitud} onDone={() => setExpanded(false)} />
                    </div>
                </>
            )}
        </div>
    );
}
