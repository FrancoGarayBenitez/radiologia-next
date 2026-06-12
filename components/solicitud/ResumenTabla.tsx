"use client";

import { ClipboardList, Trash2 } from "lucide-react";
import { formatPrecio } from "@/lib/utils";
import { getRegionMeta } from "@/lib/regionIcons";
import type { ItemCarrito, Lateralidad } from "@/types";

const LATERALIDAD_SHORT: Record<string, string> = {
    izquierdo: "Izq.",
    derecho: "Der.",
    bilateral: "Bil.",
};

interface Props {
    items: ItemCarrito[];
    onEliminar: (estudioId: number, lateralidad: Lateralidad) => void;
}

export function ResumenTabla({ items, onEliminar }: Props) {
    if (items.length === 0) {
        return (
            <div className="border border-dashed border-slate-300 rounded-xl py-10 px-4 flex flex-col items-center text-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <ClipboardList className="size-5 text-slate-400" />
                </div>
                <div>
                    <p className="text-sm font-medium text-slate-500">Sin estudios aún</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                        Seleccioná estudios desde el catálogo para armar el pedido.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-semibold text-slate-700 text-sm">Pedido</h3>
                <span className="inline-flex items-center justify-center size-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    {items.length}
                </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {items.map((item) => {
                    const { icon: Icon, lightBg, color } = getRegionMeta(item.estudio.categoria);
                    return (
                        <div
                            key={`${item.estudio.id}-${item.lateralidad ?? "none"}`}
                            className="px-4 py-3 flex items-start gap-3"
                        >
                            {/* Category icon */}
                            <div
                                className={`flex items-center justify-center size-8 rounded-lg shrink-0 ${lightBg}`}
                            >
                                <Icon className={`size-4 ${color}`} aria-hidden />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-1.5">
                                    <p className="text-sm font-medium text-slate-800 leading-snug">
                                        {item.estudio.region}
                                    </p>
                                    {item.lateralidad && (
                                        <span className={`text-[11px] ${color} font-medium shrink-0`}>
                                            {LATERALIDAD_SHORT[item.lateralidad]}
                                        </span>
                                    )}
                                </div>

                                {item.proyecciones.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {item.proyecciones.map((p) => (
                                            <span
                                                key={p}
                                                className={`inline-block text-[10px] ${lightBg} ${color} rounded px-1.5 py-0.5 leading-tight`}
                                            >
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <p className="text-xs text-slate-500 mt-1">
                                    <span className="font-medium text-slate-700">
                                        {formatPrecio(item.estudio.precio)}
                                    </span>
                                    {" × "}
                                    {item.cantidad} incidencia
                                    {item.cantidad !== 1 ? "s" : ""}
                                </p>
                            </div>

                            {/* Price + remove */}
                            <div className="flex flex-col items-end gap-1 shrink-0">
                                <span className="text-sm font-semibold text-slate-800">
                                    {formatPrecio(item.estudio.precio * item.cantidad)}
                                </span>
                                <button
                                    onClick={() => onEliminar(item.estudio.id, item.lateralidad)}
                                    className="text-slate-300 hover:text-red-500 transition-colors"
                                    title="Quitar estudio"
                                >
                                    <Trash2 className="size-3.5" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>


        </div>
    );
}
