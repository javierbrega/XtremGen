"use client";

import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Users } from 'lucide-react';
import { Card } from '../ui/Base';
import { supabase } from '../../lib/supabase/client';
import { Link } from '../../lib/router';

export const SocialRightSidebar = () => {
  const [recentPlayers, setRecentPlayers] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from('profiles')
      .select('id,username,avatar_url,role_badge')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (Array.isArray(data)) setRecentPlayers(data);
      });

    supabase
      .from('social_posts')
      .select('id,game_tag,content')
      .order('created_at', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (Array.isArray(data)) setRecentPosts(data);
      });
  }, []);

  return (
    <div className="h-full overflow-y-auto no-scrollbar py-6 pr-6 space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar en XG Social..."
          className="w-full bg-zinc-900 border border-gray-800 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-white"
        />
      </div>

      <Card className="p-5 border-gray-800 bg-zinc-900/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-sm text-zinc-400 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Jugadores en XG ({recentPlayers.length})
          </h3>
        </div>
        {recentPlayers.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">
            Sin sugerencias aún (0 jugadores). Regístrate para aparecer aquí.
          </p>
        ) : (
          <div className="space-y-4">
            {recentPlayers.map((u) => (
              <div key={u.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={u.avatar_url || `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${u.id}`}
                    alt={u.username}
                    className="w-9 h-9 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div className="truncate">
                    <div className="font-bold text-sm text-white truncate">{u.username}</div>
                    <div className="text-[10px] text-zinc-500 uppercase font-bold">
                      {u.role_badge || 'GAMER'}
                    </div>
                  </div>
                </div>
                <Link to="/profile" className="text-xs font-bold text-primary hover:text-white transition-colors">
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5 border-gray-800 bg-zinc-900/30">
        <h3 className="font-black text-base mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Actividad en Vivo
        </h3>
        {recentPosts.length === 0 ? (
          <p className="text-xs text-zinc-500 py-2">Sin publicaciones todavía (0 posts).</p>
        ) : (
          <div className="space-y-3">
            {recentPosts.map((post, i) => (
              <div key={post.id} className="group">
                <div className="text-[10px] text-primary font-bold uppercase">
                  #{i + 1} · {post.game_tag || 'Gaming'}
                </div>
                <div className="text-xs font-medium text-zinc-300 line-clamp-1">{post.content}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="text-[11px] text-zinc-600 px-2 leading-relaxed">
        © 2026 XTREMGEN · SUPABASE LIVE DATABASE
      </div>
    </div>
  );
};
