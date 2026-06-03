import DemoZone from '@/components/DemoZone';
import type { Chapter } from '@/data/chapters';
import { BreathText } from '@/components/BreathText';

/* Lumen-style: amber rail left, content + demo right */
export default function Bilateral({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{display: 'grid', gridTemplateColumns: '52px 1fr' }}>
      {/* rail */}
      <div className="flex flex-col items-center justify-end pb-16 gap-3">
        <div style={{ width: '1px', flex: 1, maxHeight: '200px', background: 'rgba(252,163,17,0.22)' }} />
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '0.22em', textTransform: 'uppercase', writingMode: 'vertical-rl', color: 'rgba(252,163,17,0.3)' }}>
          RAG
        </span>
      </div>

      {/* main */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '80px 64px 60px 44px', gap: '40px', alignItems: 'end' }}>
        <div>
          {chapter.label && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.5)', marginBottom: '20px' }}>{chapter.label}</p>}
          <BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(60px,7.5vw,104px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
            {chapter.title}
          </BreathText>
          {chapter.tech && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.4)', margin: '16px 0 20px' }}>{chapter.tech}</p>}
          {chapter.body && <p style={{ fontFamily: 'var(--font-satoshi)', fontSize: '17px', lineHeight: 1.72, fontWeight: 300, color: 'rgba(248,246,242,0.45)' }}>{chapter.body}</p>}
        </div>
        {chapter.demo && <div className="flex flex-col justify-end"><DemoZone style={{ height: '300px', width: '100%' }} /></div>}
      </div>
    </div>
  );
}
