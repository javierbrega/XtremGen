"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationStatus } from '../components/clan/ApplicationStatus';
import { Shield, Crosshair, Settings, LogOut, Save, Sparkles } from 'lucide-react';
import { Button, Badge, Card } from '../components/ui/Base';
import { supabase } from '../lib/supabase/client';
import { useNotification } from '../context/NotificationContext';
import { Link } from '../lib/router';

export const UserProfile = () => {
  const { profile, logout, openAuthModal, updateProfile } = useAuth();
  const { showNotification } = useNotification();

  const [applications, setApplications] = useState<any[]>([]);
  const [myClan, setMyClan] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newBio, setNewBio] = useState('');

  useEffect(() => {
    if (!profile?.id) return;
    setNewUsername(profile.username);
    setNewBio(profile.bio || '');

    supabase
      .from('clan_applications')
      .select('*,clans(name,logo_url)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (Array.isArray(data)) setApplications(data);
      });

    if (profile.clan_id) {
      supabase
        .from('clans')
        .select('*')
        .eq('id', profile.clan_id)
        .single()
        .then(({ data }) => {
          if (data) setMyClan(data);
        });
    } else {
      setMyClan(null);
    }
  }, [profile]);

  if (!profile) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4 text-zinc-400 px-4 text-center">
        <Sparkles className="w-12 h-12 text-primary" />
        <h2 className="text-2xl font-black text-white">Conectate a XtremGen</h2>
        <p className="text-sm max-w-md">
          Iniciá sesión con Google o con tu cuenta XG para gestionar tu perfil competitivo, tus postulaciones en The Draft y tu Clan.
        </p>
        <Button variant="primary" onClick={openAuthModal}>
          Iniciar Sesión / Registrarse
        </Button>
      </div>
    );
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile({
      username: newUsername.trim() || profile.username,
      bio: newBio.trim(),
    });
    setIsEditing(false);
    showNotification({
      title: '¡Perfil Actualizado!',
      message: 'Tus cambios se guardaron en la tabla public.profiles de Supabase.',
      type: 'success',
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="bg-[#111] border border-gray-800/50 rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 mb-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/15 to-transparent" />

          <div className="relative">
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-32 h-32 rounded-2xl border-2 border-primary/50 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              <h1 className="text-4xl font-black tracking-tight">{profile.username}</h1>
              <Badge variant="primary" className="self-center md:self-auto">
                {profile.role}
              </Badge>
            </div>
            <p className="text-zinc-400 font-medium mb-6">
              {profile.bio || 'Jugador competitivo registrado en Supabase.'}
            </p>

            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
                className="border-gray-700 hover:bg-white/5"
              >
                <Settings className="w-4 h-4 mr-2" /> {isEditing ? 'Cancelar Edición' : 'Editar Perfil'}
              </Button>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-500 hover:bg-red-500/10"
                onClick={logout}
              >
                <LogOut className="w-4 h-4 mr-2" /> Cerrar Sesión
              </Button>
            </div>

            {isEditing && (
              <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/10 space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Gamertag</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Biografía Competitiva</label>
                  <input
                    type="text"
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    placeholder="Ej: Entry Fragger | Radiant | Buscando equipo"
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
                  />
                </div>
                <Button type="submit" variant="primary" size="sm">
                  <Save className="w-4 h-4" /> Guardar en Supabase
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-black mb-6 flex items-center gap-2 uppercase tracking-tight">
                <Crosshair className="text-primary w-6 h-6" /> Mis Postulaciones ({applications.length})
              </h2>
              {applications.length === 0 ? (
                <Card className="p-8 text-center border-dashed border-white/10">
                  <p className="text-sm text-zinc-400">
                    No tienes postulaciones activas en The Draft (0 solicitudes).
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <ApplicationStatus
                      key={app.id}
                      clanName={app.clans?.name || 'Clan XG'}
                      clanLogo={
                        app.clans?.logo_url ||
                        `https://api.dicebear.com/9.x/identicon/svg?seed=${app.clan_id}`
                      }
                      roleApplied={app.role_applied}
                      status={
                        app.status === 'accepted'
                          ? 'accepted'
                          : app.status === 'rejected'
                          ? 'rejected'
                          : 'reviewing'
                      }
                      dateApplied={new Date(app.created_at).toLocaleDateString()}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-black mb-4 flex items-center gap-2 uppercase tracking-tight">
                <Shield className="text-primary w-5 h-5" /> Mi Clan
              </h2>
              {myClan ? (
                <div className="bg-[#111] border border-gray-800/50 rounded-xl p-6 text-center">
                  <img
                    src={myClan.logo_url}
                    alt={myClan.name}
                    className="w-16 h-16 mx-auto rounded-xl object-cover mb-3 border border-primary/40"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="font-black text-lg">{myClan.name}</h3>
                  <span className="text-xs text-primary font-bold">[{myClan.tag}]</span>
                  <Link to={`/clan/${myClan.id}`} className="block mt-4">
                    <Button variant="primary" size="sm" className="w-full">
                      Ver Mi Clan
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="bg-[#111] border border-gray-800/50 rounded-xl p-6 text-center">
                  <Shield className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-sm text-zinc-400 mb-4">Aún no perteneces a ningún clan.</p>
                  <Link to="/clan">
                    <Button variant="primary" className="w-full">
                      Explorar o Crear Clan
                    </Button>
                  </Link>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};
