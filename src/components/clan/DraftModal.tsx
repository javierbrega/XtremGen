"use client";

import React, { useState } from 'react';
import { X, Link as LinkIcon, Crosshair, Video, Loader2 } from 'lucide-react';
import { Button } from '../ui/Base';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface DraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  clanName: string;
  clanId?: string;
}

export const DraftModal: React.FC<DraftModalProps> = ({ isOpen, onClose, clanName, clanId }) => {
  const [roleApplied, setRoleApplied] = useState('Entry Fragger');
  const [rankCurrent, setRankCurrent] = useState('Immortal');
  const [kdRatio, setKdRatio] = useState('1.45');
  const [clipUrl, setClipUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { user, openAuthModal } = useAuth();
  const { showNotification } = useNotification();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    setIsLoading(true);
    if (clanId) {
      await supabase.from('clan_applications').insert({
        clan_id: clanId,
        user_id: user.id,
        role_applied: roleApplied,
        rank_current: rankCurrent,
        kd_ratio: kdRatio,
        clip_url: clipUrl.trim() || null,
        message: message.trim() || 'Postulación enviada desde The Draft.',
        status: 'pending',
      });
    }

    setIsLoading(false);
    setIsSubmitted(true);
    showNotification({
      title: '¡Postulación Registrada!',
      message: `Tu solicitud para ${clanName} fue guardada en Supabase.`,
      type: 'success',
    });
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="bg-[#0a0a0a] border border-primary/30 rounded-2xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.15)]">
        <div className="relative p-6 border-b border-gray-800/50 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-50" />
          <div className="relative flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">The Draft</h2>
              <p className="text-sm text-zinc-400">
                Postulación oficial para <span className="text-primary font-bold">{clanName}</span>
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-500 hover:text-white transition-colors bg-black/50 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4">
                <Crosshair className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">¡Postulación Enviada a Supabase!</h3>
              <p className="text-zinc-400 text-sm">
                El líder del clan revisará tus stats en su Dashboard de Administración.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Rol Deseado
                  </label>
                  <select
                    value={roleApplied}
                    onChange={(e) => setRoleApplied(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Entry Fragger">Entry Fragger</option>
                    <option value="Sniper / AWP">Sniper / AWP</option>
                    <option value="IGL (Líder)">IGL (Líder)</option>
                    <option value="Support">Support</option>
                    <option value="Lurker">Lurker</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Rango Actual
                  </label>
                  <select
                    value={rankCurrent}
                    onChange={(e) => setRankCurrent(e.target.value)}
                    className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  >
                    <option value="Radiante / Global Elite">Radiante / Global Elite</option>
                    <option value="Inmortal / Supreme">Inmortal / Supreme</option>
                    <option value="Diamante / LEM">Diamante / LEM</option>
                    <option value="Platino / DMG">Platino / DMG</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    K/D Ratio
                  </label>
                  <input
                    type="text"
                    required
                    value={kdRatio}
                    onChange={(e) => setKdRatio(e.target.value)}
                    placeholder="Ej: 1.45"
                    className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <Video className="w-3.5 h-3.5" /> Clip URL
                  </label>
                  <input
                    type="url"
                    value={clipUrl}
                    onChange={(e) => setClipUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <LinkIcon className="w-3.5 h-3.5" /> Mensaje / Presentación
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Cuéntale al líder tu experiencia en torneos y disponibilidad horaria..."
                  className="w-full bg-[#111] border border-gray-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-800/50 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" disabled={isLoading} className="min-w-[160px]">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Enviar Postulación'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
