export const colors = {
  background: "#111111",
  surface: "#1A1A1A",
  surfaceElevated: "#222222",
  surfaceSelected: "#281A1D",
  primary: "#8B1E2D",
  primaryHover: "#A3283A",
  accent: "#B23A48",
  text: "#F5F1EE",
  textSecondary: "#B8B0AA",
  textMuted: "#77706C",
  border: "#2A2A2A",
  success: "#2E7D5B",
  warning: "#B88746",
  error: "#B00020",
  destructive: "#D06474",
  white08: "rgba(245,241,238,0.08)",
  white14: "rgba(245,241,238,0.14)",
} as const;

export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const radii = { sm: 10, md: 16, lg: 24, pill: 999 } as const;

export const touchTargets = {
  minimum: 44,
  hitSlop: 8,
} as const;

export const typography = {
  sectionLabel: {
    fontSize: 9,
    fontWeight: "900" as const,
    letterSpacing: 1.4,
  },
} as const;
