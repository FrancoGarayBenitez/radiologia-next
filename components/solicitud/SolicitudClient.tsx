"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Clock, Zap } from "lucide-react";
import { toast } from "sonner";
import { useCarrito } from "@/hooks/useCarrito";
import { guardarSolicitudAction } from "@/app/actions/solicitud";
import { EstudioGrid } from "./EstudioGrid";
import { ResumenTabla } from "./ResumenTabla";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatPrecio } from "@/lib/utils";
import type { Estudio, Paciente, NivelUrgencia, Lateralidad } from "@/types";

const URGENCIA_OPTS: {
    value: NivelUrgencia;
    label: string;
    desc: string;
    icon: typeof Clock;
    activeClass: string;
    dotClass: string;
}[] = [
    {
        value: "rutina",
        label: "Rutina",
        desc: "Sin urgencia",
        icon: Clock,
        activeClass: "border-green-400 bg-green-50 text-green-800",
        dotClass: "bg-green-500",
    },
    {
        value: "urgente",
        label: "Urgente",
        desc: "Prioritario",
        icon: AlertTriangle,
        activeClass: "border-amber-400 bg-amber-50 text-amber-800",
        dotClass: "bg-amber-500",
    },
    {
        value: "emergencia",
        label: "Emergencia",
        desc: "Inmediato",
        icon: Zap,
        activeClass: "border-red-400 bg-red-50 text-red-800",
        dotClass: "bg-red-500",
    },
];

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
        proyecciones: string[],
        prevLateralidad?: Lateralidad
    ) {
        if (recentEstudioIds.includes(estudio.id)) {
            toast.warning(
                `"${estudio.region}" fue solicitado recientemente para este paciente.`,
                { description: "Se agregó igual. Verificá si es necesario repetirlo." }
            );
        }
        agregar(estudio, lateralidad, proyecciones, prevLateralidad);
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
        <div className="space-y-5">
            {/* Patient banner */}
            <div className="flex flex-wrap items-center gap-4 bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-sm">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center justify-center size-10 rounded-full bg-indigo-100 text-indigo-700 text-sm font-bold shrink-0">
                        {paciente.nombre.charAt(0).toUpperCase()}
                        {paciente.apellido.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">
                            Paciente
                        </p>
                        <p className="font-semibold text-slate-900 text-base">
                            {paciente.nombre} {paciente.apellido}
                        </p>
                        <p className="text-sm text-slate-600">
                            DNI: {paciente.dni}
                            {paciente.obra_social && (
                                <>
                                    <span className="mx-1.5 text-slate-300">·</span>
                                    {paciente.obra_social}
                                </>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {cantidadTotal > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white text-xs font-medium px-3 py-1">
                            {cantidadTotal} estudio{cantidadTotal !== 1 ? "s" : ""}
                        </span>
                    )}
                </div>
            </div>

            {/* Layout: catalog + panel */}
            <div className="flex flex-col lg:flex-row gap-5">
                {/* Left: catalog */}
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-600 mb-4">
                        Catálogo de estudios
                    </h2>
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

                {/* Right: summary + controls */}
                <div className="w-full lg:w-72 xl:w-80 shrink-0 space-y-5">
                    <ResumenTabla
                        items={items}
                        onEliminar={eliminar}
                    />

                    {/* Urgencia as visual radio buttons */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold uppercase tracking-widest text-slate-600">
                            Urgencia
                        </Label>
                        <div className="flex flex-col gap-1.5">
                            {URGENCIA_OPTS.map((opt) => {
                                const Icon = opt.icon;
                                const isActive = urgencia === opt.value;
                                return (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setUrgencia(opt.value)}
                                        className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left transition-all ${
                                            isActive
                                                ? `${opt.activeClass} shadow-sm`
                                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                        }`}
                                    >
                                        <div
                                            className={`size-2.5 rounded-full shrink-0 ${opt.dotClass} ${
                                                isActive ? "" : "opacity-40"
                                            }`}
                                        />
                                        <Icon
                                            className={`size-4 shrink-0 ${
                                                isActive ? "" : "text-slate-400"
                                            }`}
                                            aria-hidden
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p
                                                className={`text-sm font-medium ${
                                                    isActive ? "" : "text-slate-700"
                                                }`}
                                            >
                                                {opt.label}
                                            </p>
                                            <p className="text-xs text-slate-500">{opt.desc}</p>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Clinical indication */}
                    <div className="space-y-2">
                        <Label className="text-sm font-semibold uppercase tracking-widest text-slate-600">
                            Indicación clínica{" "}
                            <span className="font-normal normal-case text-slate-500">
                                (opcional)
                            </span>
                        </Label>
                        <Textarea
                            value={indicacionClinica}
                            onChange={(e) => setIndicacionClinica(e.target.value)}
                            placeholder="Ej: Trauma reciente en tobillo derecho, control post-quirúrgico..."
                            rows={4}
                            className="resize-none text-sm"
                        />
                    </div>

                    <Separator />

                    {/* Total + submit */}
                    {items.length > 0 && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-slate-700">
                                Total estimado
                            </span>
                            <span className="font-bold text-slate-900 text-xl">
                                {formatPrecio(total)}
                            </span>
                        </div>
                    )}

                    <Button
                        onClick={handleFinalizar}
                        disabled={isPending || items.length === 0}
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-medium h-11"
                        size="lg"
                    >
                        {isPending ? "Guardando..." : "Finalizar solicitud"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
