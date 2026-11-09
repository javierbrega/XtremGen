"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Play, Send, Sparkles, Image as ImageIcon, MessageSquare, Camera, X, Link as LinkIcon, Loader2 } from 'lucide-react';
import { Badge, Button, Card } from '../components/ui/Base';
import { SocialLayout } from '../components/social/SocialLayout';
import { ReactionButtons } from '../components/social/ReactionButtons';
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
  const [isPublishing, setIsPublishing] = useState(false);

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
      {/* Dynamic Stories Bar from registered profiles */}
      <div className="w-full max-w-[600px] mx-auto overflow-x-auto no-scrollbar py-6 px-4 border-b border-gray-800/50 mb-6">
        <div className="flex gap-4 min-w-max items-center">
          <div
            onClick={() => (!user ? openAuthModal() : null)}
            className="flex flex-col items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-orange-500">
              <div className="w-full h-full rounded-full border-2 border-[#0a0a0a] overflow-hidden relative bg-zinc-900 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Plus className="w-6 h-6 text-white" />
                )}
              </div>
            </div>
            <span className="text-xs font-bold text-white">
              {profile ? profile.username : 'Tu Historia'}
            </span>
          </div>

          {profiles
            .filter((p) => p.id !== profile?.id)
            .map((p) => (
              <div key={p.id} className="flex flex-col items-center gap-2 cursor-pointer group">
                <div className="relative w-16 h-16 rounded-full p-[2px] bg-gradient-to-tr from-primary to-accent">
                  <div className="w-full h-full rounded-full border-2 border-[#0a0a0a] overflow-hidden">
                    <img
                      src={p.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${p.id}`}
                      alt={p.username}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">
                  {p.username}
                </span>
              </div>
            ))}
        </div>
      </div>

      {/* Create Social Post Composer */}
      <div className="max-w-[520px] mx-auto w-full px-4 mb-8">
        <Card className="p-5 bg-[#121218] border-white/10">
          <form onSubmit={handleCreatePost} className="space-y-4">
            <div className="flex gap-3">
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
              <textarea
                rows={2}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  profile
                    ? `¿Qué jugada o setup quieres compartir hoy, ${profile.username}?`
                    : 'Inicia sesión para publicar clips, jugadas o tu setup...'
                }
                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-primary resize-none"
              />
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

            {/* Bottom Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98]"
                  title="Subir foto desde tu dispositivo al bucket de Supabase"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <Camera className="w-4 h-4 text-primary" />
                  )}
                  <span>{selectedFile ? 'Cambiar foto' : 'Subir foto'}</span>
                </button>

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
                  <span>Enlace</span>
                </button>

                <select
                  value={gameTag}
                  onChange={(e) => setGameTag(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-primary"
                >
                  <option value="Call of Duty: BO7">Call of Duty: BO7</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Counter-Strike 2">Counter-Strike 2</option>
                  <option value="Setup / Hardware">Setup / Hardware</option>
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
                      <div className="text-xs text-primary font-semibold">{post.game_tag || 'Gaming'}</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-zinc-500">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>

                {post.media_url && (
                  <div className="relative aspect-[4/5] bg-black group overflow-hidden rounded-xl border border-gray-800/50 mb-3">
                    <img
                      src={post.media_url}
                      alt={post.content}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-3 left-3">
                      <Badge variant="primary">{post.game_tag || 'Highlight'}</Badge>
                    </div>
                  </div>
                )}

                <p className="text-sm text-zinc-200 mb-3 leading-relaxed">
                  <span className="font-bold text-white mr-2">{author}</span>
                  {post.content}
                </p>

                <ReactionButtons
                  initialGg={post.gg_count || 0}
                  initialMvp={post.likes_count || 0}
                  initialFire={post.fires_count || 0}
                  comments={String(post.comments_count || 0)}
                />
              </article>
            );
          })
        )}
      </div>
    </SocialLayout>
  );
};
