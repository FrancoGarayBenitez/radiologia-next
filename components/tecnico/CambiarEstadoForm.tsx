"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { actualizarEstadoAction } from "@/app/actions/tecnico";
import type { Solicitud, EstadoSolicitud } from "@/types";

const SIGUIENTE_ESTADO: Record<EstadoSolicitud, EstadoSolicitud | null> = {
    pendiente: "en_proceso",
    en_proceso: "completado",
    completado: null,
    cancelado: null,
};

const BOTON_LABELS: Record<EstadoSolicitud, string> = {
    pendiente: "Tomar → En proceso",
    en_proceso: "Marcar como completado",
    completado: "",
    cancelado: "",
};

interface Props {
    solicitud: Solicitud;
    onDone: () => void;
}

export function CambiarEstadoForm({ solicitud, onDone }: Props) {
    const [notas, setNotas] = useState(solicitud.notas_tecnico ?? "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const siguiente = SIGUIENTE_ESTADO[solicitud.estado];
    if (!siguiente) return null;

    function handleSubmit(nuevoEstado: EstadoSolicitud) {
        setError(null);
        startTransition(async () => {
            const fd = new FormData();
            fd.append("solicitudId", String(solicitud.id));
            fd.append("estado", nuevoEstado);
            if (notas.trim()) fd.append("notas", notas.trim());

            const result = await actualizarEstadoAction(fd);
            if (result?.error) {
                setError(result.error);
            } else {
                onDone();
            }
        });
    }

    return (
        <div className="space-y-3">
            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
                    Notas del técnico (opcional)
                </label>
                <Textarea
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Observaciones, incidencias, comentarios para el médico…"
                    rows={2}
                    maxLength={500}
                    className="text-sm resize-none"
                />
            </div>

            {error && (
                <p className="text-xs text-red-500">{error}</p>
            )}

            <div className="flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleSubmit(siguiente)}
                    className="h-8 text-xs"
                >
                    {isPending ? "Guardando…" : BOTON_LABELS[solicitud.estado]}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={isPending}
                    onClick={() => handleSubmit("cancelado")}
                    className="h-8 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                    Cancelar solicitud
                </Button>
            </div>
        </div>
    );
}
