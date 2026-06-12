import {
    Brain,
    Bone,
    Stethoscope,
    Hand,
    Footprints,
    type LucideIcon,
} from "lucide-react";

type CategoriaAnatomica =
    | "cabeza"
    | "columna"
    | "torax_abdomen"
    | "miembro_superior"
    | "miembro_inferior";

interface RegionMeta {
    icon: LucideIcon;
    color: string;
    lightBg: string;
    label: string;
}

const CATEGORIA_META: Record<CategoriaAnatomica, RegionMeta> = {
    cabeza: {
        icon: Brain,
        color: "text-indigo-600",
        lightBg: "bg-indigo-50",
        label: "Cabeza",
    },
    columna: {
        icon: Bone,
        color: "text-emerald-600",
        lightBg: "bg-emerald-50",
        label: "Columna",
    },
    torax_abdomen: {
        icon: Stethoscope,
        color: "text-amber-600",
        lightBg: "bg-amber-50",
        label: "Tórax / Abdomen",
    },
    miembro_superior: {
        icon: Hand,
        color: "text-rose-600",
        lightBg: "bg-rose-50",
        label: "Miembro Superior",
    },
    miembro_inferior: {
        icon: Footprints,
        color: "text-violet-600",
        lightBg: "bg-violet-50",
        label: "Miembro Inferior",
    },
};

export function getRegionMeta(categoria: string): RegionMeta {
    return (
        CATEGORIA_META[categoria as CategoriaAnatomica] ?? {
            icon: Bone,
            color: "text-slate-500",
            lightBg: "bg-slate-50",
            label: categoria,
        }
    );
}
