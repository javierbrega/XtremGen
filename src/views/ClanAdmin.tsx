"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from '../lib/router';
import { Edit2, Users, Check, X, Crosshair, Play } from 'lucide-react';
import { Button, Card, Badge } from '../components/ui/Base';
import { supabase } from '../lib/supabase/client';
import { useNotification } from '../context/NotificationContext';

export const ClanAdmin = () => {
  const { id } = useParams();
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showNotification } = useNotification();

  const loadApplications = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    const { data } = await supabase
      .from('clan_applications')
      .select('*,profiles(username,avatar_url)')
      .eq('clan_id', id)
      .order('created_at', { ascending: false });
    setApplications(Array.isArray(data) ? data : []);
    setIsLoading(false);
  }, [id]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const handleDecision = async (app: any, status: 'accepted' | 'rejected') => {
    await supabase.from('clan_applications').update({ status }).eq('id', app.id);
    if (status === 'accepted') {
      await supabase.from('clan_members').insert({
        clan_id: app.clan_id,
        user_id: app.user_id,
        role: app.role_applied,
      });
    }
    loadApplications();
    showNotification({
      title: status === 'accepted' ? 'Candidato Aceptado' : 'Candidato Rechazado',
      message: `El estado de la postulación se actualizó en Supabase.`,
      type: status === 'accepted' ? 'success' : 'info',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pb-20 pt-20">
      <div className="bg-primary text-white px-6 py-3 flex justify-between items-center sticky top-16 z-40 shadow-lg">
        <div className="flex items-center gap-2 font-black uppercase tracking-wider text-sm">
          <Edit2 className="w-4 h-4" /> Dashboard de Administración del Clan
        </div>
        <Link to={`/clan/${id || ''}`}>
          <Button variant="outline" className="bg-black/20 border-white/20 text-white text-xs">
            Volver al Perfil del Clan
          </Button>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-12">
        <h2 className="text-3xl font-black mb-8 flex items-center gap-3 uppercase tracking-tight">
          <Users className="text-primary w-8 h-8" /> Postulaciones en The Draft ({applications.length})
        </h2>

        {isLoading ? (
          <div className="h-40 rounded-2xl bg-surface animate-pulse" />
        ) : applications.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-white/10">
            <Users className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">0 Candidatos Pendientes</h3>
            <p className="text-sm text-zinc-400 mt-1">
              Cuando los jugadores envíen su postulación desde &quot;The Draft&quot;, aparecerán aquí en tiempo real.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4">
            {applications.map((app) => (
              <Card key={app.id} className="p-6 flex flex-col md:flex-row items-center gap-6">
                <img
                  src={
                    app.profiles?.avatar_url ||
                    `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${app.user_id}`
                  }
                  alt={app.profiles?.username || 'Applicant'}
                  className="w-14 h-14 rounded-xl object-cover border border-white/10"
                  referrerPolicy="no-referrer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-white">
                      {app.profiles?.username || 'Postulante'}
                    </h3>
                    <Badge variant="primary">{app.status}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-zinc-400">
                    <span>
                      Rol: <strong className="text-white">{app.role_applied}</strong>
                    </span>
                    <span>
                      Rango: <strong className="text-white">{app.rank_current}</strong>
                    </span>
                    <span>
                      K/D: <strong className="text-white">{app.kd_ratio}</strong>
                    </span>
                  </div>
                  {app.message && <p className="text-xs text-zinc-300 mt-2">{app.message}</p>}
                  {app.clip_url && (
                    <a
                      href={app.clip_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                    >
                      <Play className="w-3 h-3" /> Ver Clip Adjunto
                    </a>
                  )}
                </div>

                {app.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDecision(app, 'rejected')}
                      className="border-red-500/40 text-red-400"
                    >
                      <X className="w-4 h-4" /> Rechazar
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDecision(app, 'accepted')}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      <Check className="w-4 h-4" /> Aceptar
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
