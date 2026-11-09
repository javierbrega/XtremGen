"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from '../../lib/motion';
import {
  X,
  ChevronUp,
  ChevronDown,
  Flame,
  ThumbsUp,
  Trophy,
  MessageCircle,
  Share2,
  Check,
  Send,
  Loader2,
  Sparkles,
  Radio,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { YouTubeIcon, extractYouTubeId } from './StoriesSection';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge, Button } from '../ui/Base';

interface StoryItem {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'youtube' | 'live';
  caption?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
    is_pro?: boolean;
    role_badge?: string;
  };
}

interface UserStoryGroup {
  userId: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  latestStory: StoryItem;
}

interface ShortsViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyGroups: UserStoryGroup[];
  initialGroupIndex: number;
  initialStoryIndex?: number;
}

interface ShortComment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  author: string;
  avatar: string;
}

export const ShortsViewerModal: React.FC<ShortsViewerModalProps> = ({
  isOpen,
  onClose,
  storyGroups,
  initialGroupIndex,
  initialStoryIndex = 0,
}) => {
  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(initialStoryIndex);

  // Reaction counters & active state
  const [likes, setLikes] = useState<number>(14);
  const [ggs, setGgs] = useState<number>(8);
  const [mvps, setMvps] = useState<number>(5);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasGg, setHasGg] = useState(false);
  const [hasMvp, setHasMvp] = useState(false);

  // Side-panel comments state
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [comments, setComments] = useState<ShortComment[]>([
    {
      id: 'c1',
      user_id: 'seed-1',
      content: '¡Qué puntería en ese clutch! 🔥',
      created_at: new Date(Date.now() - 60000 * 15).toISOString(),
      author: 'RoninSniper',
      avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=RoninSniper',
    },
    {
      id: 'c2',
      user_id: 'seed-2',
      content: 'Top jugada de la semana en BO7 🎯',
      created_at: new Date(Date.now() - 60000 * 5).toISOString(),
      author: 'CyberDrop',
      avatar: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CyberDrop',
    },
  ]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Link copy state
  const [copied, setCopied] = useState(false);

  // Progress & timer state
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);
  const touchStartY = useRef<number | null>(null);

  // Sync state when props change
  useEffect(() => {
    setGroupIndex(initialGroupIndex);
    setStoryIndex(initialStoryIndex);
    setProgress(0);
  }, [initialGroupIndex, initialStoryIndex]);

  const activeGroup = storyGroups[groupIndex];
  const currentStory = activeGroup ? activeGroup.stories[storyIndex] : null;

  // Stable references for navigation
  const groupIndexRef = useRef(groupIndex);
  groupIndexRef.current = groupIndex;
  const storyIndexRef = useRef(storyIndex);
  storyIndexRef.current = storyIndex;

  const handleNextStory = useCallback(() => {
    const gIdx = groupIndexRef.current;
    const sIdx = storyIndexRef.current;
    const grp = storyGroups[gIdx];
    if (!grp) return;

    if (sIdx < grp.stories.length - 1) {
      setStoryIndex(sIdx + 1);
      setProgress(0);
    } else if (gIdx < storyGroups.length - 1) {
      setGroupIndex(gIdx + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  }, [storyGroups, onClose]);

  const handlePrevStory = useCallback(() => {
    const gIdx = groupIndexRef.current;
    const sIdx = storyIndexRef.current;

    if (sIdx > 0) {
      setStoryIndex(sIdx - 1);
      setProgress(0);
    } else if (gIdx > 0) {
      const prevGrp = storyGroups[gIdx - 1];
      setGroupIndex(gIdx - 1);
      setStoryIndex(prevGrp ? prevGrp.stories.length - 1 : 0);
      setProgress(0);
    }
  }, [storyGroups]);

  // Keyboard navigation: ArrowUp (prev), ArrowDown (next), Escape (close)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextStory();
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevStory();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNextStory, handlePrevStory, onClose]);

  // Subtle Mouse Wheel Navigation (Debounced)
  const lastWheelTime = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 600) return; // 600ms debounce
    if (Math.abs(e.deltaY) > 40) {
      lastWheelTime.current = now;
      if (e.deltaY > 0) {
        handleNextStory();
      } else {
        handlePrevStory();
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartY.current !== null) {
      const deltaY = e.changedTouches[0].clientY - touchStartY.current;
      if (Math.abs(deltaY) > 50) {
        if (deltaY < 0) {
          handleNextStory();
        } else {
          handlePrevStory();
        }
      }
    }
    touchStartY.current = null;
  };

  // Timer auto-advance (YouTube Shorts: 30s, Images: 6s)
  useEffect(() => {
    if (!isOpen || !currentStory || isPaused) {
      return;
    }

    const isYouTube = currentStory.media_type === 'youtube';
    const isLive = currentStory.media_type === 'live';
    if (isLive) return; // Live streams don't auto-advance

    const duration = isYouTube ? 35000 : 6000;
    const interval = 50;
    const step = (interval / duration) * 100;

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNextStory();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, currentStory, isPaused, handleNextStory]);

  if (!isOpen || !activeGroup || !currentStory) return null;

  const ytId =
    currentStory.media_type === 'youtube' ? extractYouTubeId(currentStory.media_url) : null;
  const isLive = currentStory.media_type === 'live';

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
        const shareUrl = `${window.location.origin}/social?short=${currentStory.id}`;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showNotification({
          title: 'Enlace copiado',
          message: 'Enlace al Short copiado al portapapeles.',
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

    setIsSubmittingComment(true);
    const commentItem: ShortComment = {
      id: `comm-${Date.now()}`,
      user_id: user.id,
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      author: profile?.username || 'Gamer',
      avatar:
        profile?.avatar_url ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${user.id}`,
    };

    setComments((prev) => [commentItem, ...prev]);
    setNewComment('');
    setIsSubmittingComment(false);
  };

  const isFirstStoryOverall = groupIndex === 0 && storyIndex === 0;
  const isLastStoryOverall =
    Boolean(activeGroup) &&
    groupIndex === storyGroups.length - 1 &&
    storyIndex === (activeGroup?.stories.length ?? 1) - 1;

  // Shared Action Buttons Renderer (Overlay inside video on mobile, column beside video on desktop)
  const renderActionButtons = (isOverlay = false) => (
    <div
      className={
        isOverlay
          ? "sm:hidden absolute right-2.5 bottom-12 flex flex-col items-center gap-2.5 z-40 select-none"
          : "hidden sm:flex flex-col items-center gap-3.5 z-40 select-none"
      }
    >
      {/* Reaction 1: Flame / Like */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleLike}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md border ${
            hasLiked
              ? 'bg-orange-500/25 border-orange-500 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)]'
              : 'bg-black/60 sm:bg-white/10 hover:bg-white/20 border-white/20 sm:border-white/15 text-white'
          }`}
          title="Fuego / Me gusta"
        >
          <Flame className={`w-5 h-5 sm:w-6 sm:h-6 ${hasLiked ? 'fill-orange-400 text-orange-400' : ''}`} />
        </motion.button>
        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow">
          {likes}
        </span>
      </div>

      {/* Reaction 2: GG */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleGg}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md border ${
            hasGg
              ? 'bg-primary/25 border-primary text-primary shadow-[0_0_20px_rgba(230,0,43,0.4)]'
              : 'bg-black/60 sm:bg-white/10 hover:bg-white/20 border-white/20 sm:border-white/15 text-white'
          }`}
          title="GG (Bien jugado)"
        >
          <ThumbsUp className={`w-4 h-4 sm:w-5 sm:h-5 ${hasGg ? 'fill-primary text-primary' : ''}`} />
        </motion.button>
        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow">
          {ggs}
        </span>
      </div>

      {/* Reaction 3: MVP */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleToggleMvp}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md border ${
            hasMvp
              ? 'bg-yellow-500/25 border-yellow-500 text-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.4)]'
              : 'bg-black/60 sm:bg-white/10 hover:bg-white/20 border-white/20 sm:border-white/15 text-white'
          }`}
          title="MVP (Jugada destacada)"
        >
          <Trophy className={`w-4 h-4 sm:w-5 sm:h-5 ${hasMvp ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </motion.button>
        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow">
          {mvps}
        </span>
      </div>

      {/* Comments Toggle Button */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsCommentsOpen(!isCommentsOpen)}
          className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all shadow-xl backdrop-blur-md border ${
            isCommentsOpen
              ? 'bg-white text-black border-white'
              : 'bg-black/60 sm:bg-white/10 hover:bg-white/20 border-white/20 sm:border-white/15 text-white'
          }`}
          title="Comentarios en vivo"
        >
          <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
        </motion.button>
        <span className="text-[10px] sm:text-xs font-bold text-white drop-shadow">
          {comments.length}
        </span>
      </div>

      {/* Share Button */}
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <motion.button
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleShare}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-black/60 sm:bg-white/10 hover:bg-white/20 border border-white/20 sm:border-white/15 text-white transition-all shadow-xl backdrop-blur-md"
          title="Compartir Short"
        >
          {copied ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />}
        </motion.button>
        <span className="text-[9px] sm:text-[10px] font-bold text-zinc-300">
          {copied ? 'Copiado' : 'Compartir'}
        </span>
      </div>

      <div className="w-6 sm:w-8 h-[1px] bg-white/20 my-0.5 sm:my-1" />

      {/* Vertical Navigation: Previous Short (↑) */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={handlePrevStory}
        disabled={isFirstStoryOverall}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-black/60 sm:bg-white/10 hover:bg-white/25 border border-white/20 sm:border-white/15 text-white disabled:opacity-20 transition-all shadow-xl backdrop-blur-md"
        title="Short anterior (Flecha Arriba ↑)"
      >
        <ChevronUp className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>

      {/* Vertical Navigation: Next Short (↓) */}
      <motion.button
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleNextStory}
        disabled={isLastStoryOverall}
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-black/60 sm:bg-white/10 hover:bg-white/25 border border-white/20 sm:border-white/15 text-white disabled:opacity-20 transition-all shadow-xl backdrop-blur-md"
        title="Siguiente Short (Flecha Abajo ↓)"
      >
        <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6" />
      </motion.button>
    </div>
  );

  const content = (
    <div
      onClick={onClose}
      onWheel={handleWheel}
      className="fixed inset-0 z-[9999] bg-black sm:bg-black/95 sm:backdrop-blur-2xl flex items-center justify-center p-0 sm:p-4 select-none animate-in fade-in duration-200"
    >
      {/* Floating Close Button in Top Right (Desktop) */}
      <button
        type="button"
        onClick={onClose}
        className="hidden sm:flex fixed top-5 right-5 sm:top-7 sm:right-7 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md z-[100] transition-all hover:scale-110 active:scale-95 shadow-xl border border-white/10"
        title="Cerrar visor (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Main Container: Video + Right Action Sidebar + Sliding Comments Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative flex items-center justify-center gap-3 sm:gap-4 w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-full"
      >
        {/* ------------------------------------------------------------- */}
        {/* 1. 9:16 VERTICAL SHORTS PLAYER                                */}
        {/* ------------------------------------------------------------- */}
        <div
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative w-full h-[100dvh] sm:w-[410px] sm:h-[88vh] sm:max-h-[820px] bg-black sm:rounded-3xl overflow-hidden sm:border sm:border-white/15 shadow-[0_0_80px_rgba(230,0,43,0.25)] flex flex-col justify-between"
        >
          {/* Top Segmented Progress Bars */}
          <div className="relative z-30 px-3.5 sm:px-4 pt-3 sm:pt-3.5 pb-2 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
            <div className="flex items-center gap-1.5 w-full mb-2 sm:mb-2.5">
              {activeGroup.stories.map((st, idx) => {
                let widthPct = 0;
                if (idx < storyIndex) widthPct = 100;
                else if (idx === storyIndex) widthPct = progress;
                else widthPct = 0;

                return (
                  <div
                    key={st.id}
                    className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden"
                  >
                    <div
                      className="h-full bg-primary transition-all duration-75 ease-linear"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Author Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-2.5">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full p-[2px] bg-gradient-to-tr from-primary to-yellow-500 shadow-md">
                  <img
                    src={activeGroup.avatarUrl}
                    alt=""
                    className="w-full h-full rounded-full object-cover border border-black"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-black text-xs sm:text-sm text-white drop-shadow">
                      {activeGroup.username}
                    </span>
                    {activeGroup.stories.length > 1 && (
                      <span className="text-[10px] text-zinc-400 font-mono font-bold">
                        ({storyIndex + 1}/{activeGroup.stories.length})
                      </span>
                    )}
                    {isLive && (
                      <span className="px-1.5 py-0.2 rounded bg-red-600 text-white font-black text-[9px] uppercase tracking-wider animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                        LIVE
                      </span>
                    )}
                  </div>
                  <span className="block text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                    {new Date(currentStory.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>

              {/* Controls (YouTube link + Mobile Close Button) */}
              <div className="flex items-center gap-2">
                {currentStory.media_type === 'youtube' && (
                  <a
                    href={currentStory.media_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600 hover:bg-red-700 text-white text-[10px] sm:text-[11px] font-bold transition-all shadow-md active:scale-95"
                    title="Abrir en YouTube oficial"
                  >
                    <YouTubeIcon className="w-3.5 h-3.5" />
                    <span className="hidden xs:inline">YouTube</span>
                  </a>
                )}
                {/* Mobile Close Button (Direct thumb access) */}
                <button
                  type="button"
                  onClick={onClose}
                  className="sm:hidden p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 backdrop-blur-md transition-all active:scale-95"
                  title="Cerrar visor"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Media Player Core */}
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            {currentStory.media_type === 'youtube' ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
                {ytId ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${ytId}&modestbranding=1&rel=0`}
                    title="YouTube Short"
                    className="w-full h-full object-cover"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="text-center p-4 text-zinc-400 text-xs">
                    Video no disponible
                  </div>
                )}
              </div>
            ) : currentStory.media_type === 'live' ? (
              <div className="w-full h-full relative flex items-center justify-center bg-black">
                {currentStory.media_url.includes('youtube.com') ||
                currentStory.media_url.includes('youtu.be') ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${extractYouTubeId(currentStory.media_url)}?autoplay=1&mute=0&controls=1`}
                    title="Live Stream"
                    className="w-full h-full object-cover"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentStory.media_url}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                    loop
                  />
                )}
              </div>
            ) : currentStory.media_type === 'video' ? (
              <video
                src={currentStory.media_url}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                loop
              />
            ) : (
              <img
                src={currentStory.media_url}
                alt="Story content"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          {/* Tap-advance Areas (Only active for non-iframe content) */}
          {currentStory.media_type !== 'youtube' && (
            <div className="absolute inset-0 z-10 flex">
              <div
                className="w-1/3 h-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevStory();
                }}
              />
              <div
                className="w-2/3 h-full cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextStory();
                }}
              />
            </div>
          )}

          {/* MOBILE IN-VIDEO ACTION OVERLAY (Bottom-Right) */}
          {renderActionButtons(true)}

          {/* Bottom Video Information Overlay (Leaves room for right action column on mobile) */}
          <div className="relative z-30 p-3.5 sm:p-4 pr-16 sm:pr-4 bg-gradient-to-t from-black/95 via-black/60 to-transparent pointer-events-none">
            {/* Title / Caption */}
            {currentStory.caption && (
              <p className="text-xs sm:text-sm font-semibold text-white drop-shadow-md mb-1.5 sm:mb-2 leading-snug line-clamp-2">
                {currentStory.caption}
              </p>
            )}

            {/* Game / Tag Badge */}
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-[11px] font-bold text-yellow-300">
                🎮 Gaming Drop
              </span>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 font-mono">
                XtremGen Shorts
              </span>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. DESKTOP RIGHT-SIDE FLOATING ACTION BAR                     */}
        {/* ------------------------------------------------------------- */}
        {renderActionButtons(false)}

        {/* ------------------------------------------------------------- */}
        {/* 3. SLIDING COMMENTS PANEL (Desktop Side Panel)                */}
        {/* ------------------------------------------------------------- */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ opacity: 0, x: 20, width: 0 }}
              animate={{ opacity: 1, x: 0, width: 330 }}
              exit={{ opacity: 0, x: 20, width: 0 }}
              transition={{ duration: 0.2 }}
              className="hidden sm:flex flex-col h-[85vh] sm:h-[88vh] max-h-[820px] bg-[#111116] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <h4 className="font-black text-sm text-white uppercase tracking-wider">
                    Comentarios ({comments.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Thread */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 items-start text-xs">
                    <img
                      src={c.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-[11px]">{c.author}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed break-words">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Write Comment Form */}
              <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex items-center gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={profile ? `Comentar como @${profile.username}...` : 'Inicia sesión para comentar...'}
                  className="flex-1 bg-black/60 border border-white/10 rounded-full pl-3.5 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="p-2 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-30 text-white transition-all shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ------------------------------------------------------------- */}
        {/* 4. MOBILE SLIDE-UP COMMENTS BOTTOM SHEET                      */}
        {/* ------------------------------------------------------------- */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="sm:hidden fixed inset-x-0 bottom-0 z-50 h-[70vh] max-h-[500px] bg-[#111116]/95 backdrop-blur-2xl border-t border-white/20 rounded-t-3xl p-4 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.9)]"
            >
              {/* Drag handle */}
              <div className="w-10 h-1 bg-white/30 rounded-full mx-auto mb-3 shrink-0" />

              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  <h4 className="font-black text-sm text-white uppercase tracking-wider">
                    Comentarios ({comments.length})
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCommentsOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Comments Thread */}
              <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-2.5 items-start text-xs">
                    <img
                      src={c.avatar}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover border border-white/10 shrink-0 mt-0.5"
                    />
                    <div className="flex-1 bg-white/5 border border-white/5 rounded-xl px-3 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-white text-[11px]">{c.author}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-zinc-300 leading-relaxed break-words">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Write Comment Form */}
              <form onSubmit={handleAddComment} className="pt-3 border-t border-white/10 flex items-center gap-2 shrink-0">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder={profile ? `Comentar como @${profile.username}...` : 'Inicia sesión para comentar...'}
                  className="flex-1 bg-black/60 border border-white/10 rounded-full pl-3.5 pr-3 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary"
                />
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="p-2 rounded-full bg-primary hover:bg-primary/80 disabled:opacity-30 text-white transition-all shadow-md shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
