---
name: discord-community
description: >-
  Use this skill when interacting with the XtremGen (XG) Discord server,
  announcing new Anime-Streetwear Drops, syncing community channels, or managing Discord bot notifications.
---

# XtremGen (XG) - Discord Community Skill

Guía de integración y automatización para el servidor de **Discord** de **XtremGen (XG)**.

## 1. Datos del Servidor y Bot Conectado
- **Bot**: `Argon XG` (ID: `1568588662822805545`)
- **Servidor (Guild)**: `XtremeGen HQ` (ID: `1568588113188495370`)
- **Canal Principal**: `#general` (ID: `1568588114396712982`)

## 2. Cómo Enviar Notificaciones o Reportes a Discord
1. **Vía Servidor MCP (`xtremgen-discord`)**:
   - Usa las herramientas `discord_send_message`, `discord_list_channels` o `discord_read_messages` provistas por [server.mjs](../../plugins/xtremgen-discord/server.mjs).
2. **Vía Script Helper ([send_discord.ps1](./scripts/send_discord.ps1))**:
   ```powershell
   powershell -ExecutionPolicy Bypass -File ".agents/skills/discord-community/scripts/send_discord.ps1" -Message "⚡ Nuevo avance en XtremGen!"
   ```

## 3. Seguridad del Bot Token
- El token `DISCORD_BOT_TOKEN` reside únicamente en archivos locales ignorados por Git (`.agents/mcp_config.json` y `.agents/plugins/xtremgen-discord/mcp_config.json`).
- Nunca subir tokens reales al repositorio público; utilizar `.agents/mcp_config.example.json` como plantilla versionada.
