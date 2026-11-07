"use client";

import React from 'react';
import { Home, Compass, Bell, Shield, User } from 'lucide-react';
import { motion } from '../../lib/motion';
import { Link } from '../../lib/router';
import { useAuth } from '../../contexts/AuthContext';

const NAV_ITEMS = [
  { icon: Home, label: 'Inicio', path: '/' },
  { icon: Compass, label: 'Social', path: '/social', active: true },
  { icon: Shield, label: 'Clanes', path: '/clan' },
  { icon: Bell, label: 'Foro', path: '/foro' },
];

export const SocialSidebar = () => {
  const { profile, openAuthModal } = useAuth();

  return (
    <div className="absolute top-0 left-0 h-full w-[80px] hover:w-[240px] group transition-all duration-300 ease-in-out bg-[#0a0a0a] border-r border-gray-800/50 flex flex-col justify-between py-6 overflow-hidden z-[100] shadow-[4px_0_24px_rgba(0,0,0,0.6)]">
      <div className="space-y-8">
        <Link
          to="/"
          className="flex items-center justify-center group-hover:justify-start group-hover:px-6 transition-all duration-300"
        >
          <div className="bg-primary px-2.5 py-1 rounded-lg">
            <span className="text-xl font-black text-white tracking-tighter">XG</span>
          </div>
        </Link>

        <nav className="space-y-2 px-3">
          {NAV_ITEMS.map((item) => (
            <Link key={item.label} to={item.path}>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className={`flex items-center gap-4 w-full p-3 rounded-xl transition-colors ${
                  item.active ? 'font-bold text-white bg-white/5' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="relative flex-shrink-0">
                  <item.icon className={`w-6 h-6 ${item.active ? 'text-primary' : ''}`} />
                </div>
                <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 text-sm font-bold">
                  {item.label}
                </span>
              </motion.div>
            </Link>
          ))}
        </nav>
      </div>

      <div className="px-3">
        {profile ? (
          <Link to="/profile">
            <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors w-full overflow-hidden">
              <div className="relative flex-shrink-0">
                <img
                  src={profile.avatar_url}
                  alt={profile.username}
                  className="w-10 h-10 rounded-full ring-2 ring-primary p-[2px] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-[#0a0a0a] rounded-full" />
              </div>
              <div className="opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-300 text-left flex-1 truncate">
                <div className="font-bold text-sm text-white leading-tight truncate">{profile.username}</div>
                <div className="text-xs text-primary font-bold">{profile.role}</div>
              </div>
            </div>
          </Link>
        ) : (
          <button
            onClick={openAuthModal}
            className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary w-full overflow-hidden transition-colors"
          >
            <User className="w-6 h-6 flex-shrink-0" />
            <span className="opacity-0 group-hover:opacity-100 whitespace-nowrap text-xs font-black uppercase">
              Conectarse
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
