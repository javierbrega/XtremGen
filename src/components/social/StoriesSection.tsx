"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Camera, Loader2, Play, Flame, ThumbsUp, Trophy, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge, Button } from '../ui/Base';

// YouTube Official Vector Icon
export const YouTubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// Helper to extract 11-char YouTube ID from any Shorts / Video / Embed link
export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:shorts\/|watch\?v=|v\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

interface StoryItem {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video' | 'youtube';
  caption?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

interface UserStoryGroup {
  userId: string;
  username: string;
  avatarUrl: string;
  stories: StoryItem[]; // sorted chronologically (oldest to newest)
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
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeStoryIndexInGroup, setActiveStoryIndexInGroup] = useState<number>(0);

  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Story Creator mode & state: 'youtube' or 'upload'
  const [creationMode, setCreationMode] = useState<'youtube' | 'upload'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Story Viewer state
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

  const parsedYoutubeId = extractYouTubeId(youtubeUrl);

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
      group.latestStory = group.stories[group.stories.length - 1];
    }

    return groups;
  }, [stories]);

  const activeGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const currentStory = activeGroup ? activeGroup.stories[activeStoryIndexInGroup] : null;

  // Stable references for navigation to prevent closure bugs
  const activeGroupIndexRef = useRef(activeGroupIndex);
  activeGroupIndexRef.current = activeGroupIndex;
  const activeStoryIndexInGroupRef = useRef(activeStoryIndexInGroup);
  activeStoryIndexInGroupRef.current = activeStoryIndexInGroup;

  const handleNextStory = useCallback(() => {
    const gIdx = activeGroupIndexRef.current;
    const sIdx = activeStoryIndexInGroupRef.current;
    if (gIdx === null) return;
    const group = storyGroups[gIdx];
    if (!group) return;

    if (sIdx < group.stories.length - 1) {
      // Advance to next story of the same user
      setActiveStoryIndexInGroup(sIdx + 1);
      setStoryProgress(0);
    } else if (gIdx < storyGroups.length - 1) {
      // Advance to next user
      setActiveGroupIndex(gIdx + 1);
      setActiveStoryIndexInGroup(0);
      setStoryProgress(0);
    } else {
      // Finished all stories
      setActiveGroupIndex(null);
      setActiveStoryIndexInGroup(0);
      setStoryProgress(0);
    }
  }, [storyGroups]);

  const handlePrevStory = useCallback(() => {
    const gIdx = activeGroupIndexRef.current;
    const sIdx = activeStoryIndexInGroupRef.current;
    if (gIdx === null) return;

    if (sIdx > 0) {
      // Previous story of the same user
      setActiveStoryIndexInGroup(sIdx - 1);
      setStoryProgress(0);
    } else if (gIdx > 0) {
      // Previous user
      const prevGroup = storyGroups[gIdx - 1];
      setActiveGroupIndex(gIdx - 1);
      setActiveStoryIndexInGroup(prevGroup ? prevGroup.stories.length - 1 : 0);
      setStoryProgress(0);
    }
  }, [storyGroups]);

  // Story auto-advance timer
  // Images: 5 seconds, YouTube Shorts / Videos: 30 seconds
  useEffect(() => {
    if (activeGroupIndex === null || !currentStory) {
      setStoryProgress(0);
      return;
    }

    if (isPaused) return;

    const isYouTube = currentStory.media_type === 'youtube';
    const totalDuration = isYouTube ? 30000 : 5000;
    const interval = 50; // update every 50ms
    const step = (interval / totalDuration) * 100;

    timerRef.current = setInterval(() => {
      setStoryProgress((prev) => {
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
  }, [activeGroupIndex, activeStoryIndexInGroup, isPaused, currentStory, handleNextStory]);

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
      showNotification({
        title: 'Error al subir archivo',
        message: uploadError.message || 'No se pudo subir el archivo de historia.',
        type: 'error',
      });
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
        {/* Card 1: Create Story Button */}
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
          {/* Top half with profile picture */}
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
            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
          </div>

          {/* Plus icon on the divider */}
          <div className="absolute top-[68%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-primary border-4 border-[#16161f] flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
            <Plus className="w-4 h-4 stroke-[3]" />
          </div>

          {/* Bottom text */}
          <div className="h-[32%] flex items-center justify-center pt-2 pb-1.5 px-2 bg-[#121218]">
            <span className="text-[11px] font-black uppercase tracking-wider text-white text-center leading-tight">
              Crear Historia
            </span>
          </div>
        </div>

        {/* Grouped Stories: ONE CARD PER USER */}
        {storyGroups.map((group, gIdx) => {
          const displayStory = group.latestStory;
          const isYouTube = displayStory.media_type === 'youtube';
          const ytId = isYouTube ? extractYouTubeId(displayStory.media_url) : null;
          const storyCount = group.stories.length;

          return (
            <div
              key={group.userId}
              onClick={() => {
                setActiveGroupIndex(gIdx);
                setActiveStoryIndexInGroup(0);
                setStoryProgress(0);
              }}
              className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-primary/80 transition-all duration-300 flex-shrink-0 cursor-pointer group shadow-lg"
            >
              {/* Background preview */}
              {isYouTube ? (
                <div className="w-full h-full relative">
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                    alt={group.username}
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
                <div className="w-full h-full relative">
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
                <div className="w-full h-full relative">
                  <img
                    src={displayStory.media_url}
                    alt={group.username}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40 pointer-events-none" />

              {/* Floating avatar with neon ring */}
              <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-primary to-yellow-500 shadow-md">
                <img
                  src={group.avatarUrl}
                  alt={group.username}
                  className="w-full h-full rounded-full object-cover border border-black"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Bottom username and caption preview */}
              <div className="absolute bottom-2 left-2 right-2">
                <div className="flex items-center justify-between gap-1">
                  <span className="block text-xs font-bold text-white truncate drop-shadow-md">
                    {group.username}
                  </span>
                </div>
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
      {/* FULLSCREEN VERTICAL STORY VIEWER (Modal)                       */}
      {/* ------------------------------------------------------------- */}
      {activeGroupIndex !== null && activeGroup && currentStory && (
        <div
          onClick={() => setActiveGroupIndex(null)}
          className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
        >
          {/* Navigation arrow left */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            disabled={activeGroupIndex === 0 && activeStoryIndexInGroup === 0}
            className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 mr-4 transition-all"
            title="Anterior"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* 9:16 Vertical Story Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="relative w-full max-w-[380px] h-[85vh] max-h-[720px] bg-zinc-950 rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_80px_rgba(230,0,43,0.3)] flex flex-col justify-between"
          >
            {/* Top Header: Segmented Progress Bars & Author */}
            <div className="relative z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
              {/* Segmented Progress Bars (Instagram / Facebook Stories Model) */}
              <div className="flex items-center gap-1.5 w-full mb-3">
                {activeGroup.stories.map((st, sIdx) => {
                  let widthPct = 0;
                  if (sIdx < activeStoryIndexInGroup) {
                    widthPct = 100;
                  } else if (sIdx === activeStoryIndexInGroup) {
                    widthPct = storyProgress;
                  } else {
                    widthPct = 0;
                  }

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

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-primary to-yellow-500">
                    <img
                      src={activeGroup.avatarUrl}
                      alt={activeGroup.username}
                      className="w-full h-full rounded-full object-cover border border-black"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-sm text-white drop-shadow">
                        {activeGroup.username}
                      </span>
                      {activeGroup.stories.length > 1 && (
                        <span className="text-[10px] text-zinc-400 font-mono font-bold">
                          ({activeStoryIndexInGroup + 1}/{activeGroup.stories.length})
                        </span>
                      )}
                    </div>
                    <span className="block text-[10px] text-zinc-400 font-mono">
                      {new Date(currentStory.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {currentStory.media_type === 'youtube' && (
                    <a
                      href={currentStory.media_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-[11px] font-bold transition-colors shadow-md"
                      title="Abrir en YouTube"
                    >
                      <YouTubeIcon className="w-3.5 h-3.5" />
                      <span>YouTube</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveGroupIndex(null)}
                    className="p-1.5 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Media Content */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {currentStory.media_type === 'youtube' ? (
                <div className="w-full h-full relative flex items-center justify-center bg-black overflow-hidden">
                  {(() => {
                    const ytId = extractYouTubeId(currentStory.media_url);
                    return ytId ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=0&controls=1&loop=1&playlist=${ytId}&modestbranding=1&rel=0`}
                        title="YouTube Short"
                        className="w-full h-full object-cover rounded-3xl"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="text-center p-4 text-zinc-400 text-xs">
                        Video no disponible
                      </div>
                    );
                  })()}
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

            {/* Tap areas left / right for mobile story advance (only if not youtube iframe) */}
            {currentStory.media_type !== 'youtube' && (
              <div className="absolute inset-0 z-10 flex">
                <div
                  className="w-1/2 h-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevStory();
                  }}
                />
                <div
                  className="w-1/2 h-full cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextStory();
                  }}
                />
              </div>
            )}

            {/* Bottom Footer: Caption & Quick Reactions */}
            <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {currentStory.caption && (
                <p className="text-sm font-semibold text-white drop-shadow-md mb-3 leading-snug">
                  {currentStory.caption}
                </p>
              )}

              {/* Quick Story Reaction Chips */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    showNotification({
                      title: '🔥 Reacción enviada',
                      message: 'Le enviaste un Fuego a la historia.',
                      type: 'success',
                    })
                  }
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span>Insano</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showNotification({
                      title: '⚡ GG enviado',
                      message: 'Le diste GG a la historia.',
                      type: 'success',
                    })
                  }
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  <span>GG</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    showNotification({
                      title: '🏆 MVP enviado',
                      message: 'Votaste como MVP a esta jugada.',
                      type: 'success',
                    })
                  }
                  className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors border border-white/10"
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>MVP</span>
                </button>
              </div>
            </div>
          </div>

          {/* Navigation arrow right */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNextStory();
            }}
            disabled={
              activeGroupIndex === storyGroups.length - 1 &&
              activeStoryIndexInGroup === activeGroup.stories.length - 1
            }
            className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 ml-4 transition-all"
            title="Siguiente"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STORY CREATOR MODAL WITH YOUTUBE SHORT SUPPORT                */}
      {/* ------------------------------------------------------------- */}
      {isCreatingStory && (
        <div
          onClick={() => setIsCreatingStory(false)}
          className="fixed inset-0 z-[450] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
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

            {/* Mode Selector Tabs: YouTube Short vs File Upload */}
            <div className="flex rounded-xl bg-black/60 p-1 border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => setCreationMode('youtube')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  creationMode === 'youtube'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <YouTubeIcon className="w-4 h-4" />
                <span>YouTube Short</span>
              </button>
              <button
                type="button"
                onClick={() => setCreationMode('upload')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  creationMode === 'upload'
                    ? 'bg-primary text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Subir Archivo</span>
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
        </div>
      )}
    </div>
  );
};
