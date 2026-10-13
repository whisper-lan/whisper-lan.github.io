import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "PingFang SC",
          "HarmonyOS Sans SC",
          "Hiragino Sans GB",
          "Microsoft YaHei UI",
          "Microsoft YaHei",
          "Noto Sans SC",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-geist-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        bg: { DEFAULT: "var(--bg)", 2: "var(--bg-2)" },
        surface: { DEFAULT: "var(--surface)", 2: "var(--surface-2)" },
        ink: { DEFAULT: "var(--ink)", 2: "var(--ink-2)" },
        muted: "var(--muted)",
        faint: "var(--faint)",
        hair: { DEFAULT: "var(--hair)", 2: "var(--hair-2)" },
        accent: { DEFAULT: "var(--accent)", ink: "var(--accent-ink)", soft: "var(--accent-soft)" },
        ok: "var(--ok)",
        app: {
          canvas: "var(--app-canvas)",
          surface: "var(--app-surface)",
          muted: "var(--app-muted)",
          line: "var(--app-line)",
          text: "var(--app-text)",
          text2: "var(--app-text-2)",
          in: "var(--app-in)",
          out: "var(--app-out)",
          primary: "var(--app-primary)",
          connected: "var(--app-connected)",
          trusted: "var(--app-trusted)",
          chrome: "var(--app-chrome)",
        },
      },
      boxShadow: {
        card: "var(--shadow-card)",
        float: "var(--shadow-float)",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
