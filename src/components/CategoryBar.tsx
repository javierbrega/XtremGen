"use client";

import React from 'react';
import { Monitor, Gamepad2, Smartphone, Trophy, Disc } from 'lucide-react';
import { useFilter } from '../context/FilterContext';

const CATEGORIES = [
  { id: 'pc', label: 'PC', icon: <Monitor className="w-4 h-4" />, color: 'hover:text-slate-400 hover:border-slate-400/30', activeColor: 'text-slate-400 border-slate-400/50 bg-slate-400/10 shadow-[0_0_20px_rgba(148,163,184,0.2)]' },
  { id: 'ps', label: 'PlayStation', icon: <Disc className="w-4 h-4" />, color: 'hover:text-blue-500 hover:border-blue-500/30', activeColor: 'text-blue-500 border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_rgba(59,130,246,0.2)]' },
  { id: 'xbox', label: 'Xbox', icon: <Gamepad2 className="w-4 h-4" />, color: 'hover:text-green-500 hover:border-green-500/30', activeColor: 'text-green-500 border-green-500/50 bg-green-500/10 shadow-[0_0_20px_rgba(34,197,94,0.2)]' },
  { id: 'nintendo', label: 'Nintendo', icon: <Gamepad2 className="w-4 h-4" />, color: 'hover:text-red-500 hover:border-red-500/30', activeColor: 'text-red-500 border-red-500/50 bg-red-500/10 shadow-[0_0_20px_rgba(239,68,68,0.2)]' },
  { id: 'mobile', label: 'Mobile', icon: <Smartphone className="w-4 h-4" />, color: 'hover:text-cyan-400 hover:border-cyan-400/30', activeColor: 'text-cyan-400 border-cyan-400/50 bg-cyan-400/10 shadow-[0_0_20px_rgba(34,211,238,0.2)]' },
  { id: 'esports', label: 'Esports', icon: <Trophy className="w-4 h-4" />, color: 'hover:text-yellow-400 hover:border-yellow-400/30', activeColor: 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10 shadow-[0_0_20px_rgba(250,204,21,0.2)]' },
] as const;

export const CategoryBar = () => {
  const { activeFilter, setActiveFilter } = useFilter();

  return (
    <div className="w-full bg-[#121212] pt-24 pb-6 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-4">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`
                group flex items-center gap-3 px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-tighter
                transition-all duration-300 hover:scale-105
                ${isActive 
                  ? cat.activeColor
                  : `bg-[#1a1a1a] text-zinc-400 border border-white/5 hover:bg-[#222] ${cat.color}`
                }
              `}
            >
              <span className={`transition-colors ${isActive ? 'text-inherit' : 'text-zinc-500 group-hover:text-inherit'}`}>
                {cat.icon}
              </span>
              {cat.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
