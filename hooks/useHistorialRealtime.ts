"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Solicitud } from "@/types";

/**
 * Suscribe a cambios en la tabla `solicitudes` para las solicitudes
 * pertenecientes al médico autenticado. Devuelve la lista actualizada
 * en tiempo real, partiendo del snapshot inicial.
 */
export function useHistorialRealtime(inicial: Solicitud[]) {
    const [solicitudes, setSolicitudes] = useState<Solicitud[]>(inicial);

    useEffect(() => {
        const supabase = createClient();

        const channel = supabase
            .channel("historial-realtime")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "solicitudes",
                },
                (payload) => {
                    const updated = payload.new as Solicitud;
                    setSolicitudes((prev) =>
                        prev.map((s) =>
                            s.id === updated.id
                                ? { ...s, estado: updated.estado, notas_tecnico: updated.notas_tecnico }
                                : s
                        )
                    );
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return solicitudes;
}
