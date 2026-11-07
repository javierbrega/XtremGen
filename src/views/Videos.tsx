"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { PlayCircle, Clock, Eye, Plus, X } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Base';
import { useFilter } from '../context/FilterContext';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const VideosPage = () => {
  const { activeFilter } = useFilter();
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [videos, setVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [game, setGame] = useState('Valorant');
  const [platform, setPlatform] = useState('pc');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVideos = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('videos')
      .select('*,profiles(username)')
      .order('created_at', { ascending: false });
    setVideos(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const filteredVideos = activeFilter
    ? videos.filter((v) => v.platform?.toLowerCase() === activeFilter.toLowerCase())
    : videos;

  const handlePublishVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('videos').insert({
      author_id: user.id,
      title: title.trim(),
      game,
      platform,
      video_url: videoUrl.trim() || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      thumbnail_url:
        thumbnailUrl.trim() ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo publicar el video.',
        type: 'error',
      });
    } else {
      setTitle('');
      setVideoUrl('');
      setIsModalOpen(false);
      fetchVideos();
      showNotification({
        title: '¡Video Publicado!',
        message: 'El clip ya está disponible en Videos XG.',
        type: 'success',
      });
    }
  };

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 flex items-center gap-4">
            <PlayCircle className="text-primary w-10 h-10 md:w-14 md:h-14" />
            VIDEOS <span className="text-primary">XG</span>
            {activeFilter && (
              <Badge variant="primary" className="text-xl py-1 px-4 ml-2 uppercase">
                {activeFilter}
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Highlights de la comunidad, análisis en video y coberturas de torneos.
          </p>
        </div>

        <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
          <Plus className="w-4 h-4" />
          Subir Video / Clip
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filteredVideos.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-white/10 bg-[#121218]/60">
          <PlayCircle className="w-16 h-16 text-primary/60 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Galería de Videos en 0</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Sin videos hardcodeados. Sube el primer highlight o cobertura competitiva.
          </p>
          <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
            <Plus className="w-4 h-4" />
            Publicar Primer Video
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((video) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden group cursor-pointer">
                <div className="relative aspect-video">
                  <img
                    src={video.thumbnail_url}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center scale-90 group-hover:scale-105 transition-transform">
                      <PlayCircle className="text-white w-8 h-8" />
                    </div>
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" /> {video.views || 0} vistas
                    </span>
                    <span className="text-primary">{video.profiles?.username || 'XG Creator'}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-black uppercase text-white">Publicar Video</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePublishVideo} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">URL del Video</label>
                <input
                  type="url"
                  required
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Publicar Video
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
