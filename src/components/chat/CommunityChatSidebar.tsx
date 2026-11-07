"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  PanelRightClose,
  Hash,
  Users,
  ShieldAlert,
  Sparkles,
  Radio,
} from "lucide-react";
import type { ChannelId, ChatMessage, ChatRole } from "@/types/xtremgen";

export interface CommunityChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHANNELS: { id: ChannelId; label: string; onlineCount: number }[] = [
  { id: "general", label: "#general", onlineCount: 142 },
  { id: "drops-xg", label: "#drops-xg", onlineCount: 89 },
  { id: "cyber-arena", label: "#cyber-arena", onlineCount: 54 },
];

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    channel: "general",
    username: "Argon XG",
    role_badge: "SYSTEM BOT",
    content:
      "⚡ PROTOCOLO XTREMGEN v2.5 ACTIVO. El Drop 'AKIRA // ZERO-G TECH HOODIE' entra en fase de acceso anticipado.",
    created_at: "21:04",
    is_online: true,
    reactions: { hype: 24, drop: 18, rebel: 9 },
  },
  {
    id: "msg-2",
    channel: "general",
    username: "javib31",
    role_badge: "FOUNDER",
    content:
      "Bienvenidos al hub oficial de XtremGen. Hoy liberamos 150 unidades numeradas con corte pesado 500GSM. Estén atentos al canal #drops-xg.",
    created_at: "21:06",
    is_online: true,
    reactions: { hype: 42, drop: 31, rebel: 15 },
  },
  {
    id: "msg-3",
    channel: "general",
    username: "NeoTokyo_Drifter",
    role_badge: "RONIN",
    content:
      "La estética Opera GX de la nueva interfaz está brutal 🔥 ¿El envío a LATAM y España sigue con tracking prioritario?",
    created_at: "21:08",
    is_online: true,
    reactions: { hype: 7, drop: 3, rebel: 2 },
  },
  {
    id: "msg-4",
    channel: "general",
    username: "Valkyrie_XG",
    role_badge: "REBEL",
    content:
      "Confirmado @NeoTokyo_Drifter, me llegó la chaqueta Ronin en 48h con el tag metálico coleccionable y stickers holográficos 👹",
    created_at: "21:10",
    is_online: true,
    reactions: { hype: 14, drop: 9, rebel: 11 },
  },
  {
    id: "msg-5",
    channel: "drops-xg",
    username: "Argon XG",
    role_badge: "SYSTEM BOT",
    content:
      "🚨 ALERTA DE STOCK: Quedan menos de 15 unidades del Drop 'KITSUNE BLOODLINE CARGO' en talla L y XL.",
    created_at: "21:02",
    is_online: true,
    reactions: { hype: 19, drop: 27, rebel: 6 },
  },
  {
    id: "msg-6",
    channel: "drops-xg",
    username: "javib31",
    role_badge: "FOUNDER",
    content:
      "No habrá restock del Kitsune Cargo. Una vez agotado pasa directo a la bóveda histórica XG.",
    created_at: "21:05",
    is_online: true,
    reactions: { hype: 33, drop: 29, rebel: 14 },
  },
  {
    id: "msg-7",
    channel: "cyber-arena",
    username: "NeoTokyo_Drifter",
    role_badge: "RONIN",
    content:
      "¿Alguien para lobby nocturno en Valorant / Tekken 8? Estamos en el canal de voz Cyber-01 en Discord.",
    created_at: "20:58",
    is_online: true,
    reactions: { hype: 11, drop: 2, rebel: 8 },
  },
  {
    id: "msg-8",
    channel: "cyber-arena",
    username: "Valkyrie_XG",
    role_badge: "REBEL",
    content:
      "Entrando en 5 min. El que gane el torneo de la comunidad se lleva código de descuento 20% para el próximo drop.",
    created_at: "21:01",
    is_online: true,
    reactions: { hype: 16, drop: 12, rebel: 10 },
  },
];

function getRoleBadgeStyle(role: ChatRole): {
  badgeClass: string;
  nameClass: string;
} {
  switch (role) {
    case "FOUNDER":
      return {
        badgeClass:
          "bg-[#FFD200] text-black border border-[#FFD200] shadow-[2px_2px_0px_0px_#E6002B]",
        nameClass: "text-[#FFD200]",
      };
    case "SYSTEM BOT":
      return {
        badgeClass:
          "bg-[#E6002B] text-white border border-[#E6002B] shadow-[2px_2px_0px_0px_#000000]",
        nameClass: "text-[#E6002B]",
      };
    case "RONIN":
      return {
        badgeClass:
          "bg-[#D4FE00]/15 text-[#D4FE00] border border-[#D4FE00]",
        nameClass: "text-[#D4FE00]",
      };
    case "REBEL":
      return {
        badgeClass:
          "bg-[#FFD200]/15 text-[#FFD200] border border-[#FFD200]/70",
        nameClass: "text-white",
      };
    default:
      return {
        badgeClass: "bg-white/10 text-white border border-white/30",
        nameClass: "text-white",
      };
  }
}

export function CommunityChatSidebar({
  isOpen,
  onClose,
}: CommunityChatSidebarProps) {
  const [activeChannel, setActiveChannel] = useState<ChannelId>("general");
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [userHandle, setUserHandle] = useState("NightRunner_99");
  const feedEndRef = useRef<HTMLDivElement | null>(null);

  const channelMessages = messages.filter(
    (msg) => msg.channel === activeChannel
  );

  const currentChannelMeta =
    CHANNELS.find((c) => c.id === activeChannel) ?? CHANNELS[0];

  useEffect(() => {
    feedEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length, activeChannel]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channel: activeChannel,
      username: userHandle.trim() || "NightRunner_99",
      role_badge: "REBEL",
      content: trimmed,
      created_at: timeFormatted,
      is_online: true,
      reactions: { hype: 1, drop: 0, rebel: 0 },
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
  };

  const handleQuickReaction = (label: string) => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    const reactionMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      channel: activeChannel,
      username: userHandle.trim() || "NightRunner_99",
      role_badge: "REBEL",
      content: `${label} // Señal enviada al canal #${activeChannel}`,
      created_at: timeFormatted,
      is_online: true,
      reactions: { hype: 2, drop: 1, rebel: 1 },
    };

    setMessages((prev) => [...prev, reactionMessage]);
  };

  const handleIncrementMessageReaction = (
    messageId: string,
    key: "hype" | "drop" | "rebel"
  ) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId) return m;
        const current = m.reactions ?? { hype: 0, drop: 0, rebel: 0 };
        return {
          ...m,
          reactions: {
            ...current,
            [key]: current[key] + 1,
          },
        };
      })
    );
  };

  if (!isOpen) {
    return null;
  }

  return (
    <aside
      aria-label="Comunidad Live Chat"
      className="w-80 xl:w-96 shrink-0 bg-[#050508] border-l-2 border-xg-yellow/40 flex flex-col h-full select-none relative z-30"
    >
      {/* Decorative top cyber accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FFD200] via-[#E6002B] to-[#D4FE00]" />

      {/* Header */}
      <div className="p-3.5 border-b border-white/10 bg-[#0A0A0E]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-none bg-[#D4FE00] opacity-75" />
              <span className="relative inline-flex rounded-none h-2.5 w-2.5 bg-[#D4FE00] shadow-[0_0_10px_#D4FE00]" />
            </span>
            <h2 className="font-display text-xs md:text-sm font-bold tracking-wider uppercase text-white">
              COMUNIDAD // LIVE CHAT
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            title="Colapsar panel de chat"
            className="p-1.5 rounded-none bg-[#050508] border border-white/20 text-white/70 hover:text-[#FFD200] hover:border-[#FFD200] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-all"
          >
            <PanelRightClose className="w-4 h-4" />
          </button>
        </div>

        {/* Status Subbar */}
        <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-white/60">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-[#D4FE00]" />
            <span>SUPABASE REALTIME: SYNC</span>
          </div>
          <div className="flex items-center gap-1 text-[#D4FE00]">
            <Users className="w-3.5 h-3.5" />
            <span>{currentChannelMeta.onlineCount} ONLINE</span>
          </div>
        </div>

        {/* Channel Selector */}
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {CHANNELS.map((channel) => {
            const isActive = channel.id === activeChannel;
            return (
              <button
                key={channel.id}
                type="button"
                onClick={() => setActiveChannel(channel.id)}
                className={`px-2 py-1.5 text-[11px] font-mono uppercase tracking-tight rounded-none border transition-all truncate ${
                  isActive
                    ? "bg-[#FFD200] text-black font-bold border-[#FFD200] shadow-[3px_3px_0px_0px_#E6002B]"
                    : "bg-[#050508] text-white/70 border-white/15 hover:border-[#FFD200]/60 hover:text-white"
                }`}
              >
                {channel.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pinned Notice Banner */}
      <div className="px-3 py-2 bg-[#0B1020] border-b border-[#E6002B]/40 flex items-center gap-2 text-[11px] font-mono text-white/80">
        <ShieldAlert className="w-4 h-4 text-[#E6002B] shrink-0" />
        <p className="truncate">
          <span className="text-[#FFD200] font-bold">REGLA #01:</span> Respeto en
          la arena. Drops verificados por{" "}
          <span className="text-[#D4FE00]">RLS Auth</span>.
        </p>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 select-text">
        {channelMessages.map((msg) => {
          const { badgeClass, nameClass } = getRoleBadgeStyle(msg.role_badge);
          return (
            <div
              key={msg.id}
              className="group bg-[#0A0A0E] border border-white/10 hover:border-[#FFD200]/50 p-2.5 rounded-none shadow-[4px_4px_0px_0px_#000000] transition-all"
            >
              {/* Message Header */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="inline-block w-2 h-2 rounded-none bg-[#D4FE00] shrink-0"
                    title="En línea"
                  />
                  <span
                    className={`font-mono text-xs font-bold truncate ${nameClass}`}
                  >
                    {msg.username}
                  </span>
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold uppercase rounded-none tracking-wider shrink-0 ${badgeClass}`}
                  >
                    [{msg.role_badge}]
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40 shrink-0">
                  {msg.created_at}
                </span>
              </div>

              {/* Message Content */}
              <p className="text-xs text-white/90 leading-relaxed break-words font-sans">
                {msg.content}
              </p>

              {/* Micro Reactions Bar */}
              {msg.reactions && (
                <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleIncrementMessageReaction(msg.id, "hype")
                    }
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-[#050508] border border-white/10 hover:border-[#FFD200] text-white/70 hover:text-[#FFD200] rounded-none transition-colors"
                  >
                    ⚡ {msg.reactions.hype}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleIncrementMessageReaction(msg.id, "drop")
                    }
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-[#050508] border border-white/10 hover:border-[#E6002B] text-white/70 hover:text-[#E6002B] rounded-none transition-colors"
                  >
                    🔥 {msg.reactions.drop}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleIncrementMessageReaction(msg.id, "rebel")
                    }
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-[#050508] border border-white/10 hover:border-[#D4FE00] text-white/70 hover:text-[#D4FE00] rounded-none transition-colors"
                  >
                    👹 {msg.reactions.rebel}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        <div ref={feedEndRef} />
      </div>

      {/* Quick Reaction Buttons + Input Area */}
      <div className="p-3 border-t-2 border-xg-yellow/30 bg-[#0A0A0E] space-y-2.5">
        {/* Quick Reactions */}
        <div className="flex items-center justify-between gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickReaction("⚡ HYPE")}
            className="flex-1 py-1 px-2 text-[11px] font-mono font-bold bg-[#050508] text-[#FFD200] border border-[#FFD200]/50 rounded-none shadow-[2px_2px_0px_0px_#000] hover:bg-[#FFD200] hover:text-black hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] transition-all"
          >
            ⚡ HYPE
          </button>
          <button
            type="button"
            onClick={() => handleQuickReaction("🔥 DROP")}
            className="flex-1 py-1 px-2 text-[11px] font-mono font-bold bg-[#050508] text-[#E6002B] border border-[#E6002B]/60 rounded-none shadow-[2px_2px_0px_0px_#000] hover:bg-[#E6002B] hover:text-white hover:shadow-[0_0_20px_rgba(230,0,43,0.45)] transition-all"
          >
            🔥 DROP
          </button>
          <button
            type="button"
            onClick={() => handleQuickReaction("👹 REBEL")}
            className="flex-1 py-1 px-2 text-[11px] font-mono font-bold bg-[#050508] text-[#D4FE00] border border-[#D4FE00]/50 rounded-none shadow-[2px_2px_0px_0px_#000] hover:bg-[#D4FE00] hover:text-black hover:shadow-[0_0_15px_rgba(212,254,0,0.45)] transition-all"
          >
            👹 REBEL
          </button>
        </div>

        {/* Handle indicator */}
        <div className="flex items-center justify-between text-[10px] font-mono text-white/50">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#FFD200]" />
            ID ACTIVO:
          </span>
          <input
            type="text"
            value={userHandle}
            onChange={(e) => setUserHandle(e.target.value)}
            maxLength={20}
            aria-label="Alias de usuario"
            className="bg-transparent border-b border-white/20 focus:border-[#FFD200] text-[#D4FE00] text-right font-mono text-[10px] focus:outline-none px-1 w-28"
          />
        </div>

        {/* Message Form */}
        <form onSubmit={handleSendMessage} className="flex items-center gap-1.5">
          <div className="relative flex-1">
            <Hash className="w-3.5 h-3.5 text-[#FFD200]/70 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Transmitir en #${activeChannel}...`}
              maxLength={280}
              className="w-full pl-8 pr-2.5 py-2 text-xs font-mono bg-[#050508] text-white placeholder:text-white/35 border border-white/20 focus:border-[#FFD200] focus:outline-none rounded-none shadow-[4px_4px_0px_0px_#000000]"
            />
          </div>
          <button
            type="submit"
            aria-label="Enviar mensaje"
            className="px-3 py-2 bg-[#FFD200] text-black font-mono font-bold text-xs rounded-none border border-[#FFD200] shadow-[4px_4px_0px_0px_#E6002B] hover:shadow-[0_0_20px_rgba(255,210,0,0.45)] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </aside>
  );
}

export default CommunityChatSidebar;
