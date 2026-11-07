import { Zap, Radio, ShieldAlert } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-xg-bg text-xg-white flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full bg-xg-contrast border-2 border-xg-yellow p-8 rounded-none shadow-[4px_4px_0px_0px_#E6002B] transition-all hover:shadow-[0_0_20px_rgba(255,210,0,0.45)]">
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-xg-yellow fill-xg-yellow" />
            <span className="font-display text-2xl font-bold tracking-wider uppercase">
              XTREM<span className="text-xg-red">GEN</span> // XG
            </span>
          </div>
          <div className="flex items-center gap-2 bg-xg-sidebar px-3 py-1 border border-xg-neon/40 rounded-none">
            <span className="w-2.5 h-2.5 bg-xg-neon rounded-none animate-pulse shadow-glow-neon" />
            <span className="font-mono text-xs uppercase text-xg-neon tracking-widest">
              SYSTEM ONLINE
            </span>
          </div>
        </div>

        <h1 className="font-display text-4xl font-bold uppercase tracking-tight mb-3">
          ESTÁNDARES <span className="text-xg-yellow">ANIME-STREETWEAR</span> INICIALIZADOS
        </h1>
        <p className="text-white/75 mb-6 leading-relaxed">
          Arquitectura Next.js (App Router) + TypeScript estricto + Tailwind CSS preconfigurada según{" "}
          <code className="font-mono text-xg-yellow bg-xg-sidebar px-1.5 py-0.5 border border-white/10">
            GEMINI.md
          </code>
          .
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          <div className="bg-xg-sidebar border border-xg-yellow/50 p-3 rounded-none shadow-[4px_4px_0px_0px_#000]">
            <div className="text-xg-yellow font-bold mb-1 flex items-center gap-1.5">
              <Radio className="w-4 h-4" /> ACENTO STREET
            </div>
            <div className="text-white/60">#FFD200 // #E6002B</div>
          </div>
          <div className="bg-xg-sidebar border border-xg-red/50 p-3 rounded-none shadow-[4px_4px_0px_0px_#000]">
            <div className="text-xg-red font-bold mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> GEOMETRÍA
            </div>
            <div className="text-white/60">Cortes secos (rounded-none)</div>
          </div>
          <div className="bg-xg-sidebar border border-xg-neon/50 p-3 rounded-none shadow-[4px_4px_0px_0px_#000]">
            <div className="text-xg-neon font-bold mb-1">TIPOGRAFÍA</div>
            <div className="text-white/60">Chakra Petch + Space Grotesk</div>
          </div>
        </div>
      </div>
    </main>
  );
}
