"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatPrecio } from "@/lib/utils";
import { getRegionIcon } from "@/lib/regionIcons";
import type { Estudio, Lateralidad } from "@/types";

interface Props {
    estudio: Estudio;
    estaEnCarrito: boolean;
    esReciente: boolean;
    onAgregar: (estudio: Estudio, lateralidad: Lateralidad, proyecciones: string[]) => void;
}

export function EstudioCard({ estudio, estaEnCarrito, esReciente, onAgregar }: Props) {
    const [showConfig, setShowConfig] = useState(false);
    const [seleccionadas, setSeleccionadas] = useState<string[]>([]);
    const [lateralidad, setLateralidad] = useState<string>("");

    function handleOpenConfig() {
        // Pre-seleccionar todas las proyecciones estándar
        setSeleccionadas([...estudio.proyecciones]);
        setLateralidad("");
        setShowConfig(true);
    }

    function handleCancelar() {
        setShowConfig(false);
        setSeleccionadas([]);
        setLateralidad("");
    }

    function handleToggle(p: string) {
        setSeleccionadas((prev) =>
            prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
        );
    }

    function handleConfirmar() {
        if (seleccionadas.length === 0) return;
        if (estudio.requiere_lateralidad && !lateralidad) return;
        onAgregar(estudio, (lateralidad as Lateralidad) || null, seleccionadas);
        handleCancelar();
    }

    const puedeConfirmar =
        seleccionadas.length > 0 &&
        (!estudio.requiere_lateralidad || !!lateralidad);

    return (
        <div
            className={`relative flex flex-col border rounded-xl p-4 gap-3 transition-all bg-white hover:shadow-md ${estaEnCarrito ? "border-blue-300 bg-blue-50/40" : "border-slate-200"
                }`}
        >
            {/* Badge: solicitado recientemente */}
            {esReciente && (
                <Badge
                    variant="destructive"
                    className="absolute top-2 right-2 text-[10px] px-1.5 py-0.5"
                >
                    ⚠ Reciente
                </Badge>
            )}

            {/* Ícono por región + nombre + precio */}
            <div className="flex items-start gap-3">
                <span className="text-3xl select-none leading-none mt-0.5">
                    {getRegionIcon(estudio.region)}
                </span>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-slate-800 text-sm leading-tight">
                        {estudio.region}
                    </h3>
                    <p className="text-slate-500 text-sm mt-0.5">
                        {formatPrecio(estudio.precio)}{" "}
                        <span className="text-slate-400 text-xs font-normal">/ incidencia</span>
                    </p>
                    {estudio.requiere_lateralidad && (
                        <p className="text-slate-400 text-xs mt-0.5">Indica lateralidad</p>
                    )}
                </div>
            </div>

            {/* Panel de configuración: incidencias + lateralidad */}
            {showConfig ? (
                <div className="space-y-3 border-t border-slate-100 pt-3">
                    {/* Proyecciones/incidencias */}
                    {estudio.proyecciones.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                                Incidencias
                            </p>
                            <div className="space-y-1.5">
                                {estudio.proyecciones.map((p) => (
                                    <label
                                        key={p}
                                        className="flex items-center gap-2 cursor-pointer group"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={seleccionadas.includes(p)}
                                            onChange={() => handleToggle(p)}
                                            className="w-3.5 h-3.5 rounded accent-blue-600 shrink-0"
                                        />
                                        <span className="text-xs text-slate-700 group-hover:text-slate-900 leading-snug">
                                            {p}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {/* Total en vivo */}
                            <div className="flex items-baseline justify-between mt-1 pt-1.5 border-t border-slate-100">
                                {seleccionadas.length === 0 ? (
                                    <p className="text-[11px] text-red-500">
                                        Seleccioná al menos una incidencia.
                                    </p>
                                ) : (
                                    <p className="text-xs text-slate-500">
                                        {formatPrecio(estudio.precio)}{" "}×{" "}{seleccionadas.length}{" "}
                                        incidencia{seleccionadas.length !== 1 ? "s" : ""}
                                    </p>
                                )}
                                {seleccionadas.length > 0 && (
                                    <span className="text-sm font-bold text-slate-800">
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
                            <Select
                                value={lateralidad}
                                onValueChange={(v) => setLateralidad(v ?? "")}
                            >
                                <SelectTrigger className="h-8 text-sm">
                                    <SelectValue placeholder="Seleccionar lado..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="izquierdo">Izquierdo/a</SelectItem>
                                    <SelectItem value="derecho">Derecho/a</SelectItem>
                                    <SelectItem value="bilateral">Bilateral</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="flex gap-2 pt-1">
                        <Button
                            size="sm"
                            className="flex-1 h-8 text-xs"
                            onClick={handleConfirmar}
                            disabled={!puedeConfirmar}
                        >
                            {estaEnCarrito ? "Guardar cambios" : "Agregar al pedido"}
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
                </div>
            ) : (
                <Button
                    size="sm"
                    variant={estaEnCarrito ? "secondary" : "default"}
                    className="h-8 text-xs w-full"
                    onClick={handleOpenConfig}
                >
                    {estaEnCarrito ? "✏️ Modificar incidencias" : "Agregar a la lista"}
                </Button>
            )}
        </div>
    );
}
