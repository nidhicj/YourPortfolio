'use client';
import { useState } from 'react';
import { fonts } from '@/lib/theme';

interface HeroTileProps {
  label: string;
  sub: string;
  bg: string;
  color?: string;
}

export function HeroTile({ label, sub, bg, color = '#F8F6F2' }: HeroTileProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ perspective: '600px', height: '160px', marginTop: '44px', cursor: 'pointer' }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transform: hovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
        transition: 'transform 0.5s ease',
        transformStyle: 'preserve-3d',
      }}>

        {/* FRONT */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflow: 'hidden',
        }}>
          <p style={{
            fontFamily: fonts.clash,
            fontWeight: 700,
            fontSize: '38px',
            lineHeight: 0.9,
            color,
            margin: 0,
          }}>
            {label}
          </p>
        </div>

        {/* BACK */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          overflow: 'hidden',
        }}>
          <p style={{
            fontFamily: fonts.clash,
            fontWeight: 600,
            fontSize: '16px',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            color,
            margin: 0,
            textAlign: 'center',
          }}>
            {sub}
          </p>
        </div>

      </div>
    </div>
  );
}
