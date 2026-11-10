"use client";

export interface GamingAccount {
  username: string;
  connected: boolean;
  connected_at: string;
  avatar_url?: string;
}

export interface GamingConnections {
  twitch?: GamingAccount;
  kick?: GamingAccount;
  discord?: GamingAccount;
}

const STORAGE_PREFIX = 'xg_gaming_conn_';

export function getGamingConnections(userId?: string): GamingConnections {
  if (typeof window === 'undefined') return {};
  const id = userId || 'default_user';
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return {};
}

export function saveGamingConnections(userId: string | undefined, connections: GamingConnections): void {
  if (typeof window === 'undefined') return;
  const id = userId || 'default_user';
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(connections));
    // Dispatch custom event for real-time reactivity across components
    window.dispatchEvent(new CustomEvent('xg-gaming-connections-updated', { detail: connections }));
  } catch {}
}

export function connectTwitchAccount(userId: string | undefined, username: string): GamingConnections {
  const cleanUsername = username.replace(/^@/, '').trim();
  const current = getGamingConnections(userId);
  const updated: GamingConnections = {
    ...current,
    twitch: {
      username: cleanUsername,
      connected: true,
      connected_at: new Date().toISOString(),
      avatar_url: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=twitch-${cleanUsername}`,
    },
  };
  saveGamingConnections(userId, updated);
  return updated;
}

export function disconnectTwitchAccount(userId: string | undefined): GamingConnections {
  const current = getGamingConnections(userId);
  const updated = { ...current };
  delete updated.twitch;
  saveGamingConnections(userId, updated);
  return updated;
}

export function connectKickAccount(userId: string | undefined, username: string): GamingConnections {
  const cleanUsername = username.replace(/^@/, '').trim();
  const current = getGamingConnections(userId);
  const updated: GamingConnections = {
    ...current,
    kick: {
      username: cleanUsername,
      connected: true,
      connected_at: new Date().toISOString(),
      avatar_url: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=kick-${cleanUsername}`,
    },
  };
  saveGamingConnections(userId, updated);
  return updated;
}

export function disconnectKickAccount(userId: string | undefined): GamingConnections {
  const current = getGamingConnections(userId);
  const updated = { ...current };
  delete updated.kick;
  saveGamingConnections(userId, updated);
  return updated;
}

export function connectDiscordAccount(userId: string | undefined, username: string): GamingConnections {
  const cleanUsername = username.replace(/^@/, '').trim();
  const current = getGamingConnections(userId);
  const updated: GamingConnections = {
    ...current,
    discord: {
      username: cleanUsername,
      connected: true,
      connected_at: new Date().toISOString(),
      avatar_url: `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=discord-${cleanUsername}`,
    },
  };
  saveGamingConnections(userId, updated);
  return updated;
}

export function disconnectDiscordAccount(userId: string | undefined): GamingConnections {
  const current = getGamingConnections(userId);
  const updated = { ...current };
  delete updated.discord;
  saveGamingConnections(userId, updated);
  return updated;
}
