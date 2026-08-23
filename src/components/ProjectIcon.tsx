import React from "react";

interface ProjectIconProps {
  className?: string;
  size?: number;
}

export const ProjectIcon: React.FC<ProjectIconProps> = ({ className = "", size = 32 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={size}
      height={size}
      className={`select-none ${className}`}
    >
      <defs>
        <radialGradient id="compBgGrad" cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor="#0e3a5d" />
          <stop offset="45%" stopColor="#0c2340" />
          <stop offset="80%" stopColor="#030c1b" />
          <stop offset="100%" stopColor="#01060f" />
        </radialGradient>

        <radialGradient id="compTopGlow" cx="50%" cy="15%" r="60%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.35} />
          <stop offset="45%" stopColor="#38bdf8" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#0c2340" stopOpacity={0} />
        </radialGradient>

        <radialGradient id="compBookAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a5f3fc" stopOpacity={0.75} />
          <stop offset="35%" stopColor="#38bdf8" stopOpacity={0.4} />
          <stop offset="70%" stopColor="#0284c7" stopOpacity={0.12} />
          <stop offset="100%" stopColor="#0c2340" stopOpacity={0} />
        </radialGradient>

        <linearGradient id="compTextGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e0f2fe" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>

        {/* LAYER 4: Outermost Base Page (Set to what Layer 2 originally was) */}
        <linearGradient id="compGlass4" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cffafe" stopOpacity={0.55} />
          <stop offset="50%" stopColor="#a5f3fc" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.30} />
        </linearGradient>

        {/* LAYER 3: Equally spaced between Layer 4 and Layer 1 */}
        <linearGradient id="compGlass3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d9fbfb" stopOpacity={0.66} />
          <stop offset="50%" stopColor="#b2f5fb" stopOpacity={0.47} />
          <stop offset="100%" stopColor="#5cd2fa" stopOpacity={0.40} />
        </linearGradient>

        {/* LAYER 2: Equally spaced between Layer 4 and Layer 1 */}
        <linearGradient id="compGlass2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e3fdfe" stopOpacity={0.77} />
          <stop offset="50%" stopColor="#c1f8fc" stopOpacity={0.59} />
          <stop offset="100%" stopColor="#80e2fc" stopOpacity={0.50} />
        </linearGradient>

        {/* LAYER 1: Foreground Glass Pages (Unchanged Vibrant Luminous Ice Cyan) */}
        <linearGradient id="compGlass1" x1="20%" y1="0%" x2="80%" y2="100%">
          <stop offset="0%" stopColor="#ecfeff" stopOpacity={0.88} />
          <stop offset="40%" stopColor="#cffafe" stopOpacity={0.72} />
          <stop offset="100%" stopColor="#a5f3fc" stopOpacity={0.60} />
        </linearGradient>

        <linearGradient id="compNeonRimFront" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.95} />
          <stop offset="40%" stopColor="#a5f3fc" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.6} />
        </linearGradient>

        <linearGradient id="compNeonRimLayer2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity={0.90} />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity={0.75} />
        </linearGradient>

        <linearGradient id="compNeonRimOuter" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#cffafe" stopOpacity={0.85} />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity={0.60} />
        </linearGradient>

        <linearGradient id="compNeonRimBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.80} />
          <stop offset="100%" stopColor="#0284c7" stopOpacity={0.45} />
        </linearGradient>
      </defs>

      {/* Base Icon Background */}
      <rect width="480" height="480" x="16" y="16" rx="112" fill="url(#compBgGrad)" stroke="#0284c7" strokeWidth={2.5} strokeOpacity={0.35} />
      <rect width="480" height="480" x="16" y="16" rx="112" fill="url(#compTopGlow)" />

      {/* Atmosphere Sparkles */}
      <circle cx="95" cy="110" r={3} fill="#a5f3fc" opacity={0.6} />
      <circle cx="415" cy="110" r={3} fill="#a5f3fc" opacity={0.6} />
      <circle cx="256" cy="48" r={2.5} fill="#ffffff" opacity={0.75} />

      {/* "EGW" Sans-Serif Typographic Wordmark */}
      <g id="egw-typography-comp">
        <text
          x="256"
          y="152"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"
          fontSize="104"
          fontWeight="900"
          letterSpacing="10"
          fill="#38bdf8"
          opacity={0.4}
        >EGW</text>

        <text
          x="256"
          y="152"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, 'Plus Jakarta Sans', 'Inter', 'Segoe UI', sans-serif"
          fontSize="104"
          fontWeight="900"
          letterSpacing="10"
          fill="url(#compTextGrad)"
          stroke="#0284c7"
          strokeWidth="1.5"
          strokeOpacity={0.5}
        >EGW</text>

        {/* Elegant Accent Pip & Line */}
        <circle cx="256" cy="190" r={3} fill="#67e8f9" opacity={0.9} />
        <line x1="186" y1="190" x2="238" y2="190" stroke="#38bdf8" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
        <line x1="274" y1="190" x2="326" y2="190" stroke="#38bdf8" strokeWidth={1.5} strokeLinecap="round" opacity={0.45} />
      </g>

      {/* SHRUNK OPEN BOOK (70% scale, positioned at bottom center) */}
      <g transform="matrix(0.7 0 0 0.7 76.8 163)">
        <circle cx="256" cy="270" r="160" fill="url(#compBookAura)" />

        {/* LAYER 4: Outermost Base Page */}
        <g opacity={0.90}>
          <path
            d="M 256,408 C 215,400 115,398 46,378 C 38,375 34,367 34,358 L 34,200 C 34,190 42,184 52,188 C 118,208 218,212 256,260 Z"
            fill="url(#compGlass4)"
            stroke="url(#compNeonRimBase)"
            strokeWidth={3}
            strokeLinejoin="round"
          />
          <path
            d="M 256,408 C 297,400 397,398 466,378 C 474,375 478,367 478,358 L 478,200 C 478,190 470,184 460,188 C 394,208 294,212 256,260 Z"
            fill="url(#compGlass4)"
            stroke="url(#compNeonRimBase)"
            strokeWidth={3}
            strokeLinejoin="round"
          />
        </g>

        {/* LAYER 3: Outer Spread Page (Equally Spaced, Lightened) */}
        <g opacity={0.93}>
          <path
            d="M 256,410 C 210,395 125,385 64,360 C 56,357 52,348 52,340 L 52,168 C 52,158 60,152 70,156 C 130,178 215,190 256,238 Z"
            fill="url(#compGlass3)"
            stroke="url(#compNeonRimOuter)"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
          <path
            d="M 256,410 C 302,395 387,385 448,360 C 456,357 460,348 460,340 L 460,168 C 460,158 452,152 442,156 C 382,178 297,190 256,238 Z"
            fill="url(#compGlass3)"
            stroke="url(#compNeonRimOuter)"
            strokeWidth={3.5}
            strokeLinejoin="round"
          />
        </g>

        {/* LAYER 2: Middle Translucent Glass Pages (Equally Spaced, Lightened) */}
        <g opacity={0.96}>
          <path
            d="M 256,412 C 205,392 135,370 82,342 C 74,338 70,329 70,320 L 70,136 C 70,126 78,120 88,124 C 142,148 210,165 256,215 Z"
            fill="url(#compGlass2)"
            stroke="url(#compNeonRimLayer2)"
            strokeWidth={4}
            strokeLinejoin="round"
          />
          <path
            d="M 256,412 C 307,392 377,370 430,342 C 438,338 442,329 442,320 L 442,136 C 442,126 434,120 424,124 C 370,148 302,165 256,215 Z"
            fill="url(#compGlass2)"
            stroke="url(#compNeonRimLayer2)"
            strokeWidth={4}
            strokeLinejoin="round"
          />
        </g>

        {/* LAYER 1: Foreground Glass Pages (Center pages: Unchanged vibrant luminous color) */}
        <g>
          <path
            d="M 256,418 C 218,375 140,348 106,310 C 98,301 96,290 96,280 L 96,98 C 96,87 106,80 116,84 C 158,102 225,135 256,182 Z"
            fill="url(#compGlass1)"
            stroke="url(#compNeonRimFront)"
            strokeWidth={4.5}
            strokeLinejoin="round"
          />
          <path
            d="M 256,418 C 294,375 372,348 406,310 C 414,301 416,290 416,280 L 416,98 C 416,87 406,80 396,84 C 354,102 287,135 256,182 Z"
            fill="url(#compGlass1)"
            stroke="url(#compNeonRimFront)"
            strokeWidth={4.5}
            strokeLinejoin="round"
          />

          {/* Center Spine Flare */}
          <path d="M 256,182 L 256,424" stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" opacity={0.9} />

          {/* Top Gleam Accents */}
          <path d="M 106,94 C 120,87 140,94 154,102" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.95} />
          <circle cx="106" cy="94" r={5} fill="#ffffff" />

          <path d="M 406,94 C 392,87 372,94 358,102" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.95} />
          <circle cx="366" cy="96" r={6} fill="#ffffff" />
          <circle cx="366" cy="96" r={14} fill="#a5f3fc" opacity={0.4} />

          {/* Inner Refraction Arcs */}
          <path d="M 125,120 C 170,145 220,172 245,210" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />
          <path d="M 387,120 C 342,145 292,172 267,210" fill="none" stroke="#ffffff" strokeWidth={2} strokeLinecap="round" opacity={0.6} />

          {/* Base Spine Glow */}
          <path d="M 224,428 C 242,434 270,434 288,428" fill="none" stroke="#38bdf8" strokeWidth={5} strokeLinecap="round" opacity={0.8} />
        </g>
      </g>
    </svg>
  );
};
