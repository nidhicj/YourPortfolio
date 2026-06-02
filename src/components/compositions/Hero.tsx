import type { Chapter } from '@/data/chapters';

const P = { padding: '72px 64px 60px' } as const;

export default function Hero({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0 grid gap-12" style={{
      ...P,
      gridTemplateColumns: '1fr 1fr',
      alignItems: 'end',

    }}>
      {/* left: title */}
      <div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.3)', marginBottom: '28px' }}>
          AI/ML Engineer · Duluth, GA
        </p>
        <h1 style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(72px,9vw,128px)', letterSpacing: '-0.04em', lineHeight: 0.88, color: '#000' }}>
          {chapter.title.split('\n').map((line, i, arr) => (
            <span key={i}>
              {i === 1 ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></> : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </h1>
      </div>

      {/* right: tagline + bio + contact */}
      <div className="flex flex-col justify-end gap-8">
        {chapter.tagline && (
          <blockquote style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(28px,3.2vw,46px)', letterSpacing: '-0.03em', lineHeight: 1.05, color: '#000' }}>
            {chapter.tagline.split('\n').map((l, i) => <span key={i}>{l}{i < chapter.tagline!.split('\n').length - 1 && <br />}</span>)}
          </blockquote>
        )}
        {chapter.body && (
          <p style={{ fontFamily: 'var(--font-satoshi)', fontSize: '17px', lineHeight: 1.72, fontWeight: 300, color: 'rgba(0,0,0,0.5)', maxWidth: '360px' }}>
            {chapter.body}
          </p>
        )}
        {chapter.links && (
          <div>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.7)', marginBottom: '12px' }}>
              Contact
            </p>
            <div className="flex flex-wrap gap-6">
              {chapter.links.map(l => (
                <a key={l.label} href={l.href} style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.4)', textDecoration: 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--color-amber)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(0,0,0,0.4)')}>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
