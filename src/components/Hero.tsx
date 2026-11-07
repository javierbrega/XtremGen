"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { Button, Badge } from './ui/Base';
import { ChevronRight, Play, Users, Trophy, Zap, Plus, X, Sparkles } from 'lucide-react';
import { TrailerModal } from './TrailerModal';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

const HERO_BG = 'https://raw.githubusercontent.com/javierbrega/XtremeGem/main/src/assets/images/fondoHero.png';

export const Hero = () => {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [heroGame, setHeroGame] = useState<any | null>(null);
  const [stats, setStats] = useState({ players: 0, clans: 0, events: 0 });

  // Form states for setting the Hero Spotlight in Supabase
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [bannerUrl, setBannerUrl] = useState(HERO_BG);
  const [isSaving, setIsSaving] = useState(false);

  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const loadHeroAndStats = useCallback(async () => {
    const [gamesRes, profilesRes, clansRes, eventsRes] = await Promise.all([
      supabase.from('games').select('*').eq('is_hero', true).order('created_at', { ascending: false }).limit(1),
      supabase.from('profiles').select('id'),
      supabase.from('clans').select('id'),
      supabase.from('events').select('id'),
    ]);

    if (gamesRes.data && gamesRes.data.length > 0) {
      setHeroGame(gamesRes.data[0]);
    } else {
      setHeroGame(null);
    }

    setStats({
      players: Array.isArray(profilesRes.data) ? profilesRes.data.length : 0,
      clans: Array.isArray(clansRes.data) ? clansRes.data.length : 0,
      events: Array.isArray(eventsRes.data) ? eventsRes.data.length : 0,
    });
  }, []);

  useEffect(() => {
    loadHeroAndStats();
  }, [loadHeroAndStats]);

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSaving(true);
    const { error } = await supabase.from('games').insert({
      title: title.trim() || 'NUEVO DROP XG',
      subtitle: subtitle.trim() || 'TEMPORADA OFICIAL',
      description: description.trim(),
      banner_url: bannerUrl.trim() || HERO_BG,
      image_url: bannerUrl.trim() || HERO_BG,
      is_hero: true,
      is_trending: true,
      created_by: user.id,
    });
    setIsSaving(false);

    if (error) {
      showNotification({
        title: 'Error al guardar Hero',
        message: error.message || 'No se pudo actualizar el Hero en Supabase.',
        type: 'error',
      });
    } else {
      setIsConfigOpen(false);
      loadHeroAndStats();
      showNotification({
        title: '¡Hero Actualizado!',
        message: 'El juego destacado ya está publicado en vivo desde Supabase.',
        type: 'success',
      });
    }
  };

  return (
    <section className="relative min-h-[82vh] flex items-center pt-28 pb-20 overflow-hidden bg-[#09090d] border-b border-white/5">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroGame?.banner_url || HERO_BG}
          alt="Hero Background"
          className="w-full h-full object-cover opacity-55 scale-105 transition-transform duration-1000"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#09090d] via-[#09090d]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#09090d]/60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-primary mb-6 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              {heroGame ? heroGame.subtitle || 'DESTACADO EN VIVO' : 'NUEVA TEMPORADA COMPETITIVA'}
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black leading-[0.88] mb-6 tracking-tighter text-white uppercase">
              {heroGame ? (
                <>
                  {heroGame.title}
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500">
                    {heroGame.category || 'COMPETITIVE'}
                  </span>
                </>
              ) : (
                <>
                  XTREMGEN <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-red-500 to-orange-500">
                    PRO ARENA
                  </span>
                </>
              )}
            </h1>

            <p className="text-lg md:text-xl text-zinc-300 mb-10 max-w-xl leading-relaxed font-medium drop-shadow-lg">
              {heroGame
                ? heroGame.description
                : 'El ecosistema definitivo para jugadores competitivos. Publica el lanzamiento destacado de la temporada, crea tu clan o inaugura el foro.'}
            </p>

            <div className="flex flex-wrap gap-4">
              <Button
                size="lg"
                onClick={() => {
                  if (!user) openAuthModal();
                  else setIsConfigOpen(true);
                }}
                className="group h-14 px-8 text-base shadow-[0_0_25px_rgba(239,68,68,0.4)]"
              >
                <Plus className="w-5 h-5" />
                {heroGame ? 'Cambiar Destacado' : 'Publicar Juego Destacado'}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 text-base backdrop-blur-md bg-white/5 hover:bg-white/10 border-white/15"
                onClick={() => setIsTrailerOpen(true)}
              >
                <Play className="w-4 h-4 fill-current" />
                Ver Trailer
              </Button>
            </div>

            {/* Real-time database counters */}
            <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center gap-8">
              <StatItem
                icon={<Users className="w-5 h-5 text-primary" />}
                label="Jugadores Registrados"
                value={String(stats.players)}
              />
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <StatItem
                icon={<Trophy className="w-5 h-5 text-accent" />}
                label="Clanes Activos"
                value={String(stats.clans)}
              />
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <StatItem
                icon={<Zap className="w-5 h-5 text-emerald-400" />}
                label="Torneos & Eventos"
                value={String(stats.events)}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal to configure Hero Game in Supabase */}
      {isConfigOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-black uppercase text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" /> Publicar Destacado en Portada
              </h3>
              <button onClick={() => setIsConfigOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveHero} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Título Principal</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: CALL OF DUTY: BLACK OPS 7"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Etiqueta Superior</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ej: NUEVO LANZAMIENTO: SEASON 1"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Descripción</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe la temporada, torneo o lanzamiento..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">URL de Imagen de Fondo</label>
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsConfigOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSaving}>
                  Guardar en Supabase
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <TrailerModal isOpen={isTrailerOpen} onClose={() => setIsTrailerOpen(false)} />
    </section>
  );
};

const StatItem = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-2xl font-black text-white">{value}</span>
    </div>
    <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">{label}</span>
  </div>
);
