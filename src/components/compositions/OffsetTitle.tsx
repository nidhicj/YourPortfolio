import DemoZone from '@/components/DemoZone';
import type { Chapter } from '@/data/chapters';
import { BreathText } from '@/components/BreathText';

/* Projection Mapper: title top-right, demo mid-left, desc bottom */
export default function OffsetTitle({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{position: 'relative', padding: '72px 64px 60px' }}>
      {chapter.label && (
        <p style={{ position: 'absolute', top: '80px', left: '64px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.5)' }}>{chapter.label}</p>
      )}

      {/* title — top-right intentionally */}
      <div style={{ position: 'absolute', top: '100px', right: '64px', textAlign: 'right' }}>
        <BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
          {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
        </BreathText>
        {chapter.tech && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.4)', marginTop: '16px', textAlign: 'right' }}>{chapter.tech}</p>}
      </div>

      {/* demo — mid-left */}
      {chapter.demo && (
        <DemoZone style={{ position: 'absolute', top: '110px', left: '64px', width: '40%', height: '240px' }} />
      )}

      {/* desc — bottom-left */}
      {chapter.body && (
        <p style={{ position: 'absolute', bottom: '60px', left: '64px', width: '48%', fontFamily: 'var(--font-satoshi)', fontSize: '17px', lineHeight: 1.72, fontWeight: 300, color: 'rgba(248,246,242,0.45)' }}>
          {chapter.body}
        </p>
      )}
    </div>
  );
}
