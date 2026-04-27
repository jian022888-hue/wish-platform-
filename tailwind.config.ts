import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1A1A1A",
          light: "#F5F5F4",
        },
        clay: "#C46A42",
        moss: "#5C7A50",
        background: {
          DEFAULT: "#FAFAF9",
          dark: "#121110",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#1C1A18",
          "dark-hover": "#262422",
          "dark-elevated": "#242220",
        },
        sand: "#F5EFE6",
        line: "#E5E2DE",
        mist: "#F7F5F3",
        stone: {
          50: "#FAFAF9",
          100: "#F5F5F4",
          200: "#E7E5E4",
          300: "#D6D3D1",
          400: "#A8A29E",
          500: "#78716C",
          600: "#57534E",
          700: "#44403C",
          800: "#292524",
          900: "#1C1917",
          950: "#0C0A09",
        },
      },
      animation: {
        "slide-in": "slideIn 0.3s ease-out",
      },
      keyframes: {
        slideIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
