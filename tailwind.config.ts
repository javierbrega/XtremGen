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
        xg: {
          bg: "#0A0A0E",        // Negro Carbón Mate (Fondo Base)
          contrast: "#0B1020",  // Azul/Negro profundo para contrastes
          sidebar: "#050508",   // Fondo ultra-oscuro Sidebar estilo Opera GX
          yellow: "#FFD200",    // Amarillo Industrial / Street (Acento Principal)
          red: "#E6002B",       // Rojo Sangre (Acento Principal / Alerta)
          neon: "#D4FE00",      // Verde Neón (Estado "En línea" y detalles)
          white: "#FFFFFF",     // Blanco puro
        },
        background: "#0A0A0E",
        foreground: "#FFFFFF",
      },
      fontFamily: {
        sans: ["var(--font-space-grotesk)", "sans-serif"],
        display: ["var(--font-chakra-petch)", "sans-serif"],
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
      borderRadius: {
        none: "0px",
        sm: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
