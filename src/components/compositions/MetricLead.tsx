import DemoZone from '@/components/DemoZone';
import type { Chapter } from '@/data/chapters';

/* Weed Detection: huge metric top-left, title + demo bottom */
export default function MetricLead({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{padding: '60px 64px 60px' }}>
      {chapter.label && (
        <p style={{ position: 'absolute', top: '68px', left: '64px', fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.5)' }}>{chapter.label}</p>
      )}

      {/* metric dominates */}
      {chapter.metric && (
        <div style={{ position: 'absolute', top: '52px', left: '52px' }}>
          <span style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(96px,13vw,176px)', letterSpacing: '-0.04em', lineHeight: 0.85, color: 'var(--color-amber)' }}>
            {chapter.metric}
          </span>
        </div>
      )}

      {/* title + tech — bottom-left */}
      <div style={{ position: 'absolute', bottom: '60px', left: '64px', width: '44%' }}>
        <h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(48px,5.5vw,80px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>
          {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
        </h2>
        {chapter.tech && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.4)', margin: '14px 0 16px' }}>{chapter.tech}</p>}
        {chapter.body && <p style={{ fontFamily: 'var(--font-satoshi)', fontSize: '16px', lineHeight: 1.72, fontWeight: 300, color: 'rgba(248,246,242,0.45)' }}>{chapter.body}</p>}
      </div>

      {/* demo + stats — bottom-right */}
      <div style={{ position: 'absolute', bottom: '60px', right: '64px', width: '46%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {chapter.demo && <DemoZone style={{ height: '220px', width: '100%' }} />}
        {chapter.stats && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {chapter.stats.map(s => (
              <div key={s.label}>
                <p style={{ fontFamily: 'var(--font-clash)', fontSize: '26px', fontWeight: 700, color: 'var(--color-amber)', lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,246,242,0.3)', marginTop: '4px' }}>{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
