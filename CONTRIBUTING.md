# Guía de Contribución a XtremGen (XG)

¡Gracias por tu interés en contribuir a **XtremGen (XG)**! Este documento establece las reglas técnicas y visuales para mantener la coherencia del proyecto.

## 1. Estándares de Diseño Obligatorios (`gemini.md`)
Antes de crear o modificar cualquier componente de interfaz, revisa [`gemini.md`](./gemini.md):
- **Paleta de Colores**: Usa siempre los tokens `xg-*` definidos en `tailwind.config.ts` (`bg-xg-bg`, `bg-xg-contrast`, `bg-xg-sidebar`, `text-xg-yellow`, `text-xg-red`, `text-xg-neon`).
- **Geometría**: Usa exclusivamente cortes secos (`rounded-none` o `rounded-sm`). No utilices `rounded-lg`, `rounded-xl` ni `rounded-full` en contenedores.
- **Sombras**: Aplica sombras neobrutalistas 2D (`shadow-brutal-black`, `shadow-brutal-red`, `shadow-brutal-yellow`) y efectos glow en hover (`hover:shadow-glow-yellow`).

## 2. Flujo de Trabajo con Git
1. Crea una rama descriptiva desde `main`:
   - `feat/<nombre-feature>`
   - `fix/<nombre-bug>`
   - `style/<ajuste-visual>`
2. Usa **Conventional Commits**:
   - `feat(ui): add Opera GX left sidebar navigation`
   - `feat(supabase): configure realtime channel for community chat`
   - `fix(bento): prevent horizontal overflow on mobile viewports`

## 3. Verificación antes de abrir un Pull Request
Ejecuta siempre las validaciones locales antes de subir tus cambios:
```bash
npm run lint
npm run build
```
Asegúrate de no incluir credenciales ni archivos `.env.local` o `mcp_config.json` con tokens en tus commits.
