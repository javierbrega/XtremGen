export type ChatRole = "FOUNDER" | "SYSTEM BOT" | "RONIN" | "REBEL" | "CYBER";

export type ChannelId = "general" | "drops-xg" | "cyber-arena";

export interface ChatMessage {
  id: string;
  channel: ChannelId;
  user_id?: string;
  username: string;
  role_badge: ChatRole;
  content: string;
  created_at: string;
  is_online?: boolean;
  reactions?: {
    hype: number;
    drop: number;
    rebel: number;
  };
}

export interface UserProfile {
  id: string;
  username: string;
  role_badge: ChatRole;
  avatar_url?: string | null;
  reputation_points: number;
  is_online: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface BentoDropItem {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  category: "HOODIE" | "JACKET" | "ACCESSORY" | "SNEAKER" | "LIMITED";
  price_usd: number;
  stock_remaining: number;
  is_featured: boolean;
  accent_color?: "yellow" | "red" | "neon";
  image_url?: string | null;
  col_span?: number;
  row_span?: number;
  created_at: string;
}
