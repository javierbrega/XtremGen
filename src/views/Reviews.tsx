"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { Star, Plus, X } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Base';
import { useFilter } from '../context/FilterContext';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const ReviewsPage = () => {
  const { activeFilter } = useFilter();
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [gameTitle, setGameTitle] = useState('');
  const [score, setScore] = useState('9.5');
  const [category, setCategory] = useState('Gaming');
  const [platform, setPlatform] = useState('pc');
  const [summary, setSummary] = useState('');
  const [prosText, setProsText] = useState('Rendimiento sólido, Gran diseño');
  const [consText, setConsText] = useState('Precio elevado');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('game_reviews')
      .select('*,profiles(username)')
      .order('created_at', { ascending: false });
    setReviews(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const filteredReviews = activeFilter
    ? reviews.filter((r) => r.platform?.toLowerCase() === activeFilter.toLowerCase())
    : reviews;

  const handlePublishReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('game_reviews').insert({
      author_id: user.id,
      game_title: gameTitle.trim(),
      score: Math.min(10, Math.max(0, parseFloat(score) || 9.0)),
      verdict: 'Recomendado XG',
      summary: summary.trim() || 'Análisis publicado por la comunidad XG.',
      category,
      platform,
      pros: prosText.split(',').map((s) => s.trim()).filter(Boolean),
      cons: consText.split(',').map((s) => s.trim()).filter(Boolean),
      image_url:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo publicar la reseña.',
        type: 'error',
      });
    } else {
      setGameTitle('');
      setSummary('');
      setIsModalOpen(false);
      fetchReviews();
      showNotification({
        title: '¡Reseña Publicada!',
        message: 'Tu análisis ya está visible en Reseñas XG.',
        type: 'success',
      });
    }
  };

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 flex items-center gap-4">
            <Star className="text-primary w-10 h-10 md:w-14 md:h-14" />
            RESEÑAS <span className="text-primary">XG</span>
            {activeFilter && (
              <Badge variant="primary" className="text-xl py-1 px-4 ml-2 uppercase">
                {activeFilter}
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Análisis profundos sobre hardware y los últimos lanzamientos competitivos.
          </p>
        </div>

        <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
          <Plus className="w-4 h-4" />
          Publicar Reseña
        </Button>
      </div>

      {isLoading ? (
        <div className="grid lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-72 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filteredReviews.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-white/10 bg-[#121218]/60">
          <Star className="w-16 h-16 text-primary/60 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Sección de Reseñas en 0</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Sin reseñas hardcodeadas. Publica la primera review técnica de un juego o periférico.
          </p>
          <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
            <Plus className="w-4 h-4" />
            Escribir Primera Reseña
          </Button>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {filteredReviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden group h-full flex flex-col">
                <div className="relative h-48">
                  <img
                    src={review.image_url}
                    alt={review.game_title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-primary flex items-center justify-center font-black text-white shadow-xl">
                    {review.score}
                  </div>
                  <div className="absolute top-4 left-4">
                    <Badge variant="primary">{review.category}</Badge>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary transition-colors">
                    {review.game_title}
                  </h3>
                  <p className="text-xs text-zinc-400 mb-4">{review.summary}</p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">
                        Pros
                      </div>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        {(review.pros || []).map((pro: string, i: number) => (
                          <li key={i}>+ {pro}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1">
                        Contras
                      </div>
                      <ul className="text-xs text-zinc-400 space-y-1">
                        {(review.cons || []).map((con: string, i: number) => (
                          <li key={i}>- {con}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
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
              <h3 className="text-lg font-black uppercase text-white">Publicar Reseña</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handlePublishReview} className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Juego / Hardware</label>
                  <input
                    type="text"
                    required
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    placeholder="Ej: Elden Ring / RTX 5090"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Puntaje (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    required
                    value={score}
                    onChange={(e) => setScore(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Veredicto / Resumen</label>
                <textarea
                  rows={3}
                  required
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Pros (separar por coma)</label>
                  <input
                    type="text"
                    value={prosText}
                    onChange={(e) => setProsText(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Contras (por coma)</label>
                  <input
                    type="text"
                    value={consText}
                    onChange={(e) => setConsText(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Publicar Reseña
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
