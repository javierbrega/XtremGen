"use client";

import React, { useState, useEffect } from 'react';
import { Crosshair, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Base';

interface MetaBuildProps {
  isAdmin?: boolean;
}

export const MetaBuild: React.FC<MetaBuildProps> = () => {
  const [build, setBuild] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [weapon, setWeapon] = useState('');
  const [notes, setNotes] = useState('');
  const { user, openAuthModal } = useAuth();

  useEffect(() => {
    supabase
      .from('meta_builds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) setBuild(data);
      });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    const { data } = await supabase
      .from('meta_builds')
      .insert({
        author_id: user.id,
        game: 'Call of Duty / Valorant',
        weapon_or_hero: weapon.trim(),
        title: `${weapon.trim()} - Pro Setup`,
        notes: notes.trim(),
      })
      .single();
    if (data) {
      setBuild(data);
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-[#111] border border-gray-800/50 rounded-xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" /> Tactical Meta
        </h3>
        <button
          onClick={() => (user ? setIsCreating(!isCreating) : openAuthModal())}
          className="text-xs font-bold text-primary hover:text-white flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> Configurar
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={handleSave} className="space-y-3 bg-[#0a0a0a] p-4 rounded-xl border border-white/10">
          <input
            type="text"
            required
            value={weapon}
            onChange={(e) => setWeapon(e.target.value)}
            placeholder="Arma / Agente (Ej: Vandal / MCW)"
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
          />
          <textarea
            rows={2}
            required
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Accesorios o notas tácticas..."
            className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white resize-none"
          />
          <Button type="submit" variant="primary" size="sm" className="w-full">
            Guardar Meta Build
          </Button>
        </form>
      ) : !build ? (
        <div className="bg-[#0a0a0a] rounded-lg p-6 border border-dashed border-gray-800 text-center">
          <p className="text-xs text-zinc-500">
            Sin Meta Build cargada (0 registros). Haz clic en Configurar para publicar una.
          </p>
        </div>
      ) : (
        <div className="bg-[#0a0a0a] rounded-lg p-4 border border-gray-800/30">
          <h4 className="font-black text-white text-lg">{build.weapon_or_hero}</h4>
          <p className="text-[10px] text-primary font-black uppercase tracking-widest mb-2">
            {build.tier || 'S-TIER'}
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">{build.notes}</p>
        </div>
      )}
    </div>
  );
};
