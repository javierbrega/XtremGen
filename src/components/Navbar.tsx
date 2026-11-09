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
  Menu,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase/client';
import { Button } from './ui/Base';
import { CATEGORIES } from './CategoryBar';
import { useFilter } from '../context/FilterContext';

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

  const { activeFilter, setActiveFilter } = useFilter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer on route navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.location.hash.includes('menu=true') || window.location.search.includes('menu=true'))) {
      setIsMobileMenuOpen(true);
      return;
    }
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Lock background scroll when drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Top Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0c0c10]/95 backdrop-blur-xl border-b border-white/10 py-2.5 shadow-2xl'
            : 'bg-[#121212]/90 backdrop-blur-md border-b border-white/5 py-3'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8">
          {/* DESKTOP (md:flex): Clean & Centered Tab Bar */}
          <div className="hidden md:flex items-center justify-center gap-1 sm:gap-3 md:gap-5 overflow-x-auto no-scrollbar">
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

          {/* MOBILE (< md): Brand Logo + Active Route Pill + Hamburger Toggle Button */}
          <div className="flex md:hidden items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-primary to-red-700 px-2.5 py-1 rounded-lg shadow-md border border-white/15">
                <span className="text-base font-black text-white tracking-tighter">XG</span>
              </div>
              <span className="text-base font-black tracking-tight text-white">
                XTREME<span className="text-primary">GEN</span>
              </span>
            </Link>

            {/* Active Route Pill Indicator */}
            <div className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 flex items-center gap-1.5 capitalize">
              <span className="text-primary">{allItems.find((item) => item.id === activeTab)?.icon}</span>
              <span>{allItems.find((item) => item.id === activeTab)?.label}</span>
            </div>

            {/* Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 transition-all active:scale-95 shadow-md flex items-center justify-center"
              aria-label="Abrir menú de navegación"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Hamburger Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[999] animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-[#0e0e14] border-l border-white/15 p-5 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar z-10 animate-in slide-in-from-right duration-300">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="bg-primary px-2.5 py-1 rounded-lg">
                    <span className="text-base font-black text-white">XG</span>
                  </div>
                  <div>
                    <span className="text-sm font-black text-white tracking-tight">
                      XTREME<span className="text-primary">GEN</span>
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-mono">Menú Móvil</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SECTION 1: Navegación Principal (Tab Bar) */}
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2.5">
                  Secciones de la Plataforma
                </span>
                <div className="grid grid-cols-1 gap-1.5">
                  {allItems.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isActive
                            ? 'bg-primary/20 text-white border border-primary/40 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                            : 'bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={isActive ? 'text-primary' : 'text-zinc-400'}>{item.icon}</span>
                          <span>{item.label}</span>
                        </div>
                        {isActive && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: Plataformas & Categorías (Imagen 1) */}
              <div>
                <span className="block text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2.5">
                  Filtrar por Plataforma / Categoría
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isActive = activeFilter === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveFilter(cat.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-black uppercase tracking-tight transition-all border ${
                          isActive
                            ? cat.activeColor
                            : `bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10 ${cat.color}`
                        }`}
                      >
                        <span className={isActive ? 'text-inherit' : 'text-zinc-500'}>
                          {cat.icon}
                        </span>
                        <span className="truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* SECTION 3: Perfil / Cuenta / Conexión */}
            <div className="pt-4 border-t border-white/10 mt-6">
              {profile ? (
                <div className="space-y-3">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-10 h-10 rounded-full object-cover border border-primary/60"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block font-black text-sm text-white truncate">
                        {profile.username}
                      </span>
                      <span className="block text-[10px] text-emerald-400 font-mono">
                        ● Conectado
                      </span>
                    </div>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full py-2 px-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Cerrar Sesión
                  </button>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    openAuthModal();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]"
                >
                  <Sparkles className="w-4 h-4" />
                  Conectar con XtremGen
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

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
