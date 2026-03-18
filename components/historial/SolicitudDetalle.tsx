"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatFecha, formatPrecio } from "@/lib/utils";
import type { Solicitud, EstadoSolicitud, NivelUrgencia } from "@/types";

const ESTADO_LABELS: Record<EstadoSolicitud, string> = {
    pendiente: "Pendiente",
    en_proceso: "En proceso",
    completado: "Completado",
    cancelado: "Cancelado",
};

const ESTADO_STYLES: Record<EstadoSolicitud, string> = {
    pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
    en_proceso: "bg-blue-100 text-blue-700 border-blue-300",
    completado: "bg-green-100 text-green-700 border-green-300",
    cancelado: "bg-slate-100 text-slate-500 border-slate-300",
};

const URGENCIA_ICONS: Record<NivelUrgencia, string> = {
    rutina: "🟢",
    urgente: "🟡",
    emergencia: "🔴",
};

const LATERALIDAD_LABELS: Record<string, string> = {
    izquierdo: "Izquierdo/a",
    derecho: "Derecho/a",
    bilateral: "Bilateral",
};

interface Props {
    solicitud: Solicitud | null;
    open: boolean;
    onClose: () => void;
}

export function SolicitudDetalle({ solicitud, open, onClose }: Props) {
    if (!solicitud) return null;

    const paciente = solicitud.paciente;

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg">
                        Solicitud #{solicitud.id}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 text-sm">
                    {/* Datos del paciente */}
                    <section className="space-y-1.5">
                        <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wide">
                            Paciente
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-0.5">
                            <p className="font-medium text-slate-800">
                                {paciente?.nombre} {paciente?.apellido}
                            </p>
                            <p className="text-slate-500">DNI: {paciente?.dni}</p>
                            {paciente?.obra_social && (
                                <p className="text-slate-500">Obra social: {paciente.obra_social}</p>
                            )}
                        </div>
                    </section>

                    {/* Metadatos de la solicitud */}
                    <section className="space-y-1.5">
                        <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wide">
                            Solicitud
                        </h3>
                        <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Fecha</span>
                                <span className="font-medium">{formatFecha(solicitud.created_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Estado</span>
                                <Badge
                                    variant="outline"
                                    className={`text-xs border ${ESTADO_STYLES[solicitud.estado]}`}
                                >
                                    {ESTADO_LABELS[solicitud.estado]}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500">Urgencia</span>
                                <span className="font-medium">
                                    {URGENCIA_ICONS[solicitud.urgencia]}{" "}
                                    {solicitud.urgencia.charAt(0).toUpperCase() + solicitud.urgencia.slice(1)}
                                </span>
                            </div>
                            {solicitud.indicacion_clinica && (
                                <div className="pt-1 border-t border-slate-200">
                                    <p className="text-slate-500 mb-0.5">Indicación clínica</p>
                                    <p className="text-slate-700 italic">&ldquo;{solicitud.indicacion_clinica}&rdquo;</p>
                                </div>
                            )}
                            {solicitud.notas_tecnico && (
                                <div className="pt-1 border-t border-slate-200">
                                    <p className="text-slate-500 mb-0.5">Notas del técnico</p>
                                    <p className="text-slate-700">{solicitud.notas_tecnico}</p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Estudios */}
                    {solicitud.items && solicitud.items.length > 0 && (
                        <section className="space-y-1.5">
                            <h3 className="font-semibold text-slate-700 uppercase text-xs tracking-wide">
                                Estudios solicitados
                            </h3>
                            <div className="border border-slate-200 rounded-lg overflow-hidden">
                                <div className="divide-y divide-slate-100">
                                    {solicitud.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start justify-between px-3 py-2.5 gap-3"
                                        >
                                            <div className="min-w-0">
                                                <span className="font-medium text-slate-800 capitalize">
                                                    {item.estudio?.region}
                                                </span>
                                                {item.lateralidad && (
                                                    <span className="text-xs text-blue-600 ml-1.5">
                                                        ({LATERALIDAD_LABELS[item.lateralidad] ?? item.lateralidad})
                                                    </span>
                                                )}
                                                {item.cantidad > 1 && (
                                                    <span className="text-xs text-slate-400 ml-1.5">
                                                        ×{item.cantidad}
                                                    </span>
                                                )}
                                                {/* Incidencias solicitadas */}
                                                {item.proyecciones?.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {item.proyecciones.map((p) => (
                                                            <span
                                                                key={p}
                                                                className="inline-block text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 leading-tight"
                                                            >
                                                                {p}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-slate-700 font-medium shrink-0">
                                                {formatPrecio(item.precio_unit * item.cantidad)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                                <Separator />
                                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50">
                                    <span className="font-semibold text-slate-700">Total</span>
                                    <span className="font-bold text-slate-900 text-base">
                                        {formatPrecio(solicitud.total)}
                                    </span>
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
