"use client";

import { Separator } from "@/components/ui/separator";
import { formatPrecio } from "@/lib/utils";
import { getRegionIcon } from "@/lib/regionIcons";
import type { ItemCarrito, Lateralidad } from "@/types";

const LATERALIDAD_LABELS: Record<string, string> = {
    izquierdo: "Izq.",
    derecho: "Der.",
    bilateral: "Bil.",
};

interface Props {
    items: ItemCarrito[];
    onEliminar: (estudioId: number, lateralidad: Lateralidad) => void;
    total: number;
}

export function ResumenTabla({ items, onEliminar, total }: Props) {
    if (items.length === 0) {
        return (
            <div className="border border-dashed border-slate-300 rounded-xl p-6 text-center">
                <p className="text-slate-400 text-sm leading-relaxed">
                    Aún no agregó estudios.
                    <br />
                    Seleccione desde el catálogo.
                </p>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                <h3 className="font-semibold text-slate-700 text-sm">
                    Estudios seleccionados ({items.length})
                </h3>
            </div>

            <div className="divide-y divide-slate-100">
                {items.map((item) => (
                    <div
                        key={`${item.estudio.id}-${item.lateralidad ?? "none"}`}
                        className="px-4 py-3 flex items-start gap-2.5"
                    >
                        {/* Ícono */}
                        <span className="text-xl select-none shrink-0 mt-0.5">
                            {getRegionIcon(item.estudio.region)}
                        </span>

                        {/* Región + lateralidad + incidencias */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 leading-snug">
                                {item.estudio.region}
                                {item.lateralidad && (
                                    <span className="text-xs text-blue-600 ml-1.5 font-normal">
                                        ({LATERALIDAD_LABELS[item.lateralidad] ?? item.lateralidad})
                                    </span>
                                )}
                            </p>
                            {/* Incidencias seleccionadas */}
                            {item.proyecciones.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {item.proyecciones.map((p) => (
                                        <span
                                            key={p}
                                            className="inline-block text-[10px] bg-slate-100 text-slate-600 rounded px-1.5 py-0.5 leading-tight"
                                        >
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            )}
                            {/* Precio: por incidencia × cantidad = total */}
                            <p className="text-xs text-slate-500 mt-1">
                                {formatPrecio(item.estudio.precio)}/inc{" "}
                                <span className="text-slate-400">× {item.proyecciones.length}</span>
                                {" = "}
                                <span className="font-semibold text-slate-700">
                                    {formatPrecio(item.estudio.precio * item.proyecciones.length)}
                                </span>
                            </p>
                        </div>

                        {/* Precio calculado + eliminar */}
                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <span className="text-sm font-semibold text-slate-700">
                                {formatPrecio(item.estudio.precio * item.proyecciones.length)}
                            </span>
                            <button
                                onClick={() => onEliminar(item.estudio.id, item.lateralidad)}
                                className="text-slate-300 hover:text-red-400 transition-colors text-base leading-none"
                                title="Quitar estudio"
                            >
                                ✕
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <Separator />

            <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-600">Total estimado</span>
                <span className="font-bold text-slate-900 text-base">{formatPrecio(total)}</span>
            </div>
        </div>
    );
}
