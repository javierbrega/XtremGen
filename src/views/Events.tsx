"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from '../lib/motion';
import { Calendar, MapPin, Plus, X } from 'lucide-react';
import { Card, Badge, Button } from '../components/ui/Base';
import { useFilter } from '../context/FilterContext';
import { supabase } from '../lib/supabase/client';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../context/NotificationContext';

export const EventsPage = () => {
  const { activeFilter } = useFilter();
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [game, setGame] = useState('Counter-Strike 2');
  const [platform, setPlatform] = useState('pc');
  const [prizePool, setPrizePool] = useState('$10,000 USD');
  const [region, setRegion] = useState('Online / LATAM');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });
    setEvents(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = activeFilter
    ? events.filter((ev) => ev.platform?.toLowerCase() === activeFilter.toLowerCase())
    : events;

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from('events').insert({
      organizer_id: user.id,
      title: title.trim(),
      game,
      platform,
      prize_pool: prizePool.trim(),
      region: region.trim(),
      banner_url:
        bannerUrl.trim() ||
        'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=900',
    });
    setIsSubmitting(false);

    if (error) {
      showNotification({
        title: 'Error',
        message: error.message || 'No se pudo crear el evento.',
        type: 'error',
      });
    } else {
      setTitle('');
      setIsModalOpen(false);
      fetchEvents();
      showNotification({
        title: '¡Torneo Creado!',
        message: 'El evento ya está abierto para inscripciones en Supabase.',
        type: 'success',
      });
    }
  };

  const handleRegister = async (ev: any) => {
    if (!user) {
      openAuthModal();
      return;
    }
    const { error } = await supabase.from('event_registrations').insert({
      event_id: ev.id,
      user_id: user.id,
    });
    if (error) {
      showNotification({
        title: 'Ya estás inscrito',
        message: 'Ya registraste tu participación en este torneo.',
        type: 'info',
      });
    } else {
      await supabase
        .from('events')
        .update({ slots_taken: (ev.slots_taken || 0) + 1 })
        .eq('id', ev.id);
      fetchEvents();
      showNotification({
        title: '¡Inscripción Confirmada!',
        message: `Te inscribiste a ${ev.title}.`,
        type: 'success',
      });
    }
  };

  return (
    <div className="pt-12 pb-20 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl md:text-6xl font-black mb-3 flex items-center gap-4">
            <Calendar className="text-primary w-10 h-10 md:w-14 md:h-14" />
            EVENTOS <span className="text-primary">XG</span>
            {activeFilter && (
              <Badge variant="primary" className="text-xl py-1 px-4 ml-2 uppercase">
                {activeFilter}
              </Badge>
            )}
          </h1>
          <p className="text-zinc-400 text-base max-w-2xl">
            Torneos oficiales, ligas comunitarias y competencias con premios en vivo.
          </p>
        </div>

        <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
          <Plus className="w-4 h-4" />
          Crear Torneo / Evento
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-56 rounded-2xl bg-surface animate-pulse" />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-white/10 bg-[#121218]/60">
          <Calendar className="w-16 h-16 text-primary/60 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-white mb-2">Calendario de Eventos en 0</h2>
          <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
            Sin eventos hardcodeados. Crea el primer torneo oficial de XtremGen para abrir las inscripciones.
          </p>
          <Button variant="primary" onClick={() => (user ? setIsModalOpen(true) : openAuthModal())}>
            <Plus className="w-4 h-4" />
            Organizar Primer Torneo
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {filteredEvents.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <Card className="p-0 overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3 h-64 md:h-auto overflow-hidden">
                    <img
                      src={event.banner_url}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="primary">
                        {new Date(event.event_date).toLocaleDateString()}
                      </Badge>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-primary" /> {event.region}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-white mb-4 group-hover:text-primary transition-colors">
                      {event.title}
                    </h3>
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          Prize Pool
                        </div>
                        <div className="text-lg font-black text-accent">{event.prize_pool}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">
                          Cupos Inscritos
                        </div>
                        <div className="text-lg font-black text-white">
                          {event.slots_taken || 0} / {event.slots_total || 64}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Button variant="primary" onClick={() => handleRegister(event)}>
                        Inscribirse Ahora
                      </Button>
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
            <div className="flex justify-between items-center pb-4 border-b border-white/10 mb-5">
              <h3 className="text-lg font-black uppercase text-white">Crear Torneo / Evento</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Nombre del Torneo</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: XG Invitational 2026"
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Juego</label>
                  <input
                    type="text"
                    required
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  />
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
                    <option value="mobile">Mobile</option>
                    <option value="esports">Esports</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Premio</label>
                  <input
                    type="text"
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Región / Sede</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Crear Torneo
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
