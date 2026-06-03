import DemoZone from '@/components/DemoZone';
import type { Chapter } from '@/data/chapters';
import { BreathText } from '@/components/BreathText';

/* AutoDoc-style: content left, ghost accent + demo right */
export default function ReadingRoom({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '72px 64px 60px', gap: '48px', alignItems: 'end' }}>
      {/* left */}
      <div>
        {chapter.label && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.5)', marginBottom: '20px' }}>{chapter.label}</p>}
        <BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(60px,7.5vw,104px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
          {chapter.title}
        </BreathText>
        {chapter.tech && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.4)', margin: '16px 0 20px' }}>{chapter.tech}</p>}
        {chapter.body && <p style={{ fontFamily: 'var(--font-satoshi)', fontSize: '17px', lineHeight: 1.72, fontWeight: 300, color: 'rgba(248,246,242,0.45)' }}>{chapter.body}</p>}
      </div>
      {/* right: ghost text + demo */}
      <div className="flex flex-col justify-end items-end gap-6">
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', writingMode: 'vertical-rl', color: 'rgba(248,246,242,0.06)' }}>
          {chapter.tech}
        </span>
        <div style={{ width: '1px', height: '80px', background: 'rgba(252,163,17,0.2)' }} />
        {chapter.demo && <DemoZone style={{ width: '100%', height: '260px' }} />}
      </div>
    </div>
  );
}
