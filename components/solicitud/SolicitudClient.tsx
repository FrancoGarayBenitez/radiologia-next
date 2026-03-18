"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCarrito } from "@/hooks/useCarrito";
import { guardarSolicitudAction } from "@/app/actions/solicitud";
import { EstudioGrid } from "./EstudioGrid";
import { ResumenTabla } from "./ResumenTabla";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { formatPrecio } from "@/lib/utils";
import type { Estudio, Paciente, NivelUrgencia, Lateralidad } from "@/types";

const URGENCIA_BADGE: Record<NivelUrgencia, string> = {
    rutina: "bg-green-100 text-green-700 border-green-300",
    urgente: "bg-yellow-100 text-yellow-700 border-yellow-300",
    emergencia: "bg-red-100 text-red-700 border-red-300",
};

interface Props {
    estudios: Estudio[];
    paciente: Paciente;
    recentEstudioIds: number[];
}

export function SolicitudClient({ estudios, paciente, recentEstudioIds }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const { items, agregar, eliminar, limpiar, total, cantidadTotal } = useCarrito();

    const [urgencia, setUrgencia] = useState<NivelUrgencia>("rutina");
    const [indicacionClinica, setIndicacionClinica] = useState("");
    const [search, setSearch] = useState("");
    const [categoria, setCategoria] = useState("todos");

    function handleAgregarEstudio(
        estudio: Estudio,
        lateralidad: Lateralidad,
        proyecciones: string[]
    ) {
        if (recentEstudioIds.includes(estudio.id)) {
            toast.warning(
                `"${estudio.region}" fue solicitado recientemente para este paciente.`,
                { description: "Se agregó igual. Verificá si es necesario repetirlo." }
            );
        }
        agregar(estudio, lateralidad, proyecciones);
    }

    function handleFinalizar() {
        if (items.length === 0) {
            toast.error("Debe agregar al menos un estudio antes de finalizar");
            return;
        }

        startTransition(async () => {
            const result = await guardarSolicitudAction({
                paciente_id: paciente.id,
                urgencia,
                indicacion_clinica: indicacionClinica,
                items: items.map((i) => ({
                    estudio_id: i.estudio.id,
                    cantidad: i.cantidad,
                    precio_unit: i.estudio.precio,
                    lateralidad: i.lateralidad,
                    proyecciones: i.proyecciones,
                })),
            });

            if (result.error) {
                toast.error(result.error);
                return;
            }

            limpiar();
            toast.success("¡Solicitud guardada! Derive su paciente a la sala de rayos X.");
            router.push("/paciente");
        });
    }

    return (
        <div className="space-y-4">
            {/* Banner del paciente */}
            <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-sm">
                <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Paciente</p>
                    <p className="font-semibold text-slate-800">
                        {paciente.nombre} {paciente.apellido}
                    </p>
                    <p className="text-sm text-slate-500">
                        DNI: {paciente.dni}
                        {paciente.obra_social && ` · ${paciente.obra_social}`}
                    </p>
                </div>

                <Badge
                    variant="outline"
                    className={`border font-medium text-xs ${URGENCIA_BADGE[urgencia]}`}
                >
                    {urgencia.charAt(0).toUpperCase() + urgencia.slice(1)}
                </Badge>

                {cantidadTotal > 0 && (
                    <Badge className="bg-blue-600 text-white">
                        {cantidadTotal} estudio{cantidadTotal !== 1 ? "s" : ""}
                    </Badge>
                )}
            </div>

            {/* Layout principal: catálogo + panel lateral */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* Izquierda: catálogo de estudios */}
                <div className="flex-1 min-w-0">
                    <EstudioGrid
                        estudios={estudios}
                        recentEstudioIds={recentEstudioIds}
                        cartItems={items}
                        onAgregar={handleAgregarEstudio}
                        search={search}
                        onSearchChange={setSearch}
                        categoria={categoria}
                        onCategoriaChange={setCategoria}
                    />
                </div>

                {/* Derecha: resumen + configuración + finalizar */}
                <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-4">
                    <ResumenTabla
                        items={items}
                        onEliminar={eliminar}
                        total={total}
                    />

                    {/* Urgencia */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">
                            Nivel de urgencia
                        </Label>
                        <Select
                            value={urgencia}
                            onValueChange={(v) => setUrgencia(v as NivelUrgencia)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="rutina">🟢 Rutina</SelectItem>
                                <SelectItem value="urgente">🟡 Urgente</SelectItem>
                                <SelectItem value="emergencia">🔴 Emergencia</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Indicación clínica */}
                    <div className="space-y-1.5">
                        <Label className="text-sm font-medium text-slate-700">
                            Indicación clínica{" "}
                            <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </Label>
                        <Textarea
                            value={indicacionClinica}
                            onChange={(e) => setIndicacionClinica(e.target.value)}
                            placeholder="Ej: Trauma reciente en tobillo derecho, control post-quirúrgico..."
                            rows={3}
                            className="resize-none text-sm"
                        />
                    </div>

                    <Separator />

                    {/* Total + botón finalizar */}
                    {items.length > 0 && (
                        <div className="flex justify-between items-center text-sm text-slate-600">
                            <span>Total estimado</span>
                            <span className="font-bold text-slate-900 text-base">
                                {formatPrecio(total)}
                            </span>
                        </div>
                    )}

                    <Button
                        onClick={handleFinalizar}
                        disabled={isPending || items.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium"
                        size="lg"
                    >
                        {isPending ? "Guardando..." : "✓ Finalizar solicitud"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
