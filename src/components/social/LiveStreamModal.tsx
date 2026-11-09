"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Radio,
  Monitor,
  Camera,
  Link as LinkIcon,
  Sparkles,
  StopCircle,
  Eye,
  Send,
  Flame,
  ThumbsUp,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button, Badge } from '../ui/Base';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStreamStarted?: (streamStory: any) => void;
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  isOpen,
  onClose,
  onStreamStarted,
}) => {
  const { user, profile, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  const [streamType, setStreamType] = useState<'screen' | 'camera' | 'external'>('screen');
  const [title, setTitle] = useState('');
  const [gameTag, setGameTag] = useState('Call of Duty: BO7');
  const [externalUrl, setExternalUrl] = useState('');

  const [isLive, setIsLive] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [liveStoryId, setLiveStoryId] = useState<string | null>(null);

  // Local media stream
  const localStreamRef = useRef<MediaStream | null>(null);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);

  // Clean up tracks when closing or unmounting
  const stopLocalMedia = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    return () => {
      stopLocalMedia();
    };
  }, []);

  const handleStartLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!title.trim()) {
      showNotification({
        title: 'Título requerido',
        message: 'Por favor ingresa un título para tu transmisión en vivo.',
        type: 'error',
      });
      return;
    }

    setIsStarting(true);
    let streamUrl = '';

    try {
      if (streamType === 'screen') {
        // Capture Screen / Gameplay
        if (!navigator.mediaDevices?.getDisplayMedia) {
          throw new Error('Tu navegador no soporta captura de pantalla en vivo.');
        }
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }

        // Handle user stopping stream from browser UI
        stream.getVideoTracks()[0].onended = () => {
          handleStopLive();
        };

        streamUrl = `webrtc://local-screen/${user.id}`;
      } else if (streamType === 'camera') {
        // Capture Webcam & Mic
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (videoPreviewRef.current) {
          videoPreviewRef.current.srcObject = stream;
        }
        streamUrl = `webrtc://local-camera/${user.id}`;
      } else {
        // External link (YouTube Live / Twitch)
        if (!externalUrl.trim()) {
          throw new Error('Ingresa un enlace de transmisión de YouTube Live o Twitch.');
        }
        streamUrl = externalUrl.trim();
      }

      // Publish ephemeral live row to social_stories
      // (expires in 2 hours, and deleted immediately when streamer clicks Stop)
      const { data, error } = await supabase
        .from('social_stories')
        .insert({
          user_id: user.id,
          media_url: streamUrl,
          media_type: 'live',
          caption: `🔴 EN VIVO: ${title.trim()} [${gameTag}]`,
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
        title: '🔴 ¡Estás EN VIVO!',
        message: 'Tu transmisión en vivo ya aparece en el carrusel para toda la comunidad.',
        type: 'success',
      });
    } catch (err: any) {
      stopLocalMedia();
      setIsStarting(false);
      showNotification({
        title: 'No se pudo iniciar el VIVO',
        message: err.message || 'Error al acceder al dispositivo de captura.',
        type: 'error',
      });
    }
  };

  const handleStopLive = async () => {
    stopLocalMedia();
    if (liveStoryId) {
      // Ephemeral: delete row immediately so 0 storage is consumed!
      await supabase.from('social_stories').delete().eq('id', liveStoryId);
      setLiveStoryId(null);
    }
    setIsLive(false);
    onClose();
    showNotification({
      title: 'Transmisión finalizada',
      message: 'El directo concluyó con éxito. Ningún archivo fue almacenado.',
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
              {isLive ? '🔴 Transmisión En Vivo Activa' : 'Iniciar VIVO en XtremGen'}
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
              <video
                ref={videoPreviewRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-red-600 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-white block" />
                  EN VIVO
                </span>
                <span className="px-2 py-0.5 rounded-full bg-black/75 text-white text-[11px] font-mono border border-white/15">
                  {gameTag}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10">
              <span className="block text-xs font-bold text-zinc-400">Título del Directo:</span>
              <p className="text-sm font-black text-white mt-0.5">{title}</p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleStopLive}
              className="w-full !bg-red-600 hover:!bg-red-700 !text-white flex items-center justify-center gap-2"
            >
              <StopCircle className="w-4 h-4" />
              Finalizar Transmisión
            </Button>
          </div>
        ) : (
          /* CONFIGURATION SCREEN */
          <form onSubmit={handleStartLive} className="space-y-4">
            {/* Stream Mode Selection Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
              <button
                type="button"
                onClick={() => setStreamType('screen')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  streamType === 'screen'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>Juego / Pantalla</span>
              </button>
              <button
                type="button"
                onClick={() => setStreamType('camera')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  streamType === 'camera'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Camera className="w-4 h-4" />
                <span>Cámara Web</span>
              </button>
              <button
                type="button"
                onClick={() => setStreamType('external')}
                className={`py-2 px-2 rounded-lg text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                  streamType === 'external'
                    ? 'bg-red-600 text-white shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Link En Vivo</span>
              </button>
            </div>

            {/* Title Input */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Título del Directo
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Rankeando en BO7 en vivo 🎯"
                className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
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
                <option value="Just Chatting / Setup">Just Chatting / Setup</option>
              </select>
            </div>

            {/* External URL if selected */}
            {streamType === 'external' && (
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                  Enlace del Directo (YouTube Live / Twitch / Kick)
                </label>
                <input
                  type="url"
                  value={externalUrl}
                  onChange={(e) => setExternalUrl(e.target.value)}
                  placeholder="https://www.youtube.com/live/... o https://twitch.tv/..."
                  className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[11px] text-zinc-300 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>
                <strong>Streaming Efímero:</strong> El directo se transmite en tiempo real a la comunidad y <strong>no consume almacenamiento en disco</strong>. Al finalizar la transmisión, desaparece.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full !bg-red-600 hover:!bg-red-700 !text-white flex items-center justify-center gap-2"
              isLoading={isStarting}
              disabled={isStarting}
            >
              <Radio className="w-4 h-4" />
              Emitir en Directo
            </Button>
          </form>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
};
