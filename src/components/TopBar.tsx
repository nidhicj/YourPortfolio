'use client';
import { profile } from '@/data/profile';

interface TopBarProps {
  chapterNumber: string;
  chapterName: string;
  total: number;
}

export default function TopBar({ chapterNumber, chapterName, total }: TopBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        zIndex: 100,
        mixBlendMode: 'difference',
        pointerEvents: 'none',
      }}
    >
      <span style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: '13px', letterSpacing: '-0.01em', color: '#F8F6F2' }}>
        {profile.name}
</span>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#F8F6F2' }}>
        · {chapterName}
      </span>
    </div>
  );
}
