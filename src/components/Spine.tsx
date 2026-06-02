import type { Chapter } from '@/data/chapters';

const numColor: Record<string, string> = {
  cream: 'rgba(0,0,0,0.38)',
  black: 'rgba(252,163,17,0.5)',
  navy:  'rgba(252,163,17,0.5)',
};
const nameColor: Record<string, string> = {
  cream: 'rgba(0,0,0,0.55)',
  black: 'rgba(248,246,242,0.55)',
  navy:  'rgba(248,246,242,0.55)',
};

interface SpineProps {
  chapter: Chapter;
  isActive: boolean;
}

export default function Spine({ chapter, isActive }: SpineProps) {
  return (
    <div
      className="spine absolute inset-0 flex flex-col items-center justify-center gap-4 pointer-events-none"
      style={{
        opacity: isActive ? 0 : 1,
        transition: 'opacity 0.25s',
        zIndex: 5,
      }}
    >
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '11px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        writingMode: 'vertical-rl',
        color: numColor[chapter.bg],
      }}>
        {chapter.number}
      </span>
      <span style={{
        fontFamily: 'var(--font-clash)',
        fontSize: '13px',
        fontWeight: 600,
        writingMode: 'vertical-rl',
        letterSpacing: '-0.01em',
        color: nameColor[chapter.bg],
      }}>
        {chapter.name}
      </span>
    </div>
  );
}
