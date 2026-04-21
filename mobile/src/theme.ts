export const theme = {
  colors: {
    bg: "#1c1b18",
    panel: "#262421",
    panel2: "#2f2c28",
    border: "#3a3733",
    text: "#efece6",
    muted: "#9c968a",
    accent: "#6aa84f",
    accent2: "#a7c87a",
    warn: "#d97c2c",
    bad: "#b94a3c",
    lightSq: "#f1d9b5",
    darkSq: "#b58863",
    last: "rgba(255, 235, 105, 0.45)",
    sel: "rgba(106, 168, 79, 0.55)",
    check: "rgba(220, 70, 50, 0.55)",
    hint: "rgba(80, 170, 80, 0.85)",
    hintFill: "rgba(106, 168, 79, 0.35)",
    hintFillStrong: "rgba(106, 168, 79, 0.55)",
  },
  radius: { sm: 4, md: 6, lg: 8, pill: 999 },
  spacing: (n: number) => n * 4,
  fontSize: { xs: 11, sm: 13, md: 15, lg: 17, xl: 22, xxl: 28 },
} as const;

export type Theme = typeof theme;
