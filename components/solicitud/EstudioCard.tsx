"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { formatPrecio } from "@/lib/utils";
import { getRegionMeta } from "@/lib/regionIcons";
import type { Estudio, ItemCarrito, Lateralidad } from "@/types";

interface Props {
    estudio: Estudio;
    carritoItem: ItemCarrito | null;
    esReciente: boolean;
    onAgregar: (estudio: Estudio, lateralidad: Lateralidad, proyecciones: string[], prevLateralidad?: Lateralidad) => void;
}

const LATERALIDAD_OPTIONS: { value: Lateralidad; label: string }[] = [
    { value: "izquierdo", label: "Izquierdo" },
    { value: "derecho", label: "Derecho" },
    { value: "bilateral", label: "Bilateral" },
];

export function EstudioCard({ estudio, carritoItem, esReciente, onAgregar }: Props) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
    const [lateralidad, setLateralidad] = useState<Lateralidad>(null);

    const { icon: Icon, color, lightBg } = getRegionMeta(estudio.categoria);

    function handleOpenDialog() {
        setSeleccionadas(
            carritoItem ? [...carritoItem.proyecciones] : [...estudio.proyecciones]
        );
        setLateralidad(carritoItem?.lateralidad ?? null);
        setDialogOpen(true);
    }

    function handleToggle(p: string) {
        setSeleccionadas((prev) =>
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
        );
    }

    function handleConfirmar() {
        if (seleccionadas.length === 0) return;
        if (estudio.requiere_lateralidad && !lateralidad) return;
        onAgregar(estudio, lateralidad, seleccionadas, carritoItem?.lateralidad ?? undefined);
        setDialogOpen(false);
    }

    function handleCancelar() {
        setDialogOpen(false);
    }

    const puedeConfirmar =
        seleccionadas.length > 0 &&
        (!estudio.requiere_lateralidad || !!lateralidad);

    return (
        <div
            className={`relative flex flex-col border rounded-xl overflow-hidden transition-all bg-white hover:shadow-md group ${
                carritoItem
                    ? "ring-2 ring-blue-200 border-blue-300"
                    : "border-slate-200 shadow-sm"
            }`}
        >
            {/* Colored top accent bar */}
            <div className={`h-1.5 w-full shrink-0 ${lightBg.replace("50", "200")}`} />

            {/* Badge: solicitado recientemente */}
            {esReciente && (
                <Badge
                    variant="outline"
                    className="absolute top-3 right-3 text-[10px] px-1.5 py-0.5 bg-amber-50 text-amber-700 border-amber-200 font-normal z-10"
                >
                    Solicitado antes
                </Badge>
            )}

            <div className="p-4 pt-3 flex flex-col gap-3 flex-1">
                {/* Header: icon + name + price */}
                <div className="flex items-center gap-3">
                    <div
                        className={`flex items-center justify-center size-9 rounded-lg shrink-0 ${lightBg}`}
                    >
                        <Icon className={`size-4.5 ${color}`} aria-hidden />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 text-sm leading-tight break-words">
                            {estudio.region}
                        </h3>
                        <p className="text-slate-600 text-xs mt-0.5">
                            {formatPrecio(estudio.precio)}{" "}
                            <span className="text-slate-500">/ incidencia</span>
                        </p>
                    </div>
                </div>

                {/* Footer: add / edit button */}
                <div className="mt-auto flex justify-center pt-2.5 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={handleOpenDialog}
                        className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                            carritoItem
                                ? `${color} ${lightBg} border-transparent`
                                : "border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 hover:bg-slate-50"
                        }`}
                        title={carritoItem ? "Modificar incidencias" : "Agregar estudio"}
                    >
                        {carritoItem ? (
                            <>
                                <Check className="size-3.5" aria-hidden />
                                Modificar
                            </>
                        ) : (
                            <>
                                <Plus className="size-3.5" aria-hidden />
                                Agregar
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Dialog: selección de incidencias */}
            <Dialog open={dialogOpen} onOpenChange={(v) => !v && setDialogOpen(false)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <div className={`flex items-center justify-center size-7 rounded-md shrink-0 ${lightBg}`}>
                                <Icon className={`size-3.5 ${color}`} aria-hidden />
                            </div>
                            {estudio.region}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Incidencias */}
                        {estudio.proyecciones.length > 0 && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    Incidencias
                                </p>
                                <div className="space-y-1 max-h-56 overflow-y-auto pr-0.5">
                                    {estudio.proyecciones.map((p) => (
                                        <label
                                            key={p}
                                            className="flex items-center gap-2 cursor-pointer group rounded-md px-2 py-1.5 hover:bg-slate-50 transition-colors"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={seleccionadas.includes(p)}
                                                onChange={() => handleToggle(p)}
                                                className="size-3.5 rounded accent-blue-600 shrink-0"
                                            />
                                            <span className="text-xs text-slate-700 group-hover:text-slate-900 leading-snug">
                                                {p}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                                    {seleccionadas.length === 0 ? (
                                        <p className="text-[11px] text-red-500">
                                            Seleccioná al menos una incidencia
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-600">
                                            {seleccionadas.length} incidencia
                                            {seleccionadas.length !== 1 ? "s" : ""}
                                        </p>
                                    )}
                                    {seleccionadas.length > 0 && (
                                        <span className="text-sm font-bold text-slate-900">
                                            {formatPrecio(estudio.precio * seleccionadas.length)}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Lateralidad */}
                        {estudio.requiere_lateralidad && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                    Lateralidad
                                </p>
                                <div className="flex gap-1.5">
                                    {LATERALIDAD_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setLateralidad(opt.value)}
                                            className={`flex-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all ${
                                                lateralidad === opt.value
                                                    ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-2 pt-1 border-t border-slate-100">
                        <Button
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={handleConfirmar}
                            disabled={!puedeConfirmar}
                        >
                            {carritoItem ? "Guardar cambios" : "Agregar al pedido"}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs"
                            onClick={handleCancelar}
                        >
                            Cancelar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
