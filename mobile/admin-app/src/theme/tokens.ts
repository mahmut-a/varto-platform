// Medusa UI Kit — Tasarım Tokenleri (React Native)
// Minimalist, sade, temiz

export const colors = {
    // Backgrounds
    bg: {
        base: "#FFFFFF",     // Ana arka plan
        subtle: "#F8F9FA",   // Kartlar, list items
        field: "#F1F3F5",    // Input alanları
        hover: "#F4F4F5",    // Hover/aktif durum
        disabled: "#FAFAFA",
    },
    // Foreground / Text
    fg: {
        base: "#18181B",       // Başlıklar
        subtle: "#52525B",     // Ana metin
        muted: "#A1A1AA",      // Alt metin, placeholder
        disabled: "#D4D4D8",
        on_color: "#FFFFFF",   // Renkli arka plan üstünde
    },
    // Borders
    border: {
        base: "#E4E4E7",
        strong: "#D4D4D8",
    },
    // Tags / Status
    tag: {
        neutral: { bg: "#F4F4F5", fg: "#52525B" },
        green: { bg: "#ECFDF3", fg: "#027A48" },
        blue: { bg: "#EFF8FF", fg: "#175CD3" },
        orange: { bg: "#FFF6ED", fg: "#C4320A" },
        red: { bg: "#FEF3F2", fg: "#B42318" },
        purple: { bg: "#F4F3FF", fg: "#5925DC" },
    },
    // Primary / Interactive
    interactive: "#6366F1",
    interactive_hover: "#4F46E5",
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
}

export const typography = {
    h1: { fontSize: 20, fontWeight: "600" as const, color: colors.fg.base, letterSpacing: -0.4 },
    h2: { fontSize: 16, fontWeight: "600" as const, color: colors.fg.base },
    h3: { fontSize: 14, fontWeight: "500" as const, color: colors.fg.base },
    body: { fontSize: 14, fontWeight: "400" as const, color: colors.fg.subtle, lineHeight: 20 },
    small: { fontSize: 13, fontWeight: "400" as const, color: colors.fg.muted },
    label: { fontSize: 13, fontWeight: "500" as const, color: colors.fg.subtle },
    mono: { fontSize: 13, fontWeight: "400" as const, fontFamily: "monospace", color: colors.fg.subtle },
}
