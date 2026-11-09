"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ApplicationStatus } from '../components/clan/ApplicationStatus';
import { Shield, Crosshair, Settings, LogOut, Save, Sparkles, Image as ImageIcon, Grid, X, ExternalLink } from 'lucide-react';
import { Button, Badge, Card } from '../components/ui/Base';
import { supabase } from '../lib/supabase/client';
import { useNotification } from '../context/NotificationContext';
import { Link } from '../lib/router';

export const UserProfile = () => {
  const { profile, logout, openAuthModal, updateProfile } = useAuth();
  const { showNotification } = useNotification();

  const [applications, setApplications] = useState<any[]>([]);
  const [userMedia, setUserMedia] = useState<any[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'media' | 'applications'>('media');
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

    // Fetch user's uploaded social photos and clips
    supabase
      .from('social_posts')
      .select('id,content,media_url,created_at,game_tag')
      .eq('author_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setUserMedia(data.filter((item: any) => Boolean(item.media_url)));
        }
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
          <div className="md:col-span-2 space-y-6">
            {/* Tabs Bar */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setActiveTab('media')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'media'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>Multimedia ({userMedia.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('applications')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                  activeTab === 'applications'
                    ? 'bg-primary text-white shadow-lg shadow-primary/25'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Crosshair className="w-4 h-4" />
                <span>Mis Postulaciones ({applications.length})</span>
              </button>
            </div>

            {/* Multimedia Gallery Tab */}
            {activeTab === 'media' && (
              <section>
                {userMedia.length === 0 ? (
                  <Card className="p-10 text-center border-dashed border-white/10 bg-[#121218]/60">
                    <ImageIcon className="w-12 h-12 text-primary/60 mx-auto mb-3" />
                    <h3 className="text-lg font-black text-white">Galería Vacía</h3>
                    <p className="text-xs text-zinc-400 mt-1 mb-6 max-w-sm mx-auto">
                      Aún no has compartido fotos, jugadas o clips en la sección Social.
                    </p>
                    <Link to="/social">
                      <Button variant="primary" size="sm">
                        Publicar en Social
                      </Button>
                    </Link>
                  </Card>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {userMedia.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedMedia(item)}
                        className="relative aspect-square rounded-xl overflow-hidden bg-zinc-900 border border-white/10 group cursor-pointer shadow-md"
                      >
                        <img
                          src={item.media_url}
                          alt={item.content || 'User media'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                          <Badge variant="primary" className="self-start text-[9px]">
                            {item.game_tag || 'Gaming'}
                          </Badge>
                          <div>
                            <p className="text-xs text-white line-clamp-2 font-medium mb-1">
                              {item.content || 'Sin descripción'}
                            </p>
                            <span className="text-[10px] font-mono text-zinc-400">
                              {new Date(item.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Postulaciones Tab */}
            {activeTab === 'applications' && (
              <section>
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
            )}
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

      {/* Lightbox Modal for Selected Profile Media */}
      {selectedMedia && (
        <div
          onClick={() => setSelectedMedia(null)}
          className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-3xl w-full bg-[#111116] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-3.5 border-b border-white/10 bg-black/40">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{profile.username}</span>
                {selectedMedia.game_tag && (
                  <Badge variant="primary" className="text-[10px]">{selectedMedia.game_tag}</Badge>
                )}
                <span className="text-xs text-zinc-500">
                  {new Date(selectedMedia.created_at).toLocaleDateString()}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMedia(null)}
                className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                title="Cerrar visor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 flex items-center justify-center bg-black/95 overflow-hidden p-3 min-h-[300px]">
              <img
                src={selectedMedia.media_url}
                alt={selectedMedia.content || 'User media'}
                className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>
            {selectedMedia.content && (
              <div className="p-4 border-t border-white/10 bg-black/60 text-sm text-zinc-200 flex justify-between items-center gap-4">
                <p className="flex-1">{selectedMedia.content}</p>
                <Link to="/social">
                  <Button variant="outline" size="sm" className="shrink-0 text-xs">
                    <ExternalLink className="w-3.5 h-3.5 mr-1" /> Ver en Social
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
