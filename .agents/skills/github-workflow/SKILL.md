---
name: github-workflow
description: >-
  Use this skill when initializing Git, managing branches, creating commits,
  configuring remotes, or interacting with GitHub repositories, Issues, and Pull Requests for XtremGen (XG).
---

# XtremGen (XG) - Git & GitHub Workflow Skill

Procedimientos estándar para control de versiones e integración con GitHub en el proyecto **XtremGen (XG)**.

## 1. Inicialización y Configuración del Repositorio
Si el repositorio aún no tiene `.git`:
1. Verificar `.gitignore` antes del primer commit (debe ignorar `node_modules/`, `.next/`, `.env*.local`, y credenciales en `.agents/mcp_config.json` si contiene tokens en texto plano).
2. Inicializar rama principal como `main`:
   ```bash
   git init -b main
   ```
3. Configurar el remoto de GitHub (vía CLI `gh` o `git remote add origin <url>`).

## 2. Convención de Commits (Conventional Commits)
Todos los commits deben seguir el formato:
- `feat(ui): ...` — Nuevos componentes visuales, sidebars o Bento Grid.
- `feat(supabase): ...` — Esquemas, migraciones, Auth o Realtime Chat.
- `fix(...): ...` — Corrección de errores.
- `style(...): ...` — Ajustes de Tailwind CSS / estética Anime-Streetwear (`#FFD200`, `#E6002B`, `#0A0A0E`).
- `chore(...): ...` — Configuraciones, dependencias, skills o MCP.

## 3. Verificación Pre-Commit
Antes de crear un commit o abrir un Pull Request:
1. Ejecutar verificación de tipos y linting:
   ```bash
   npm run lint
   ```
2. Confirmar que no existan secretos (`SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_PERSONAL_ACCESS_TOKEN`) en archivos rastreados por Git (`git status` / `git diff`).
