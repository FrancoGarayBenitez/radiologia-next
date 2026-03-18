"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations/auth";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const searchParams = useSearchParams();
    const registered = searchParams.get("registered") === "1";

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(loginSchema),
    });

    function onSubmit(data: LoginInput) {
        setServerError(null);
        startTransition(async () => {
            const formData = new FormData();
            formData.append("email", data.email);
            formData.append("password", data.password);

            const result = await loginAction(formData);
            if (result?.error) {
                setServerError(result.error);
            }
        });
    }

    return (
        <div className="w-full max-w-sm space-y-6">
            {/* Header */}
            <div className="text-center space-y-1">
                <div className="flex justify-center text-4xl mb-2"></div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                    Radiología Mendoza
                </h1>
                <p className="text-slate-400 text-sm">
                    Acceso exclusivo para profesionales médicos
                </p>
            </div>

            {/* Card */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl space-y-5">
                <h2 className="text-lg font-semibold text-white">Iniciar sesión</h2>

                {/* Aviso registro exitoso con confirmación de email pendiente */}
                {registered && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-md px-3 py-2">
                        <p className="text-green-400 text-sm">
                            Cuenta creada! Revisá tu email para confirmar el registro antes de iniciar sesión.
                        </p>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label htmlFor="email" className="text-slate-300">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="doctor@email.com"
                            autoComplete="email"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-red-400 text-xs">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1.5">
                        <Label htmlFor="password" className="text-slate-300">
                            Contraseña
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder=""
                            autoComplete="current-password"
                            className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
                            {...register("password")}
                        />
                        {errors.password && (
                            <p className="text-red-400 text-xs">{errors.password.message}</p>
                        )}
                    </div>

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
                        {isPending ? "Iniciando sesión..." : "Iniciar sesión"}
                    </Button>
                </form>

                <p className="text-center text-slate-400 text-sm">
                    ¿No tenés cuenta?{" "}
                    <Link
                        href="/registro"
                        className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                        Registrarse
                    </Link>
                </p>
            </div>
        </div>
    );
}
