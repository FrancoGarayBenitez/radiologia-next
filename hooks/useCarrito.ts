import { useState, useCallback } from "react";
import type { ItemCarrito, Estudio, Lateralidad } from "@/types";

function itemKey(estudioId: number, lateralidad: Lateralidad): string {
    return `${estudioId}-${lateralidad ?? "none"}`;
}

export function useCarrito() {
    const [items, setItems] = useState<ItemCarrito[]>([]);

    /**
     * Agrega un estudio al carrito.
     * Si ya existe la misma combinación estudio+lateralidad, actualiza
     * las proyecciones seleccionadas (no duplica ni incrementa cantidad).
     */
    const agregar = useCallback(
        (estudio: Estudio, lateralidad: Lateralidad = null, proyecciones: string[] = []) => {
            const k = itemKey(estudio.id, lateralidad);
            setItems((prev) => {
                const existe = prev.find((i) => itemKey(i.estudio.id, i.lateralidad) === k);
                if (existe) {
                    // Actualiza proyecciones y recalcula cantidad
                    return prev.map((i) =>
                        itemKey(i.estudio.id, i.lateralidad) === k
                            ? { ...i, proyecciones, cantidad: proyecciones.length }
                            : i
                    );
                }
                return [...prev, { estudio, cantidad: proyecciones.length, lateralidad, proyecciones }];
            });
        },
        []
    );

    const eliminar = useCallback((estudioId: number, lateralidad: Lateralidad) => {
        const k = itemKey(estudioId, lateralidad);
        setItems((prev) => prev.filter((i) => itemKey(i.estudio.id, i.lateralidad) !== k));
    }, []);

    const limpiar = useCallback(() => setItems([]), []);

    // total = precio por incidencia × número de incidencias seleccionadas
    const total = items.reduce((acc, i) => acc + i.estudio.precio * i.cantidad, 0);
    const cantidadTotal = items.length;

    return { items, agregar, eliminar, limpiar, total, cantidadTotal };
}
