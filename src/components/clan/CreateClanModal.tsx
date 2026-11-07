"use client";

import React, { useState } from 'react';
import { X, Loader2, Gamepad2, Shield, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Base';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { supabase } from '../../lib/supabase/client';

interface CreateClanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClanCreated?: () => void;
}

export const CreateClanModal: React.FC<CreateClanModalProps> = ({ isOpen, onClose, onClanCreated }) => {
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [mainGame, setMainGame] = useState('Valorant');
  const [region, setRegion] = useState('LATAM');
  const [tier, setTier] = useState('Élite');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { user, updateProfile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    setIsLoading(true);
    const cleanTag = tag.replace(/[\[\]]/g, '').toUpperCase();

    const { data: createdClan, error } = await supabase
      .from('clans')
      .insert({
        name: name.trim(),
        tag: cleanTag,
        description: description.trim() || 'Escuadra oficial registrada en XtremGen.',
        main_game: mainGame,
        region,
        tier,
        leader_id: user.id,
        logo_url:
          logoUrl.trim() ||
          `https://api.dicebear.com/9.x/identicon/svg?seed=${encodeURIComponent(name.trim())}`,
        banner_url:
          bannerUrl.trim() ||
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600',
        members_count: 1,
        win_rate: 100,
      })
      .single();

    if (error || !createdClan) {
      setIsLoading(false);
      showNotification({
        title: 'Error al crear clan',
        message: error?.message || 'Verifica que el nombre o tag no estén duplicados.',
        type: 'error',
      });
      return;
    }

    // Add creator as Leader in clan_members and update profile
    await supabase.from('clan_members').insert({
      clan_id: createdClan.id,
      user_id: user.id,
      role: 'Leader',
    });

    await updateProfile({
      role: 'LEADER',
      clan_id: createdClan.id,
      clan_tag: cleanTag,
    });

    setIsLoading(false);
    setName('');
    setTag('');
    setDescription('');
    onClanCreated?.();
    onClose();
    showNotification({
      title: '¡Clan Inscrito en Supabase!',
      message: `${createdClan.name} [${cleanTag}] ya es oficial en XtremGen.`,
      type: 'success',
    });
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-[#0e0e14] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-white/10">
          <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" /> Inscribir Clan en XG
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Nombre del Clan
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej: Neon Ninjas"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Tag (Máx 5)
              </label>
              <input
                type="text"
                required
                maxLength={5}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="NEON"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white uppercase font-black"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Juego Principal
              </label>
              <div className="relative">
                <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <select
                  value={mainGame}
                  onChange={(e) => setMainGame(e.target.value)}
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-2 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
                >
                  <option value="Call of Duty: BO7">CoD: BO7</option>
                  <option value="Valorant">Valorant</option>
                  <option value="Counter-Strike 2">CS2</option>
                  <option value="League of Legends">LoL</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Región
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
              >
                <option value="LATAM">LATAM</option>
                <option value="NA">NA</option>
                <option value="EU">EU</option>
                <option value="BR">BR</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                División
              </label>
              <select
                value={tier}
                onChange={(e) => setTier(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-primary text-white"
              >
                <option value="Élite">Élite</option>
                <option value="Oro">Oro</option>
                <option value="Bronce">Bronce</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
              Lema / Descripción
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Silenciosos en la red, letales en el servidor."
              className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Logo URL (Opcional)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Banner URL (Opcional)
              </label>
              <div className="relative">
                <ImageIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={isLoading}
              className="w-full py-3 font-black text-sm tracking-wider uppercase"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Confirmar Inscripción en Supabase'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
