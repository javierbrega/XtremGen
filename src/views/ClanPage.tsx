"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Trophy, Target, Shield, Plus } from 'lucide-react';
import { ClanCard, ClanData } from '../components/clan/ClanCard';
import { CreateClanModal } from '../components/clan/CreateClanModal';
import { Button, Card } from '../components/ui/Base';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';

export const ClanPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clans, setClans] = useState<ClanData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { user, openAuthModal } = useAuth();

  const loadClans = useCallback(async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('clans')
      .select('*,profiles(username,avatar_url)')
      .order('created_at', { ascending: false });

    if (Array.isArray(data)) {
      const mapped: ClanData[] = data.map((c: any) => ({
        id: c.id,
        name: `${c.name} [${c.tag}]`,
        logo: c.logo_url || `https://api.dicebear.com/9.x/identicon/svg?seed=${c.id}`,
        banner:
          c.banner_url ||
          'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
        rank: (c.tier === 'Oro' || c.tier === 'Bronce' ? c.tier : 'Élite') as 'Élite' | 'Oro' | 'Bronce',
        leader: {
          name: c.profiles?.username || 'Líder XG',
          avatar:
            c.profiles?.avatar_url ||
            `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${c.leader_id}`,
        },
        members: {
          current: c.members_count || 1,
          max: c.max_members || 50,
          avatars: [
            c.profiles?.avatar_url ||
              `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${c.leader_id}`,
          ],
        },
        stats: {
          winRate: c.win_rate || 100,
          tournamentsWon: c.trophies || 0,
        },
      }));
      setClans(mapped);
    } else {
      setClans([]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadClans();
  }, [loadClans]);

  const handleCreateClick = () => {
    if (!user) {
      openAuthModal();
    } else {
      setIsModalOpen(true);
    }
  };

  const filteredClans = clans.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
          CLANES <span className="text-primary">XG</span>
        </h1>
        <p className="text-zinc-400 text-sm mb-6">
          Explora las organizaciones registradas o inscribe tu propio clan en XtremGen.
        </p>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111111] p-4 rounded-xl border border-gray-800/50">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar clanes por nombre o tag..."
              className="w-full bg-[#0a0a0a] border border-gray-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors text-white"
            />
          </div>

          <Button onClick={handleCreateClick} variant="primary" className="w-full md:w-auto">
            <Plus className="w-4 h-4" />
            Inscribir Nuevo Clan
          </Button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <main className="flex-1">
          <div className="mb-8 bg-gradient-to-r from-[#14141c] to-[#111] border border-primary/40 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_25px_rgba(239,68,68,0.12)]">
            <div>
              <h2 className="text-xl font-black text-white mb-1">Llevá a tu equipo a la cima</h2>
              <p className="text-sm text-zinc-400">
                Crea tu clan oficial en Supabase, abre reclutamiento en The Draft y gestiona tu roster.
              </p>
            </div>
            <Button onClick={handleCreateClick} variant="primary" className="px-6 py-3">
              Inscribir Clan
            </Button>
          </div>

          <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
            Escuadras Registradas ({filteredClans.length})
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-72 rounded-2xl bg-surface animate-pulse border border-white/5" />
              ))}
            </div>
          ) : filteredClans.length === 0 ? (
            <Card className="p-14 text-center border-dashed border-white/10 bg-[#121218]/60">
              <Shield className="w-14 h-14 text-primary/60 mx-auto mb-4" />
              <h3 className="text-xl font-black text-white mb-2">Directorio de Clanes en 0</h3>
              <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
                Se eliminaron todos los clanes hardcodeados. Sé el fundador del primer Clan competitivo en XtremGen.
              </p>
              <Button variant="primary" onClick={handleCreateClick}>
                <Plus className="w-4 h-4" />
                Fundar Primer Clan
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClans.map((clan) => (
                <ClanCard key={clan.id} clan={clan} />
              ))}
            </div>
          )}
        </main>

        {/* Ranking Sidebar */}
        <aside className="w-full xl:w-[340px] flex-shrink-0">
          <div className="bg-[#111111] rounded-2xl border border-gray-800/50 p-6 sticky top-24">
            <h3 className="text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Top Global ({clans.length})
            </h3>

            {clans.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">
                Sin clanes en el ranking todavía (0 registros).
              </p>
            ) : (
              <div className="space-y-3">
                {clans.slice(0, 5).map((clan, index) => (
                  <div
                    key={clan.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-[#0a0a0a] border border-white/5"
                  >
                    <div className="w-6 text-center font-black text-primary">#{index + 1}</div>
                    <img
                      src={clan.logo}
                      alt={clan.name}
                      className="w-10 h-10 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 truncate">
                      <div className="font-bold text-sm truncate">{clan.name}</div>
                      <div className="text-xs text-zinc-500">{clan.stats.winRate}% WR</div>
                    </div>
                    <Trophy className="w-4 h-4 text-yellow-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      <CreateClanModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClanCreated={loadClans}
      />
    </div>
  );
};
