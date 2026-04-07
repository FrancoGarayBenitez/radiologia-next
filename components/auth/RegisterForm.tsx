"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registroSchema, type RegistroInput } from "@/lib/validations/auth";
import { registroAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import Link from "next/link";

const INPUT_CLASS =
    "bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500";

export function RegisterForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RegistroInput>({
        resolver: zodResolver(registroSchema),
        defaultValues: { rol: "medico" },
    });

    const rol = watch("rol");

    function onSubmit(data: RegistroInput) {
        setServerError(null);
        startTransition(async () => {
            const formData = new FormData();
            Object.entries(data).forEach(([key, value]) => {
                if (value !== undefined) formData.append(key, value);
            });

            const result = await registroAction(formData);
            if (result?.error) {
                setServerError(result.error);
            }
        });
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
                <div className="flex justify-center text-4xl mb-2">☢</div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Radiología Mendoza
                </h1>
                <p className="text-slate-400 text-sm">Crear cuenta profesional</p>
            </div>

            {/* Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5">
                <h2 className="text-lg font-semibold text-white">Registro</h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>

                    {/* Selector de rol */}
                    <div className="space-y-2">
                        <Label className="text-slate-300">Tipo de cuenta</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {(["medico", "tecnico"] as const).map((opcion) => (
                                <label
                                    key={opcion}
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition-colors ${rol === opcion
                                        ? "border-blue-500 bg-blue-500/10 text-blue-300"
                                        : "border-slate-600 text-slate-400 hover:border-slate-500"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        value={opcion}
                                        className="sr-only"
                                        {...register("rol")}
                                    />
                                    <span>{opcion === "medico" ? "👨‍⚕️ Médico" : "🔬 Técnico"}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Nombre y Apellido */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="nombre" className="text-slate-300">Nombre</Label>
                            <Input
                                id="nombre"
                                placeholder="Juan"
                                autoComplete="given-name"
                                className={INPUT_CLASS}
                                {...register("nombre")}
                            />
                            {errors.nombre && (
                                <p className="text-red-400 text-xs">{errors.nombre.message}</p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="apellido" className="text-slate-300">Apellido</Label>
                            <Input
                                id="apellido"
                                placeholder="García"
                                autoComplete="family-name"
                                className={INPUT_CLASS}
                                {...register("apellido")}
                            />
                            {errors.apellido && (
                                <p className="text-red-400 text-xs">{errors.apellido.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Matrícula — solo para médicos */}
                    {rol === "medico" && (
                        <div className="space-y-1.5">
                            <Label htmlFor="matricula" className="text-slate-300">
                                Número de matrícula
                            </Label>
                            <Input
                                id="matricula"
                                placeholder="12345"
                                inputMode="numeric"
                                className={INPUT_CLASS}
                                {...register("matricula")}
                            />
                            {errors.matricula && (
                                <p className="text-red-400 text-xs">{errors.matricula.message}</p>
                            )}
                        </div>
                    )}

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-slate-300">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="usuario@email.com"
                            autoComplete="email"
                            className={INPUT_CLASS}
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-slate-300">Contraseña</Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            autoComplete="new-password"
                            className={INPUT_CLASS}
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Código secreto — solo visible al seleccionar técnico */}
                    {rol === "tecnico" && (
                        <div className="space-y-1.5">
                            <Label htmlFor="codigoTecnico" className="text-slate-300">
                                Código de acceso técnico
                            </Label>
                            <Input
                                id="codigoTecnico"
                                type="password"
                                placeholder="Ingresá el código provisto por administración"
                                className={INPUT_CLASS}
                                {...register("codigoTecnico")}
                            />
                            <p className="text-slate-500 text-xs">
                                Solicitá el código al administrador del sistema.
                            </p>
                        </div>
                    )}

                    {/* Error del servidor */}
                    {serverError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">
                            <p className="text-red-400 text-sm">{serverError}</p>
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    >
                        {isPending ? "Registrando..." : "Crear cuenta"}
                    </Button>
                </form>

                <p className="text-center text-slate-400 text-sm">
                    ¿Ya tenés cuenta?{" "}
                    <Link
                        href="/login"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Iniciar sesión
                    </Link>
                </p>
            </div>
        </div>
    );
}
