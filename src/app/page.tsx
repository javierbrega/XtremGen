"use client";

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from '../lib/router';
import { NotificationProvider } from '../context/NotificationContext';
import { FilterProvider } from '../context/FilterContext';
import { Navbar } from '../components/Navbar';
import { CategoryBar } from '../components/CategoryBar';
import { Hero } from '../components/Hero';
import { TrendingGames } from '../components/TrendingGames';
import { ForumFeed } from '../components/ForumFeed';
import { NewsPage } from '../views/News';
import { VideosPage } from '../views/Videos';
import { ReviewsPage } from '../views/Reviews';
import { ForumPage } from '../views/Forum';
import { EventsPage } from '../views/Events';
import { SocialPage } from '../views/SocialPage';
import { BlogPage, AboutPage } from '../views/MiscPages';
import { ClanPage } from '../views/ClanPage';
import { ClanProfile } from '../views/ClanProfile';
import { ClanAdmin } from '../views/ClanAdmin';
import { ProHQ } from '../views/ProHQ';
import { UserProfile } from '../views/UserProfile';
import { AuthProvider } from '../contexts/AuthContext';
import { AuthModal } from '../components/auth/AuthModal';
import { Github, Twitter, Youtube, MessageSquare } from 'lucide-react';

const HomePage = () => (
  <>
    <Hero />
    <TrendingGames />
    <ForumFeed />
  </>
);

const Footer = () => (
  <footer className="border-t border-border py-20 bg-surface/30">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <div className="bg-primary px-3 py-1 rounded-lg">
              <span className="text-xl font-black text-white tracking-tighter">XG</span>
            </div>
            <span className="text-xl font-black tracking-tighter text-white">XTREME<span className="text-primary">GEN</span></span>
          </div>
          <p className="text-zinc-400 max-w-sm leading-relaxed mb-8">
            La plataforma líder para la comunidad gamer de alto rendimiento. 
            Hardware, software y competencia en un solo ecosistema digital.
          </p>
          <div className="flex items-center gap-4">
            <SocialIcon icon={<Twitter className="w-5 h-5" />} />
            <SocialIcon icon={<Youtube className="w-5 h-5" />} />
            <SocialIcon icon={<Github className="w-5 h-5" />} />
            <SocialIcon icon={<MessageSquare className="w-5 h-5" />} />
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Plataforma</h4>
          <ul className="space-y-4">
            <FooterLink label="Noticias" to="/noticias" />
            <FooterLink label="Reseñas" to="/reseñas" />
            <FooterLink label="E-sports & Clanes" to="/clan" />
            <FooterLink label="Foros" to="/foro" />
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest">Compañía</h4>
          <ul className="space-y-4">
            <FooterLink label="Sobre Nosotros" to="/acerca" />
            <FooterLink label="Blog Editorial" to="/blog" />
            <FooterLink label="Videos" to="/videos" />
            <FooterLink label="Eventos" to="/eventos" />
          </ul>
        </div>
      </div>

      <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-500 font-medium">
        <p>© 2026 XtremeGen. Desarrollado sobre AsIstia Framework.</p>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary transition-colors">Status</a>
          <a href="#" className="hover:text-primary transition-colors">Soporte</a>
          <a href="#" className="hover:text-primary transition-colors">API</a>
        </div>
      </div>
    </div>
  </footer>
);

const FooterLink = ({ label, to }: { label: string; to: string }) => (
  <li>
    <Link to={to} className="text-sm text-zinc-500 hover:text-primary transition-colors">{label}</Link>
  </li>
);

const SocialIcon = ({ icon }: { icon: React.ReactNode }) => (
  <a href="#" className="w-10 h-10 rounded-lg glass flex items-center justify-center text-zinc-400 hover:text-primary hover:border-primary/50 transition-all">
    {icon}
  </a>
);

export default function XtremGenHubPage() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <FilterProvider>
          <Router>
            <div className="min-h-screen bg-background selection:bg-primary/30 selection:text-white">
              <Navbar />
              <CategoryBar />
              <main>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/noticias" element={<NewsPage />} />
                  <Route path="/videos" element={<VideosPage />} />
                  <Route path="/reseñas" element={<ReviewsPage />} />
                  <Route path="/social" element={<SocialPage />} />
                  <Route path="/clan" element={<ClanPage />} />
                  <Route path="/clan/:id" element={<ClanProfile />} />
                  <Route path="/clan/:id/dashboard" element={<ClanAdmin />} />
                  <Route path="/pro/:id" element={<ProHQ />} />
                  <Route path="/profile" element={<UserProfile />} />
                  <Route path="/foro" element={<ForumPage />} />
                  <Route path="/eventos" element={<EventsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/acerca" element={<AboutPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <AuthModal />
          </Router>
        </FilterProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
