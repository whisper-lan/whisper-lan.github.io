import type { Config } from "tailwindcss";

const appColor = (name: string) => `color-mix(in srgb, var(${name}) calc(<alpha-value> * 100%), transparent)`;

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
        // An alpha slot, so opacity modifiers (bg-app-primary/70) work; a bare var() gets none.
        app: {
          canvas: appColor("--app-canvas"),
          surface: appColor("--app-surface"),
          muted: appColor("--app-muted"),
          line: appColor("--app-line"),
          text: appColor("--app-text"),
          text2: appColor("--app-text-2"),
          in: appColor("--app-in"),
          out: appColor("--app-out"),
          primary: appColor("--app-primary"),
          connected: appColor("--app-connected"),
          trusted: appColor("--app-trusted"),
          chrome: appColor("--app-chrome"),
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
