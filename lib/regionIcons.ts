/**
 * Iconos específicos por región anatómica.
 * Claves en minúsculas normalizadas para coincidir con estudio.region.toLowerCase().
 */
export const REGION_ICONS: Record<string, string> = {
    // ─── Cabeza ──────────────────────────────────────────────────────────────
    "cráneo completo": "💀",
    "huesos propios de la nariz": "👃",
    "senos paranasales": "👁️",
    "macizo facial": "😬",
    "órbitas": "👁️",
    "mandíbula": "🦷",
    "atm (articulación temporomandibular)": "🦷",
    "panorámica dental (opg)": "🦷",

    // ─── Columna ─────────────────────────────────────────────────────────────
    "columna completa": "🦴",
    "cervical": "🫀", // cuello aprox.
    "dorsal": "🦴",
    "lumbar": "🦴",
    "lumbosacra": "🦴",
    "sacro": "🦴",
    "coxis": "🦴",

    // ─── Tórax / Abdomen ─────────────────────────────────────────────────────
    "tórax": "🫁",
    "abdomen": "🫃",
    "pelvis": "🦴",
    "sacroilíacas": "🦴",

    // ─── Miembro superior ────────────────────────────────────────────────────
    "hombro": "💪",
    "escápula": "💪",
    "clavícula": "🦴",
    "brazo": "💪",
    "codo": "🦾",
    "antebrazo": "🦾",
    "muñeca": "✋",
    "mano": "✋",
    "dedos (mano)": "☝️",

    // ─── Miembro inferior ────────────────────────────────────────────────────
    "cadera": "🦴",
    "fémur": "🦴",
    "rodilla": "🦵",
    "pierna": "🦵",
    "tobillo": "🦶",
    "pie": "🦶",
    "pie con carga": "🦶",
    "calcáneo": "🦶",
    "dedos (pie)": "🦶",
};

/** Devuelve el emoji para la región, con fallback a 🩻 */
export function getRegionIcon(region: string): string {
    return REGION_ICONS[region.toLowerCase()] ?? "🩻";
}
