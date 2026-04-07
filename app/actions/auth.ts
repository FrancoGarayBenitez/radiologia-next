"use server";

import { createClient } from "@/lib/supabase/server";
import { loginSchema, registroSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(formData: FormData) {
    const raw = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const result = loginSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const supabase = await createClient();
    const { error, data } = await supabase.auth.signInWithPassword({
        email: result.data.email,
        password: result.data.password,
    });

    if (error) {
        return { error: "Email o contraseña incorrectos" };
    }

    const rol = data.user?.user_metadata?.rol;
    redirect(rol === "tecnico" ? "/tecnico" : "/dashboard");
}

// ─── Registro ─────────────────────────────────────────────────────────────────

export async function registroAction(formData: FormData) {
    const raw = {
        nombre: formData.get("nombre") as string,
        apellido: formData.get("apellido") as string,
        matricula: formData.get("matricula") ?? undefined,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        rol: (formData.get("rol") as string) || "medico",
        codigoTecnico: formData.get("codigoTecnico") ?? undefined,
    };

    const result = registroSchema.safeParse(raw);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    // Validar código secreto para técnico — solo en servidor, nunca expuesto al cliente
    if (result.data.rol === "tecnico") {
        const secreto = process.env.TECNICO_SECRET_CODE;
        if (!secreto || result.data.codigoTecnico !== secreto) {
            return { error: "Código de técnico incorrecto" };
        }
    }

    const supabase = await createClient();

    // Para médicos: verificar que la matrícula no esté duplicada
    if (result.data.rol === "medico") {
        const { data: existente } = await supabase
            .from("personal")
            .select("id")
            .eq("matricula", result.data.matricula ?? "")
            .maybeSingle();

        if (existente) {
            return { error: "Ya existe una cuenta registrada con esa matrícula" };
        }
    }

    // Crear usuario en Supabase Auth.
    // nombre, apellido y matrícula (solo médicos) se pasan como user_metadata
    // para que el trigger on_auth_user_created los escriba en la tabla personal
    // con SECURITY DEFINER, sin depender de una sesión activa.
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: result.data.email,
        password: result.data.password,
        options: {
            data: {
                nombre: result.data.nombre,
                apellido: result.data.apellido,
                ...(result.data.rol === "medico" && { matricula: result.data.matricula }),
                rol: result.data.rol,
            },
        },
    });

    if (authError) {
        if (authError.message.toLowerCase().includes("already registered")) {
            return { error: "Ya existe una cuenta con ese email" };
        }
        return { error: authError.message };
    }

    // Supabase devuelve identities vacío cuando el email ya existe
    if (!authData.user || authData.user.identities?.length === 0) {
        return { error: "Ya existe una cuenta con ese email" };
    }

    // Si la confirmación de email está habilitada en Supabase, no hay sesión
    // todavía: redirigir a login con aviso en lugar de al dashboard.
    if (!authData.session) {
        redirect("/login?registered=1");
    }

    const rol = result.data.rol;
    redirect(rol === "tecnico" ? "/tecnico" : "/dashboard");
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
}
