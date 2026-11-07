---
name: discord-community
description: >-
  Use this skill when interacting with the XtremGen (XG) Discord server,
  announcing new Anime-Streetwear Drops, syncing community channels, or managing Discord bot notifications.
---

# XtremGen (XG) - Discord Community Skill

Guía de integración y automatización para el servidor de **Discord** de **XtremGen (XG)**.

## 1. Casos de Uso Principales
- **Anuncios de Drops (`#drops-xg`)**: Publicar alertas automáticas cuando se agregue un nuevo ítem destacado en `public.bento_drops`.
- **Estado del Hub (`#system-status`)**: Notificar despliegues, eventos en vivo y actividad de la comunidad.
- **Puente de Comunidad**: Conectar eventos clave del Chat Realtime de la Sidebar Derecha con los canales oficiales de Discord.

## 2. Seguridad del Bot Token
- El token `DISCORD_BOT_TOKEN` reside únicamente en archivos locales ignorados por Git (`.agents/mcp_config.json` y `.agents/plugins/xtremgen-discord/mcp_config.json`) o en `.env.local`.
- Nunca subir tokens reales al repositorio público; utilizar `.agents/mcp_config.example.json` como plantilla versionada.
