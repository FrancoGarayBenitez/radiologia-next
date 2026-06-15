"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal } from "lucide-react";
import { formatFecha } from "@/lib/utils";
import { actualizarEstadoAction } from "@/app/actions/tecnico";
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

const CARD_BORDER: Record<EstadoSolicitud, string> = {
    pendiente: "border-slate-200",
    en_proceso: "border-blue-300",
    completado: "border-slate-200",
    cancelado: "border-slate-200",
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
    const [isPending, startTransition] = useTransition();
    const paciente = solicitud.paciente;
    const medico = solicitud.medico;

    function handleDirectAction(nuevoEstado: EstadoSolicitud) {
        const fd = new FormData();
        fd.append("solicitudId", String(solicitud.id));
        fd.append("estado", nuevoEstado);
        startTransition(async () => {
            await actualizarEstadoAction(fd);
        });
    }

    return (
        <div
            className={`bg-white border ${CARD_BORDER[solicitud.estado]} border-l-4 ${URGENCIA_BORDER[solicitud.urgencia]} rounded-xl overflow-hidden shadow-sm`}
        >
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                <div
                    className="flex-1 min-w-0 space-y-1 cursor-pointer"
                    onClick={() => setExpanded((v) => !v)}
                >
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
                    {/* Estudios — visibles sin expandir */}
                    {solicitud.items && solicitud.items.length > 0 && (
                        <div className="flex flex-wrap gap-x-2 gap-y-1.5 mt-1.5">
                            {solicitud.items.map((item) => (
                                <span key={item.id} className="inline-flex flex-wrap items-center gap-1">
                                    <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-0.5 leading-tight">
                                        {item.estudio?.region}
                                        {item.lateralidad && (
                                            <span className="text-blue-400">
                                                ({LATERALIDAD_LABELS[item.lateralidad] ?? item.lateralidad})
                                            </span>
                                        )}
                                    </span>
                                    {item.proyecciones?.map((p) => (
                                        <span
                                            key={p}
                                            className="text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 leading-tight"
                                        >
                                            {p}
                                        </span>
                                    ))}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Estado + acciones */}
                <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
                    <Badge
                        variant="outline"
                        className={`text-xs border ${ESTADO_STYLES[solicitud.estado]}`}
                    >
                        {ESTADO_LABELS[solicitud.estado]}
                    </Badge>
                    <div className="flex sm:flex-col items-center gap-1.5">
                        {solicitud.estado === "pendiente" && (
                            <Button
                                size="sm"
                                className="text-xs h-7 px-3"
                                disabled={isPending}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectAction("en_proceso");
                                }}
                            >
                                {isPending ? "…" : "Iniciar estudio"}
                            </Button>
                        )}
                        {solicitud.estado === "en_proceso" && (
                            <Button
                                size="sm"
                                className="text-xs h-7 px-3 bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={isPending}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDirectAction("completado");
                                }}
                            >
                                {isPending ? "…" : "Finalizar estudio"}
                            </Button>
                        )}
                        <Button
                            size="icon"
                            variant="ghost"
                            className="size-6"
                            onClick={(e) => {
                                e.stopPropagation();
                                setExpanded((v) => !v);
                            }}
                        >
                            <MoreHorizontal className="size-4 text-slate-400" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Detalle expandido */}
            {expanded && (
                <>
                    <Separator />
                    <div className="p-4 bg-slate-50 space-y-4">
                        <CambiarEstadoForm solicitud={solicitud} onDone={() => setExpanded(false)} />
                    </div>
                </>
            )}
        </div>
    );
}
