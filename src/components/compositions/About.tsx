import type { Chapter } from '@/data/chapters';

export default function About({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '72px 64px 60px', gap: '48px', alignItems: 'end' }}>
      <div>
        {chapter.label && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)', marginBottom: '24px' }}>{chapter.label}</p>}
        <h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,96px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#000' }}>
          {chapter.title.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.title.split('\n').length - 1 && <br />}</span>)}
        </h2>
        {chapter.body && <p style={{ fontFamily: 'var(--font-satoshi)', fontSize: '17px', lineHeight: 1.72, fontWeight: 300, color: 'rgba(0,0,0,0.5)', marginTop: '20px' }}>{chapter.body}</p>}
      </div>

      <div className="flex flex-col justify-end gap-0">
        {chapter.experience && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '18px', marginBottom: '16px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.6)', marginBottom: '10px' }}>Experience</p>
            <p style={{ fontFamily: 'var(--font-clash)', fontSize: '20px', fontWeight: 600, color: '#000', letterSpacing: '-0.02em' }}>{chapter.experience.company}</p>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)', marginTop: '6px' }}>
              {chapter.experience.role} · {chapter.experience.period} · {chapter.experience.location}
            </p>
          </div>
        )}
        {chapter.education && (
          <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '18px' }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.6)', marginBottom: '10px' }}>Education</p>
            {chapter.education.map(e => (
              <div key={e.school} style={{ marginBottom: '8px' }}>
                <p style={{ fontFamily: 'var(--font-clash)', fontSize: '17px', fontWeight: 600, color: '#000', letterSpacing: '-0.02em' }}>{e.degree}</p>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.3)', marginTop: '3px' }}>{e.school} · {e.years}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
