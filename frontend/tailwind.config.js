/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: {
          DEFAULT: "var(--folio-paper)",
          raised: "var(--folio-paper-raised)",
        },
        ink: {
          DEFAULT: "var(--folio-ink)",
          soft: "var(--folio-ink-soft)",
        },
        accent: {
          DEFAULT: "var(--folio-accent)",
          ink: "var(--folio-accent-ink)",
        },
        line: {
          DEFAULT: "var(--folio-line)",
          strong: "var(--folio-line-strong)",
        },
        positive: { DEFAULT: "var(--folio-positive)", soft: "var(--folio-positive-soft)" },
        warning: { DEFAULT: "var(--folio-warning)", soft: "var(--folio-warning-soft)" },
        info: { DEFAULT: "var(--folio-info)", soft: "var(--folio-info-soft)" },
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        text: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      maxWidth: {
        wrap: "82rem",
      },
      boxShadow: {
        e1: "var(--sc-e1)",
        e2: "var(--sc-e2)",
        e3: "var(--sc-e3)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.23, 1, 0.32, 1)",
      },
    },
  },
  plugins: [],
};
