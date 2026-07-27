import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1B1F2B",
        paper: "#F7F3EC",
        amber: "#E8A23D",
        teal: "#2F6F6B",
        rust: "#C1502E",
        slate: "#6B7280",
      },
      fontFamily: {
        display: ["'Archivo Black'", "sans-serif"],
        condensed: ["'Barlow Condensed'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
