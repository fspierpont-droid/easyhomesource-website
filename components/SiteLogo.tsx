'use client';

import React from 'react';
import Image from 'next/image';

interface SiteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverse?: boolean;
}

export function SiteLogo({ className = '', size = 'md', inverse = false }: SiteLogoProps) {
  // Exact high-resolution vector dimensions
  const heights = {
    sm: 36,
    md: 48,
    lg: 64,
    xl: 84
  };

  const currentHeight = heights[size] || 48;

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      {/* Official Master Vector Logo */}
      <svg
        height={currentHeight}
        viewBox="0 0 400 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto max-w-full drop-shadow-2xs"
      >
        {/* Chimney on left roof pitch */}
        <path d="M100 48 V105 H128 V65 Z" fill={inverse ? '#FFFFFF' : '#0B1E38'} />

        {/* Roofline Gable Peak */}
        <path
          d="M200 18 L34 148 L56 166 L200 52 L344 166 L366 148 Z"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />

        {/* EHS Lettering */}
        {/* Letter 'E' - 3 Cyan/Blue Horizontal Bars */}
        <g id="letter-E">
          {/* Top Bar */}
          <rect x="36" y="176" width="94" height="24" rx="3" fill="#BAE6FD" />
          {/* Middle Bar */}
          <rect x="36" y="212" width="94" height="24" rx="3" fill="#7DD3FC" />
          {/* Bottom Bar */}
          <rect x="36" y="248" width="94" height="24" rx="3" fill="#38BDF8" />
        </g>

        {/* Letter 'H' - Solid Heavy Black */}
        <path
          d="M152 176 H182 V219 H218 V176 H248 V272 H218 V241 H182 V272 H152 Z"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />

        {/* Letter 'S' - Solid Heavy Black */}
        <path
          d="M344 196 C336 182 320 174 298 174 C272 174 256 188 256 208 C256 226 270 236 294 241 L308 244 C322 247 328 252 328 259 C328 266 318 272 302 272 C284 272 270 264 262 250 L242 262 C254 282 276 294 302 294 C334 294 354 278 354 257 C354 237 338 226 314 221 L298 218 C286 215 280 210 280 204 C280 197 290 192 302 192 C316 192 328 198 334 208 Z"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />

        {/* Subtitle: EASY HOMESOURCE */}
        <text
          x="200"
          y="312"
          textAnchor="middle"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="23"
          letterSpacing="4"
        >
          EASY HOMESOURCE
        </text>

        {/* Bottom Tagline Badge: HOME MADE EASY */}
        <rect
          x="44"
          y="324"
          width="312"
          height="32"
          rx="5"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />
        <text
          x="200"
          y="346"
          textAnchor="middle"
          fill={inverse ? '#0B1E38' : '#FFFFFF'}
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="15"
          letterSpacing="4.5"
        >
          HOME MADE EASY
        </text>
      </svg>
    </div>
  );
}
