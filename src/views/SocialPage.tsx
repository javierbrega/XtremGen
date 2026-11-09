"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Play, Send, Sparkles, Image as ImageIcon, MessageSquare, Camera, X, Link as LinkIcon, Loader2, Smile, Radio, Tv, Flame, Eye, Video } from 'lucide-react';
import { Badge, Button, Card } from '../components/ui/Base';
import { SocialLayout } from '../components/social/SocialLayout';
import { ReactionButtons } from '../components/social/ReactionButtons';
import { CommentsSection } from '../components/social/CommentsSection';
import { StoriesSection } from '../components/social/StoriesSection';
import { LiveStreamPlayerModal, LiveStreamData } from '../components/social/LiveStreamPlayerModal';
import { LiveStreamModal } from '../components/social/LiveStreamModal';
import { ShortsViewerModal } from '../components/social/ShortsViewerModal';
import { parseStreamInfo, getPlatformMeta, YouTubeIcon, extractYouTubeId } from '../lib/stream-helpers';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

const SEED_LIVES: LiveStreamData[] = [
  {
    id: 'seed-live-twitch',
    user_id: 'seed-streamer-1',
    media_url: 'https://twitch.tv/shroud',
    caption: '🔴 [Twitch] Rankeando en Search & Destroy BO7 con el clan',
    created_at: new Date().toISOString(),
    profiles: {
      username: 'ShroudXG',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ShroudXG',
    },
  },
  {
    id: 'seed-live-yt',
    user_id: 'seed-streamer-2',
    media_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    caption: '🔴 [YouTube] Torneo Pro Invitational XtremGen En Vivo',
    created_at: new Date().toISOString(),
    profiles: {
      username: 'JaviXG',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=JaviXG',
    },
  },
  {
    id: 'seed-live-kick',
    user_id: 'seed-streamer-3',
    media_url: 'https://kick.com/xqc',
    caption: '🔴 [Kick] Watch Party Comunidad XtremGen Gaming Nights',
    created_at: new Date().toISOString(),
    profiles: {
      username: 'CyberDrop',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=CyberDrop',
    },
  },
];

async function compressImage(file: File, maxWidth = 1280, quality = 0.85): Promise<Blob> {
  return new Promise((resolve) => {
    if (file.type === 'image/svg+xml' || file.type === 'image/gif') {
      return resolve(file);
    }
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let width = img.width;
      let height = img.height;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve(file);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          resolve(blob || file);
        },
        'image/webp',
        quality
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(file);
    };
    img.src = objectUrl;
  });
}

const MOOD_OPTIONS = [
  { id: 'on_fire', label: '🔥 En Racha' },
  { id: 'tryhard', label: '🎯 Tryhard' },
  { id: 'chill', label: '☕ Chill' },
  { id: 'tilt', label: '💀 Tilt' },
  { id: 'lfg', label: '🏆 Buscando Team' },
];

export const SocialPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [content, setContent] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [gameTag, setGameTag] = useState('Call of Duty: BO7');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});
  const [isPublishing, setIsPublishing] = useState(false);
  const [lightboxMedia, setLightboxMedia] = useState<{ url: string; content?: string; author?: string; gameTag?: string } | null>(null);

  // Option A: Active Social Tab ('feed' | 'shorts' | 'directos')
  const [activeTab, setActiveTab] = useState<'feed' | 'shorts' | 'directos'>(() => {
    if (typeof window !== 'undefined') {
      const href = window.location.href;
      if (href.includes('tab=directos') || href.includes('openLive') || href.includes('live=')) {
        return 'directos';
      }
      if (href.includes('tab=shorts') || href.includes('openShorts') || href.includes('short=')) {
        return 'shorts';
      }
    }
    return 'feed';
  });
  const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([]);
  const [shortsList, setShortsList] = useState<any[]>([]);
  const [selectedLiveForPlayer, setSelectedLiveForPlayer] = useState<LiveStreamData | null>(null);
  const [isLivePlayerModalOpen, setIsLivePlayerModalOpen] = useState(false);
  const [isLiveBroadcastModalOpen, setIsLiveBroadcastModalOpen] = useState(false);
  const [isShortsViewerOpen, setIsShortsViewerOpen] = useState(false);
  const [activeShortGroupIndex, setActiveShortGroupIndex] = useState(0);

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const loadSocialFeed = useCallback(async () => {
    setIsLoading(true);
    const [postsRes, profilesRes, storiesRes] = await Promise.all([
      supabase
        .from('social_posts')
        .select('*,profiles(username,avatar_url,is_pro,role_badge)')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.from('profiles').select('id,username,avatar_url,is_online').limit(10),
      supabase
        .from('social_stories')
        .select('*,profiles(username,avatar_url,is_pro,role_badge)')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false }),
    ]);

    setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    setProfiles(Array.isArray(profilesRes.data) ? profilesRes.data : []);

    const rawStories = Array.isArray(storiesRes.data) ? storiesRes.data : [];
    const activeLives = rawStories.filter((s: any) => s.media_type === 'live');
    const activeShorts = rawStories.filter((s: any) => s.media_type !== 'live');

    setLiveStreams(activeLives.length > 0 ? activeLives : SEED_LIVES);
    setShortsList(activeShorts);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSocialFeed();

    if (typeof window !== 'undefined') {
      const href = window.location.href;
      if (href.includes('tab=directos') || href.includes('openLive') || href.includes('live=')) {
        setActiveTab('directos');
      } else if (href.includes('tab=shorts') || href.includes('openShorts') || href.includes('short=')) {
        setActiveTab('shorts');
      }
    }
  }, [loadSocialFeed]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showNotification({
        title: 'Formato no soportado',
        message: 'Por favor selecciona un archivo de imagen (PNG, JPG, WEBP, GIF).',
        type: 'error',
      });
      return;
    }

    try {
      setIsUploadingImage(true);
      const compressed = await compressImage(file);
      const optimizedFile = new File(
        [compressed],
        file.name.replace(/\.[^/.]+$/, '') + '.webp',
        { type: 'image/webp' }
      );
      setSelectedFile(optimizedFile);
      setPreviewUrl(URL.createObjectURL(compressed));
      setMediaUrl('');
    } catch {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!content.trim() && !selectedFile && !mediaUrl.trim()) return;

    setIsPublishing(true);
    let finalMediaUrl: string | null = mediaUrl.trim() || null;

    if (selectedFile) {
      const ext = selectedFile.type === 'image/webp' ? 'webp' : selectedFile.name.split('.').pop() || 'jpg';
      const cleanFileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const filePath = `${user.id}/${cleanFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('social-media')
        .upload(filePath, selectedFile, {
          contentType: selectedFile.type,
          upsert: true,
        });

      if (uploadError) {
        setIsPublishing(false);
        const isAuthError =
          uploadError.message?.includes('sesión') ||
          uploadError.message?.includes('exp') ||
          uploadError.message?.includes('timestamp') ||
          uploadError.message?.includes('Unauthorized');
        showNotification({
          title: isAuthError ? 'Sesión expirada' : 'Error al subir imagen',
          message: isAuthError
            ? 'Tu sesión de Supabase ha caducado. Vuelve a iniciar sesión para continuar.'
            : uploadError.message || 'No se pudo subir la imagen al bucket de Supabase.',
          type: 'error',
        });
        if (isAuthError) {
          openAuthModal();
        }
        return;
      }

      const { data: urlData } = supabase.storage.from('social-media').getPublicUrl(filePath);
      finalMediaUrl = urlData.publicUrl;
    }

    const { error } = await supabase.from('social_posts').insert({
      author_id: user.id,
      content: content.trim(),
      media_url: finalMediaUrl,
      game_tag: gameTag,
      mood: selectedMood || null,
    });
    setIsPublishing(false);

    if (error) {
      showNotification({
        title: 'Error al publicar',
        message: error.message || 'No se pudo publicar en el feed social.',
        type: 'error',
      });
    } else {
      setContent('');
      handleClearImage();
      setMediaUrl('');
      setShowUrlInput(false);
      setSelectedMood(null);
      setShowMoodSelector(false);
      loadSocialFeed();
      showNotification({
        title: '¡Publicado en XG Social!',
        message: 'Tu publicación ya está visible para toda la comunidad.',
        type: 'success',
      });
    }
  };

  // Option A: Groups for pure Shorts Viewer (No live streams)
  const shortsUserGroups = React.useMemo(() => {
    const map = new Map<string, any>();
    for (const story of shortsList) {
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
    return Array.from(map.values());
  }, [shortsList]);

  return (
    <SocialLayout>
      {/* Option A Navigation Pill Tabs: Separate Muro, Shorts & Directos */}
      <div className="max-w-[620px] mx-auto px-4 mb-5">
        <div className="flex items-center gap-1.5 p-1 bg-[#121218] border border-white/10 rounded-2xl shadow-xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('feed');
              if (typeof window !== 'undefined') window.location.hash = '/social';
            }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'feed'
                ? 'bg-primary text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Muro</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('shorts');
              if (typeof window !== 'undefined') window.location.hash = '/social?tab=shorts';
            }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'shorts'
                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Shorts ⚡</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('directos');
              if (typeof window !== 'undefined') window.location.hash = '/social?tab=directos';
            }}
            className={`flex-1 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${
              activeTab === 'directos'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>Directos 🔴</span>
          </button>
        </div>
      </div>

      {activeTab === 'feed' && (
        <>
          {/* 9:16 Vertical Stories / Shorts Carousel */}
          <StoriesSection />

          {/* Modern Gaming Post Composer */}
          <div className="max-w-[520px] mx-auto w-full px-4 mb-8">
        <Card className="p-4 sm:p-5 bg-[#121218] border-white/10 shadow-xl">
          <form onSubmit={handleCreatePost} className="space-y-3.5">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Sparkles className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <textarea
                  rows={2}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    profile
                      ? `¿Qué jugada o setup quieres compartir hoy, ${profile.username}?`
                      : 'Inicia sesión para publicar clips, jugadas o tu setup...'
                  }
                  className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary resize-none transition-colors"
                />

                {/* Selected Mood Chip Preview */}
                {selectedMood && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/30 text-yellow-300 text-xs font-bold">
                      <span>Modo: {MOOD_OPTIONS.find((m) => m.id === selectedMood)?.label}</span>
                      <button
                        type="button"
                        onClick={() => setSelectedMood(null)}
                        className="hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Image Preview with Remove Button */}
            {previewUrl && (
              <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black/60 max-h-72 w-full group">
                <img
                  src={previewUrl}
                  alt="Previsualización"
                  className="w-full h-full object-cover max-h-72 rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleClearImage}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/80 hover:bg-red-600 text-white transition-all shadow-lg"
                  title="Quitar imagen"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/75 text-[10px] font-mono text-emerald-400 border border-emerald-500/30">
                  ✓ Imagen optimizada para Supabase
                </div>
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Optional URL input if toggled */}
            {showUrlInput && (
              <div className="relative animate-in fade-in duration-150">
                <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={mediaUrl}
                  onChange={(e) => {
                    setMediaUrl(e.target.value);
                    if (e.target.value.trim()) {
                      handleClearImage();
                    }
                  }}
                  placeholder="Pegar URL de Imagen / GIF / Clip..."
                  className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {/* Gamer Mood / Sentimiento Options Tray */}
            {showMoodSelector && (
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex flex-wrap gap-1.5 animate-in fade-in duration-150">
                <span className="w-full text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">
                  Selecciona tu Modo Gamer / Sentimiento:
                </span>
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMood(selectedMood === m.id ? null : m.id);
                      setShowMoodSelector(false);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                      selectedMood === m.id
                        ? 'bg-yellow-500 text-black shadow-md'
                        : 'bg-black/50 text-zinc-300 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Actions Bar: Responsive & Clean (Single row on mobile & desktop) */}
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2.5 border-t border-white/5">
              <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1">
                {/* Photo / Clip Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] shrink-0 flex items-center gap-1.5"
                  title="Subir foto o clip al bucket de Supabase"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary" />
                  )}
                  <span className="hidden sm:inline">{selectedFile ? 'Cambiar foto' : 'Foto/Clip'}</span>
                </button>

                {/* Gamer Mood / Sentimiento button */}
                <button
                  type="button"
                  onClick={() => setShowMoodSelector(!showMoodSelector)}
                  className={`p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
                    showMoodSelector || selectedMood
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10'
                  }`}
                  title="Modo Gamer / Sentimiento"
                >
                  <Smile className="w-4 h-4 text-yellow-400" />
                  <span className="hidden sm:inline">Sentimiento</span>
                </button>

                {/* URL Link */}
                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className={`p-2 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
                    showUrlInput
                      ? 'bg-primary/20 text-primary border border-primary/40'
                      : 'bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white'
                  }`}
                  title="Pegar enlace web"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Enlace</span>
                </button>

                {/* Game Tag Dropdown */}
                <select
                  value={gameTag}
                  onChange={(e) => setGameTag(e.target.value)}
                  className="bg-black/60 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] sm:text-xs text-zinc-300 focus:outline-none focus:border-primary max-w-[105px] xs:max-w-[130px] sm:max-w-none truncate shrink min-w-0"
                >
                  <option value="Call of Duty: BO7">BO7</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Counter-Strike 2">CS2</option>
                  <option value="Setup / Hardware">Setup</option>
                  <option value="XtremGen Streetwear">XG Drop</option>
                </select>
              </div>

              {/* Publicar Button */}
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isPublishing}
                disabled={isUploadingImage}
                className="shrink-0 px-3 sm:px-4 py-1.5 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.35)]"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar</span>
              </Button>
            </div>
          </form>
        </Card>
      </div>

      {/* Social Feed */}
      <div className="max-w-[520px] mx-auto w-full px-4 pb-16 space-y-8">
        {isLoading ? (
          <div className="h-64 rounded-2xl bg-surface animate-pulse border border-white/5" />
        ) : posts.length === 0 ? (
          <Card className="p-10 text-center border-dashed border-white/10 bg-[#121218]/60">
            <MessageSquare className="w-12 h-12 text-primary/60 mx-auto mb-3" />
            <h3 className="text-lg font-black text-white">Feed Social en 0</h3>
            <p className="text-xs text-zinc-400 mt-1">
              Sin publicaciones hardcodeadas. Comparte el primer clip o estado arriba para inaugurar el muro social.
            </p>
          </Card>
        ) : (
          posts.map((post) => {
            const author = post.profiles?.username || 'Jugador XG';
            const avatar =
              post.profiles?.avatar_url ||
              `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${post.author_id}`;
            return (
              <article key={post.id} className="pb-8 border-b border-gray-800/60">
                <div className="py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={avatar}
                      alt={author}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">{author}</span>
                        {post.profiles?.is_pro && (
                          <Badge
                            variant="accent"
                            className="text-[8px] px-1.5 py-0 bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                          >
                            PRO
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs text-primary font-semibold">{post.game_tag || 'Gaming'}</span>
                        {post.mood && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 font-bold">
                            {MOOD_OPTIONS.find((m) => m.id === post.mood)?.label || post.mood}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {post.media_url && (
                  <div
                    onClick={() =>
                      setLightboxMedia({
                        url: post.media_url,
                        content: post.content,
                        author,
                        gameTag: post.game_tag,
                      })
                    }
                    className="relative bg-black/70 group overflow-hidden rounded-2xl border border-white/10 mb-3 cursor-pointer flex items-center justify-center max-h-[560px] shadow-lg"
                  >
                    <img
                      src={post.media_url}
                      alt={post.content || 'Post media'}
                      className="w-full h-auto max-h-[560px] object-contain rounded-2xl group-hover:scale-[1.01] transition-transform duration-200"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none">
                      <Badge variant="primary">{post.game_tag || 'Gaming'}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 shadow-md border border-white/10 pointer-events-none">
                      <span>Ampliar</span>
                    </div>
                  </div>
                )}

                <p className="text-sm text-zinc-200 mb-3 leading-relaxed">
                  <span className="font-bold text-white mr-2">{author}</span>
                  {post.content}
                </p>

                <ReactionButtons
                  postId={post.id}
                  initialGg={post.gg_count || 0}
                  initialMvp={post.likes_count || 0}
                  initialFire={post.fires_count || 0}
                  commentsCount={post.comments_count || 0}
                  onToggleComments={() => toggleComments(post.id)}
                  isCommentsOpen={!!expandedComments[post.id]}
                />

                {expandedComments[post.id] && (
                  <CommentsSection
                    postId={post.id}
                    onCommentAdded={() => {
                      setPosts((prev) =>
                        prev.map((p) =>
                          p.id === post.id
                            ? { ...p, comments_count: (p.comments_count || 0) + 1 }
                            : p
                        )
                      );
                    }}
                  />
                )}
              </article>
            );
          })
        )}
      </div>
    </>
  )}

  {/* ============================================================= */}
  {/* OPTION A: DEDICATED DIRECTOS TAB (TWITCH, KICK, YOUTUBE LIVE) */}
  {/* ============================================================= */}
  {activeTab === 'directos' && (
    <div className="max-w-[720px] mx-auto w-full px-4 mb-10 space-y-6">
      {/* Directos Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1c080d] via-[#121218] to-black border border-red-500/30 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wider text-red-400">
                XtremGen Directos Oficiales
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Transmisiones en Vivo
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Sigue las partidas de clanes y gamers en Twitch, Kick y YouTube con reproductor integrado en XtremGen.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              if (!user) openAuthModal();
              else setIsLiveBroadcastModalOpen(true);
            }}
            className="!bg-red-600 hover:!bg-red-700 !text-white flex items-center gap-2 font-black shadow-lg shadow-red-600/30 shrink-0 self-start sm:self-auto"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Re-transmitir Mi Vivo</span>
          </Button>
        </div>
      </div>

      {/* Grid of Community Live Streams */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {liveStreams.map((live) => {
          const streamInfo = parseStreamInfo(live.media_url);
          const meta = getPlatformMeta(streamInfo.platform);
          const streamerName = live.profiles?.username || 'Streamer XG';
          const streamerAvatar =
            live.profiles?.avatar_url ||
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${live.user_id}`;

          return (
            <div
              key={live.id}
              onClick={() => {
                setSelectedLiveForPlayer(live);
                setIsLivePlayerModalOpen(true);
              }}
              className="group relative rounded-2xl overflow-hidden bg-[#121218] border border-white/10 hover:border-red-500/50 transition-all duration-300 shadow-xl cursor-pointer flex flex-col justify-between"
            >
              {/* Thumbnail / Ambient Preview */}
              <div className="relative w-full aspect-video bg-black overflow-hidden flex items-center justify-center">
                {streamInfo.platform === 'youtube' && streamInfo.channelOrId ? (
                  <img
                    src={`https://img.youtube.com/vi/${streamInfo.channelOrId}/hqdefault.jpg`}
                    alt=""
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-85"
                  />
                ) : (
                  <div
                    className={`w-full h-full relative flex items-center justify-center bg-gradient-to-tr ${meta.bgGradient}`}
                  >
                    <meta.Icon className="w-14 h-14 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                  </div>
                )}

                {/* Overlaid Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-lg animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                    EN VIVO
                  </span>
                </div>

                {/* Platform Badge: STRICTLY NON-CLICKABLE BADGE TO RETAIN USER */}
                <div className="absolute top-2.5 right-2.5">
                  <div
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-white text-[10px] font-black shadow-lg border border-white/20 select-none backdrop-blur-md"
                    style={{ backgroundColor: meta.color }}
                    title={`Transmisión de ${meta.name} dentro de XtremGen`}
                  >
                    <meta.Icon className="w-3 h-3" />
                    <span>{meta.badge}</span>
                  </div>
                </div>

                {/* Hover Play Theater Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-xl">
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Ver en Directo
                  </div>
                </div>
              </div>

              {/* Streamer Info Bottom Row */}
              <div className="p-3.5 flex items-start gap-3 bg-[#111116]">
                {/* Glowing Avatar */}
                <div className="relative w-9 h-9 rounded-full p-[2px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse shrink-0">
                  <img
                    src={streamerAvatar}
                    alt={streamerName}
                    className="w-full h-full rounded-full object-cover border border-black bg-zinc-800"
                  />
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-[0.5px] rounded-full bg-red-600 text-white font-black text-[7px] uppercase tracking-wider">
                    VIVO
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-red-400 transition-colors">
                    {live.caption || `${streamerName} en directo`}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-semibold text-zinc-300 truncate">
                      {streamerName}
                    </span>
                    <span className="text-[10px] text-zinc-500">•</span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      🎮 Gaming
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* ============================================================= */}
  {/* OPTION A: DEDICATED SHORTS TAB (PURE SHORT VERTICAL VIDEOS)   */}
  {/* ============================================================= */}
  {activeTab === 'shorts' && (
    <div className="max-w-[720px] mx-auto w-full px-4 mb-10 space-y-6">
      {/* Shorts Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a0814] via-[#121218] to-black border border-white/10 p-5 sm:p-6 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-black uppercase tracking-wider text-primary">
                XtremGen Shorts Reel
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Clips y Jugadas Destacadas
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-md">
              Desliza en vertical estilo YouTube Shorts para ver los mejores clutches y jugadas de la comunidad.
            </p>
          </div>

          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={() => {
              setActiveShortGroupIndex(0);
              setIsShortsViewerOpen(true);
            }}
            className="flex items-center gap-2 font-black shadow-lg shrink-0 self-start sm:self-auto"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Ver Shorts Vertical</span>
          </Button>
        </div>
      </div>

      {/* Grid of 9:16 Shorts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
        {(shortsList.length > 0
          ? shortsList
          : [
              {
                id: 's-seed-1',
                user_id: 'seed-sniper',
                media_url: 'https://www.youtube.com/shorts/5e_0E06x-D0',
                media_type: 'youtube',
                caption: '🎯 Quickscope Clutch en Black Ops #shorts',
                profiles: {
                  username: 'GhostSniper',
                  avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=GhostSniper',
                },
              },
            ]
        ).map((shortItem, idx) => {
          const isYt = shortItem.media_type === 'youtube';
          const ytId = isYt ? extractYouTubeId(shortItem.media_url) : null;
          const author = shortItem.profiles?.username || 'Gamer';
          const avatar =
            shortItem.profiles?.avatar_url ||
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${shortItem.user_id}`;

          return (
            <div
              key={shortItem.id || idx}
              onClick={() => {
                const gIdx = shortsUserGroups.findIndex(
                  (g) => g.userId === shortItem.user_id
                );
                setActiveShortGroupIndex(gIdx >= 0 ? gIdx : 0);
                setIsShortsViewerOpen(true);
              }}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-black border border-white/10 hover:border-primary/50 transition-all duration-300 shadow-xl cursor-pointer"
            >
              {isYt && ytId ? (
                <img
                  src={`https://img.youtube.com/vi/${ytId}/hqdefault.jpg`}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : shortItem.media_type === 'video' ? (
                <video
                  src={shortItem.media_url}
                  className="w-full h-full object-cover"
                  muted
                />
              ) : (
                <img
                  src={shortItem.media_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}

              {/* Informative Platform Badge (NO LINK) */}
              <div className="absolute top-2.5 right-2.5">
                {isYt && (
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/90 text-white text-[9px] font-black shadow-md border border-red-500/30 select-none"
                    title="YouTube Short oficial"
                  >
                    <YouTubeIcon className="w-2.5 h-2.5" />
                    <span>Short</span>
                  </div>
                )}
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30 pointer-events-none" />

              {/* Creator info & caption */}
              <div className="absolute bottom-3 left-3 right-3 space-y-1">
                <div className="flex items-center gap-1.5">
                  <img
                    src={avatar}
                    alt={author}
                    className="w-5 h-5 rounded-full object-cover border border-white/20"
                  />
                  <span className="text-[11px] font-bold text-white truncate">
                    {author}
                  </span>
                </div>
                {shortItem.caption && (
                  <p className="text-[10px] text-zinc-300 line-clamp-2 leading-tight">
                    {shortItem.caption}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  )}

  {/* ============================================================= */}
  {/* MODALS: THEATER LIVE PLAYER, LIVE BROADCAST & SHORTS VIEWER    */}
  {/* ============================================================= */}
  <LiveStreamPlayerModal
    isOpen={isLivePlayerModalOpen}
    stream={selectedLiveForPlayer}
    onClose={() => {
      setIsLivePlayerModalOpen(false);
      setSelectedLiveForPlayer(null);
    }}
  />

  <LiveStreamModal
    isOpen={isLiveBroadcastModalOpen}
    onClose={() => setIsLiveBroadcastModalOpen(false)}
    onStreamStarted={() => {
      loadSocialFeed();
      setActiveTab('directos');
    }}
  />

  <ShortsViewerModal
    isOpen={isShortsViewerOpen}
    storyGroups={
      shortsUserGroups.length > 0
        ? shortsUserGroups
        : [
            {
              userId: 'seed-sniper',
              username: 'GhostSniper',
              avatarUrl: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=GhostSniper',
              stories: [
                {
                  id: 'seed-yt-1',
                  user_id: 'seed-sniper',
                  media_url: 'https://www.youtube.com/shorts/5e_0E06x-D0',
                  media_type: 'youtube',
                  caption: '🎯 Quickscope Insano en Black Ops #shorts',
                  created_at: new Date().toISOString(),
                },
              ],
              latestStory: {
                id: 'seed-yt-1',
                user_id: 'seed-sniper',
                media_url: 'https://www.youtube.com/shorts/5e_0E06x-D0',
                media_type: 'youtube',
                caption: '🎯 Quickscope Insano en Black Ops #shorts',
                created_at: new Date().toISOString(),
              },
            },
          ]
    }
    initialGroupIndex={activeShortGroupIndex}
    onClose={() => setIsShortsViewerOpen(false)}
  />

  {/* Fullscreen Lightbox Modal */}
  {lightboxMedia && (
        <div
          onClick={() => setLightboxMedia(null)}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{lightboxMedia.author || 'Usuario XG'}</span>
                {lightboxMedia.gameTag && (
                  <Badge variant="primary" className="text-[10px]">{lightboxMedia.gameTag}</Badge>
                )}
              </div>
              <button
                type="button"
                onClick={() => setLightboxMedia(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black/95 overflow-hidden p-3 min-h-[300px]">
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.content || 'Preview'}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
            {lightboxMedia.content && (
              <div className="p-4 border-t border-white/10 bg-black/60 text-sm text-zinc-200">
                <span className="font-bold text-white mr-2">{lightboxMedia.author}:</span>
                {lightboxMedia.content}
              </div>
            )}
          </div>
        </div>
      )}
    </SocialLayout>
  );
};
