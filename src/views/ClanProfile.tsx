"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from '../lib/router';
import {
  Shield,
  Crosshair,
  ChevronLeft,
  Zap,
  BadgeCheck,
  Settings,
  Users,
} from 'lucide-react';
import { Button, Badge, Card } from '../components/ui/Base';
import { XGPlayer } from '../components/clan/XGPlayer';
import { MetaBuild } from '../components/clan/MetaBuild';
import { useAuth } from '../contexts/AuthContext';
import { DraftModal } from '../components/clan/DraftModal';
import { supabase } from '../lib/supabase/client';

export const ClanProfile = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [clan, setClan] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadClanDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const [clanRes, membersRes] = await Promise.all([
      supabase.from('clans').select('*,profiles(username,avatar_url)').eq('id', id).single(),
      supabase
        .from('clan_members')
        .select('*,profiles(username,avatar_url,rank,role_badge)')
        .eq('clan_id', id),
    ]);

    setClan(clanRes.data || null);
    setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadClanDetails();
  }, [loadClanDetails]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!clan) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 px-6 text-center">
        <Shield className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
        <h1 className="text-3xl font-black mb-2">Clan no encontrado</h1>
        <p className="text-zinc-400 mb-6">Este clan no existe en la base de datos de Supabase.</p>
        <Link to="/clan">
          <Button variant="primary">Volver a Clanes</Button>
        </Link>
      </div>
    );
  }

  const isOwner = profile?.id === clan.leader_id || profile?.role === 'LEADER';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
      <div className="relative h-[60vh] min-h-[500px] w-full flex items-end justify-center pb-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={
              clan.banner_url ||
              'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1600'
            }
            alt={clan.name}
            className="w-full h-full object-cover opacity-35"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/85 to-transparent" />
        </div>

        <Link
          to="/clan"
          className="absolute top-24 left-8 z-20 flex items-center gap-2 text-zinc-300 hover:text-white transition-colors bg-black/60 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10 text-sm font-bold"
        >
          <ChevronLeft className="w-4 h-4" /> Volver a Clanes
        </Link>

        {isOwner && (
          <Link
            to={`/clan/${clan.id}/dashboard`}
            className="absolute top-24 right-8 z-20 flex items-center gap-2 text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-all text-sm font-bold"
          >
            <Settings className="w-4 h-4" /> Panel de Control
          </Link>
        )}

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-4 w-full">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-[#0a0a0a] border-2 border-primary/50 flex items-center justify-center overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.35)] mb-6">
            <img
              src={clan.logo_url || `https://api.dicebear.com/9.x/identicon/svg?seed=${clan.id}`}
              alt={clan.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl font-black text-primary tracking-widest">[{clan.tag}]</span>
            <Badge variant="primary">{clan.tier || 'Élite'}</Badge>
            <Badge variant="default">{clan.main_game}</Badge>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 uppercase flex items-center justify-center gap-3">
            {clan.name}
            <BadgeCheck className="w-10 h-10 text-blue-500" />
          </h1>

          <p className="text-lg md:text-xl text-zinc-300 italic mb-8 max-w-2xl">
            &quot;{clan.description || 'Escuadra competitiva oficial en XtremGen.'}&quot;
          </p>

          <div className="flex gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsDraftModalOpen(true)}
              className="px-10 py-4 text-base font-black uppercase tracking-wider"
            >
              Postularse en The Draft
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12 mt-12">
        <div className="lg:col-span-2 space-y-12">
          <section>
            <h2 className="text-3xl font-black mb-6 flex items-center gap-3 uppercase tracking-tight">
              <Crosshair className="text-primary w-8 h-8" /> Roster Oficial ({members.length})
            </h2>

            {members.length === 0 ? (
              <Card className="p-8 text-center border-dashed border-white/10">
                <Users className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm text-zinc-400">Sin miembros registrados en el roster.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {members.map((m) => (
                  <Card key={m.id} className="p-5 flex items-center gap-4 border-white/10">
                    <img
                      src={
                        m.profiles?.avatar_url ||
                        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${m.user_id}`
                      }
                      alt={m.profiles?.username || 'Member'}
                      className="w-16 h-16 rounded-xl object-cover border border-primary/40"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h3 className="text-lg font-black text-white">
                        {m.profiles?.username || 'Jugador XG'}
                      </h3>
                      <Badge variant="primary" className="mt-1">
                        {m.role}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-8">
          <MetaBuild />
          <div className="bg-[#111] border border-gray-800/50 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-widest text-zinc-400 flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" /> Clan Vibe
            </h3>
            <XGPlayer playlistId="37i9dQZF1DX0XUsuxWHRQd" />
          </div>
        </div>
      </div>

      <DraftModal
        isOpen={isDraftModalOpen}
        onClose={() => setIsDraftModalOpen(false)}
        clanName={clan.name}
        clanId={clan.id}
      />
    </div>
  );
};
