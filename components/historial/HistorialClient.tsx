"use client";

import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { SolicitudCard } from "./SolicitudCard";
import { SolicitudDetalle } from "./SolicitudDetalle";
import { useHistorialRealtime } from "@/hooks/useHistorialRealtime";
import type { Solicitud, EstadoSolicitud, NivelUrgencia } from "@/types";

interface Props {
    solicitudes: Solicitud[];
}

type FiltroEstado = EstadoSolicitud | "todos";
type FiltroUrgencia = NivelUrgencia | "todos";

export function HistorialClient({ solicitudes: inicial }: Props) {
    const solicitudes = useHistorialRealtime(inicial);
    const [search, setSearch] = useState("");
    const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("todos");
    const [filtroUrgencia, setFiltroUrgencia] = useState<FiltroUrgencia>("todos");
    const [detalle, setDetalle] = useState<Solicitud | null>(null);

    const filtradas = useMemo(() => {
        return solicitudes.filter((s) => {
            const paciente = s.paciente;
            const nombreCompleto =
                `${paciente?.nombre ?? ""} ${paciente?.apellido ?? ""}`.toLowerCase();
            const dni = paciente?.dni?.toString() ?? "";
            const matchSearch =
                search.trim() === "" ||
                nombreCompleto.includes(search.toLowerCase()) ||
                dni.includes(search.trim());

            const matchEstado =
                filtroEstado === "todos" || s.estado === filtroEstado;
            const matchUrgencia =
                filtroUrgencia === "todos" || s.urgencia === filtroUrgencia;

            return matchSearch && matchEstado && matchUrgencia;
        });
    }, [solicitudes, search, filtroEstado, filtroUrgencia]);

    return (
        <div className="space-y-5">
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Input
                    placeholder="Buscar por nombre o DNI del paciente…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="sm:max-w-xs"
                />
                <Select
                    value={filtroEstado}
                    onValueChange={(v) => setFiltroEstado((v ?? "todos") as FiltroEstado)}
                >
                    <SelectTrigger className="sm:w-44">
                        <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos los estados</SelectItem>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en_proceso">En proceso</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                </Select>
                <Select
                    value={filtroUrgencia}
                    onValueChange={(v) => setFiltroUrgencia((v ?? "todos") as FiltroUrgencia)}
                >
                    <SelectTrigger className="sm:w-44">
                        <SelectValue placeholder="Urgencia" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Toda urgencia</SelectItem>
                        <SelectItem value="rutina">🟢 Rutina</SelectItem>
                        <SelectItem value="urgente">🟡 Urgente</SelectItem>
                        <SelectItem value="emergencia">🔴 Emergencia</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Conteo de resultados */}
            <p className="text-sm text-slate-500">
                {filtradas.length === solicitudes.length
                    ? `${solicitudes.length} solicitud${solicitudes.length !== 1 ? "es" : ""}`
                    : `${filtradas.length} de ${solicitudes.length} solicitud${solicitudes.length !== 1 ? "es" : ""}`}
            </p>

            {/* Lista */}
            {filtradas.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                    <p className="text-4xl mb-3">📋</p>
                    <p className="font-medium">Sin resultados</p>
                    <p className="text-sm">Ajustá los filtros para ver más solicitudes.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtradas.map((s) => (
                        <SolicitudCard
                            key={s.id}
                            solicitud={s}
                            onVerDetalle={setDetalle}
                        />
                    ))}
                </div>
            )}

            {/* Modal de detalle */}
            <SolicitudDetalle
                solicitud={detalle}
                open={detalle !== null}
                onClose={() => setDetalle(null)}
            />
        </div>
    );
}
