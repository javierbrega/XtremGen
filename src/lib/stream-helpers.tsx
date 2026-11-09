"use client";

import React from 'react';

export type StreamPlatform = 'youtube' | 'twitch' | 'kick' | 'tiktok' | 'instagram' | 'unknown';

export interface StreamInfo {
  platform: StreamPlatform;
  channelOrId: string;
  originalUrl: string;
  displayName: string;
  embedUrl?: string;
  canEmbed: boolean;
}

// 1. YouTube Vector Icon
export const YouTubeIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

// 2. Twitch Vector Icon
export const TwitchIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
  </svg>
);

// 3. Kick Vector Icon (stylized geometric 'K')
export const KickIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 2h5.5v7.5L14 2h7l-7.5 9.5L21 22h-7l-5.5-8v8H3V2z" />
  </svg>
);

// 4. TikTok Vector Icon
export const TikTokIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.15 1.15 2.08 2.27 2.37 1.06.27 2.26-.01 3.04-.77.52-.49.86-1.17.93-1.89.04-1.77.02-3.54.02-5.32V.02h.85z" />
  </svg>
);

// 5. Instagram Vector Icon
export const InstagramIcon = ({ className = 'w-4 h-4' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

/**
 * Helper to extract 11-char YouTube ID from any Shorts / Live / Video / Embed link
 */
export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  const regExp = /(?:youtube\.com\/(?:live\/|shorts\/|watch\?v=|v\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Detects the streaming platform from any URL string or channel identifier
 */
export function detectStreamPlatform(rawInput: string | undefined | null): StreamPlatform {
  if (!rawInput) return 'unknown';
  const url = rawInput.trim().toLowerCase();

  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('twitch.tv')) return 'twitch';
  if (url.includes('kick.com')) return 'kick';
  if (url.includes('tiktok.com')) return 'tiktok';
  if (url.includes('instagram.com')) return 'instagram';

  return 'unknown';
}

/**
 * Parses any live stream URL or identifier and builds embed info
 */
export function parseStreamInfo(rawInput: string | undefined | null, defaultHostname = 'localhost'): StreamInfo {
  const empty: StreamInfo = {
    platform: 'unknown',
    channelOrId: '',
    originalUrl: rawInput || '',
    displayName: 'Transmisión En Vivo',
    canEmbed: false,
  };
  if (!rawInput) return empty;

  const trimmed = rawInput.trim();
  const platform = detectStreamPlatform(trimmed);

  // 1. YouTube
  if (platform === 'youtube') {
    // Check for 11-char ID in /live/ID, /watch?v=ID, youtu.be/ID, /shorts/ID
    const regExp = /(?:youtube\.com\/(?:live\/|shorts\/|watch\?v=|v\/|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = trimmed.match(regExp);
    const id = match && match[1] ? match[1] : trimmed.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 11);

    return {
      platform: 'youtube',
      channelOrId: id,
      originalUrl: trimmed.startsWith('http') ? trimmed : `https://youtube.com/live/${id}`,
      displayName: `YouTube Live (${id})`,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=0&controls=1`,
      canEmbed: Boolean(id && id.length === 11),
    };
  }

  // 2. Twitch
  if (platform === 'twitch') {
    // Match channel name: twitch.tv/channel or just channel
    const match = trimmed.match(/twitch\.tv\/([a-zA-Z0-9_]+)/i);
    const channel = match && match[1] ? match[1] : trimmed.replace(/[^a-zA-Z0-9_]/g, '');
    const hostname =
      typeof window !== 'undefined' && window.location.hostname
        ? window.location.hostname
        : defaultHostname;

    return {
      platform: 'twitch',
      channelOrId: channel,
      originalUrl: trimmed.startsWith('http') ? trimmed : `https://twitch.tv/${channel}`,
      displayName: `Twitch / ${channel}`,
      embedUrl: `https://player.twitch.tv/?channel=${channel}&parent=${hostname}&autoplay=true&muted=false`,
      canEmbed: Boolean(channel),
    };
  }

  // 3. Kick
  if (platform === 'kick') {
    // Match channel name: kick.com/channel or just channel
    const match = trimmed.match(/kick\.com\/([a-zA-Z0-9_]+)/i);
    const channel = match && match[1] ? match[1] : trimmed.replace(/[^a-zA-Z0-9_]/g, '');

    return {
      platform: 'kick',
      channelOrId: channel,
      originalUrl: trimmed.startsWith('http') ? trimmed : `https://kick.com/${channel}`,
      displayName: `Kick / ${channel}`,
      embedUrl: `https://player.kick.com/${channel}?autoplay=true&muted=false`,
      canEmbed: Boolean(channel),
    };
  }

  // 4. TikTok
  if (platform === 'tiktok') {
    const match = trimmed.match(/tiktok\.com\/@([a-zA-Z0-9_.-]+)/i);
    const user = match && match[1] ? match[1] : trimmed.replace(/^@/, '');
    const url = trimmed.startsWith('http') ? trimmed : `https://www.tiktok.com/@${user}/live`;

    return {
      platform: 'tiktok',
      channelOrId: user,
      originalUrl: url,
      displayName: `TikTok Live / @${user}`,
      canEmbed: false, // TikTok blocks external live iframe via CSP
    };
  }

  // 5. Instagram
  if (platform === 'instagram') {
    const match = trimmed.match(/instagram\.com\/([a-zA-Z0-9_.-]+)/i);
    const user = match && match[1] ? match[1] : trimmed.replace(/^@/, '');
    const url = trimmed.startsWith('http') ? trimmed : `https://www.instagram.com/${user}/live`;

    return {
      platform: 'instagram',
      channelOrId: user,
      originalUrl: url,
      displayName: `Instagram / @${user}`,
      canEmbed: false, // Meta blocks external live iframe via X-Frame-Options
    };
  }

  return {
    ...empty,
    originalUrl: trimmed,
  };
}

/**
 * Returns UI metadata (label, colors, icon) for any supported stream platform
 */
export function getPlatformMeta(platform: StreamPlatform) {
  switch (platform) {
    case 'youtube':
      return {
        name: 'YouTube Live',
        badge: 'YOUTUBE',
        color: '#FF0000',
        bgGradient: 'from-red-600/30 to-red-950/50',
        borderColor: 'border-red-500/40',
        textColor: 'text-red-400',
        Icon: YouTubeIcon,
        placeholder: 'https://youtube.com/live/ID o https://youtu.be/...',
      };
    case 'twitch':
      return {
        name: 'Twitch',
        badge: 'TWITCH',
        color: '#9146FF',
        bgGradient: 'from-purple-600/30 to-purple-950/50',
        borderColor: 'border-purple-500/40',
        textColor: 'text-purple-400',
        Icon: TwitchIcon,
        placeholder: 'https://twitch.tv/tu_canal o solo tu_canal',
      };
    case 'kick':
      return {
        name: 'Kick',
        badge: 'KICK',
        color: '#53FC18',
        bgGradient: 'from-emerald-500/30 to-black',
        borderColor: 'border-emerald-400/50',
        textColor: 'text-emerald-400',
        Icon: KickIcon,
        placeholder: 'https://kick.com/tu_canal o solo tu_canal',
      };
    case 'tiktok':
      return {
        name: 'TikTok Live',
        badge: 'TIKTOK',
        color: '#00F2FE',
        bgGradient: 'from-cyan-500/30 to-pink-900/40',
        borderColor: 'border-cyan-400/40',
        textColor: 'text-cyan-400',
        Icon: TikTokIcon,
        placeholder: 'https://www.tiktok.com/@usuario/live',
      };
    case 'instagram':
      return {
        name: 'Instagram Live',
        badge: 'INSTAGRAM',
        color: '#E1306C',
        bgGradient: 'from-pink-600/30 via-purple-900/40 to-amber-900/30',
        borderColor: 'border-pink-500/40',
        textColor: 'text-pink-400',
        Icon: InstagramIcon,
        placeholder: 'https://instagram.com/usuario o @usuario',
      };
    default:
      return {
        name: 'En Vivo',
        badge: 'LIVE',
        color: '#EF4444',
        bgGradient: 'from-red-600/30 to-black',
        borderColor: 'border-red-500/30',
        textColor: 'text-red-400',
        Icon: YouTubeIcon,
        placeholder: 'Pega tu enlace de YouTube, Twitch, Kick, TikTok o Instagram...',
      };
  }
}
