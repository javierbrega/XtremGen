"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { Card, Badge, Button } from './ui/Base';
import { Flame, Star, Users, Plus, Gamepad2, X } from 'lucide-react';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useFilter } from '../context/FilterContext';

export const TrendingGames = () => {
  const [games, setGames] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Shooter');
  const [platform, setPlatform] = useState('pc');
  const [rating, setRating] = useState('4.9');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();
  const { activeFilter } = useFilter();

  const fetchGames = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(8);
    setGames(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  const filteredGames = activeFilter
    ? games.filter((g) => g.platform?.toLowerCase() === activeFilter.toLowerCase())
    : games;

  const handleAddGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('games').insert({
      title: title.trim(),
      category,
      platform,
      rating: parseFloat(rating) || 5.0,
      players_count: 'Activo',
      image_url:
        imageUrl.trim() ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=600',
      is_trending: true,
      created_by: user.id,
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo registrar el juego.',
        type: 'error',
      });
    } else {
      setTitle('');
      setImageUrl('');
      setIsModalOpen(false);
      fetchGames();
      showNotification({
        title: '¡Juego Añadido!',
        message: 'El título ya aparece en Tendencias desde Supabase.',
        type: 'success',
      });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-14">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-black flex items-center gap-3">
            <Flame className="text-primary w-7 h-7" />
            JUEGOS EN TENDENCIA
            {activeFilter && (
              <Badge variant="primary" className="uppercase">
                {activeFilter}
              </Badge>
            )}
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Explora los títulos más jugados por la comunidad de XtremGen.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}
          className="border-white/15 hover:border-primary"
        >
          <Plus className="w-4 h-4" />
          Añadir Juego
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="aspect-[4/5] rounded-2xl bg-surface animate-pulse border border-white/5" />
          ))}
        </div>
      ) : filteredGames.length === 0 ? (
        <Card className="p-12 text-center border-dashed border-white/10 bg-[#14141a]/60">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Gamepad2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-black text-white mb-2">Sin juegos cargados todavía (0 registros)</h3>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Eliminamos todo el contenido hardcodeado. Agrega el primer juego competitivo a la base de datos de XtremGen.
          </p>
          <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
            <Plus className="w-4 h-4" />
            Registrar Primer Juego
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredGames.map((game, index) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden group cursor-pointer border-white/5 hover:border-primary/40 transition-all duration-500">
                <div className="relative aspect-[4/5]">
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-all duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />

                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant="primary" className="uppercase text-[10px]">
                      {game.category}
                    </Badge>
                    <Badge variant="default" className="uppercase text-[10px] bg-black/70">
                      {game.platform}
                    </Badge>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="font-bold text-lg text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {game.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-zinc-300 font-bold">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        {game.rating}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <Users className="w-3.5 h-3.5" />
                        {game.players_count || 'Online'}
                      </div>
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
          <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-black uppercase text-white">Añadir Juego a Tendencias</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddGame} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre del Juego</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Valorant / CS2 / GTA VI"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Categoría</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  >
                    <option value="Shooter">Shooter</option>
                    <option value="Battle Royale">Battle Royale</option>
                    <option value="MOBA">MOBA</option>
                    <option value="RPG">RPG</option>
                    <option value="Sports">Sports</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Calificación (1-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Portada (URL)</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Publicar Juego
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
