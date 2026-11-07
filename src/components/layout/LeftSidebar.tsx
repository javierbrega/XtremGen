"use client";

import React from "react";
import {
  Flame,
  ShoppingBag,
  Swords,
  Trophy,
  Terminal,
  MessageSquare,
  Github,
} from "lucide-react";

export interface LeftSidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  isChatOpen: boolean;
  onToggleChat: () => void;
}

interface NavItem {
  id: string;
  label: string;
  code: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: "hub", label: "HUB // CENTRAL", code: "01", icon: Flame },
  { id: "drops", label: "DROPS // ARCHIVE", code: "02", icon: ShoppingBag },
  { id: "arena", label: "ARENA // VERSUS", code: "03", icon: Swords },
  { id: "ranking", label: "RANK // LEADERBOARD", code: "04", icon: Trophy },
  { id: "vault", label: "VAULT // TERMINAL", code: "05", icon: Terminal },
];

export function LeftSidebar({
  activeSection,
  onSelectSection,
  isChatOpen,
  onToggleChat,
}: LeftSidebarProps) {
  return (
    <aside
      aria-label="Navegación Principal"
      className="fixed left-0 top-0 bottom-0 z-40 w-16 md:w-20 bg-[#050508] border-r-2 border-xg-yellow/30 flex flex-col items-center justify-between py-4 select-none"
    >
      {/* Top: Logo Neobrutalista XG */}
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectSection("hub")}
          title="XtremGen // Home Hub"
          className="w-11 h-11 md:w-12 md:h-12 bg-xg-red text-white font-display font-bold text-lg md:text-xl tracking-tighter border-2 border-xg-yellow shadow-[3px_3px_0px_0px_#FFD200] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] active:translate-x-[1px] active:translate-y-[1px] transition-all flex items-center justify-center rounded-none"
        >
          XG
        </button>
        <span className="font-mono text-[9px] tracking-widest text-xg-yellow/60 uppercase">
          GX-OS
        </span>
      </div>

      {/* Center: Iconos de Navegación */}
      <nav className="flex flex-col items-center gap-3 w-full px-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              {/* Indicador Lateral Activo #FFD200 */}
              {isActive && (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1 bottom-1 w-1 bg-[#FFD200] shadow-glow-yellow"
                />
              )}

              <button
                type="button"
                onClick={() => onSelectSection(item.id)}
                aria-label={item.label}
                aria-current={isActive ? "page" : undefined}
                className={`relative w-11 h-11 md:w-12 md:h-12 flex flex-col items-center justify-center rounded-none border transition-all duration-150 ${
                  isActive
                    ? "bg-xg-contrast border-xg-yellow text-xg-yellow shadow-brutal-yellow"
                    : "bg-[#0A0A0E] border-white/10 text-white/60 hover:text-xg-yellow hover:border-xg-yellow"
                } hover:shadow-[0_0_20px_rgba(255,210,0,0.45)]`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-mono text-[8px] leading-none mt-1 opacity-75">
                  {item.code}
                </span>
              </button>

              {/* Tooltip Técnico Estilo Cyber-Streetwear */}
              <div
                role="tooltip"
                className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-[#050508] text-white border-2 border-xg-yellow px-2.5 py-1 shadow-brutal-black rounded-none"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-xg-yellow font-bold">
                    [{item.code}]
                  </span>
                  <span className="font-display text-xs font-bold tracking-wider uppercase">
                    {item.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </nav>

      {/* Bottom: Comunidad, GitHub & Estado Online */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {/* Botón Chat de la Comunidad */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={onToggleChat}
            aria-label={
              isChatOpen
                ? "Cerrar Chat de la Comunidad"
                : "Abrir Chat de la Comunidad"
            }
            aria-expanded={isChatOpen}
            className={`relative w-11 h-11 md:w-12 md:h-12 flex items-center justify-center rounded-none border-2 transition-all ${
              isChatOpen
                ? "bg-xg-yellow text-black border-white shadow-brutal-red"
                : "bg-xg-contrast text-white border-xg-red/80 hover:border-xg-yellow shadow-brutal-black"
            } hover:shadow-[0_0_20px_rgba(255,210,0,0.45)]`}
          >
            <MessageSquare className="w-5 h-5" />
            <span
              aria-hidden="true"
              className="
                absolute -top-1 -right-1 w-2.5 h-2.5 bg-xg-neon border border-black
              "
            />
          </button>

          <div
            role="tooltip"
            className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 whitespace-nowrap bg-[#050508] text-white border-2 border-xg-red px-2.5 py-1 shadow-brutal-black rounded-none"
          >
            <span className="font-mono text-xs uppercase tracking-wider text-xg-neon">
              {isChatOpen ? "HIDE // COMMS_PANEL" : "OPEN // COMMS_PANEL"}
            </span>
          </div>
        </div>

        {/* Enlace al Repositorio GitHub */}
        <a
          href="https://github.com/javierbrega/XtremGen"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Repositorio GitHub de XtremGen"
          title="GitHub // javierbrega/XtremGen"
          className="w-11 h-10 md:w-12 md:h-10 flex items-center justify-center rounded-none bg-[#0A0A0E] border border-white/15 text-white/70 hover:text-xg-yellow hover:border-xg-yellow hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-all"
        >
          <Github className="w-4 h-4" />
        </a>

        {/* Indicador Pulsante #D4FE00 (bg-xg-neon) */}
        <div
          className="flex items-center gap-1.5 pt-1"
          title="NODE STATUS: ONLINE"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-xg-neon opacity-75" />
            <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-xg-neon shadow-glow-neon" />
          </span>
          <span className="font-mono text-[9px] text-xg-neon tracking-tighter uppercase">
            ON
          </span>
        </div>
      </div>
    </aside>
  );
}
