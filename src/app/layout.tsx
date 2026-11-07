import type { Metadata } from "next";
import { Space_Grotesk, Chakra_Petch, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["400", "500", "600", "700"],
});

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  variable: "--font-chakra-petch",
  weight: ["600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "XtremGen (XG) | Anime-Streetwear Rebel Hub",
  description: "Comunidad y Hub de Anime-Streetwear Rebelde con arquitectura estilo Opera GX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${spaceGrotesk.variable} ${chakraPetch.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-xg-bg text-xg-white min-h-screen overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
