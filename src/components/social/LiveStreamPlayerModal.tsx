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
} from 'lucide-react';
import {
  parseStreamInfo,
  getPlatformMeta,
  StreamPlatform,
} from '../../lib/stream-helpers';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge, Button } from '../ui/Base';

export interface LiveStreamData {
  id: string;
  user_id: string;
  media_url: string;
  caption?: string;
  created_at: string;
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
  const streamerName = stream.profiles?.username || 'Streamer XG';
  const streamerAvatar =
    stream.profiles?.avatar_url ||
    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${stream.user_id}`;

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
        className="relative w-full max-w-6xl max-h-[94vh] bg-[#0c0c10] border border-white/15 rounded-3xl overflow-hidden shadow-[0_0_90px_rgba(230,0,43,0.3)] flex flex-col"
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
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white">
                  {streamerName}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  EN DIRECTO
                </span>
              </div>
              <p className="text-xs text-zinc-400 truncate max-w-xs sm:max-w-md">
                {stream.caption || 'Transmitiendo en tiempo real para la comunidad XtremGen'}
              </p>
            </div>
          </div>

          {/* Platform Informational Badge: STRICTLY NON-LINK TO RETAIN USER ON XTREMGEN */}
          <div className="flex items-center gap-2">
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
          </div>
        </div>

        {/* Core Content: 16:9 Video Player + Live Community Chat */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left/Center: Video Player Stage */}
          <div className="lg:col-span-8 xl:col-span-9 bg-black flex flex-col justify-center relative min-h-[260px] sm:min-h-[420px] lg:min-h-[520px]">
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

          {/* Right: Live Community Chat / Cheers */}
          <div className="lg:col-span-4 xl:col-span-3 bg-[#13131a] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col h-[280px] lg:h-auto min-h-0">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Chat de la Comunidad
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-zinc-400">
                {comments.length} mensajes
              </span>
            </div>

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
                      <span className="font-bold text-zinc-200 truncate text-[11px]">
                        {msg.author}
                      </span>
                      <span className="text-[9px] text-zinc-500 font-mono">
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
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
