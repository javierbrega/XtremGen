-- ============================================================================
-- XTREMGEN (XG) - INITIAL SCHEMA & RLS MIGRATION
-- ============================================================================

-- 1. TABLA: public.profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  role_badge text not null default 'REBEL' check (role_badge in ('FOUNDER', 'SYSTEM BOT', 'RONIN', 'REBEL', 'CYBER')),
  avatar_url text,
  reputation_points integer not null default 0 check (reputation_points >= 0),
  is_online boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- RLS Policies for public.profiles
create policy "Profiles are viewable by authenticated and anon users"
  on public.profiles
  for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Authenticated users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- 2. TABLA: public.chat_messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  channel text not null default 'general' check (channel in ('general', 'drops-xg', 'cyber-arena')),
  user_id uuid not null references auth.users(id) on delete cascade,
  username text not null,
  role_badge text not null default 'REBEL' check (role_badge in ('FOUNDER', 'SYSTEM BOT', 'RONIN', 'REBEL', 'CYBER')),
  content text not null check (char_length(trim(content)) > 0 and char_length(content) <= 280),
  created_at timestamptz not null default now()
);

alter table public.chat_messages enable row level security;

-- Indexes for performance & RLS on public.chat_messages
create index if not exists idx_chat_messages_channel on public.chat_messages (channel);
create index if not exists idx_chat_messages_user_id on public.chat_messages (user_id);
create index if not exists idx_chat_messages_created_at on public.chat_messages (created_at desc);
create index if not exists idx_chat_messages_channel_created_at on public.chat_messages (channel, created_at desc);

-- RLS Policies for public.chat_messages
create policy "Community chat messages are viewable by everyone"
  on public.chat_messages
  for select
  to authenticated, anon
  using (true);

create policy "Authenticated users can insert their own chat messages"
  on public.chat_messages
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Authenticated users can update their own chat messages"
  on public.chat_messages
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Authenticated users can delete their own chat messages"
  on public.chat_messages
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);


-- 3. TABLA: public.bento_drops
create table if not exists public.bento_drops (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null check (category in ('HOODIE', 'JACKET', 'ACCESSORY', 'SNEAKER', 'LIMITED')),
  price_usd numeric(10, 2) not null check (price_usd >= 0),
  stock_remaining integer not null default 0 check (stock_remaining >= 0),
  is_featured boolean not null default false,
  image_url text,
  created_at timestamptz not null default now()
);

alter table public.bento_drops enable row level security;

create index if not exists idx_bento_drops_created_at on public.bento_drops (created_at desc);
create index if not exists idx_bento_drops_is_featured on public.bento_drops (is_featured) where is_featured = true;

-- RLS Policies for public.bento_drops
create policy "Bento drops are viewable by authenticated and anon users"
  on public.bento_drops
  for select
  to authenticated, anon
  using (true);


-- 4. SUPABASE REALTIME PUBLICATION
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1
      from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = 'chat_messages'
    ) then
      alter publication supabase_realtime add table public.chat_messages;
    end if;
  end if;
end
$$;
