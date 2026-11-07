import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XG Command Center — Panel de Administración",
  description: "Panel de Administración independiente de XtremGen (XG) conectado en tiempo real a Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className="bg-[#09080c] text-zinc-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
