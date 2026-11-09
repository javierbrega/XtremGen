"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Sparkles, Camera, Loader2, Play, Flame, ThumbsUp, Trophy } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Badge, Button } from '../ui/Base';

interface StoryItem {
  id: string;
  user_id: string;
  media_url: string;
  media_type: 'image' | 'video';
  caption?: string;
  created_at: string;
  profiles?: {
    username: string;
    avatar_url: string;
  };
}

// Curated seed stories for fresh gaming community launch
const SEED_STORIES: StoryItem[] = [
  {
    id: 'seed-1',
    user_id: 'seed-founder',
    media_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80',
    media_type: 'image',
    caption: '⚡ Nuevo setup listo para rankear en BO7 y Valorant!',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
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
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
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
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
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
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Story Creator form state
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyPreview, setStoryPreview] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Story Viewer state
  const [storyProgress, setStoryProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<any>(null);

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

  // Story auto-advance timer (5 seconds per story)
  useEffect(() => {
    if (activeStoryIndex === null) {
      setStoryProgress(0);
      return;
    }

    if (isPaused) return;

    const interval = 50; // update every 50ms
    const step = (interval / 5000) * 100;

    timerRef.current = setInterval(() => {
      setStoryProgress((prev) => {
        if (prev >= 100) {
          // Go to next story or close
          if (activeStoryIndex < stories.length - 1) {
            setActiveStoryIndex((curr) => (curr !== null ? curr + 1 : null));
            return 0;
          } else {
            setActiveStoryIndex(null);
            return 0;
          }
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeStoryIndex, isPaused, stories.length]);

  const handleNextStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex(activeStoryIndex + 1);
      setStoryProgress(0);
    } else {
      setActiveStoryIndex(null);
    }
  };

  const handlePrevStory = () => {
    if (activeStoryIndex === null) return;
    if (activeStoryIndex > 0) {
      setActiveStoryIndex(activeStoryIndex - 1);
      setStoryProgress(0);
    }
  };

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
        title: 'Error al subir historia',
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

        {/* Stories from Users */}
        {stories.map((s, idx) => {
          const author = s.profiles?.username || 'Gamer';
          const avatar =
            s.profiles?.avatar_url ||
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${s.user_id}`;

          return (
            <div
              key={s.id}
              onClick={() => {
                setActiveStoryIndex(idx);
                setStoryProgress(0);
              }}
              className="relative w-28 sm:w-32 h-44 sm:h-48 rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-primary/80 transition-all duration-300 flex-shrink-0 cursor-pointer group shadow-lg"
            >
              {/* Background vertical preview */}
              {s.media_type === 'video' ? (
                <video
                  src={s.media_url}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  muted
                />
              ) : (
                <img
                  src={s.media_url}
                  alt={author}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              )}

              {/* Gradient dark overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />

              {/* Floating avatar with neon ring */}
              <div className="absolute top-2.5 left-2.5 w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-primary to-yellow-500 shadow-md">
                <img
                  src={avatar}
                  alt={author}
                  className="w-full h-full rounded-full object-cover border border-black"
                  referrerPolicy="no-referrer"
                />
              </div>

              {/* Bottom username and caption preview */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="block text-xs font-bold text-white truncate drop-shadow-md">
                  {author}
                </span>
                {s.caption && (
                  <p className="text-[10px] text-zinc-300 truncate drop-shadow font-medium">
                    {s.caption}
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
      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <div
          onClick={() => setActiveStoryIndex(null)}
          className="fixed inset-0 z-[400] bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
        >
          {/* Navigation arrow left */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevStory();
            }}
            disabled={activeStoryIndex === 0}
            className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 mr-4 transition-all"
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
            {/* Top Header: Progress Bar & Author */}
            <div className="relative z-20 p-4 bg-gradient-to-b from-black/80 to-transparent">
              {/* Animated Progress Bar */}
              <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-primary transition-all duration-75 ease-linear"
                  style={{ width: `${storyProgress}%` }}
                />
              </div>

              {/* Author Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-primary to-yellow-500">
                    <img
                      src={
                        stories[activeStoryIndex].profiles?.avatar_url ||
                        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${stories[activeStoryIndex].user_id}`
                      }
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover border border-black"
                    />
                  </div>
                  <div>
                    <span className="font-black text-sm text-white drop-shadow">
                      {stories[activeStoryIndex].profiles?.username || 'Usuario XG'}
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-mono">
                      {new Date(stories[activeStoryIndex].created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveStoryIndex(null)}
                  className="p-1.5 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Media Content */}
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              {stories[activeStoryIndex].media_type === 'video' ? (
                <video
                  src={stories[activeStoryIndex].media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  playsInline
                  loop
                />
              ) : (
                <img
                  src={stories[activeStoryIndex].media_url}
                  alt="Story content"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Tap areas left / right for mobile story advance */}
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

            {/* Bottom Footer: Caption & Reactions */}
            <div className="relative z-20 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
              {stories[activeStoryIndex].caption && (
                <p className="text-sm font-semibold text-white drop-shadow-md mb-3 leading-snug">
                  {stories[activeStoryIndex].caption}
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
            disabled={activeStoryIndex === stories.length - 1}
            className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-20 ml-4 transition-all"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STORY CREATOR MODAL                                            */}
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
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
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

            <form onSubmit={handlePublishStory} className="space-y-4">
              {/* Media Upload Area */}
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
                className="w-full"
                isLoading={isUploading}
                disabled={!storyFile || isUploading}
              >
                Publicar Historia (24h)
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
