"use client";

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from '../lib/router';
import {
  Flame,
  Newspaper,
  Star,
  Share2,
  Shield,
  Users,
  Calendar,
  Bell,
  Search,
  LogOut,
  CheckCircle2,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { Button } from './ui/Base';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  path: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, path }) => (
  <Link
    to={path}
    className={`relative flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap group ${
      isActive ? 'text-primary' : 'text-zinc-400 hover:text-zinc-100'
    }`}
  >
    <span className={`${isActive ? 'text-primary' : 'text-zinc-400 group-hover:text-zinc-100'} transition-colors`}>
      {icon}
    </span>
    <span>{label}</span>
    {isActive && (
      <div className="absolute bottom-[-8px] left-0 right-0 h-[2px] bg-primary shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-in fade-in duration-300" />
    )}
  </Link>
);

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbNotifications, setDbNotifications] = useState<any[]>([]);
  const location = useLocation();
  const { profile, openAuthModal, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!profile?.id) {
      setDbNotifications([]);
      return;
    }
    supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setDbNotifications(data);
      });
  }, [profile?.id, isNotificationsOpen]);

  const leftItems = [
    { id: 'inicio', path: '/', icon: <Flame className="w-4 h-4" />, label: 'Inicio' },
    { id: 'noticias', path: '/noticias', icon: <Newspaper className="w-4 h-4" />, label: 'Noticias' },
    { id: 'reseñas', path: '/reseñas', icon: <Star className="w-4 h-4" />, label: 'Reseñas' },
  ];

  const rightItems = [
    { id: 'social', path: '/social', icon: <Share2 className="w-4 h-4" />, label: 'Social' },
    { id: 'clan', path: '/clan', icon: <Shield className="w-4 h-4" />, label: 'Clan' },
    { id: 'foro', path: '/foro', icon: <Users className="w-4 h-4" />, label: 'Foro' },
    { id: 'eventos', path: '/eventos', icon: <Calendar className="w-4 h-4" />, label: 'Eventos' },
  ];

  const allItems = [...leftItems, ...rightItems];
  const activeTab = allItems.find((item) => item.path === location.pathname)?.id || 'inicio';
  const unreadCount = dbNotifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Top Navbar: 100% Clean & Centered */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0c0c10]/95 backdrop-blur-xl border-b border-white/10 py-2.5 shadow-2xl'
            : 'bg-[#121212]/90 backdrop-blur-md border-b border-white/5 py-3.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-center">
          <div className="flex items-center justify-center gap-1 sm:gap-3 md:gap-5 overflow-x-auto no-scrollbar">
            {leftItems.map((item) => (
              <NavItem
                key={item.id}
                path={item.path}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
              />
            ))}

            {/* Centered XG Emblem */}
            <Link to="/" className="flex-shrink-0 mx-2 sm:mx-4 cursor-pointer group">
              <div className="bg-gradient-to-br from-primary to-red-700 px-4 py-1.5 rounded-xl shadow-[0_0_20px_rgba(239,68,68,0.45)] group-hover:shadow-[0_0_30px_rgba(239,68,68,0.75)] transition-all group-hover:scale-105 border border-white/15">
                <span className="text-xl font-black text-white tracking-tighter">XG</span>
              </div>
            </Link>

            {rightItems.map((item) => (
              <NavItem
                key={item.id}
                path={item.path}
                icon={item.icon}
                label={item.label}
                isActive={activeTab === item.id}
              />
            ))}
          </div>
        </div>
      </nav>

      {/* Bottom-Left Floating Gaming Capsule (Discord / HUD Style) */}
      <div className="fixed bottom-5 left-5 z-50 flex flex-col items-start">
        {/* Popover: Search Bar (opens upwards above the capsule) */}
        {isSearchOpen && (
          <div className="mb-3 w-72 sm:w-80 bg-[#0e0e14]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.85)] p-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center bg-black/60 border border-white/10 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-primary mr-2.5 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar juegos, clanes, posts..."
                className="bg-transparent text-xs text-white placeholder:text-zinc-500 focus:outline-none w-full"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="text-zinc-500 hover:text-white ml-2"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Popover: Notifications (opens upwards above the capsule) */}
        {isNotificationsOpen && (
          <div className="mb-3 w-80 bg-[#0e0e14]/95 backdrop-blur-xl border border-white/15 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.85)] p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-white">
                Notificaciones ({dbNotifications.length})
              </span>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {dbNotifications.length === 0 ? (
              <div className="py-6 text-center text-zinc-500 text-xs">
                <CheckCircle2 className="w-7 h-7 mx-auto mb-2 text-zinc-700" />
                No tienes notificaciones pendientes.
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {dbNotifications.map((n) => (
                  <div key={n.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                    <div className="font-bold text-white">{n.title}</div>
                    <div className="text-zinc-400 mt-0.5">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Main Floating Capsule Dock */}
        <div className="flex items-center gap-1.5 bg-[#0c0c12]/95 backdrop-blur-xl border border-white/15 rounded-2xl p-1.5 pr-2.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] hover:border-white/25 transition-all">
          {profile ? (
            <Link
              to="/profile"
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-xl hover:bg-white/5 transition-all group"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-8 h-8 rounded-full object-cover border border-primary/60 group-hover:border-primary transition-colors"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#D4FE00] rounded-full ring-2 ring-[#0c0c12]" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-extrabold text-white max-w-[120px] truncate group-hover:text-primary transition-colors">
                  {profile.username}
                </span>
                <span className="text-[10px] font-semibold text-zinc-400">En línea</span>
              </div>
            </Link>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={openAuthModal}
              className="px-3.5 py-2 text-xs font-black uppercase tracking-wider rounded-xl shadow-[0_0_15px_rgba(239,68,68,0.35)]"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Conectar
            </Button>
          )}

          <div className="h-6 w-[1px] bg-white/10 mx-0.5" />

          {/* Search Toggle */}
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsNotificationsOpen(false);
            }}
            className={`p-2 rounded-xl transition-colors ${
              isSearchOpen
                ? 'bg-primary/20 text-primary'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Buscar"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications Toggle */}
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              setIsSearchOpen(false);
            }}
            className={`p-2 rounded-xl transition-colors relative ${
              isNotificationsOpen
                ? 'bg-primary/20 text-primary'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
            title="Notificaciones"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full animate-ping" />
            )}
          </button>

          {/* Logout Button */}
          {profile && (
            <button
              onClick={logout}
              className="p-2 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
