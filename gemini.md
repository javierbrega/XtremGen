---
description: Estándares de Arquitectura, UX y UI para XtremGen (XG)
trigger: always_on
---
# XtremGen (XG) - Frontend Standards

## 1. Stack Tecnológico
- Framework: Next.js (App Router) con TypeScript estricto.
- Estilos: Tailwind CSS.
- Dependencias UI: Lucide React para iconografía, clsx y tailwind-merge.

## 2. Identidad Visual (Anime-Streetwear Rebelde)
- Fondo Base: `#0A0A0E` (Negro Carbón Mate) o `#0B1020` para contrastes.
- Acentos Principales: Amarillo Industrial/Street (`#FFD200`) y Rojo Sangre (`#E6002B`).
- Detalles y Estados: Verde Neón (`#D4FE00`) para indicadores "En línea" y Blanco puro.
- Bordes y Geometría: Cortes secos y agresivos (`rounded-none` o `rounded-sm`), prohibido usar bordes muy redondeados.
- Sombreado: Sombras 2D estilo neobrutalista/fanzine (`shadow-[4px_4px_0px_0px_#000]` o `#E6002B`).
- Interacciones: Efectos hover con brillo sólido (`hover:shadow-[0_0_20px_rgba(255,210,0,0.45)]`).

## 3. Arquitectura de Navegación (Estilo Opera GX)
- Sidebar Izquierda: Fija, ultra-delgada (`w-16` o `w-20`), fondo `#050508`, iconos para navegación principal y redes.
- Sidebar Derecha: Panel colapsable lateral para Chat de la Comunidad.
- Área Central (Dashboard): Grid tipo Bento interactivo (`grid-cols-12`) permitiendo que las ilustraciones anime sobresalgan de sus contenedores (efecto out-of-bounds).
