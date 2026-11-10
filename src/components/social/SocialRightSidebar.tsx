"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, Users, Radio, Sparkles, Play, Flame } from 'lucide-react';
import { Card, Badge, Button } from '../ui/Base';
import { supabase } from '../../lib/supabase/client';
import { Link } from '../../lib/router';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import {
  parseStreamInfo,
  getPlatformMeta,
  YouTubeIcon,
  TwitchIcon,
  KickIcon,
  parseLiveCaption,
} from '../../lib/stream-helpers';
import {
  LiveStreamPlayerModal,
  LiveStreamData,
} from './LiveStreamPlayerModal';
import { LiveStreamModal } from './LiveStreamModal';

// Curated seed live streams for community discovery
const SEED_SIDEBAR_LIVES: LiveStreamData[] = [
  {
    id: 'seed-live-twitch',
    user_id: 'seed-streamer-1',
    media_url: 'https://twitch.tv/shroud',
    caption: '🔴 Rankeando en Search & Destroy BO7',
    created_at: new Date().toISOString(),
    is_host: true,
    host_username: 'JaviXG',
    original_streamer: 'Shroud',
    profiles: {
      username: 'Shroud',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=ShroudXG',
    },
  },
  {
    id: 'seed-live-yt',
    user_id: 'seed-streamer-2',
    media_url: 'https://www.youtube.com/watch?v=5qap5aO4i9A',
    caption: '🔴 Torneo Pro Invitational XtremGen En Vivo',
    created_at: new Date().toISOString(),
    profiles: {
      username: 'JaviXG',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=JaviXG',
    },
  },
  {
    id: 'seed-live-kick',
    user_id: 'seed-streamer-3',
    media_url: 'https://kick.com/xqc',
    caption: '🔴 Watch Party XtremGen Gaming Nights',
    created_at: new Date().toISOString(),
    is_host: true,
    host_username: 'CyberDrop',
    original_streamer: 'xQc',
    profiles: {
      username: 'xQc',
      avatar_url: 'https://api.dicebear.com/9.x/bottts-neutral/svg?seed=xQc',
    },
  },
];

export const SocialRightSidebar: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const [recentPlayers, setRecentPlayers] = useState<any[]>([]);
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [liveStreams, setLiveStreams] = useState<LiveStreamData[]>([]);

  // Modals for Sidebar Live Stream Viewer & Creator
  const [selectedLiveStream, setSelectedLiveStream] = useState<LiveStreamData | null>(null);
  const [isLivePlayerOpen, setIsLivePlayerOpen] = useState(false);
  const [isLiveBroadcastOpen, setIsLiveBroadcastOpen] = useState(false);

  const loadSidebarData = useCallback(async () => {
    // 1. Load active live streams
    const { data: livesData } = await supabase
      .from('social_stories')
      .select('*,profiles(username,avatar_url)')
      .eq('media_type', 'live')
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (Array.isArray(livesData) && livesData.length > 0) {
      setLiveStreams(livesData);
    } else {
      setLiveStreams(SEED_SIDEBAR_LIVES);
    }

    // 2. Load recent players
    const { data: playersData } = await supabase
      .from('profiles')
      .select('id,username,avatar_url,role_badge')
      .order('created_at', { ascending: false })
      .limit(4);

    if (Array.isArray(playersData)) setRecentPlayers(playersData);

    // 3. Load recent posts
    const { data: postsData } = await supabase
      .from('social_posts')
      .select('id,game_tag,content')
      .order('created_at', { ascending: false })
      .limit(4);

    if (Array.isArray(postsData)) setRecentPosts(postsData);
  }, []);

  useEffect(() => {
    loadSidebarData();
  }, [loadSidebarData]);

  return (
    <div className="h-full overflow-y-auto no-scrollbar py-6 pr-6 space-y-6">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input
          type="text"
          placeholder="Buscar en XG Social..."
          className="w-full bg-zinc-900 border border-gray-800 rounded-full py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-primary transition-colors text-white"
        />
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DEDICATED LATERAL PANEL: DIRECTOS EN VIVO 🔴 (Estilo Twitch)   */}
      {/* ------------------------------------------------------------- */}
      <Card className="p-4 border-red-500/20 bg-gradient-to-b from-[#18090f] via-zinc-900/60 to-zinc-900/30 shadow-xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <h3 className="font-black text-sm text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>Directos</span>
              <span className="text-[10px] px-1.5 py-[1px] rounded-full bg-red-600/80 text-white font-mono font-bold">
                {liveStreams.length}
              </span>
            </h3>
          </div>

          <button
            type="button"
            onClick={() => {
              if (!user) openAuthModal();
              else setIsLiveBroadcastOpen(true);
            }}
            className="text-[11px] font-black uppercase tracking-wider px-2 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all shadow-md active:scale-95 flex items-center gap-1"
            title="Re-transmitir tu directo en XtremGen"
          >
            <span>+ Emitir</span>
          </button>
        </div>

        {/* Live Streamers List */}
        <div className="space-y-2.5">
          {liveStreams.map((live) => {
            const streamInfo = parseStreamInfo(live.media_url);
            const meta = getPlatformMeta(streamInfo.platform);
            const hostInfo = parseLiveCaption(live.caption);
            const isHost = Boolean(live.is_host || hostInfo.isHost);
            const hostUsername = live.host_username || hostInfo.hostUsername;
            const streamerName = live.original_streamer || live.profiles?.username || 'Streamer XG';
            const streamerAvatar =
              live.profiles?.avatar_url ||
              `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${live.user_id}`;

            return (
              <div
                key={live.id}
                onClick={() => {
                  setSelectedLiveStream(live);
                  setIsLivePlayerOpen(true);
                }}
                className="group relative p-2.5 rounded-xl bg-black/40 hover:bg-white/5 border border-white/5 hover:border-red-500/40 transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 shadow-md"
              >
                {/* Left: Glowing Streamer Avatar with VIVO Badge */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-red-600 via-rose-500 to-amber-400 shadow-[0_0_12px_rgba(239,68,68,0.8)] animate-pulse shrink-0">
                    <img
                      src={streamerAvatar}
                      alt={streamerName}
                      className="w-full h-full rounded-full object-cover border border-black bg-zinc-800"
                    />
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1 py-[0.5px] rounded-full bg-red-600 text-white font-black text-[7px] uppercase tracking-wider shadow-md">
                      VIVO
                    </span>
                  </div>

                  {/* Channel & Stream Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-black text-xs text-white truncate group-hover:text-red-400 transition-colors">
                        {streamerName}
                      </span>
                      {isHost && hostUsername && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-[0.5px] rounded bg-amber-500/20 border border-amber-500/40 text-[9px] font-black text-amber-300 uppercase tracking-tight shadow-sm">
                          <span>🤝 Host @{hostUsername}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-zinc-300 truncate font-medium">
                      {hostInfo.cleanCaption || live.caption || 'Transmitiendo en tiempo real'}
                    </p>
                  </div>
                </div>

                {/* Right: Informational Platform Badge (NO LINK - RETIENE EN XTREMGEN) */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-[9px] font-black shadow-md border border-white/10 select-none"
                    style={{ backgroundColor: meta.color }}
                    title={`Transmitiendo desde ${meta.name}`}
                  >
                    <meta.Icon className="w-2.5 h-2.5" />
                    <span className="text-[8px]">{meta.badge}</span>
                  </div>

                  <span className="text-[10px] font-bold text-red-400 group-hover:underline flex items-center gap-0.5">
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Ver</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ------------------------------------------------------------- */}
      {/* JUGADORES EN XG                                               */}
      {/* ------------------------------------------------------------- */}
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

      {/* ------------------------------------------------------------- */}
      {/* ACTIVIDAD EN VIVO                                             */}
      {/* ------------------------------------------------------------- */}
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

      {/* ------------------------------------------------------------- */}
      {/* THEATER STREAM PLAYER MODAL (TWITCH-STYLE IN-APP)             */}
      {/* ------------------------------------------------------------- */}
      <LiveStreamPlayerModal
        isOpen={isLivePlayerOpen}
        stream={selectedLiveStream}
        onClose={() => {
          setIsLivePlayerOpen(false);
          setSelectedLiveStream(null);
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* BROADCAST STREAM MODAL                                        */}
      {/* ------------------------------------------------------------- */}
      <LiveStreamModal
        isOpen={isLiveBroadcastOpen}
        onClose={() => setIsLiveBroadcastOpen(false)}
        onStreamStarted={() => {
          loadSidebarData();
        }}
      />
    </div>
  );
};
