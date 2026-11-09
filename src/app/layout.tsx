import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="es" className="dark font-sans">
      <body className="bg-xg-bg text-xg-white min-h-screen overflow-x-hidden font-sans">
        {children}
      </body>
    </html>
  );
}
