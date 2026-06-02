import type { Chapter } from '@/data/chapters';

export default function Cta({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '72px 64px 60px', gap: '48px', alignItems: 'end' }}>
      <div>
        {chapter.label && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.5)', marginBottom: '24px' }}>{chapter.label}</p>}
        <h2 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9, color: '#F8F6F2' }}>
          {chapter.title.split('\n').map((l, i, arr) => (
            <span key={i}>
              {i === arr.length - 1
                ? <>{l.slice(0, l.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{l.slice(l.lastIndexOf(' ') + 1)}</span></>
                : l}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h2>
        {chapter.links && (
          <div className="flex flex-wrap gap-6" style={{ marginTop: '36px' }}>
            {chapter.links.map(l => (
              <a key={l.label} href={l.href}
                style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(248,246,242,0.4)', textDecoration: 'none' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-amber)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(248,246,242,0.4)')}>
                {l.label}
              </a>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-end items-end gap-2">
        <p style={{ fontFamily: 'var(--font-clash)', fontSize: '13px', fontWeight: 600, color: 'rgba(248,246,242,0.2)', letterSpacing: '-0.01em' }}>Nidhi Joshi</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,246,242,0.12)' }}>Duluth, GA · Open to work</p>
      </div>
    </div>
  );
}
