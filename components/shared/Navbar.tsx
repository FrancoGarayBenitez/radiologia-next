"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSession } from "@/hooks/useSession";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const MEDICO_LINKS = [
    { href: "/dashboard", label: "Inicio" },
    { href: "/paciente", label: "Nuevo paciente" },
    { href: "/historial", label: "Mis solicitudes" },
];

const TECNICO_LINKS = [
    { href: "/tecnico", label: "Cola de trabajo" },
];

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const { medico, loading } = useSession();

    const navLinks = medico?.rol === "tecnico" ? TECNICO_LINKS : MEDICO_LINKS;

    async function handleLogout() {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success("Sesión cerrada");
        router.push("/login");
        router.refresh();
    }

    const iniciales = medico
        ? `${medico.nombre[0]}${medico.apellido[0]}`.toUpperCase()
        : "?";

    return (
        <header className="sticky top-0 z-50 border-b bg-slate-900 text-white shadow-sm">
            <div className="container mx-auto flex h-14 items-center justify-between px-4">
                {/* Logo */}
                <Link
                    href={medico?.rol === "tecnico" ? "/tecnico" : "/paciente"}
                    className="flex items-center gap-2 font-semibold text-lg tracking-tight"
                >
                    <span className="text-blue-400">☢</span> Radiología Mendoza
                </Link>

                {/* Nav links */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-md text-sm transition-colors ${pathname.startsWith(link.href)
                                ? "bg-slate-700 text-white"
                                : "text-slate-300 hover:bg-slate-700 hover:text-white"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Usuario */}
                {!loading && medico && (
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-600 text-white text-xs">
                                    {iniciales}
                                </AvatarFallback>
                            </Avatar>
                            <span className="hidden md:block text-sm text-slate-200">
                                {medico.rol === "tecnico" ? "Téc." : "Dr/a."}{" "}
                                {medico.nombre} {medico.apellido}
                            </span>
                            {medico.rol === "tecnico" && (
                                <Badge variant="outline" className="text-slate-300 border-slate-500 text-xs">
                                    Técnico
                                </Badge>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-52">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel className="font-normal">
                                    <p className="text-sm font-medium">
                                        {medico.nombre} {medico.apellido}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Mat. {medico.matricula}
                                    </p>
                                </DropdownMenuLabel>
                            </DropdownMenuGroup>
                            <DropdownMenuSeparator />
                            <DropdownMenuGroup>
                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="text-red-600 cursor-pointer focus:text-red-600"
                                >
                                    Cerrar sesión
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
