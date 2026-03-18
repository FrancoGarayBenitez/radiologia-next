"use client";

import { EstudioCard } from "./EstudioCard";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Estudio, Lateralidad, ItemCarrito } from "@/types";

const CATEGORIAS = [
    { value: "todos", label: "Todos" },
    { value: "cabeza", label: "Cabeza" },
    { value: "columna", label: "Columna" },
    { value: "torax_abdomen", label: "Tórax / Abdomen" },
    { value: "miembro_superior", label: "Miembro Superior" },
    { value: "miembro_inferior", label: "Miembro Inferior" },
];

interface Props {
    estudios: Estudio[];
    recentEstudioIds: number[];
    cartItems: ItemCarrito[];
    onAgregar: (estudio: Estudio, lateralidad: Lateralidad, proyecciones: string[]) => void;
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
    const cartEstudioIds = new Set(cartItems.map((i) => i.estudio.id));

    const filtered = estudios
        .filter((e) => categoria === "todos" || e.categoria === categoria)
        .filter((e) => e.region.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="space-y-4">
            {/* Búsqueda en tiempo real */}
            <Input
                placeholder="Buscar región anatómica..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="max-w-sm"
            />

            {/* Tabs de categoría */}
            <Tabs value={categoria} onValueChange={onCategoriaChange}>
                <TabsList className="flex flex-wrap h-auto gap-1 bg-slate-100 p-1">
                    {CATEGORIAS.map((cat) => (
                        <TabsTrigger
                            key={cat.value}
                            value={cat.value}
                            className="text-xs px-3 py-1.5"
                        >
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {/* Catálogo de cards */}
            {filtered.length === 0 ? (
                <div className="py-12 text-center">
                    <p className="text-slate-400 text-sm">
                        No se encontraron estudios para &ldquo;{search}&rdquo;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filtered.map((estudio) => (
                        <EstudioCard
                            key={estudio.id}
                            estudio={estudio}
                            estaEnCarrito={cartEstudioIds.has(estudio.id)}
                            esReciente={recentEstudioIds.includes(estudio.id)}
                            onAgregar={onAgregar}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
