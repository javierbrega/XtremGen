import React from "react";

export interface AnimeArtProps {
  className?: string;
}

/**
 * Ilustración vectorial de alto detalle: Cyber-Samurai con Hoodie Streetwear,
 * Visor Industrial #FFD200, Katana de Plasma #E6002B y detalles #D4FE00.
 * Diseñada con fondo transparente para sobresalir (Out-of-Bounds) del Bento Grid.
 */
export function CyberSamuraiArt({ className = "" }: AnimeArtProps) {
  return (
    <svg
      viewBox="0 0 380 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Cyber Samurai Streetwear Illustration"
    >
      <defs>
        <filter id="xg-yellow-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#FFD200" floodOpacity="0.85" />
        </filter>
        <filter id="xg-red-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="5" floodColor="#E6002B" floodOpacity="0.85" />
        </filter>
        <linearGradient id="hoodie-grad" x1="190" y1="90" x2="190" y2="410" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#141829" />
          <stop offset="60%" stopColor="#0A0A0E" />
          <stop offset="100%" stopColor="#050508" />
        </linearGradient>
        <linearGradient id="blade-grad" x1="40" y1="15" x2="350" y2="290" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#FFD200" />
          <stop offset="100%" stopColor="#E6002B" />
        </linearGradient>
      </defs>

      {/* Halo geométrico Manga/Fanzine detrás del personaje (sobresale arriba) */}
      <polygon
        points="195,8 235,38 215,42 260,88 195,62 140,95 162,45 135,35"
        fill="#E6002B"
        opacity="0.9"
      />
      <rect
        x="118"
        y="28"
        width="154"
        height="154"
        transform="rotate(12 195 105)"
        stroke="#FFD200"
        strokeWidth="2.5"
        strokeDasharray="10 5"
        fill="none"
      />

      {/* Katana Tecnológica Diagonal (Sobresale por el borde superior e izquierdo/derecho) */}
      <g filter="url(#xg-red-glow)">
        <path
          d="M28 18 L348 255 L336 266 L18 26 Z"
          fill="url(#blade-grad)"
          stroke="#000000"
          strokeWidth="3"
        />
        {/* Filo luminoso de la katana */}
        <line x1="25" y1="20" x2="344" y2="257" stroke="#FFD200" strokeWidth="2.5" />
      </g>
      {/* Empuñadura (Tsuka) cyber-industrial */}
      <rect
        x="285"
        y="208"
        width="78"
        height="18"
        transform="rotate(36.5 285 208)"
        fill="#0A0A0E"
        stroke="#FFD200"
        strokeWidth="2.5"
      />
      {/* Tsuba (Guardia) */}
      <polygon
        points="272,188 292,202 276,225 256,210"
        fill="#E6002B"
        stroke="#000000"
        strokeWidth="2.5"
      />

      {/* Katana Secundaria Cruzada */}
      <path
        d="M352 14 L60 265 L72 276 L362 24 Z"
        fill="#0B1020"
        stroke="#FFD200"
        strokeWidth="2.5"
      />
      <line x1="356" y1="19" x2="66" y2="270" stroke="#E6002B" strokeWidth="2" />

      {/* Hombros y Torso Heavy Hoodie Streetwear */}
      <path
        d="M42 415 L64 252 L115 212 L195 225 L275 212 L322 252 L344 415 Z"
        fill="url(#hoodie-grad)"
        stroke="#000000"
        strokeWidth="4"
      />

      {/* Paneles Techwear en Hombros con bordes agresivos */}
      <polygon
        points="54,285 115,216 142,265 65,320"
        fill="#E6002B"
        stroke="#000000"
        strokeWidth="3"
      />
      <polygon
        points="332,285 275,216 248,265 320,320"
        fill="#FFD200"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Cuello Alto Táctico / Respirador Cyber */}
      <polygon
        points="135,195 255,195 272,275 195,305 118,275"
        fill="#050508"
        stroke="#FFD200"
        strokeWidth="2.5"
      />

      {/* Capucha Oversize (Hoodie) con corte seco y sombra manga */}
      <path
        d="M95 195 L108 92 L152 48 L238 48 L282 92 L295 195 L252 222 L195 205 L138 222 Z"
        fill="#0B1020"
        stroke="#000000"
        strokeWidth="4.5"
      />
      {/* Borde interior de la capucha en amarillo street */}
      <path
        d="M114 188 L124 102 L160 66 L230 66 L266 102 L276 188"
        stroke="#FFD200"
        strokeWidth="3"
        fill="#050508"
      />

      {/* Cabello Anime Puntiagudo (Sobresaliendo de la capucha) */}
      <polygon
        points="130,98 102,65 148,78 162,38 192,76 228,36 238,78 286,62 258,102"
        fill="#E6002B"
        stroke="#000000"
        strokeWidth="3"
      />

      {/* Máscara Oni / Samurai Cyberpunk */}
      <polygon
        points="138,142 195,126 252,142 242,208 195,232 148,208"
        fill="#0A0A0E"
        stroke="#E6002B"
        strokeWidth="3"
      />
      {/* Colmillos / Rejilla de ventilación Oni en blanco y verde neón */}
      <polygon points="156,178 172,178 166,204" fill="#FFFFFF" />
      <polygon points="234,178 218,178 224,204" fill="#FFFFFF" />
      <line x1="176" y1="188" x2="214" y2="188" stroke="#D4FE00" strokeWidth="3" />
      <line x1="180" y1="198" x2="210" y2="198" stroke="#D4FE00" strokeWidth="3" />

      {/* Visor Luminoso Industrial #FFD200 (Ojos Cyber-Anime) */}
      <g filter="url(#xg-yellow-glow)">
        <polygon
          points="122,118 195,136 268,118 256,148 195,160 134,148"
          fill="#FFD200"
          stroke="#000000"
          strokeWidth="2.5"
        />
        {/* Brillo blanco de velocidad en el visor */}
        <polygon points="140,126 185,137 175,146 135,136" fill="#FFFFFF" />
        <polygon points="215,136 252,126 248,136 210,145" fill="#FFFFFF" />
      </g>

      {/* Cintas Tácticas / Straps del Hoodie con Tipografía XG */}
      <path d="M150 225 L138 395 L164 395 L172 225 Z" fill="#FFD200" stroke="#000000" strokeWidth="3" />
      <path d="M240 225 L252 395 L226 395 L218 225 Z" fill="#E6002B" stroke="#000000" strokeWidth="3" />

      {/* Emblema Central del Pecho: XG NEON */}
      <rect
        x="166"
        y="278"
        width="58"
        height="58"
        fill="#050508"
        stroke="#D4FE00"
        strokeWidth="3"
      />
      <text
        x="195"
        y="316"
        textAnchor="middle"
        fill="#D4FE00"
        fontSize="26"
        fontWeight="900"
        fontFamily="monospace"
      >
        XG
      </text>

      {/* Líneas de velocidad Manga / Partículas Neón */}
      <line x1="38" y1="92" x2="78" y2="92" stroke="#D4FE00" strokeWidth="3" />
      <line x1="22" y1="108" x2="54" y2="108" stroke="#FFD200" strokeWidth="2" />
      <line x1="312" y1="88" x2="358" y2="88" stroke="#E6002B" strokeWidth="3" />
      <rect x="330" y="102" width="12" height="12" fill="#D4FE00" />
      <rect x="48" y="135" width="10" height="10" fill="#FFD200" />
    </svg>
  );
}

/**
 * Ilustración vectorial de alto detalle: Neon Ronin Streetwear
 * para tarjetas secundarias del Bento Grid con efecto Out-of-Bounds.
 */
export function NeonRoninArt({ className = "" }: AnimeArtProps) {
  return (
    <svg
      viewBox="0 0 240 260"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Neon Ronin Anime Illustration"
    >
      {/* Fondo geométrico agresivo */}
      <polygon
        points="120,10 210,55 185,175 55,175 30,55"
        fill="#050508"
        stroke="#E6002B"
        strokeWidth="3"
      />

      {/* Sombrero Kasa Cyber-Ronin que sobresale del borde superior */}
      <polygon
        points="12,68 120,14 228,68 196,82 120,54 44,82"
        fill="#0A0A0E"
        stroke="#FFD200"
        strokeWidth="3.5"
      />
      <line x1="65" y1="44" x2="175" y2="44" stroke="#E6002B" strokeWidth="3" />

      {/* Cuello y Chaqueta Techwear */}
      <polygon
        points="36,255 58,152 120,136 182,152 204,255"
        fill="#0B1020"
        stroke="#000000"
        strokeWidth="4"
      />
      <polygon
        points="60,155 120,175 180,155 168,245 72,245"
        fill="#050508"
        stroke="#FFD200"
        strokeWidth="2.5"
      />

      {/* Rostro sombreado y Visor #FFD200 + #D4FE00 */}
      <polygon
        points="76,74 164,74 152,148 120,164 88,148"
        fill="#050508"
        stroke="#000000"
        strokeWidth="3"
      />
      {/* Visor Táctico */}
      <polygon
        points="72,88 120,102 168,88 158,112 120,122 82,112"
        fill="#FFD200"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <polygon points="84,94 114,103 108,110 80,101" fill="#FFFFFF" />

      {/* Máscara Respirador con acento #D4FE00 */}
      <polygon
        points="92,126 148,126 140,156 120,166 100,156"
        fill="#E6002B"
        stroke="#000000"
        strokeWidth="2.5"
      />
      <rect x="106" y="138" width="28" height="6" fill="#D4FE00" />

      {/* Katana al hombro sobresaliendo a la derecha */}
      <path
        d="M158 142 L234 18 L222 12 L146 136 Z"
        fill="#FFD200"
        stroke="#000000"
        strokeWidth="3"
      />
      <line x1="154" y1="138" x2="228" y2="15" stroke="#FFFFFF" strokeWidth="2" />
    </svg>
  );
}
