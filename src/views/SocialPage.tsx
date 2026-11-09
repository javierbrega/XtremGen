"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Play, Send, Sparkles, Image as ImageIcon, MessageSquare, Camera, X, Link as LinkIcon, Loader2, Smile } from 'lucide-react';
import { Badge, Button, Card } from '../components/ui/Base';
import { SocialLayout } from '../components/social/SocialLayout';
import { ReactionButtons } from '../components/social/ReactionButtons';
import { CommentsSection } from '../components/social/CommentsSection';
import { StoriesSection } from '../components/social/StoriesSection';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

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

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const loadSocialFeed = useCallback(async () => {
    setIsLoading(true);
    const [postsRes, profilesRes] = await Promise.all([
      supabase
        .from('social_posts')
        .select('*,profiles(username,avatar_url,is_pro,role_badge)')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.from('profiles').select('id,username,avatar_url,is_online').limit(10),
    ]);

    setPosts(Array.isArray(postsRes.data) ? postsRes.data : []);
    setProfiles(Array.isArray(profilesRes.data) ? profilesRes.data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadSocialFeed();
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
        showNotification({
          title: 'Error al subir imagen',
          message: uploadError.message || 'No se pudo subir la imagen al bucket de Supabase.',
          type: 'error',
        });
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

  return (
    <SocialLayout>
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

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-white/5">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                {/* Photo / Clip Upload */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Subir foto o clip al bucket de Supabase"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary" />
                  )}
                  <span>{selectedFile ? 'Cambiar foto' : 'Foto/Clip'}</span>
                </button>

                {/* Gamer Mood / Sentimiento button */}
                <button
                  type="button"
                  onClick={() => setShowMoodSelector(!showMoodSelector)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
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
                  className="bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-primary max-w-[130px] sm:max-w-none"
                >
                  <option value="Call of Duty: BO7">Call of Duty: BO7</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                  <option value="Setup / Hardware">Setup / Hardware</option>
                  <option value="XtremGen Streetwear">XtremGen Drop</option>
                </select>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isPublishing}
                disabled={isUploadingImage}
              >
                <Send className="w-3.5 h-3.5" />
                Publicar
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
