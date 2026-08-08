'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface SiteLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  inverse?: boolean;
}

export function SiteLogo({ className = '', size = 'md', inverse = false }: SiteLogoProps) {
  const [imgError, setImgError] = useState(false);

  // High-resolution display dimensions
  const heights = {
    sm: 36,
    md: 48,
    lg: 64,
    xl: 84
  };

  const currentHeight = heights[size] || 48;

  if (!imgError) {
    return (
      <div className={`inline-flex items-center select-none ${className}`}>
        {/* Official EHS Master Logo Image */}
        <Image
          src="/images/ehs-master-logo.png"
          alt="Easy HomeSource - Home Made Easy"
          width={currentHeight * 1.6}
          height={currentHeight}
          priority
          className="h-auto max-h-full w-auto object-contain drop-shadow-2xs"
          style={{ height: `${currentHeight}px`, width: 'auto' }}
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Vector Fallback
  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        height={currentHeight}
        viewBox="0 0 400 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-auto max-w-full drop-shadow-2xs"
      >
        {/* Chimney */}
        <path d="M100 48 V105 H128 V65 Z" fill={inverse ? '#FFFFFF' : '#0B1E38'} />

        {/* Roofline Gable */}
        <path
          d="M200 18 L34 148 L56 166 L200 52 L344 166 L366 148 Z"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />

        {/* EHS Lettering: E (3 light blue horizontal stripes) */}
        <g id="letter-E">
          <rect x="36" y="176" width="94" height="24" rx="3" fill="#BAE6FD" />
          <rect x="36" y="212" width="94" height="24" rx="3" fill="#7DD3FC" />
          <rect x="36" y="248" width="94" height="24" rx="3" fill="#38BDF8" />
        </g>

        {/* Letter H */}
        <path
          d="M152 176 H182 V219 H218 V176 H248 V272 H218 V241 H182 V272 H152 Z"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />

        {/* Letter S - Smooth bold curve */}
        <path
          d="M344 196 C336 182 320 174 298 174 C272 174 256 188 256 208 C256 226 270 236 294 241 L308 244 C322 247 328 252 328 259 C328 266 318 272 302 272 C284 272 270 264 262 250 L242 262 C254 282 276 294 302 294 C334 294 354 278 354 257 C354 237 338 226 314 221 L298 218 C286 215 280 210 280 204 C280 197 290 192 302 192 C316 192 328 198 334 208 Z"
          fill={inverse ? '#FFFFFF' : '#0B1E38'}
        />

        {/* Subtitle */}
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

        {/* Tagline Banner */}
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
