"use client";

import React, { useState, useEffect } from 'react';
import {
  Gamepad2,
  CheckCircle2,
  ExternalLink,
  Unlink,
  Sparkles,
  Radio,
  MessageSquare,
  ShieldCheck,
  Plus,
  X,
} from 'lucide-react';
import {
  GamingConnections,
  getGamingConnections,
  connectTwitchAccount,
  disconnectTwitchAccount,
  connectKickAccount,
  disconnectKickAccount,
  connectDiscordAccount,
  disconnectDiscordAccount,
} from '../../lib/gaming-connections';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../ui/Base';

interface GamingIdentitiesCardProps {
  userId?: string;
}

export const GamingIdentitiesCard: React.FC<GamingIdentitiesCardProps> = ({ userId }) => {
  const { showNotification } = useNotification();
  const [connections, setConnections] = useState<GamingConnections>({});

  // Input states for quick connecting
  const [activeForm, setActiveForm] = useState<'twitch' | 'kick' | 'discord' | null>(null);
  const [inputValue, setInputValue] = useState('');

  const loadConnections = () => {
    setConnections(getGamingConnections(userId));
  };

  useEffect(() => {
    loadConnections();
    const handleUpdate = () => loadConnections();
    window.addEventListener('xg-gaming-connections-updated', handleUpdate);
    return () => window.removeEventListener('xg-gaming-connections-updated', handleUpdate);
  }, [userId]);

  const handleOpenForm = (platform: 'twitch' | 'kick' | 'discord', defaultUser = '') => {
    setActiveForm(platform);
    setInputValue(defaultUser);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    if (activeForm === 'twitch') {
      connectTwitchAccount(userId, inputValue);
      showNotification({
        title: '¡Twitch Vinculado!',
        message: `@${inputValue.replace(/^@/, '')} conectado para chatear en directos oficiales.`,
        type: 'success',
      });
    } else if (activeForm === 'kick') {
      connectKickAccount(userId, inputValue);
      showNotification({
        title: '¡Kick Vinculado!',
        message: `@${inputValue.replace(/^@/, '')} conectado a tu perfil de XtremGen.`,
        type: 'success',
      });
    } else if (activeForm === 'discord') {
      connectDiscordAccount(userId, inputValue);
      showNotification({
        title: '¡Discord Vinculado!',
        message: `Cuenta de Discord conectada con el Clan de XtremGen.`,
        type: 'success',
      });
    }

    setActiveForm(null);
    setInputValue('');
  };

  const handleDisconnect = (platform: 'twitch' | 'kick' | 'discord') => {
    if (platform === 'twitch') disconnectTwitchAccount(userId);
    if (platform === 'kick') disconnectKickAccount(userId);
    if (platform === 'discord') disconnectDiscordAccount(userId);

    showNotification({
      title: 'Cuenta desvinculada',
      message: `Has desconectado tu cuenta de ${platform.toUpperCase()}.`,
      type: 'info',
    });
  };

  return (
    <div className="bg-[#111116] border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      {/* Top ambient glow */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-[#00E701] to-[#5865F2]" />

      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-white/10">
        <div>
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-primary" />
            <span>Identidad Gamer & Cuentas</span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Conecta tus plataformas de streaming con 1 clic para chatear en directos oficiales y sincronizar tu Clan.
          </p>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono font-bold text-zinc-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Verificado</span>
        </span>
      </div>

      {/* 3 Platforms Grid */}
      <div className="space-y-3.5">
        {/* ---------------- 1. TWITCH ---------------- */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            connections.twitch?.connected
              ? 'bg-purple-950/20 border-purple-500/40 shadow-[0_0_15px_rgba(145,70,255,0.15)]'
              : 'bg-black/40 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Twitch Icon / Avatar */}
              <div className="w-10 h-10 rounded-xl bg-[#9146FF] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Twitch
                  </span>
                  {connections.twitch?.connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-purple-400" />
                      <span>Conectado</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">No vinculado</span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 truncate">
                  {connections.twitch?.connected ? (
                    <span className="font-bold text-purple-300 font-mono">
                      @{connections.twitch.username}
                    </span>
                  ) : (
                    'Chatea en streams oficiales sin bloqueo de cookies'
                  )}
                </p>
              </div>
            </div>

            {/* Action */}
            <div>
              {connections.twitch?.connected ? (
                <button
                  type="button"
                  onClick={() => handleDisconnect('twitch')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-1"
                  title="Desvincular Twitch"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desvincular</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenForm('twitch')}
                  className="px-3 py-1.5 rounded-lg text-xs font-black bg-[#9146FF] hover:bg-[#772ce8] text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Conectar</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Quick Connect Form */}
          {activeForm === 'twitch' && (
            <form onSubmit={handleSaveConnection} className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tu usuario de Twitch (ej: GhostShadow)"
                className="flex-1 bg-black/60 border border-purple-500/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black disabled:opacity-40 transition-all"
              >
                Vincular
              </button>
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* ---------------- 2. KICK ---------------- */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            connections.kick?.connected
              ? 'bg-[#00E701]/10 border-[#00E701]/40 shadow-[0_0_15px_rgba(0,231,1,0.15)]'
              : 'bg-black/40 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Kick Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#00E701] flex items-center justify-center text-black font-black text-sm shrink-0 shadow-md">
                <span>K</span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Kick
                  </span>
                  {connections.kick?.connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00E701]/20 text-[#00E701] border border-[#00E701]/40 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#00E701]" />
                      <span>Conectado</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">No vinculado</span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 truncate">
                  {connections.kick?.connected ? (
                    <span className="font-bold text-[#00E701] font-mono">
                      @{connections.kick.username}
                    </span>
                  ) : (
                    'Sincroniza tu canal y directos de Kick'
                  )}
                </p>
              </div>
            </div>

            {/* Action */}
            <div>
              {connections.kick?.connected ? (
                <button
                  type="button"
                  onClick={() => handleDisconnect('kick')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-1"
                  title="Desvincular Kick"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desvincular</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenForm('kick')}
                  className="px-3 py-1.5 rounded-lg text-xs font-black bg-[#00E701] hover:bg-[#00c801] text-black transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Conectar</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Quick Connect Form */}
          {activeForm === 'kick' && (
            <form onSubmit={handleSaveConnection} className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tu canal de Kick (ej: GhostShadow)"
                className="flex-1 bg-black/60 border border-[#00E701]/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#00E701]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#00E701] hover:bg-[#00c801] text-black text-xs font-black disabled:opacity-40 transition-all"
              >
                Vincular
              </button>
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

        {/* ---------------- 3. DISCORD ---------------- */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            connections.discord?.connected
              ? 'bg-[#5865F2]/10 border-[#5865F2]/40 shadow-[0_0_15px_rgba(88,101,242,0.15)]'
              : 'bg-black/40 border-white/5 hover:border-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {/* Discord Icon */}
              <div className="w-10 h-10 rounded-xl bg-[#5865F2] flex items-center justify-center text-white shrink-0 shadow-md">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white uppercase tracking-wider">
                    Discord
                  </span>
                  {connections.discord?.connected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#5865F2]/20 text-[#8ea1e1] border border-[#5865F2]/40 text-[10px] font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#5865F2]" />
                      <span>Sincronizado</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-500 font-mono">No vinculado</span>
                  )}
                </div>

                <p className="text-xs text-zinc-300 truncate">
                  {connections.discord?.connected ? (
                    <span className="font-bold text-[#8ea1e1] font-mono">
                      @{connections.discord.username}
                    </span>
                  ) : (
                    'Alertas de clan y hosteos automáticos en tu servidor'
                  )}
                </p>
              </div>
            </div>

            {/* Action */}
            <div>
              {connections.discord?.connected ? (
                <button
                  type="button"
                  onClick={() => handleDisconnect('discord')}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/10 hover:border-red-500/30 transition-all flex items-center gap-1"
                  title="Desvincular Discord"
                >
                  <Unlink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Desvincular</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenForm('discord')}
                  className="px-3 py-1.5 rounded-lg text-xs font-black bg-[#5865F2] hover:bg-[#4752c4] text-white transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Conectar</span>
                </button>
              )}
            </div>
          </div>

          {/* Inline Quick Connect Form */}
          {activeForm === 'discord' && (
            <form onSubmit={handleSaveConnection} className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Tu usuario de Discord (ej: GhostShadow#1337)"
                className="flex-1 bg-black/60 border border-[#5865F2]/40 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#5865F2]"
              />
              <button
                type="submit"
                disabled={!inputValue.trim()}
                className="px-3 py-1.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-black disabled:opacity-40 transition-all"
              >
                Vincular
              </button>
              <button
                type="button"
                onClick={() => setActiveForm(null)}
                className="p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
