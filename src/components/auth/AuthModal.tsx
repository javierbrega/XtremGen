"use client";

import React, { useState } from 'react';
import { X, Mail, Lock, User, Gamepad2, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '../ui/Base';

export const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, loginWithGoogle, loginWithDiscord, loginWithEmail, registerWithEmail } =
    useAuth();
  const { showNotification } = useNotification();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [mainGame, setMainGame] = useState('Valorant');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    const { error } = await loginWithGoogle(email || 'javierbrega@gmail.com', username || 'JaviXG');
    setIsSubmitting(false);
    if (error) {
      showNotification({
        title: 'Error con Google Auth',
        message: error.message || 'No se pudo autenticar con Google en Supabase.',
        type: 'error',
      });
    } else {
      showNotification({
        title: '¡Conectado con Google!',
        message: 'Tu sesión y perfil de Google ya están activos en Supabase.',
        type: 'success',
      });
    }
  };

  const handleDiscordSignIn = async () => {
    setIsSubmitting(true);
    const { error } = await loginWithDiscord(username || 'javib31');
    setIsSubmitting(false);
    if (error) {
      showNotification({
        title: 'Error con Discord Auth',
        message: error.message || 'No se pudo autenticar con Discord en Supabase.',
        type: 'error',
      });
    } else {
      showNotification({
        title: '¡Conectado con Discord!',
        message: 'Tu cuenta de Discord (@javib31) ya está sincronizada en Supabase.',
        type: 'success',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showNotification({
        title: 'Campos incompletos',
        message: 'Ingresa tu correo y contraseña.',
        type: 'error',
      });
      return;
    }

    setIsSubmitting(true);

    if (mode === 'login') {
      const { error } = await loginWithEmail(email, password);
      setIsSubmitting(false);
      if (error) {
        showNotification({
          title: 'Error de acceso',
          message: error.error_description || error.msg || error.message || 'Credenciales inválidas.',
          type: 'error',
        });
      } else {
        showNotification({
          title: '¡Bienvenido a XtremGen!',
          message: 'Sesión sincronizada con Supabase correctamente.',
          type: 'success',
        });
      }
    } else {
      if (!username.trim()) {
        setIsSubmitting(false);
        showNotification({
          title: 'Gamertag requerido',
          message: 'Elige tu nombre de jugador para continuar.',
          type: 'error',
        });
        return;
      }

      const { error } = await registerWithEmail(email, password, username.trim(), mainGame);
      setIsSubmitting(false);
      if (error) {
        showNotification({
          title: 'Error al registrar',
          message: error.error_description || error.msg || error.message || 'No se pudo crear la cuenta.',
          type: 'error',
        });
      } else {
        showNotification({
          title: '¡Cuenta XG Creada!',
          message: `Bienvenido @${username}. Tu perfil ya está activo en Supabase.`,
          type: 'success',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative bg-[#0c0c10] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_60px_rgba(239,68,68,0.2)]">
        {/* Top Accent Glow */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-32 bg-primary/25 blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="relative flex justify-between items-center p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="bg-primary px-2.5 py-1 rounded-lg shadow-[0_0_15px_rgba(239,68,68,0.5)]">
              <span className="text-lg font-black text-white tracking-tighter">XG</span>
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">
                {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta XG'}
              </h2>
              <p className="text-[11px] text-zinc-400 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" /> Conectado a Supabase Auth
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher */}
        <div className="px-6 pt-5">
          <div className="grid grid-cols-2 p-1 bg-black/60 border border-white/5 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Ingresar
            </button>
            <button
              type="button"
              onClick={() => setMode('register')}
              className={`py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-primary text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Primary Google & Discord Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-900" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              )}
              Continuar con Google
            </button>

            <button
              type="button"
              onClick={handleDiscordSignIn}
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-3 bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold py-2.5 px-4 rounded-xl transition-all text-sm shadow-md"
            >
              <Gamepad2 className="w-4 h-4 text-white" />
              Continuar con Discord
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full" />
            <span className="bg-[#0c0c10] px-3 text-[10px] font-bold uppercase tracking-widest text-zinc-500 whitespace-nowrap">
              o con tu cuenta XG
            </span>
            <div className="border-t border-white/10 w-full" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Gamertag / Nick
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Ej: JaviXG"
                      className="w-full bg-black/60 border border-white/10 rounded-xl pl-9 pr-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                    Juego Principal
                  </label>
                  <select
                    value={mainGame}
                    onChange={(e) => setMainGame(e.target.value)}
                    className="w-full bg-black/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                  >
                    <option value="Call of Duty: BO7">Call of Duty: BO7</option>
                    <option value="Valorant">Valorant</option>
                    <option value="Counter-Strike 2">Counter-Strike 2</option>
                    <option value="League of Legends">League of Legends</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="javierbrega@gmail.com"
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="w-full py-3 font-black uppercase tracking-wider text-sm shadow-[0_0_25px_rgba(239,68,68,0.35)]"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  {mode === 'login' ? 'Entrar a XtremGen' : 'Crear Cuenta y Entrar'}
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
