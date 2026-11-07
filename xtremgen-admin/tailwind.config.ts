import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0A0A0E",
        surface: "#121218",
        "surface-hover": "#1A1A24",
        primary: "#E6002B",
        accent: "#FFD200",
        neon: "#D4FE00",
      },
    },
  },
  plugins: [],
};
export default config;
