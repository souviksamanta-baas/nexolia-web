import type { Config } from "tailwindcss";

// Note: Tailwind v4 largely uses CSS-first config in globals.css via @theme.
// This file is kept for compatibility and can be extended with plugins.
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#101935",
        "navy-soft": "#1a2548",
        primary: "#08bd66",
        "primary-dark": "#04a85a",
        "primary-soft": "#e8faf1",
        bg: "#fbfcfb",
        surface: "#ffffff",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
