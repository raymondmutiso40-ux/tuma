import type { Config } from "tailwindcss";

/**
 * Tuma design tokens.
 *
 * The palette is deliberately small: one dark primary (ink), one warm
 * neutral (paper), two brand accents (amber for identity, teal for action)
 * and four semantic colours. Anything a page needs should already be here —
 * if you find yourself reaching for a raw hex in a component, add it here
 * instead so every screen stays part of the same product.
 *
 * Accessibility note: `amber` is a 2:1 colour on white, so it is only ever
 * used on dark surfaces or as a non-text fill. For amber-coloured text on a
 * light background use `amber-700`, which clears 4.5:1.
 */
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B1F2B",
          950: "#0E1119",
          900: "#1B1F2B",
          800: "#252A3A",
          700: "#333A4E",
          600: "#4B5468",
          500: "#6B7280",
          400: "#98A0AF",
          300: "#C3C9D4",
          200: "#DFE3EA",
          100: "#EFF1F5",
        },
        paper: {
          DEFAULT: "#F7F3EC",
          dark: "#EFE9DE",
          light: "#FCFAF6",
        },
        amber: {
          DEFAULT: "#E8A23D",
          light: "#F5C77E",
          600: "#C9822A",
          700: "#9A6410",
        },
        teal: {
          DEFAULT: "#2F6F6B",
          light: "#4E938E",
          dark: "#245854",
        },
        rust: "#C1502E",
        slate: "#6B7280",

        success: { DEFAULT: "#15803D", soft: "#E7F5EC" },
        warning: { DEFAULT: "#A16207", soft: "#FBF1DD" },
        danger: { DEFAULT: "#B91C1C", soft: "#FBEAE8" },
        info: { DEFAULT: "#1D4ED8", soft: "#E8EEFC" },
      },
      fontFamily: {
        // `display` is the Tuma wordmark / hero voice. Everything else is
        // Inter — including `condensed`, which is kept as an alias so any
        // stray legacy class still renders in the product typeface.
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        condensed: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      borderRadius: {
        sm: "0.375rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.125rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,31,43,0.04), 0 8px 24px -12px rgba(27,31,43,0.18)",
        "card-hover":
          "0 2px 4px rgba(27,31,43,0.05), 0 16px 40px -16px rgba(27,31,43,0.28)",
        lifted: "0 24px 60px -24px rgba(14,17,25,0.45)",
        ticket: "0 20px 50px -20px rgba(27,31,43,0.35)",
        focus: "0 0 0 3px rgba(47,111,107,0.35)",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "check-pop": {
          "0%": { transform: "scale(0.4)", opacity: "0" },
          "60%": { transform: "scale(1.08)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(0.9)", opacity: "0.7" },
          "100%": { transform: "scale(1.6)", opacity: "0" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.4s ease-out both",
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "scale-in": "scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both",
        "slide-down": "slide-down 0.2s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        "check-pop": "check-pop 0.45s cubic-bezier(0.22,1,0.36,1) both",
        "pulse-ring": "pulse-ring 1.8s ease-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
