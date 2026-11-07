---
name: xtremgen-supabase
description: >-
  Use this skill when implementing Supabase features specifically for XtremGen (XG),
  including Next.js 15 App Router SSR clients (@supabase/ssr), the right-sidebar
  Community Realtime Chat, user profiles, drops/bento items, and Row Level Security (RLS).
---

# XtremGen (XG) - Supabase Architecture Skill

Guía específica para integrar **Supabase** en **XtremGen (XG)** con **Next.js 15 (App Router)**. Trabaja en conjunto con las skills globales `supabase` y `supabase-postgres-best-practices`.

## 1. Variables de Entorno Requeridas (`.env.local`)
Nunca exponer claves `service_role` en el cliente. Usar en `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<project_ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_or_publishable_key>
```

## 2. Estructura de Clientes en Next.js 15 (`src/lib/supabase/`)
Usar `@supabase/ssr` y `@supabase/supabase-js`:
- `src/lib/supabase/client.ts`: `createBrowserClient` para componentes cliente (ej. **Sidebar Derecha - Chat de la Comunidad en vivo** con Supabase Realtime).
- `src/lib/supabase/server.ts`: `createServerClient` usando `await cookies()` de `next/headers` (obligatorio asíncrono en Next.js 15) para Server Components, Server Actions y Route Handlers.
- `src/lib/supabase/middleware.ts`: Refresco de sesión de Auth en `middleware.ts`.

## 3. Tablas Clave de XtremGen y Reglas RLS
Toda tabla en el esquema `public` **debe** tener `ENABLE ROW LEVEL SECURITY`:
1. **`profiles`**:
   - Vinculada a `auth.users(id)` (`ON DELETE CASCADE`).
   - Campos: `username`, `avatar_url`, `role_badge` (estilo streetwear/rebel), `is_online` (`#D4FE00`).
2. **`chat_messages` (Sidebar Derecha - Chat de la Comunidad)**:
   - Habilitada en publicación `supabase_realtime`.
   - Políticas RLS:
     - `SELECT`: Pública o `TO authenticated, anon` para lectura del chat en vivo.
     - `INSERT`: `TO authenticated WITH CHECK ((select auth.uid()) = user_id)`.
3. **`bento_drops` (Dashboard Central)**:
   - Contenido dinámico para el Bento Grid (`grid-cols-12`), soportando `image_url` con recorte transparente PNG/WebP para el efecto *out-of-bounds*.
