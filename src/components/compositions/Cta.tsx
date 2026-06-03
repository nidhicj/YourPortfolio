import type { Chapter } from '@/data/chapters';
import { profile } from '@/data/profile';
import { BreathText } from '@/components/BreathText';
import { BreathLink } from '@/components/BreathLink';

export default function Cta({ chapter }: { chapter: Chapter }) {
  return (
    <div className="content absolute inset-0" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '72px 64px 60px', gap: '48px', alignItems: 'end' }}>
      <div>
        {chapter.label && <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(252,163,17,0.5)', marginBottom: '24px' }}>{chapter.label}</p>}
        <BreathText as="h2" bg="dark" style={{ fontFamily: 'var(--font-clash)', fontWeight: 700, fontSize: 'clamp(56px,7vw,100px)', letterSpacing: '-0.04em', lineHeight: 0.9 }}>
          {chapter.title.split('\n').map((l, i, arr) => (
            <span key={i}>
              {i === arr.length - 1
                ? <>{l.slice(0, l.lastIndexOf(' ') + 1)}<span style={{ color: 'var(--color-amber)' }}>{l.slice(l.lastIndexOf(' ') + 1)}</span></>
                : l}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </BreathText>
        {chapter.links && (
          <div className="flex flex-wrap gap-6" style={{ marginTop: '36px' }}>
            {chapter.links.map(l => (
              <BreathLink
                key={l.label}
                href={l.href}
                bg="dark"
                style={{
                  fontFamily:    'var(--font-mono)',
                  fontSize:      '10px',
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                }}
              >
                {l.label}
              </BreathLink>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-col justify-end items-end gap-2">
        <p style={{ fontFamily: 'var(--font-clash)', fontSize: '13px', fontWeight: 600, color: 'rgba(248,246,242,0.2)', letterSpacing: '-0.01em' }}>{profile.name}</p>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(248,246,242,0.12)' }}>{profile.location} · {profile.status}</p>
      </div>
    </div>
  );
}
