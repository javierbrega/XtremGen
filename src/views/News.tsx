"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { Newspaper, Clock, ArrowRight, Plus, X } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Base';
import { useFilter } from '../context/FilterContext';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const NewsPage = () => {
  const { activeFilter } = useFilter();
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('Gaming');
  const [platform, setPlatform] = useState('pc');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('news_articles')
      .select('*,profiles(username)')
      .order('created_at', { ascending: false });
    setArticles(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const filteredNews = activeFilter
    ? articles.filter((item) => item.platform?.toLowerCase() === activeFilter.toLowerCase())
    : articles;

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('news_articles').insert({
      author_id: user.id,
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: excerpt.trim(),
      category,
      platform,
      image_url:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900',
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo publicar la noticia.',
        type: 'error',
      });
    } else {
      setTitle('');
      setExcerpt('');
      setImageUrl('');
      setIsModalOpen(false);
      fetchNews();
      showNotification({
        title: '¡Noticia Publicada!',
        message: 'El artículo ya está disponible en Noticias XG.',
        type: 'success',
      });
    }
  };

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 flex items-center gap-4">
            <Newspaper className="text-primary w-10 h-10 md:w-14 md:h-14" />
            NOTICIAS <span className="text-primary">XG</span>
            {activeFilter && (
              <Badge variant="primary" className="text-xl py-1 px-4 ml-2 uppercase">
                {activeFilter}
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Mantente al día con las últimas novedades de gaming, hardware y esports.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}
        >
          <Plus className="w-4 h-4" />
          Publicar Noticia
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filteredNews.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-white/10 bg-[#121218]/60">
          <Newspaper className="w-16 h-16 text-primary/60 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Portal de Noticias en 0</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Sin noticias hardcodeadas. Publica el primer artículo de hardware, esports o lanzamientos.
          </p>
          <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
            <Plus className="w-4 h-4" />
            Redactar Primera Noticia
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredNews.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden group h-full flex flex-col">
                <div className="h-52 relative overflow-hidden">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="primary">{item.category}</Badge>
                    <Badge variant="default" className="uppercase">
                      {item.platform}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-bold mb-3 uppercase tracking-widest">
                    <Clock className="w-3 h-3" /> {new Date(item.created_at).toLocaleDateString()} ·{' '}
                    {item.profiles?.username || 'XG Editor'}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-primary transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-zinc-400 text-sm mb-6 line-clamp-3 flex-1">{item.excerpt}</p>
                  <Button variant="ghost" size="sm" className="p-0 hover:bg-transparent self-start">
                    Leer más <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-black uppercase text-white">Publicar Noticia</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePublish} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Titular</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Nueva actualización competitiva..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="Gaming">Gaming</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Esports">Esports</option>
                    <option value="Eventos">Eventos</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  >
                    <option value="pc">PC</option>
                    <option value="ps">PlayStation</option>
                    <option value="xbox">Xbox</option>
                    <option value="nintendo">Nintendo</option>
                    <option value="mobile">Mobile</option>
                    <option value="esports">Esports</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Resumen / Cuerpo</label>
                <textarea
                  rows={4}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Escribe el contenido de la noticia..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Imagen URL</label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Publicar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
