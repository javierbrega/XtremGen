"use client";

import React from 'react';
import { Shield, Users, Trophy, ChevronRight } from 'lucide-react';
import { Link } from '../../lib/router';
import { Badge, Button } from '../ui/Base';

export interface ClanData {
  id: string;
  name: string;
  logo: string;
  banner: string;
  rank: 'Élite' | 'Oro' | 'Bronce';
  leader: {
    name: string;
    avatar: string;
  };
  members: {
    current: number;
    max: number;
    avatars: string[];
  };
  stats: {
    winRate: number;
    tournamentsWon: number;
  };
  sponsor?: {
    name: string;
    logo: string;
  };
}

export const ClanCard: React.FC<{ clan: ClanData }> = ({ clan }) => {
  const getGlowColor = () => {
    switch (clan.rank) {
      case 'Élite': return 'shadow-red-500/50 group-hover:shadow-red-500/80';
      case 'Oro': return 'shadow-yellow-500/50 group-hover:shadow-yellow-500/80';
      case 'Bronce': return 'shadow-zinc-400/50 group-hover:shadow-zinc-400/80';
      default: return 'shadow-gray-500/50';
    }
  };

  return (
    <div className="bg-[#111111] rounded-xl border border-gray-800/50 overflow-hidden flex flex-col group hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/10 relative">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black pointer-events-none mix-blend-overlay" />
      
      {/* Header (Visual/Branding) */}
      <div className="relative h-32 w-full bg-zinc-900">
        <img src={clan.banner} alt={`${clan.name} banner`} className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-300" referrerPolicy="no-referrer" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/80 to-transparent" />
        
        {/* Rank Badge */}
        <div className="absolute top-4 right-4 z-10">
          <Badge variant={clan.rank === 'Élite' ? 'primary' : 'outline'} className="bg-black/50 backdrop-blur-sm border-gray-700 shadow-lg">
            {clan.rank}
          </Badge>
        </div>

        {/* Clan Logo with Dynamic Glow */}
        <div className="absolute -bottom-8 left-6 z-10">
          <div className={`w-16 h-16 rounded-xl bg-[#0a0a0a] border-2 border-[#111111] flex items-center justify-center overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] transition-shadow duration-300 ${getGlowColor()}`}>
            {clan.logo ? (
              <img src={clan.logo} alt={clan.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              <Shield className="w-8 h-8 text-primary" />
            )}
          </div>
        </div>
      </div>

      {/* Info del Clan (Cuerpo) */}
      <div className="pt-10 px-6 pb-6 flex-1 flex flex-col relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-black text-white mb-1 tracking-tight">{clan.name}</h3>
            <div className="flex items-center gap-2 text-sm text-zinc-400">
              <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500">IGL</span>
              <img src={clan.leader.avatar} alt={clan.leader.name} className="w-5 h-5 rounded-full border border-gray-700" referrerPolicy="no-referrer" />
              <span className="font-medium text-zinc-300">{clan.leader.name}</span>
            </div>
          </div>
        </div>

        {/* Miembros */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-zinc-400 flex items-center gap-2 font-medium"><Users className="w-4 h-4" /> Miembros</span>
            <span className="text-zinc-300 font-bold">{clan.members.current} <span className="text-zinc-600">/ {clan.members.max}</span></span>
          </div>
          <div className="flex -space-x-2">
            {clan.members.avatars.map((avatar, i) => (
              <img key={i} src={avatar} alt="Member" className="w-8 h-8 rounded-full border-2 border-[#111111] object-cover" referrerPolicy="no-referrer" />
            ))}
            {clan.members.current > clan.members.avatars.length && (
              <div className="w-8 h-8 rounded-full border-2 border-[#111111] bg-zinc-800 flex items-center justify-center text-xs text-zinc-400 font-medium">
                +{clan.members.current - clan.members.avatars.length}
              </div>
            )}
          </div>
        </div>

        {/* Estadísticas Clave */}
        <div className="grid grid-cols-2 gap-4 mb-6 bg-[#0a0a0a]/80 backdrop-blur-sm rounded-lg p-3 border border-gray-800/50 shadow-inner">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1">Win Rate</span>
            <span className="text-lg font-black text-white">{clan.stats.winRate}%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest mb-1 flex items-center gap-1">
              <Trophy className="w-3 h-3 text-yellow-500" /> Torneos
            </span>
            <span className="text-lg font-black text-white">{clan.stats.tournamentsWon}</span>
          </div>
        </div>

        <div className="mt-auto">
          {clan.sponsor && (
            <div className="mb-5 flex items-center gap-3 text-xs text-zinc-500 border-t border-gray-800/30 pt-4">
              <span className="uppercase tracking-widest font-bold text-[10px]">Powered by</span>
              <img src={clan.sponsor.logo} alt={clan.sponsor.name} className="h-5 object-contain opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-300" referrerPolicy="no-referrer" />
            </div>
          )}

          <Link to={`/clan/${clan.id}`} className="block">
            <Button variant="outline" className="w-full justify-between group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-300 shadow-sm">
              Ver Perfil Completo
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
