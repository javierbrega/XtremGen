"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Radio,
  Sparkles,
  StopCircle,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../ui/Base';
import {
  StreamPlatform,
  detectStreamPlatform,
  parseStreamInfo,
  getPlatformMeta,
  YouTubeIcon,
  TwitchIcon,
  KickIcon,
  TikTokIcon,
  InstagramIcon,
} from '../../lib/stream-helpers';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamStarted?: (streamStory: any) => void;
}

const PLATFORMS: { id: StreamPlatform; label: string; icon: React.FC<{ className?: string }>; color: string }[] = [
  { id: 'youtube', label: 'YouTube', icon: YouTubeIcon, color: '#FF0000' },
  { id: 'twitch', label: 'Twitch', icon: TwitchIcon, color: '#9146FF' },
  { id: 'kick', label: 'Kick', icon: KickIcon, color: '#53FC18' },
  { id: 'tiktok', label: 'TikTok', icon: TikTokIcon, color: '#00F2FE' },
  { id: 'instagram', label: 'Instagram', icon: InstagramIcon, color: '#E1306C' },
];

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  isOpen,
  onClose,
  onStreamStarted,
}) => {
  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [platform, setPlatform] = useState<StreamPlatform>('youtube');
  const [streamUrl, setStreamUrl] = useState('');
  const [title, setTitle] = useState('');
  const [gameTag, setGameTag] = useState('Call of Duty: BO7');

  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [liveStoryId, setLiveStoryId] = useState<string | null>(null);

  // Auto-detect platform when pasting URL
  const handleUrlChange = (value: string) => {
    setStreamUrl(value);
    const detected = detectStreamPlatform(value);
    if (detected !== 'unknown' && detected !== platform) {
      setPlatform(detected);
    }
  };

  const currentMeta = getPlatformMeta(platform);
  const parsedStream = parseStreamInfo(streamUrl);

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!streamUrl.trim()) {
      showNotification({
        title: 'Enlace requerido',
        message: `Por favor ingresa tu enlace o usuario de ${currentMeta.name}.`,
        type: 'error',
      });
      return;
    }

    if (!title.trim()) {
      showNotification({
        title: 'Título requerido',
        message: 'Por favor ingresa un título para tu directo en XtremGen.',
        type: 'error',
      });
      return;
    }

    setIsStarting(true);

    try {
      const finalUrl = parsedStream.originalUrl || streamUrl.trim();
      const captionText = `🔴 [${currentMeta.badge}] ${title.trim()} [${gameTag}]`;

      // Publish live story to social_stories
      const { data, error } = await supabase
        .from('social_stories')
        .insert({
          user_id: user.id,
          media_url: finalUrl,
          media_type: 'live',
          caption: captionText,
        })
        .select()
        .single();

      if (error) throw error;

      setLiveStoryId(data?.id || null);
      setIsLive(true);
      setIsStarting(false);

      if (onStreamStarted) {
        onStreamStarted(data);
      }

      showNotification({
        title: `🔴 ¡EN VIVO con ${currentMeta.name}!`,
        message: 'Tu directo ya aparece en el carrusel para toda la comunidad.',
        type: 'success',
      });
    } catch (err: any) {
      setIsStarting(false);
      showNotification({
        title: 'No se pudo iniciar la re-transmisión',
        message: err.message || 'Error al conectar con la base de datos.',
        type: 'error',
      });
    }
  };

  const handleStopLive = async () => {
    if (liveStoryId) {
      await supabase.from('social_stories').delete().eq('id', liveStoryId);
      setLiveStoryId(null);
    }
    setIsLive(false);
    onClose();
    showNotification({
      title: 'Transmisión finalizada',
      message: 'El directo concluyó con éxito. Tu historia en vivo ha finalizado.',
      type: 'info',
    });
  };

  if (!isOpen) return null;

  const content = (
    <div
      onClick={isLive ? undefined : onClose}
      className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-lg w-full bg-[#111116] border border-white/15 rounded-3xl overflow-hidden shadow-2xl p-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            <h3 className="font-black text-lg text-white uppercase tracking-tight">
              {isLive ? '🔴 Transmisión En Vivo Activa' : 'Re-transmitir VIVO'}
            </h3>
          </div>
          {!isLive && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {isLive ? (
          /* ON AIR SCREEN */
          <div className="space-y-4">
            <div className="relative w-full h-64 rounded-2xl bg-black border border-red-500/40 overflow-hidden flex items-center justify-center shadow-lg">
              {parsedStream.canEmbed && parsedStream.embedUrl ? (
                <iframe
                  src={parsedStream.embedUrl}
                  title="Live Stream Preview"
                  className="w-full h-full object-cover"
                  allow="autoplay; encrypted-media; fullscreen"
                />
              ) : (
                <div className="text-center p-6 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                    <currentMeta.Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5 shadow-lg animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-white block" />
                      EN VIVO EN {currentMeta.name.toUpperCase()}
                    </span>
                    <p className="text-xs text-zinc-400 mt-2 truncate max-w-xs mx-auto">
                      {streamUrl}
                    </p>
                  </div>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded-full bg-black/85 text-white text-[11px] font-mono border border-white/20 flex items-center gap-1.5">
                  <currentMeta.Icon className="w-3.5 h-3.5" />
                  {currentMeta.badge}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/75 text-zinc-300 text-[11px] font-mono border border-white/15">
                  {gameTag}
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">
                Directo en curso:
              </span>
              <p className="text-sm font-black text-white">{title}</p>
              <a
                href={parsedStream.originalUrl || streamUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 font-bold pt-1"
              >
                Abrir stream original <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleStopLive}
              className="w-full !bg-red-600 hover:!bg-red-700 !text-white flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
              <StopCircle className="w-4 h-4" />
              Finalizar Re-transmisión
            </Button>
          </div>
        ) : (
          /* CONFIGURATION SCREEN */
          <form onSubmit={handleStartLive} className="space-y-4">
            {/* Platform Selector Grid */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Selecciona la Plataforma
              </label>
              <div className="grid grid-cols-5 gap-1.5 p-1 rounded-2xl bg-black/60 border border-white/10">
                {PLATFORMS.map((p) => {
                  const Icon = p.icon;
                  const isSelected = platform === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPlatform(p.id)}
                      className={`py-2 px-1 rounded-xl text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        isSelected
                          ? 'bg-white/15 text-white shadow-md border border-white/20'
                          : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform"
                        style={{
                          backgroundColor: isSelected ? p.color : 'rgba(255,255,255,0.05)',
                          color: '#FFFFFF',
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                      <span className="text-[10px] font-mono tracking-tight">{p.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stream URL Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <currentMeta.Icon className="w-3.5 h-3.5" />
                  <span>Enlace o Usuario ({currentMeta.name})</span>
                </label>
                {parsedStream.platform === platform && parsedStream.channelOrId && (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Detectado
                  </span>
                )}
              </div>
              <input
                type="text"
                value={streamUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={currentMeta.placeholder}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 placeholder:text-zinc-600 font-mono"
              />
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Título del Directo en XtremGen
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Rankeando en BO7 en vivo 🎯 / Clutch Time"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 placeholder:text-zinc-600"
              />
            </div>

            {/* Game Tag Dropdown */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Categoría / Juego
              </label>
              <select
                value={gameTag}
                onChange={(e) => setGameTag(e.target.value)}
                className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              >
                <option value="Call of Duty: BO7">Call of Duty: BO7</option>
                <option value="Valorant">Valorant</option>
                <option value="Counter-Strike 2">Counter-Strike 2</option>
                <option value="Fortnite">Fortnite</option>
                <option value="League of Legends">League of Legends</option>
                <option value="Just Chatting / Setup">Just Chatting / Setup</option>
                <option value="Drops & Streetwear">Drops & Streetwear XG</option>
              </select>
            </div>

            {/* Info notice */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-zinc-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Multi-Streaming Comunitario:</strong> Tu directo de {currentMeta.name} se re-transmite en tiempo real para todos los usuarios de XtremGen con reproductor integrado. Cero costo de almacenamiento.
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full !bg-red-600 hover:!bg-red-700 !text-white flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 font-black tracking-wide"
              isLoading={isStarting}
              disabled={isStarting}
            >
              <Radio className="w-4 h-4" />
              Iniciar Re-transmisión En Vivo
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
