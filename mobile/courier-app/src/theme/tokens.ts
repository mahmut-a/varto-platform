// Medusa UI Kit — Tasarım Tokenleri (React Native)
// Courier App için özelleştirilmiş — mavi aksan rengi

export const colors = {
    // Backgrounds
    bg: {
        base: "#FFFFFF",
        subtle: "#F8F9FA",
        field: "#F1F3F5",
        hover: "#F4F4F5",
        disabled: "#FAFAFA",
    },
    // Foreground / Text
    fg: {
        base: "#18181B",
        subtle: "#52525B",
        muted: "#A1A1AA",
        disabled: "#D4D4D8",
        on_color: "#FFFFFF",
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
        yellow: { bg: "#FFFAEB", fg: "#B54708" },
    },
    // Primary / Interactive — mavi tonlu (kurye kimliği)
    interactive: "#3B82F6",
    interactive_hover: "#2563EB",
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
}

export const typography = {
    h1: { fontSize: 22, fontWeight: "700" as const, color: colors.fg.base, letterSpacing: -0.5 },
    h2: { fontSize: 17, fontWeight: "600" as const, color: colors.fg.base },
    h3: { fontSize: 15, fontWeight: "600" as const, color: colors.fg.base },
    body: { fontSize: 14, fontWeight: "400" as const, color: colors.fg.subtle, lineHeight: 20 },
    small: { fontSize: 13, fontWeight: "400" as const, color: colors.fg.muted },
    label: { fontSize: 13, fontWeight: "500" as const, color: colors.fg.subtle },
    caption: { fontSize: 12, fontWeight: "400" as const, color: colors.fg.muted },
}
