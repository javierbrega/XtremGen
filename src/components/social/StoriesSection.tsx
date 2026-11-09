"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  X,
  Sparkles,
  Camera,
  Layers,
  Radio,
  Flame,
  ThumbsUp,
  Trophy,
} from 'lucide-react';
import { ShortsViewerModal } from './ShortsViewerModal';
import { LiveStreamModal } from './LiveStreamModal';
import { LiveStreamPlayerModal, LiveStreamData } from './LiveStreamPlayerModal';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../ui/Base';
import {
  parseStreamInfo,
  getPlatformMeta,
  YouTubeIcon,
  extractYouTubeId,
} from '../../lib/stream-helpers';

export { YouTubeIcon, extractYouTubeId };

export interface StoryItem {
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

export interface UserStoryGroup {
  userId: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[];
  latestStory: StoryItem;
}

// Curated seed stories for fresh gaming community launch
const SEED_STORIES: StoryItem[] = [
  {
    id: 'seed-yt-1',
    user_id: 'seed-sniper',
    media_url: 'https://www.youtube.com/shorts/5e_0E06x-D0',
    media_type: 'youtube',
    caption: '🎯 Quickscope Insano en Black Ops #shorts',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
    profiles: {
      username: 'GhostSniper',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=GhostSniper',
    },
  },
  {
    id: 'seed-1',
    user_id: 'seed-founder',
    media_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: '⚡ Nuevo setup listo para rankear en BO7 y Valorant!',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    profiles: {
      username: 'JaviXG',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=JaviXG',
    },
  },
  {
    id: 'seed-2',
    user_id: 'seed-ronin',
    media_url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: '🏆 Clutch 1v4 en Punto Caliente. ¡Clip completo en Social!',
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    profiles: {
      username: 'RoninSniper',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=RoninSniper',
    },
  },
  {
    id: 'seed-3',
    user_id: 'seed-cyber',
    media_url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: '🔥 Nuevo Drop XtremGen Streetwear Hoodie Cyberpunk!',
    created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
    profiles: {
      username: 'CyberDrop',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CyberDrop',
    },
  },
];

export const StoriesSection: React.FC = () => {
  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [stories, setStories] = useState<StoryItem[]>([]);
  const [mounted, setMounted] = useState(false);

  // Shorts Viewer modal state
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState<number>(0);

  // Dedicated Live Stream Viewer modal state (Option A: Separate from Shorts)
  const [selectedLiveStream, setSelectedLiveStream] = useState<LiveStreamData | null>(null);
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState(false);

  // Creator & Live Modals state
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Story Creator mode & state: 'youtube' or 'upload'
  const [creationMode, setCreationMode] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parsedYoutubeId = extractYouTubeId(youtubeUrl);

  useEffect(() => {
    setMounted(true);
  }, []);

  const loadStories = useCallback(async () => {
    const { data } = await supabase
      .from('social_stories')
      .select('*,profiles(username,avatar_url)')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (Array.isArray(data) && data.length > 0) {
      setStories(data);
    } else {
      setStories(SEED_STORIES);
    }
  }, []);

  useEffect(() => {
    loadStories();

    if (typeof window !== 'undefined') {
      const href = window.location.href;
      if (href.includes('openShorts') || href.includes('short=')) {
        setIsViewerOpen(true);
      } else if (href.includes('openLive') || href.includes('live=')) {
        setIsLiveModalOpen(true);
      }
    }
  }, [loadStories]);

  // Group stories by User (Instagram / Facebook Stories Model)
  const storyGroups = useMemo<UserStoryGroup[]>(() => {
    const map = new Map<string, UserStoryGroup>();

    for (const story of stories) {
      const uid = story.user_id;
      const author = story.profiles?.username || 'Gamer';
      const avatar =
        story.profiles?.avatar_url ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${uid}`;

      if (!map.has(uid)) {
        map.set(uid, {
          userId: uid,
          username: author,
          avatarUrl: avatar,
          stories: [story],
          latestStory: story,
        });
      } else {
        const group = map.get(uid)!;
        group.stories.push(story);
      }
    }

    // Sort stories within each user's group chronologically (oldest to newest)
    const groups = Array.from(map.values());
    for (const group of groups) {
      group.stories.sort(
        (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      // prioritize live stream if active in group
      const liveStory = group.stories.find((s) => s.media_type === 'live');
      group.latestStory = liveStory || group.stories[group.stories.length - 1];
    }

    // Put groups with active LIVE streams first in the carousel!
    groups.sort((a, b) => {
      const aLive = a.stories.some((s) => s.media_type === 'live') ? 1 : 0;
      const bLive = b.stories.some((s) => s.media_type === 'live') ? 1 : 0;
      return bLive - aLive;
    });

    return groups;
  }, [stories]);

  // Option A: Pure shorts playlist for the vertical viewer (Excludes live streams completely!)
  const pureShortGroups = useMemo<UserStoryGroup[]>(() => {
    return storyGroups
      .map((g) => ({
        ...g,
        stories: g.stories.filter((s) => s.media_type !== 'live'),
      }))
      .filter((g) => g.stories.length > 0);
  }, [storyGroups]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      showNotification({
        title: 'Formato no soportado',
        message: 'Por favor selecciona una imagen o video para tu historia.',
        type: 'error',
      });
      return;
    }

    setStoryFile(file);
    setStoryPreview(URL.createObjectURL(file));
  };

  const handlePublishStory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    // 1. YouTube Short Mode (Zero storage cost)
    if (creationMode === 'youtube') {
      const ytId = extractYouTubeId(youtubeUrl);
      if (!ytId) {
        showNotification({
          title: 'Enlace no válido',
          message: 'Pega un enlace válido de YouTube Short (ej: youtube.com/shorts/...).',
          type: 'error',
        });
        return;
      }

      setIsUploading(true);
      const { error: insertError } = await supabase.from('social_stories').insert({
        user_id: user.id,
        media_url: youtubeUrl.trim(),
        media_type: 'youtube',
        caption: storyCaption.trim() || null,
      });

      setIsUploading(false);

      if (insertError) {
        showNotification({
          title: 'Error al publicar',
          message: insertError.message || 'No se pudo guardar la historia en la base de datos.',
          type: 'error',
        });
      } else {
        setIsCreatingStory(false);
        setYoutubeUrl('');
        setStoryCaption('');
        loadStories();
        showNotification({
          title: '¡YouTube Short publicado!',
          message: 'Tu historia vertical ya está visible y agrupada en tu perfil.',
          type: 'success',
        });
      }
      return;
    }

    // 2. Local File Upload to Supabase Storage
    if (!storyFile) return;

    setIsUploading(true);
    const ext = storyFile.name.split('.').pop() || 'webp';
    const filePath = `stories/${user.id}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('social-media')
      .upload(filePath, storyFile, {
        contentType: storyFile.type,
        upsert: true,
      });

    if (uploadError) {
      setIsUploading(false);
      const isAuthError =
        uploadError.message?.includes('sesión') ||
        uploadError.message?.includes('exp') ||
        uploadError.message?.includes('timestamp') ||
        uploadError.message?.includes('Unauthorized');
      showNotification({
        title: isAuthError ? 'Sesión expirada' : 'Error al subir archivo',
        message: isAuthError
          ? 'Tu sesión de Supabase ha caducado. Vuelve a iniciar sesión para continuar.'
          : uploadError.message || 'No se pudo subir el archivo de historia.',
        type: 'error',
      });
      if (isAuthError) {
        openAuthModal();
      }
      return;
    }

    const { data: urlData } = supabase.storage.from('social-media').getPublicUrl(filePath);
    const mediaType = storyFile.type.startsWith('video/') ? 'video' : 'image';

    const { error: insertError } = await supabase.from('social_stories').insert({
      user_id: user.id,
      media_url: urlData.publicUrl,
      media_type: mediaType,
      caption: storyCaption.trim() || null,
    });

    setIsUploading(false);

    if (insertError) {
      showNotification({
        title: 'Error al publicar',
        message: insertError.message || 'No se pudo guardar la historia en la base de datos.',
        type: 'error',
      });
    } else {
      setIsCreatingStory(false);
      setStoryFile(null);
      setStoryPreview(null);
      setStoryCaption('');
      loadStories();
      showNotification({
        title: '¡Historia publicada!',
        message: 'Tu historia vertical ya está visible durante las próximas 24 horas.',
        type: 'success',
      });
    }
  };

  return (
    <div className="w-full max-w-[620px] mx-auto px-4 mb-6">
      {/* Horizontal Scroll of Vertical Story Cards */}
      <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
        {/* Card 1: Unified Create Story / Broadcast LIVE Button */}
        <div
          onClick={() => {
            if (!user) {
              openAuthModal();
            } else {
              setIsCreatingStory(true);
            }
          }}
          className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden bg-[#16161f] border border-white/10 hover:border-primary/50 transition-all duration-300 flex-shrink-0 cursor-pointer group shadow-lg flex flex-col justify-between"
        >
          <div className="relative w-full h-[68%] overflow-hidden bg-black/60 flex items-center justify-center">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.username}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Camera className="w-8 h-8 text-zinc-600" />
            )}
            <div className="absolute inset-0 bg-black/25 group-hover:bg-transparent transition-colors" />
          </div>

          <div className="absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary border-4 border-[#16161f] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>

          <div className="h-[32%] flex items-center justify-center pt-2 pb-1.5 px-2 bg-[#121218]">
            <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-white text-center leading-tight">
              Short o Vivo
            </span>
          </div>
        </div>

        {/* Grouped Stories: ONE CARD PER USER */}
        {storyGroups.map((group, gIdx) => {
          const displayStory = group.latestStory;
          const liveStory = group.stories.find((s) => s.media_type === 'live');
          const isLive = Boolean(liveStory);
          const liveStreamInfo = liveStory ? parseStreamInfo(liveStory.media_url) : null;
          const liveMeta = liveStreamInfo ? getPlatformMeta(liveStreamInfo.platform) : null;
          const isYouTube = displayStory.media_type === 'youtube';
          const ytId = isYouTube ? extractYouTubeId(displayStory.media_url) : null;
          const storyCount = group.stories.length;

          return (
            <div
              key={group.userId}
              onClick={() => {
                if (isLive && liveStory) {
                  setSelectedLiveStream(liveStory as LiveStreamData);
                  setIsLivePlayerOpen(true);
                } else {
                  const shortIdx = pureShortGroups.findIndex((g) => g.userId === group.userId);
                  setActiveGroupIndex(shortIdx >= 0 ? shortIdx : 0);
                  setIsViewerOpen(true);
                }
              }}
              className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-white/30 transition-all duration-300 flex-shrink-0 cursor-pointer group shadow-lg"
            >
              {/* Background preview */}
              {isLive ? (
                /* Clean live background: Thumbnail or ambient streamer avatar */
                <div className={`w-full h-full relative overflow-hidden flex items-center justify-center ${liveMeta ? `bg-gradient-to-t ${liveMeta.bgGradient}` : 'bg-zinc-950'}`}>
                  {liveStreamInfo?.platform === 'youtube' && liveStreamInfo.channelOrId ? (
                    <img
                      src={`https://img.youtube.com/vi/${liveStreamInfo.channelOrId}/hqdefault.jpg`}
                      alt=""
                      className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <img
                      src={group.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover blur-sm scale-110 opacity-35 group-hover:scale-125 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  {liveMeta && (
                    <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full bg-black/75 text-white text-[9px] font-bold flex items-center gap-1 backdrop-blur-md border border-white/10">
                      <liveMeta.Icon className="w-2.5 h-2.5" />
                      <span className="text-[8px] tracking-tight">{liveMeta.badge}</span>
                    </div>
                  )}
                </div>
              ) : isYouTube ? (
                <div className="w-full h-full relative bg-zinc-950">
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {/* Badges in top right */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {storyCount > 1 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-black/80 text-yellow-400 border border-yellow-400/40 text-[9px] font-mono font-black shadow-md flex items-center gap-0.5">
                        <Layers className="w-2.5 h-2.5" />
                        {storyCount}
                      </span>
                    )}
                    <span className="px-1.5 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-black flex items-center gap-0.5 shadow-lg backdrop-blur-sm">
                      <YouTubeIcon className="w-2.5 h-2.5" />
                      SHORT
                    </span>
                  </div>
                </div>
              ) : displayStory.media_type === 'video' ? (
                <div className="w-full h-full relative bg-zinc-950">
                  <video
                    src={displayStory.media_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    muted
                  />
                  {storyCount > 1 && (
                    <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full bg-black/80 text-yellow-400 border border-yellow-400/40 text-[9px] font-mono font-black shadow-md flex items-center gap-0.5">
                      <Layers className="w-2.5 h-2.5" />
                      {storyCount}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full h-full relative bg-zinc-950">
                  <img
                    src={displayStory.media_url}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  {storyCount > 1 && (
                    <div className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded-full bg-black/80 text-yellow-400 border border-yellow-400/40 text-[9px] font-mono font-black shadow-md flex items-center gap-0.5">
                      <Layers className="w-2.5 h-2.5" />
                      {storyCount}
                    </div>
                  )}
                </div>
              )}

              {/* Gradient dark overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Floating avatar: ONLY THIS HAS THE "EN VIVO" GLOWING RING AS REQUESTED */}
              <div className="absolute top-2.5 left-2.5">
                <div
                  className={`relative w-9 h-9 rounded-full ${
                    isLive
                      ? 'p-[2.5px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 shadow-[0_0_16px_rgba(239,68,68,0.95)] animate-pulse'
                      : 'p-[2px] bg-gradient-to-tr from-primary to-yellow-500 shadow-md'
                  }`}
                >
                  <img
                    src={group.avatarUrl}
                    alt=""
                    className="w-full h-full rounded-full object-cover border border-black bg-zinc-800"
                    referrerPolicy="no-referrer"
                  />
                </div>
                {/* Live pill attached to profile photo frame */}
                {isLive && (
                  <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full bg-red-600 text-white font-black text-[8px] uppercase tracking-wider shadow-lg border border-black/40 flex items-center justify-center">
                    VIVO
                  </span>
                )}
              </div>

              {/* Bottom username and caption preview */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="block text-xs font-bold text-white truncate drop-shadow-md">
                  {group.username}
                </span>
                {displayStory.caption && (
                  <p className="text-[10px] text-zinc-300 truncate drop-shadow font-medium">
                    {displayStory.caption}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PURE YOUTUBE SHORTS STYLE VIEWER MODAL (ZERO LIVE STREAMS)     */}
      {/* ------------------------------------------------------------- */}
      <ShortsViewerModal
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        storyGroups={pureShortGroups}
        initialGroupIndex={activeGroupIndex}
      />

      {/* ------------------------------------------------------------- */}
      {/* DEDICATED LIVE STREAM THEATER PLAYER (OPTION A: SEPARATED)    */}
      {/* ------------------------------------------------------------- */}
      <LiveStreamPlayerModal
        isOpen={isLivePlayerOpen}
        stream={selectedLiveStream}
        onClose={() => {
          setIsLivePlayerOpen(false);
          setSelectedLiveStream(null);
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* EPHEMERAL ZERO-STORAGE LIVE BROADCASTING MODAL                */}
      {/* ------------------------------------------------------------- */}
      <LiveStreamModal
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
        onStreamStarted={() => {
          loadStories();
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* STORY CREATOR MODAL WITH YOUTUBE SHORT SUPPORT                */}
      {/* ------------------------------------------------------------- */}
      {mounted && isCreatingStory && typeof document !== 'undefined'
        ? createPortal(
            <div
              onClick={() => setIsCreatingStory(false)}
              className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
            >
              <div
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-md w-full bg-[#111116] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6"
              >
                <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <h3 className="font-black text-lg text-white uppercase tracking-tight">
                      Crear Historia Vertical
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCreatingStory(false)}
                    className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mode Selector Tabs: YouTube Short vs Re-transmitir VIVO vs File Upload */}
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-black/60 p-1 border border-white/10 mb-4">
                  <button
                    type="button"
                    onClick={() => setCreationMode('youtube')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      creationMode === 'youtube'
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <YouTubeIcon className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Short</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingStory(false);
                      setIsLiveModalOpen(true);
                    }}
                    className="py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                    <span className="text-[11px] text-red-400 font-black">En Vivo</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreationMode('upload')}
                    className={`py-2 px-1 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                      creationMode === 'upload'
                        ? 'bg-primary text-white shadow-md'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Subir</span>
                  </button>
                </div>

                <form onSubmit={handlePublishStory} className="space-y-4">
                  {/* Option A: YouTube Short Mode */}
                  {creationMode === 'youtube' ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                          Enlace de YouTube Short o Video
                        </label>
                        <div className="relative">
                          <input
                            type="url"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/shorts/..."
                            className="w-full bg-black/60 border border-white/10 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
                          />
                          {parsedYoutubeId && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block animate-pulse" />
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-zinc-500 mt-1">
                          Pega cualquier link (ej: youtube.com/shorts/...). No consume almacenamiento y reproduce al instante.
                        </p>
                      </div>

                      {/* YouTube Live Thumbnail Preview */}
                      {parsedYoutubeId && (
                        <div className="relative w-full h-56 rounded-2xl overflow-hidden bg-black border border-red-500/30 flex items-center justify-center shadow-lg group">
                          <img
                            src={`https://img.youtube.com/vi/${parsedYoutubeId}/hqdefault.jpg`}
                            alt="Preview YouTube Short"
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl">
                              <YouTubeIcon className="w-6 h-6" />
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-black/80 text-[11px] font-bold text-white border border-white/10">
                              Short detectado ✓
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Option B: File Upload Mode */
                    <div className="space-y-3">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {storyPreview ? (
                        <div className="relative w-full h-72 rounded-2xl overflow-hidden bg-black border border-white/20 flex items-center justify-center">
                          {storyFile?.type.startsWith('video/') ? (
                            <video src={storyPreview} className="w-full h-full object-cover" autoPlay loop muted />
                          ) : (
                            <img src={storyPreview} alt="Preview" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setStoryFile(null);
                              setStoryPreview(null);
                            }}
                            className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-56 rounded-2xl border-2 border-dashed border-white/20 hover:border-primary bg-black/40 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors p-4 group"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Camera className="w-6 h-6" />
                          </div>
                          <div className="text-center">
                            <span className="block text-sm font-bold text-white">Seleccionar Foto o Clip</span>
                            <span className="block text-xs text-zinc-500 mt-1">Formato vertical 9:16 ideal para móviles</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Caption Input */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                      Texto o Mensaje (Opcional)
                    </label>
                    <input
                      type="text"
                      value={storyCaption}
                      onChange={(e) => setStoryCaption(e.target.value)}
                      placeholder="Ej: Rankeando en vivo 🎯"
                      className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                    />
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className={`w-full ${creationMode === 'youtube' ? '!bg-red-600 hover:!bg-red-700 !text-white' : ''}`}
                    isLoading={isUploading}
                    disabled={
                      (creationMode === 'youtube' && !parsedYoutubeId) ||
                      (creationMode === 'upload' && !storyFile) ||
                      isUploading
                    }
                  >
                    {creationMode === 'youtube' ? (
                      <span className="flex items-center gap-2">
                        <YouTubeIcon className="w-4 h-4" />
                        Publicar YouTube Short
                      </span>
                    ) : (
                      'Publicar Archivo (24h)'
                    )}
                  </Button>
                </form>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
};
