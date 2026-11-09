-- ============================================================================
-- XTREMGEN (XG) - FULL SOCIAL NETWORK MIGRATION
-- Tablas: social_comments, social_reactions, social_stories + Triggers
-- ============================================================================

-- 1. Agregar columna 'mood' a public.social_posts si no existe
alter table if exists public.social_posts 
  add column if not exists mood text default null;

-- 2. TABLA: public.social_comments (Comentarios en publicaciones)
create table if not exists public.social_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

alter table public.social_comments enable row level security;

-- Índices de rendimiento
create index if not exists idx_social_comments_post_id on public.social_comments (post_id);
create index if not exists idx_social_comments_created_at on public.social_comments (created_at asc);

-- Políticas RLS para social_comments
drop policy if exists "Lectura publica comentarios" on public.social_comments;
create policy "Lectura publica comentarios" on public.social_comments
  for select using (true);

drop policy if exists "Usuarios autenticados crean comentarios" on public.social_comments;
create policy "Usuarios autenticados crean comentarios" on public.social_comments
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Usuarios borran sus propios comentarios" on public.social_comments;
create policy "Usuarios borran sus propios comentarios" on public.social_comments
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- 3. TABLA: public.social_reactions (Reacciones persistidas: gg, mvp, fire)
create table if not exists public.social_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.social_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reaction_type text not null check (reaction_type in ('gg', 'mvp', 'fire')),
  created_at timestamptz not null default now(),
  constraint unique_post_user_reaction unique (post_id, user_id, reaction_type)
);

alter table public.social_reactions enable row level security;

-- Índices
create index if not exists idx_social_reactions_post_id on public.social_reactions (post_id);
create index if not exists idx_social_reactions_user_id on public.social_reactions (user_id);

-- Políticas RLS para social_reactions
drop policy if exists "Lectura publica reacciones" on public.social_reactions;
create policy "Lectura publica reacciones" on public.social_reactions
  for select using (true);

drop policy if exists "Usuarios autenticados insertan reacciones" on public.social_reactions;
create policy "Usuarios autenticados insertan reacciones" on public.social_reactions
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Usuarios borran sus propias reacciones" on public.social_reactions;
create policy "Usuarios borran sus propias reacciones" on public.social_reactions
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- 4. TABLA: public.social_stories (Historias verticales / Shorts)
create table if not exists public.social_stories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video', 'youtube', 'live')),
  caption text,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

-- Asegurar que la restricción permita 'youtube' y 'live' si la tabla ya existía
alter table public.social_stories drop constraint if exists social_stories_media_type_check;
alter table public.social_stories add constraint social_stories_media_type_check check (media_type in ('image', 'video', 'youtube', 'live'));

alter table public.social_stories enable row level security;

-- Índices
create index if not exists idx_social_stories_created_at on public.social_stories (created_at desc);
create index if not exists idx_social_stories_user_id on public.social_stories (user_id);

-- Políticas RLS para social_stories
drop policy if exists "Lectura publica historias activas" on public.social_stories;
create policy "Lectura publica historias activas" on public.social_stories
  for select using (true);

drop policy if exists "Usuarios autenticados suben historias" on public.social_stories;
create policy "Usuarios autenticados suben historias" on public.social_stories
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Usuarios borran sus propias historias" on public.social_stories;
create policy "Usuarios borran sus propias historias" on public.social_stories
  for delete to authenticated
  using ((select auth.uid()) = user_id);


-- 5. TRIGGERS PARA SINCRONIZAR CONTADORES EN public.social_posts

-- Función para actualizar comments_count
create or replace function public.update_social_comments_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.social_posts
    set comments_count = coalesce(comments_count, 0) + 1
    where id = new.post_id;
  elsif (tg_op = 'DELETE') then
    update public.social_posts
    set comments_count = greatest(coalesce(comments_count, 1) - 1, 0)
    where id = old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_update_social_comments_count on public.social_comments;
create trigger tr_update_social_comments_count
  after insert or delete on public.social_comments
  for each row execute function public.update_social_comments_count();

-- Función para actualizar gg_count, likes_count (mvp), fires_count
create or replace function public.update_social_reactions_count()
returns trigger as $$
declare
  col_name text;
begin
  if (tg_op = 'INSERT') then
    col_name := case new.reaction_type
      when 'gg' then 'gg_count'
      when 'mvp' then 'likes_count'
      when 'fire' then 'fires_count'
    end;
    execute format('update public.social_posts set %I = coalesce(%I, 0) + 1 where id = $1', col_name, col_name)
    using new.post_id;
  elsif (tg_op = 'DELETE') then
    col_name := case old.reaction_type
      when 'gg' then 'gg_count'
      when 'mvp' then 'likes_count'
      when 'fire' then 'fires_count'
    end;
    execute format('update public.social_posts set %I = greatest(coalesce(%I, 1) - 1, 0) where id = $1', col_name, col_name)
    using old.post_id;
  end if;
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_update_social_reactions_count on public.social_reactions;
create trigger tr_update_social_reactions_count
  after insert or delete on public.social_reactions
  for each row execute function public.update_social_reactions_count();
