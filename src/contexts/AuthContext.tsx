"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, SupabaseSession } from '../lib/supabase/client';

export type Role = 'USER' | 'LEADER' | 'PRO_STAFF';

export interface UserProfile {
  id: string;
  username: string;
  display_name?: string;
  avatar_url: string;
  banner_url?: string;
  bio?: string;
  level?: number;
  xp?: number;
  rank?: string;
  role: Role;
  role_badge?: string;
  clan_id: string | null;
  clan_tag?: string | null;
  is_online?: boolean;
  is_pro?: boolean;
  spotify_status: 'premium' | 'free';
  spotify_affiliate_id?: string;
  isPremium?: boolean;
  created_at?: string;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  session: SupabaseSession | null;
  isPremium: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<{ error: any }>;
  loginWithDiscord: () => Promise<{ error: any }>;
  loginWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  registerWithEmail: (email: string, password: string, username: string, mainGame?: string) => Promise<{ error: any }>;
  loginWithSpotify: () => void;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function checkProviderEnabled(provider: 'google' | 'discord'): Promise<boolean> {
  try {
    const res = await fetch(`${supabase.url}/auth/v1/settings`, {
      headers: { apikey: supabase.anonKey },
    });
    if (!res.ok) return false;
    const settings = await res.json();
    return Boolean(settings?.external?.[provider]);
  } catch {
    return false;
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<SupabaseSession | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadUserProfile = useCallback(async (userObj: any) => {
    if (!userObj?.id) {
      setProfile(null);
      return;
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userObj.id)
      .single();

    if (data && !error) {
      const mapped: UserProfile = {
        id: data.id,
        username: data.username,
        display_name: data.display_name || data.username,
        avatar_url:
          data.avatar_url ||
          `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${data.id}`,
        banner_url: data.banner_url,
        bio: data.bio || '',
        level: data.level || 1,
        xp: data.xp || 0,
        rank: data.rank || 'Unranked',
        role: (data.role_badge === 'LEADER' ? 'LEADER' : data.is_pro ? 'PRO_STAFF' : 'USER') as Role,
        role_badge: data.role_badge || 'GAMER',
        clan_id: data.clan_id || null,
        clan_tag: data.clan_tag || null,
        is_online: true,
        is_pro: Boolean(data.is_pro),
        spotify_status: data.is_pro ? 'premium' : 'free',
        isPremium: Boolean(data.is_pro),
        created_at: data.created_at,
      };
      setProfile(mapped);
      setIsPremium(Boolean(data.is_pro));
    } else {
      const fallbackUsername =
        userObj.user_metadata?.username ||
        userObj.user_metadata?.full_name ||
        userObj.email?.split('@')[0] ||
        `gamer_${userObj.id.slice(0, 4)}`;

      const avatar =
        userObj.user_metadata?.avatar_url ||
        userObj.user_metadata?.picture ||
        `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${userObj.id}`;

      const { data: inserted } = await supabase
        .from('profiles')
        .insert({
          id: userObj.id,
          username: fallbackUsername,
          display_name: fallbackUsername,
          avatar_url: avatar,
          role_badge: 'GAMER',
        })
        .single();

      const row = inserted || {
        id: userObj.id,
        username: fallbackUsername,
        avatar_url: avatar,
      };

      setProfile({
        id: row.id,
        username: row.username,
        display_name: row.display_name || row.username,
        avatar_url: row.avatar_url,
        role: 'USER',
        clan_id: row.clan_id || null,
        spotify_status: 'free',
        isPremium: false,
      });
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        loadUserProfile(data.session.user).finally(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        loadUserProfile(newSession.user);
        setIsAuthModalOpen(false);
      } else {
        setProfile(null);
        setIsPremium(false);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  /**
   * Google Sign-In via Supabase OAuth:
   * 1. Checks if Google OAuth provider is enabled in Supabase Auth settings.
   * 2. If enabled, redirects to official Google OAuth screen.
   * 3. If not enabled, returns an error informing that Google OAuth must be enabled in Supabase.
   */
  const loginWithGoogle = async () => {
    const isGoogleEnabled = await checkProviderEnabled('google');
    if (!isGoogleEnabled) {
      return {
        error: {
          message:
            'El inicio de sesión con Google no está habilitado en la consola de Supabase. Puedes iniciar sesión o registrarte con tu correo y contraseña, o habilitar Google en Supabase Dashboard > Authentication > Providers.',
        },
      };
    }

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      },
    });
    return { error: null };
  };

  /**
   * Discord Sign-In via Supabase OAuth:
   * 1. Checks if Discord OAuth provider is enabled in Supabase Auth settings.
   * 2. If enabled, redirects to official Discord OAuth screen.
   * 3. If not enabled, returns an error informing that Discord OAuth must be enabled in Supabase.
   */
  const loginWithDiscord = async () => {
    const isDiscordEnabled = await checkProviderEnabled('discord');
    if (!isDiscordEnabled) {
      return {
        error: {
          message:
            'El inicio de sesión con Discord no está habilitado en la consola de Supabase. Puedes iniciar sesión o registrarte con tu correo y contraseña.',
        },
      };
    }

    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
      },
    });
    return { error: null };
  };

  const loginWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    if (data?.user) {
      await loadUserProfile(data.user);
      setIsAuthModalOpen(false);
    }
    return { error: null };
  };

  const registerWithEmail = async (
    email: string,
    password: string,
    username: string,
    mainGame?: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
          main_game: mainGame || 'Valorant',
        },
      },
    });
    if (error) return { error };

    if (data && !data.session) {
      const signInRes = await supabase.auth.signInWithPassword({ email, password });
      if (!signInRes.error && signInRes.data?.user) {
        await loadUserProfile(signInRes.data.user);
        setIsAuthModalOpen(false);
        return { error: null };
      }
    }

    if (data?.user) {
      await loadUserProfile(data.user);
      setIsAuthModalOpen(false);
    }
    return { error: null };
  };

  const loginWithSpotify = () => {
    loginWithGoogle();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    setIsPremium(false);
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!profile) return;
    const dbUpdates: Record<string, any> = {};
    if (data.username !== undefined) dbUpdates.username = data.username;
    if (data.display_name !== undefined) dbUpdates.display_name = data.display_name;
    if (data.avatar_url !== undefined) dbUpdates.avatar_url = data.avatar_url;
    if (data.bio !== undefined) dbUpdates.bio = data.bio;
    if (data.clan_id !== undefined) dbUpdates.clan_id = data.clan_id;
    if (data.role !== undefined) dbUpdates.role_badge = data.role;

    await supabase.from('profiles').update(dbUpdates).eq('id', profile.id);
    setProfile({ ...profile, ...data });
  };

  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isPremium,
        isLoading,
        loginWithGoogle,
        loginWithDiscord,
        loginWithEmail,
        registerWithEmail,
        loginWithSpotify,
        logout,
        updateProfile,
        refreshProfile,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
