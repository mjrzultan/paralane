import React, { useId } from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  const uniqueId = useId().replace(/:/g, '-');
  const outerGradId = `outer-lane-grad-${uniqueId}`;
  const innerGradId = `inner-lane-grad-${uniqueId}`;
  const sparkGlowId = `cute-spark-glow-${uniqueId}`;
  const shadowId = `cute-logo-shadow-${uniqueId}`;

  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: `${size}px`, height: `${size}px` }}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full select-none"
      >
        <defs>
          {/* Soft glow filter for the spark */}
          <filter id={sparkGlowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feColorMatrix type="matrix" values="0 0 0 0 0.14  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Gradients for parallel lanes */}
          <linearGradient id={outerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#25FFFF" />
            <stop offset="100%" stopColor="#00A3A3" />
          </linearGradient>

          <linearGradient id={innerGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00A3A3" />
            <stop offset="100%" stopColor="#005858" />
          </linearGradient>

          {/* Soft drop shadow for overall logo depth */}
          <filter id={shadowId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#000000" floodOpacity="0.4" />
          </filter>
        </defs>

        <g filter={`url(#${shadowId})`}>
          {/* Outer Parallel Track (forms outer 'P' loop) */}
          <path
            d="M 36,74 L 36,42 C 36,24 64,24 64,42 C 64,60 36,60 36,60"
            stroke={`url(#${outerGradId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Inner Parallel Track (runs perfectly in parallel inside) */}
          <path
            d="M 46,74 L 46,42 C 46,33 54,33 54,42 C 54,51 46,51 46,51"
            stroke={`url(#${innerGradId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.9"
          />

          {/* Cute glowing data-packet spark floating in the center of the inner lane loop */}
          <circle
            cx="50"
            cy="42"
            r="3.5"
            fill="#FFFFFF"
            filter={`url(#${sparkGlowId})`}
            className="animate-pulse"
          />
        </g>
      </svg>
    </div>
  );
}
