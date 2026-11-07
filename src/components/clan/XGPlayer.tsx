"use client";

import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Music, ExternalLink } from 'lucide-react';

interface XGPlayerProps {
  playlistId: string;
}

export const XGPlayer: React.FC<XGPlayerProps> = ({ playlistId }) => {
  const { isPremium } = useAuth();

  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;

  if (isPremium) {
    return (
      <div className="w-full rounded-xl overflow-hidden border border-gray-800/50 shadow-lg">
        <iframe
          title="Spotify Web Player"
          src={embedUrl}
          width="100%"
          height="352"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="bg-[#0a0a0a]"
        ></iframe>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="w-full rounded-xl overflow-hidden border border-gray-800/50 shadow-lg">
        <iframe
          title="Spotify Web Player"
          src={embedUrl}
          width="100%"
          height="152"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="bg-[#0a0a0a]"
        ></iframe>
      </div>
      
      <div className="bg-[#111] border border-[#1DB954]/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_0_15px_rgba(29,185,84,0.1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#1DB954]/10 flex items-center justify-center shrink-0">
            <Music className="w-5 h-5 text-[#1DB954]" />
          </div>
          <p className="text-sm text-zinc-300">
            Pasate a <span className="text-[#1DB954] font-bold">Premium</span> para escuchar la playlist completa de tu Clan con la mejor calidad.
          </p>
        </div>
        <a 
          href="https://spotify.com/premium" 
          target="_blank" 
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold py-2 px-4 rounded-lg transition-colors text-sm"
        >
          Obtener Premium <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
