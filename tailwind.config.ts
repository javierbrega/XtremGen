import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/contexts/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#121212",
        surface: "#1a1a1a",
        "surface-hover": "#242424",
        primary: "#ef4444",
        "primary-glow": "rgba(239, 68, 68, 0.2)",
        accent: "#ef4444",
        border: "rgba(255, 255, 255, 0.08)",
        xg: {
          bg: "#0A0A0E",
          contrast: "#0B1020",
          sidebar: "#050508",
          yellow: "#FFD200",
          red: "#E6002B",
          neon: "#D4FE00",
          white: "#FFFFFF",
        },
        foreground: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-chakra-petch)", "Geist", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "monospace"],
      },
      boxShadow: {
        "brutal-black": "4px 4px 0px 0px #000000",
        "brutal-red": "4px 4px 0px 0px #E6002B",
        "brutal-yellow": "4px 4px 0px 0px #FFD200",
        "glow-yellow": "0 0 20px rgba(255, 210, 0, 0.45)",
        "glow-red": "0 0 20px rgba(230, 0, 43, 0.45)",
        "glow-neon": "0 0 15px rgba(212, 254, 0, 0.45)",
      },
    },
  },
  plugins: [],
};

export default config;
