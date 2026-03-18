"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacienteSchema, type PacienteInput } from "@/lib/validations/paciente";
import { buscarPacientePorDNI, guardarPacienteAction } from "@/app/actions/paciente";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/hooks/useSession";
import { useState, useTransition } from "react";
import type { Paciente } from "@/types";

export function PacienteForm() {
    const { medico } = useSession();
    const [serverError, setServerError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const [isDniSearching, setIsDniSearching] = useState(false);
    // false = sin búsqueda aún | null = buscado, no encontrado | Paciente = encontrado
    const [pacienteStatus, setPacienteStatus] = useState<Paciente | null | false>(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<PacienteInput>({
        resolver: zodResolver(pacienteSchema),
    });

    // Desestructuramos onBlur de RHF para poder combinarlo con la búsqueda
    const { ref: dniRef, onBlur: dniRhfBlur, ...dniRest } = register("dni");

    async function handleDniBlur(e: React.FocusEvent<HTMLInputElement>) {
        dniRhfBlur(e); // Mantener validación de RHF
        const dni = e.target.value.trim();
        if (dni.length < 7) return;

        setIsDniSearching(true);
        try {
            const found = await buscarPacientePorDNI(dni);
            if (found) {
                setValue("nombre", found.nombre, { shouldValidate: true });
                setValue("apellido", found.apellido, { shouldValidate: true });
                setValue("obra_social", found.obra_social || "");
                setPacienteStatus(found);
            } else {
                setPacienteStatus(null);
            }
        } catch {
            setPacienteStatus(null);
        } finally {
            setIsDniSearching(false);
        }
    }

    function onSubmit(data: PacienteInput) {
        setServerError(null);
        startTransition(async () => {
            const formData = new FormData();
            formData.append("nombre", data.nombre);
            formData.append("apellido", data.apellido);
            formData.append("dni", data.dni);
            if (data.obra_social) formData.append("obra_social", data.obra_social);

            const result = await guardarPacienteAction(formData);
            if (result?.error) setServerError(result.error);
        });
    }

    return (
        <div className="max-w-md mx-auto space-y-6">
            {/* Saludo */}
            {medico && (
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800">
                        Hola, Dr/a. {medico.nombre} {medico.apellido}
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm">
                        Mat. {medico.matricula} · Ingrese los datos del paciente para continuar
                    </p>
                </div>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Datos del paciente</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        {/* DNI con búsqueda automática */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="dni">DNI</Label>
                                {isDniSearching && (
                                    <span className="text-xs text-slate-400 animate-pulse">Buscando...</span>
                                )}
                                {!isDniSearching && pacienteStatus !== false && (
                                    <Badge
                                        variant={pacienteStatus ? "default" : "secondary"}
                                        className={pacienteStatus ? "bg-green-600" : ""}
                                    >
                                        {pacienteStatus ? "✓ Paciente existente" : "Paciente nuevo"}
                                    </Badge>
                                )}
                            </div>
                            <Input
                                id="dni"
                                ref={dniRef}
                                placeholder="Ej: 35000123"
                                inputMode="numeric"
                                onBlur={handleDniBlur}
                                {...dniRest}
                            />
                            {errors.dni && (
                                <p className="text-red-500 text-xs">{errors.dni.message}</p>
                            )}
                        </div>

                        {/* Nombre y Apellido */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="nombre">Nombre</Label>
                                <Input id="nombre" placeholder="Juan" {...register("nombre")} />
                                {errors.nombre && (
                                    <p className="text-red-500 text-xs">{errors.nombre.message}</p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="apellido">Apellido</Label>
                                <Input id="apellido" placeholder="García" {...register("apellido")} />
                                {errors.apellido && (
                                    <p className="text-red-500 text-xs">{errors.apellido.message}</p>
                                )}
                            </div>
                        </div>

                        {/* Obra Social */}
                        <div className="space-y-1.5">
                            <Label htmlFor="obra_social">
                                Obra social{" "}
                                <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                            </Label>
                            <Input
                                id="obra_social"
                                placeholder="Ej: OSEP, PAMI, OSPEA, Particular..."
                                {...register("obra_social")}
                            />
                        </div>

                        {serverError && (
                            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
                                <p className="text-red-600 text-sm">{serverError}</p>
                            </div>
                        )}

                        <Button type="submit" disabled={isPending} className="w-full">
                            {isPending ? "Guardando..." : "Solicitar estudios →"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
