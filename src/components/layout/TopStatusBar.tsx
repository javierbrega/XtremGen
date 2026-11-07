"use client";

import React, { useState } from "react";
import {
  Search,
  MessageSquare,
  Radio,
  Cpu,
  ShieldAlert,
  SlidersHorizontal,
} from "lucide-react";

export interface TopStatusBarProps {
  activeSection: string;
  isChatOpen: boolean;
  onToggleChat: () => void;
  onlineCount?: number;
}

const SECTION_TITLES: Record<string, string> = {
  hub: "SECTOR_01 // CENTRAL_BENTO_HUB",
  drops: "SECTOR_02 // LIMITED_STREETWEAR_DROPS",
  arena: "SECTOR_03 // ANIME_CLASH_ARENA",
  ranking: "SECTOR_04 // SYNDICATE_RANKING",
  vault: "SECTOR_05 // ENCRYPTED_VAULT",
};

export function TopStatusBar({
  activeSection,
  isChatOpen,
  onToggleChat,
  onlineCount = 142,
}: TopStatusBarProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");

  const currentTitle =
    SECTION_TITLES[activeSection] ?? "SECTOR_00 // UNKNOWN_GRID";

  return (
    <header className="bg-[#050508]/95 border-b border-white/15 px-4 md:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-30 backdrop-blur-sm">
      {/* Izquierda: Telemetría Cyber-Streetwear & Sector Activo */}
      <div className="flex items-center gap-4 lg:gap-6 min-w-0">
        {/* Badge de Sistema */}
        <div className="hidden sm:flex items-center gap-2 bg-xg-contrast border border-xg-yellow/40 px-2.5 py-1 rounded-none shadow-brutal-black">
          <Cpu className="w-3.5 h-3.5 text-xg-yellow shrink-0" />
          <span className="font-mono text-xs text-xg-yellow font-bold tracking-wider whitespace-nowrap">
            SYS // XG-OS v2.5
          </span>
        </div>

        {/* Telemetría Red y Estado */}
        <div className="hidden xl:flex items-center gap-4 font-mono text-xs border-l border-white/15 pl-4">
          <div className="flex items-center gap-1.5 text-white/70">
            <Radio className="w-3.5 h-3.5 text-xg-red animate-pulse" />
            <span>NET:</span>
            <span className="text-white font-semibold">SUPABASE_RT</span>
          </div>

          <div className="flex items-center gap-2 bg-[#0A0A0E] border border-white/10 px-2.5 py-1 rounded-none">
            <span className="w-2 h-2 bg-[#D4FE00] rounded-none shadow-glow-neon" />
            <span className="text-[#D4FE00] font-bold tracking-wide">
              STATUS: ONLINE
            </span>
            <span className="text-white/50">[{onlineCount} REBELS]</span>
          </div>
        </div>

        {/* Indicador de Sección Activa */}
        <div className="flex items-center gap-2 truncate">
          <ShieldAlert className="w-4 h-4 text-xg-red shrink-0" />
          <span className="font-display text-xs md:text-sm font-bold uppercase tracking-wider text-white truncate">
            {currentTitle}
          </span>
        </div>
      </div>

      {/* Centro / Derecha: Buscador Rápido de Drops & Toggle Chat */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Buscador Rápido de Drops */}
        <form
          onSubmit={(e) => e.preventDefault()}
          role="search"
          className="hidden md:flex items-center bg-[#0A0A0E] border-2 border-white/20 focus-within:border-xg-yellow rounded-none px-3 py-1.5 shadow-brutal-black transition-colors"
        >
          <Search className="w-4 h-4 text-xg-yellow mr-2 shrink-0" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="SEARCH DROPS // SKU_ID..."
            aria-label="Buscar Drops"
            className="bg-transparent text-xs font-mono text-white placeholder:text-white/40 focus:outline-none w-44 lg:w-60 rounded-none"
          />
          <SlidersHorizontal className="w-3.5 h-3.5 text-white/40 ml-2 shrink-0" />
        </form>

        {/* Estado compacto en móvil */}
        <div className="flex xl:hidden items-center gap-1.5 bg-[#0A0A0E] border border-white/15 px-2 py-1 rounded-none font-mono text-[11px]">
          <span className="w-2 h-2 bg-[#D4FE00] rounded-none" />
          <span className="text-[#D4FE00] font-bold">{onlineCount}</span>
        </div>

        {/* Botón Destacado Neobrutalista para Chat de la Comunidad */}
        <button
          type="button"
          onClick={onToggleChat}
          aria-expanded={isChatOpen}
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-none font-display text-xs md:text-sm font-bold uppercase tracking-wider border-2 transition-all active:translate-x-[1px] active:translate-y-[1px] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] ${
            isChatOpen
              ? "bg-xg-yellow text-black border-black shadow-brutal-red"
              : "bg-xg-red text-white border-xg-yellow shadow-brutal-yellow"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span className="hidden sm:inline">
            {isChatOpen ? "COMMS // ACTIVE" : "COMMUNITY CHAT"}
          </span>
          <span
            className={`w-2 h-2 rounded-none ${
              isChatOpen ? "bg-black" : "bg-[#D4FE00]"
            }`}
          />
        </button>
      </div>
    </header>
  );
}
