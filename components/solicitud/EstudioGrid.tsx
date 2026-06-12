"use client";

import { Search } from "lucide-react";
import { EstudioCard } from "./EstudioCard";
import { Input } from "@/components/ui/input";
import { getRegionMeta } from "@/lib/regionIcons";
import type { Estudio, Lateralidad, ItemCarrito } from "@/types";

interface CategoriaTab {
    value: string;
    label: string;
    icon: typeof import("lucide-react").Brain;
}

const CATEGORIAS: CategoriaTab[] = [
    { value: "todos", label: "Todos", icon: getRegionMeta("todos").icon },
    { value: "cabeza", label: "Cabeza", icon: getRegionMeta("cabeza").icon },
    { value: "columna", label: "Columna", icon: getRegionMeta("columna").icon },
    { value: "torax_abdomen", label: "Tórax / Abd.", icon: getRegionMeta("torax_abdomen").icon },
    { value: "miembro_superior", label: "M. Superior", icon: getRegionMeta("miembro_superior").icon },
    { value: "miembro_inferior", label: "M. Inferior", icon: getRegionMeta("miembro_inferior").icon },
];

interface Props {
    estudios: Estudio[];
    recentEstudioIds: number[];
    cartItems: ItemCarrito[];
    onAgregar: (estudio: Estudio, lateralidad: Lateralidad, proyecciones: string[], prevLateralidad?: Lateralidad) => void;
    search: string;
    onSearchChange: (v: string) => void;
    categoria: string;
    onCategoriaChange: (v: string) => void;
}

export function EstudioGrid({
    estudios,
    recentEstudioIds,
    cartItems,
    onAgregar,
    search,
    onSearchChange,
    categoria,
    onCategoriaChange,
}: Props) {
    const carritoItemMap = new Map(
        cartItems.map((i) => [i.estudio.id, i] as [number, ItemCarrito])
    );

    const filtered = estudios
        .filter((e) => categoria === "todos" || e.categoria === categoria)
        .filter((e) => e.region.toLowerCase().includes(search.toLowerCase()));

    const countsByCategoria = (value: string) =>
        value === "todos"
            ? estudios.length
            : estudios.filter((e) => e.categoria === value).length;

    return (
        <div className="space-y-5">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                <Input
                    placeholder="Buscar región anatómica..."
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="pl-9 h-10"
                />
            </div>

            {/* Category tabs as pills */}
            <div className="flex flex-wrap gap-1.5">
                {CATEGORIAS.map((cat) => {
                    const isActive = cat.value === categoria;

                    return (
                        <button
                            key={cat.value}
                            type="button"
                            onClick={() => onCategoriaChange(cat.value)}
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                                isActive
                                    ? "border-slate-900 bg-slate-900 text-white shadow-sm"
                                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                            }`}
                        >
                            <cat.icon className="size-3.5" aria-hidden />
                            {cat.label}
                            <span
                                className={`ml-0.5 inline-flex items-center justify-center size-4 rounded-full text-[10px] font-semibold ${
                                    isActive
                                        ? "bg-white/20 text-white"
                                        : "bg-slate-100 text-slate-500"
                                }`}
                            >
                                {countsByCategoria(cat.value)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Catálogo de cards */}
            {filtered.length === 0 ? (
                <div className="py-16 text-center">
                    <p className="text-slate-400 text-sm">
                        No se encontraron estudios para &ldquo;{search}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((estudio) => (
                        <EstudioCard
                            key={estudio.id}
                            estudio={estudio}
                            carritoItem={carritoItemMap.get(estudio.id) ?? null}
                            esReciente={recentEstudioIds.includes(estudio.id)}
                            onAgregar={onAgregar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
