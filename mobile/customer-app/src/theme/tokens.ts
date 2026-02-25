// Varto Customer App — Medusa UI Design Tokens
// Fully reactive dark theme support via ThemeContext

import React from "react"

export type ColorScheme = "light" | "dark"

// Medusa UI Kit Colors — Light & Dark
const lightColors = {
    bg: {
        base: "#FFFFFF",
        subtle: "#F8F9FA",
        field: "#F1F3F5",
        component: "#FFFFFF",
        overlay: "rgba(0,0,0,0.4)",
    },
    fg: {
        base: "#18181B",
        subtle: "#52525B",
        muted: "#A1A1AA",
        disabled: "#D4D4D8",
        on_color: "#FFFFFF",
    },
    border: {
        base: "#E4E4E7",
        strong: "#D4D4D8",
    },
    interactive: "#6366F1",
    interactive_hover: "#4F46E5",
    tag: {
        neutral: { bg: "#F4F4F5", fg: "#52525B" },
        green: { bg: "#ECFDF3", fg: "#027A48" },
        blue: { bg: "#EFF8FF", fg: "#175CD3" },
        orange: { bg: "#FFF6ED", fg: "#C4320A" },
        red: { bg: "#FEF3F2", fg: "#B42318" },
        purple: { bg: "#F4F3FF", fg: "#5925DC" },
    },
}

const darkColors = {
    bg: {
        base: "#09090B",
        subtle: "#18181B",
        field: "#27272A",
        component: "#1C1C20",
        overlay: "rgba(0,0,0,0.6)",
    },
    fg: {
        base: "#FAFAFA",
        subtle: "#D4D4D8",
        muted: "#71717A",
        disabled: "#3F3F46",
        on_color: "#FFFFFF",
    },
    border: {
        base: "#27272A",
        strong: "#3F3F46",
    },
    interactive: "#818CF8",
    interactive_hover: "#6366F1",
    tag: {
        neutral: { bg: "#27272A", fg: "#A1A1AA" },
        green: { bg: "#052E16", fg: "#4ADE80" },
        blue: { bg: "#0C1D3E", fg: "#60A5FA" },
        orange: { bg: "#431407", fg: "#FB923C" },
        red: { bg: "#450A0A", fg: "#F87171" },
        purple: { bg: "#2E1065", fg: "#A78BFA" },
    },
}

// ── Reactive color getter by scheme ──
export const getColorsByScheme = (scheme: ColorScheme) =>
    scheme === "dark" ? darkColors : lightColors

// ── Status config (theme-independent) ──
export const statusConfig = {
    pending: { label: "Bekliyor", icon: "time-outline" },
    confirmed: { label: "Onaylandı", icon: "checkmark-circle-outline" },
    preparing: { label: "Hazırlanıyor", icon: "restaurant-outline" },
    ready: { label: "Hazır", icon: "cube-outline" },
    assigned: { label: "Kurye Atandı", icon: "bicycle-outline" },
    accepted: { label: "Kurye Kabul Etti", icon: "thumbs-up-outline" },
    delivering: { label: "Yolda", icon: "navigate-outline" },
    delivered: { label: "Teslim Edildi", icon: "checkmark-done-outline" },
    cancelled: { label: "İptal", icon: "close-circle-outline" },
} as const

export const getStatusColor = (scheme: ColorScheme, status: string) => {
    const c = getColorsByScheme(scheme)
    const map: Record<string, { bg: string; fg: string }> = {
        pending: c.tag.orange,
        confirmed: c.tag.blue,
        preparing: c.tag.purple,
        ready: c.tag.green,
        assigned: c.tag.blue,
        accepted: c.tag.green,
        delivering: c.tag.orange,
        delivered: c.tag.green,
        cancelled: c.tag.red,
    }
    return map[status] || c.tag.neutral
}

export const statusLabels: Record<string, string> = {
    pending: "Bekliyor",
    confirmed: "Onaylandı",
    preparing: "Hazırlanıyor",
    ready: "Hazır",
    assigned: "Kurye Atandı",
    accepted: "Kurye Kabul Etti",
    delivering: "Yolda",
    delivered: "Teslim Edildi",
    cancelled: "İptal",
}

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
}

export const radius = {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
}

export const getTypographyByScheme = (scheme: ColorScheme) => {
    const c = getColorsByScheme(scheme)
    return {
        h1: { fontSize: 20, fontWeight: "600" as const, color: c.fg.base, letterSpacing: -0.4 },
        h2: { fontSize: 16, fontWeight: "600" as const, color: c.fg.base },
        h3: { fontSize: 14, fontWeight: "500" as const, color: c.fg.base },
        body: { fontSize: 14, fontWeight: "400" as const, color: c.fg.subtle, lineHeight: 20 },
        small: { fontSize: 13, fontWeight: "400" as const, color: c.fg.muted },
        label: { fontSize: 13, fontWeight: "500" as const, color: c.fg.subtle },
        price: { fontSize: 16, fontWeight: "700" as const, color: c.interactive },
    }
}

export const shadow = {
    sm: { shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
    md: { shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
}

// ── DEPRECATED: Static exports for backward compat (default to light) ──
// These should be migrated away in favor of useColors() hook
export const colors = lightColors
export const typography = getTypographyByScheme("light")
export const getColors = () => lightColors
export const getTypography = () => getTypographyByScheme("light")
export const setThemeScheme = (_scheme: "light" | "dark" | null) => {
    // No-op: deprecated, now handled reactively via ThemeContext
}
