"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  X,
  Radio,
  Flame,
  ThumbsUp,
  Trophy,
  MessageCircle,
  Share2,
  Check,
  Send,
  Eye,
  Sparkles,
  Film,
  PanelRightClose,
  PanelRightOpen,
  ExternalLink,
} from 'lucide-react';
import {
  parseStreamInfo,
  getPlatformMeta,
  StreamPlatform,
  parseLiveCaption,
} from '../../lib/stream-helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge, Button } from '../ui/Base';
import { getGamingConnections, GamingConnections } from '../../lib/gaming-connections';

export interface LiveStreamData {
  id: string;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
  is_host?: boolean;
  host_username?: string;
  original_streamer?: string;
  profiles?: {
    username: string;
    avatar_url: string;
    is_pro?: boolean;
    role_badge?: string;
  };
}

interface LiveStreamPlayerModalProps {
  stream: LiveStreamData | null;
  isOpen: boolean;
  onClose: () => void;
}

interface StreamComment {
  id: string;
  user_id: string;
  author: string;
  avatar: string;
  content: string;
  created_at: string;
  twitch_badge?: string;
  kick_badge?: string;
}

export const LiveStreamPlayerModal: React.FC<LiveStreamPlayerModalProps> = ({
  stream,
  isOpen,
  onClose,
}) => {
  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  // Live reactions
  const [likes, setLikes] = useState<number>(42);
  const [ggs, setGgs] = useState<number>(27);
  const [mvps, setMvps] = useState<number>(19);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasGg, setHasGg] = useState(false);
  const [hasMvp, setHasMvp] = useState(false);

  // Link copy
  const [copied, setCopied] = useState(false);

  // Cinema Mode / Hide Chat toggle
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  // Dual Chat Tab: 'xg' (Community Chat) vs 'platform' (Twitch / Kick / YouTube)
  const [activeChatTab, setActiveChatTab] = useState<'xg' | 'platform'>('xg');

  // Gaming Identities (Twitch, Kick, Discord)
  const [gamingConns, setGamingConns] = useState<GamingConnections>({});

  useEffect(() => {
    setGamingConns(getGamingConnections(user?.id));
    const handleConnUpdate = (e: any) => {
      setGamingConns(e.detail || getGamingConnections(user?.id));
    };
    window.addEventListener('xg-gaming-connections-updated', handleConnUpdate);
    return () => window.removeEventListener('xg-gaming-connections-updated', handleConnUpdate);
  }, [user?.id]);

  // Chat comments
  const [comments, setComments] = useState<StreamComment[]>([
    {
      id: 'sc-1',
      user_id: 'seed-1',
      author: 'GhostSniper',
      avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=GhostSniper',
      content: '¡Buena partida! Sigue así con ese sniper 🔥',
      created_at: new Date(Date.now() - 120000).toISOString(),
    },
    {
      id: 'sc-2',
      user_id: 'seed-2',
      author: 'RoninGamer',
      avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=RoninSniper',
      content: 'GG en esa ronda final de Search & Destroy',
      created_at: new Date(Date.now() - 45000).toISOString(),
    },
    {
      id: 'sc-3',
      user_id: 'seed-3',
      author: 'CyberDrop',
      avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CyberDrop',
      content: 'Apoyando desde XtremGen 🚀',
      created_at: new Date(Date.now() - 10000).toISOString(),
    },
  ]);
  const [newComment, setNewComment] = useState('');

  // Keyboard navigation: Escape to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !stream) return null;

  const streamInfo = parseStreamInfo(stream.media_url);
  const streamMeta = getPlatformMeta(streamInfo.platform);
  const hostInfo = parseLiveCaption(stream.caption);
  const isHost = Boolean(stream.is_host || hostInfo.isHost);
  const hostUsername = stream.host_username || hostInfo.hostUsername;
  const streamerName = stream.original_streamer || stream.profiles?.username || 'Streamer XG';
  const streamerAvatar =
    stream.profiles?.avatar_url ||
    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${stream.user_id}`;

  const getPlatformChatUrl = () => {
    if (!streamInfo.channelOrId) return null;
    const parentHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    if (streamInfo.platform === 'twitch') {
      return `https://www.twitch.tv/embed/${streamInfo.channelOrId}/chat?parent=${parentHost}&parent=localhost&parent=xtremgen.vercel.app&darkpopout`;
    }
    if (streamInfo.platform === 'kick') {
      return `https://kick.com/${streamInfo.channelOrId}/chatroom`;
    }
    if (streamInfo.platform === 'youtube') {
      return `https://www.youtube.com/live_chat?v=${streamInfo.channelOrId}&embed_domain=${parentHost}`;
    }
    return null;
  };
  const platformChatUrl = getPlatformChatUrl();

  const handleToggleLike = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setHasLiked(!hasLiked);
    setLikes((prev) => (hasLiked ? Math.max(prev - 1, 0) : prev + 1));
  };

  const handleToggleGg = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setHasGg(!hasGg);
    setGgs((prev) => (hasGg ? Math.max(prev - 1, 0) : prev + 1));
  };

  const handleToggleMvp = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    setHasMvp(!hasMvp);
    setMvps((prev) => (hasMvp ? Math.max(prev - 1, 0) : prev + 1));
  };

  const handleShare = async () => {
    if (typeof window !== 'undefined') {
      try {
        const shareUrl = `${window.location.origin}/social?live=${stream.id}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showNotification({
          title: 'Directo compartido',
          message: 'Enlace del directo en XtremGen copiado al portapapeles.',
          type: 'success',
        });
      } catch {}
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newComment.trim()) return;

    const commentItem: StreamComment = {
      id: `sc-${Date.now()}`,
      user_id: user.id,
      author: profile?.username || 'Gamer',
      avatar:
        profile?.avatar_url ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      twitch_badge: gamingConns.twitch?.connected ? gamingConns.twitch.username : undefined,
      kick_badge: gamingConns.kick?.connected ? gamingConns.kick.username : undefined,
    };

    setComments((prev) => [...prev, commentItem]);
    setNewComment('');
  };

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200"
    >
      {/* Top Floating Close Button */}
      <button
        type="button"
        onClick={onClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md z-[100] transition-all hover:scale-110 active:scale-95 shadow-xl border border-white/10"
        title="Cerrar reproductor (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Theater Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full ${
          isCinemaMode ? 'max-w-7xl' : 'max-w-6xl'
        } max-h-[94vh] bg-[#0c0c10] border border-white/15 rounded-3xl overflow-hidden shadow-[0_0_90px_rgba(230,0,43,0.3)] flex flex-col transition-all duration-300`}
      >
        {/* Streamer Top Bar */}
        <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-black/90 via-[#14141c] to-black/90 border-b border-white/10 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            {/* Glowing Streamer Avatar */}
            <div className="relative w-10 h-10 rounded-full p-[2.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 shadow-[0_0_16px_rgba(239,68,68,0.95)] animate-pulse flex-shrink-0">
              <img
                src={streamerAvatar}
                alt={streamerName}
                className="w-full h-full rounded-full object-cover border border-black bg-zinc-800"
              />
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full bg-red-600 text-white font-black text-[8px] uppercase tracking-wider shadow-lg">
                VIVO
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {streamerName}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  EN DIRECTO
                </span>
                {isHost && hostUsername && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500/25 to-yellow-500/25 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider shadow-sm">
                    <span>🤝 Hosteado por @{hostUsername}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
                {hostInfo.cleanCaption || stream.caption || 'Transmitiendo en tiempo real para la comunidad XtremGen'}
              </p>
            </div>
          </div>

          {/* Controls: Platform Badge, Viewers, and Modo Cine Toggle */}
          <div className="flex items-center gap-2">
            {/* Platform Informational Badge: STRICTLY NON-LINK TO RETAIN USER ON XTREMGEN */}
            <div
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white text-xs font-black shadow-lg border border-white/20 select-none"
              style={{ backgroundColor: streamMeta.color }}
              title={`Directo emitido desde ${streamMeta.name}`}
            >
              <streamMeta.Icon className="w-3.5 h-3.5" />
              <span>{streamMeta.badge}</span>
            </div>

            <div className="px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-zinc-300 text-xs font-mono flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-red-400" />
              <span className="font-bold">En Vivo</span>
            </div>

            {/* Cinema Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setIsCinemaMode(!isCinemaMode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all border shadow-lg ${
                isCinemaMode
                  ? 'bg-primary border-primary text-white shadow-[0_0_15px_rgba(230,0,43,0.5)]'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-zinc-200'
              }`}
              title={isCinemaMode ? 'Mostrar Chat' : 'Activar Modo Cine (Ocultar Chat)'}
            >
              <Film className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isCinemaMode ? 'Salir de Modo Cine' : 'Modo Cine'}
              </span>
              <span className="sm:hidden">
                {isCinemaMode ? 'Chat' : 'Cine'}
              </span>
            </button>
          </div>
        </div>

        {/* Core Content: 16:9 Video Player + Live Community/Platform Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left/Center: Video Player Stage */}
          <div
            className={`${
              isCinemaMode ? 'lg:col-span-12 xl:col-span-12' : 'lg:col-span-8 xl:col-span-9'
            } bg-black flex flex-col justify-center relative min-h-[260px] sm:min-h-[420px] lg:min-h-[520px] transition-all duration-300`}
          >
            {/* Cinema mode floating re-open chat button */}
            {isCinemaMode && (
              <button
                type="button"
                onClick={() => setIsCinemaMode(false)}
                className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/80 hover:bg-black/95 text-white text-xs font-bold border border-white/20 shadow-xl backdrop-blur-md transition-transform hover:scale-105"
                title="Mostrar Chat"
              >
                <PanelRightOpen className="w-3.5 h-3.5 text-primary" />
                <span>Mostrar Chat</span>
              </button>
            )}

            {streamInfo.canEmbed && streamInfo.embedUrl ? (
              <div className="w-full h-full relative aspect-video flex items-center justify-center bg-black">
                <iframe
                  src={streamInfo.embedUrl}
                  title={streamInfo.displayName}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              /* Immersive Live Ambient Card for TikTok, Instagram or non-iframeable streams */
              <div
                className={`w-full h-full aspect-video relative flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br ${streamMeta.bgGradient}`}
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <div className="relative z-10 max-w-md space-y-4">
                  <div
                    className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-white shadow-2xl border border-white/20"
                    style={{ backgroundColor: streamMeta.color }}
                  >
                    <streamMeta.Icon className="w-10 h-10" />
                  </div>
                  <div className="space-y-1">
                    <span className="px-3 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white block" />
                      EN VIVO EN {streamMeta.name.toUpperCase()}
                    </span>
                    <h4 className="text-lg font-black text-white pt-2">
                      {streamerName} está transmitiendo en vivo
                    </h4>
                    <p className="text-xs text-zinc-300">
                      {stream.caption || 'Disfruta de la retransmisión oficial y chatea con el clan'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Stream Bar: Reactions + Share */}
            <div className="p-3 sm:p-4 bg-[#101015] border-t border-white/10 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Flame / Like */}
                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    hasLiked
                      ? 'bg-orange-500/20 border-orange-500 text-orange-400'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                  title="Fuego / Me gusta"
                >
                  <Flame className={`w-4 h-4 ${hasLiked ? 'fill-orange-400 text-orange-400' : ''}`} />
                  <span>{likes}</span>
                </button>

                {/* GG */}
                <button
                  type="button"
                  onClick={handleToggleGg}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    hasGg
                      ? 'bg-primary/20 border-primary text-primary'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                  title="GG (Bien jugado)"
                >
                  <ThumbsUp className={`w-4 h-4 ${hasGg ? 'fill-primary text-primary' : ''}`} />
                  <span>{ggs} GG</span>
                </button>

                {/* MVP */}
                <button
                  type="button"
                  onClick={handleToggleMvp}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                    hasMvp
                      ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                      : 'bg-white/5 hover:bg-white/10 border-white/10 text-zinc-300'
                  }`}
                  title="MVP"
                >
                  <Trophy className={`w-4 h-4 ${hasMvp ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  <span>{mvps} MVP</span>
                </button>
              </div>

              {/* Share in XtremGen */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 text-xs font-bold transition-all"
                title="Compartir enlace de XtremGen"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado!' : 'Compartir'}</span>
              </button>
            </div>
          </div>

          {/* Right: Live Chat (XtremGen Community or Official Platform) */}
          {!isCinemaMode && (
            <div className="lg:col-span-4 xl:col-span-3 bg-[#13131a] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-[320px] lg:h-auto min-h-0">
              {/* Chat Header with Dual Tabs and Cinema Mode Toggle */}
              <div className="px-3 py-2.5 border-b border-white/10 flex items-center justify-between bg-black/40 gap-2">
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setActiveChatTab('xg')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                      activeChatTab === 'xg'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Chat XG</span>
                  </button>

                  {platformChatUrl && (
                    <button
                      type="button"
                      onClick={() => setActiveChatTab('platform')}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                        activeChatTab === 'platform'
                          ? 'text-white shadow-md'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                      style={
                        activeChatTab === 'platform'
                          ? { backgroundColor: streamMeta.color }
                          : {}
                      }
                      title={`Chat oficial de ${streamMeta.name}`}
                    >
                      <streamMeta.Icon className="w-3.5 h-3.5" />
                      <span>{streamMeta.name}</span>
                    </button>
                  )}
                </div>

                {/* Hide Chat / Enter Cinema Mode */}
                <button
                  type="button"
                  onClick={() => setIsCinemaMode(true)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Ocultar chat (Modo Cine)"
                >
                  <PanelRightClose className="w-4 h-4" />
                </button>
              </div>

              {/* Chat Content Body */}
              {activeChatTab === 'platform' && platformChatUrl ? (
                /* Official Platform Embedded Chat (Twitch, Kick, YouTube) */
                <div className="flex-1 min-h-0 relative bg-black flex flex-col">
                  <iframe
                    src={platformChatUrl}
                    title={`Chat oficial de ${streamMeta.name}`}
                    className="w-full h-full border-0 flex-1"
                    sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
                  />
                  <div className="px-3 py-2 bg-[#0c0c12] border-t border-white/10 flex items-center justify-between gap-2 text-[10px] text-zinc-300">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse shrink-0" />
                      <span className="truncate">
                        {streamInfo.platform === 'twitch' && gamingConns.twitch?.connected ? (
                          <span className="text-purple-300 font-mono font-bold">
                            🟣 @{gamingConns.twitch.username} (Vinculado)
                          </span>
                        ) : streamInfo.platform === 'kick' && gamingConns.kick?.connected ? (
                          <span className="text-[#00E701] font-mono font-bold">
                            🟢 @{gamingConns.kick.username} (Vinculado)
                          </span>
                        ) : (
                          <span>Visor en directo sincronizado</span>
                        )}
                      </span>
                    </div>

                    {streamInfo.platform === 'twitch' && (
                      <button
                        type="button"
                        onClick={() => {
                          const popoutUrl = `https://www.twitch.tv/popout/${streamInfo.channelOrId}/chat`;
                          window.open(popoutUrl, '_blank', 'width=420,height=650,menubar=no,toolbar=no,location=no');
                        }}
                        className="px-2 py-1 rounded-lg bg-[#9146FF] hover:bg-[#772ce8] text-white font-black text-[10px] transition-all flex items-center gap-1 shrink-0 shadow-md active:scale-95"
                        title="Abrir ventana oficial de Twitch con tu sesión y puntos completos (sin errores de cookies)"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Popout Oficial</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* XtremGen Community Chat */
                <>
                  {/* Host Announcement banner in chat */}
                  {isHost && hostUsername && (
                    <div className="m-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-200 shadow-inner">
                      <span className="text-base shrink-0">🤝</span>
                      <span className="text-[11px] leading-tight">
                        <strong className="text-amber-300">@{hostUsername}</strong> está hosteando este stream. ¡Apoya con GG y comentarios!
                      </span>
                    </div>
                  )}

                  {/* Chat Feed */}
                  <div className="flex-1 overflow-y-auto p-3 space-y-2.5 no-scrollbar">
                    {comments.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-2 text-xs">
                        <img
                          src={msg.avatar}
                          alt={msg.author}
                          className="w-6 h-6 rounded-full object-cover border border-white/15 flex-shrink-0 mt-0.5"
                        />
                        <div className="flex-1 min-w-0 bg-white/5 rounded-xl px-2.5 py-1.5 border border-white/5">
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="font-bold text-zinc-200 truncate text-[11px]">
                                {msg.author}
                              </span>
                              {msg.twitch_badge && (
                                <span className="inline-flex items-center px-1.5 py-[0.5px] rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[9px] font-mono font-bold">
                                  🟣 @{msg.twitch_badge}
                                </span>
                              )}
                              {msg.kick_badge && (
                                <span className="inline-flex items-center px-1.5 py-[0.5px] rounded bg-[#00E701]/20 text-[#00E701] border border-[#00E701]/30 text-[9px] font-mono font-bold">
                                  🟢 @{msg.kick_badge}
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-zinc-500 font-mono shrink-0">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-zinc-300 text-xs mt-0.5 break-words">
                            {msg.content}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={handleAddComment} className="p-3 bg-black/60 border-t border-white/10">
                    <div className="flex items-center gap-1.5 bg-[#181824] border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-primary transition-colors">
                      <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={
                          user ? 'Envía un mensaje al directo...' : 'Inicia sesión para chatear...'
                        }
                        className="w-full bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={!newComment.trim()}
                        className="p-1 rounded-lg bg-primary hover:bg-primary/90 text-white disabled:opacity-30 transition-all flex-shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
