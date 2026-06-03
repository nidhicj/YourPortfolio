import type { Chapter } from '@/data/chapters';
import { fonts, typo, space } from '@/lib/theme';
import { profile, labels } from '@/data/profile';
import { BreathText } from '@/components/BreathText';
import { BreathLink } from '@/components/BreathLink';

export default function Hero({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className="content absolute inset-0 grid"
      style={{
        padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
        gridTemplateColumns: '1fr 1fr',
        columnGap: '48px',
        alignItems: 'start',
      }}
    >
      {/* left: meta + headline */}
      <div>
        <p style={{
          fontFamily:    fonts.mono,
          fontSize:      typo.metaSize,
          letterSpacing: typo.metaLetterSpacing,
          textTransform: 'uppercase',
          color:         'rgba(0,0,0,0.3)',
          marginBottom:  `${space.metaGap}px`,
        }}>
          {profile.role} · {profile.location}
        </p>
        <BreathText as="h1" bg="light" style={{
          fontFamily:    fonts.clash,
          fontWeight:    700,
          fontSize:      typo.heroSize,
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
        }}>
          {chapter.title.split('\n').map((line, i, arr) => (
            <span key={i}>
              {i === 1
                ? <>{line.slice(0, -2)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-2)}</span></>
                : line}
              {i < arr.length - 1 && <br />}
            </span>
          ))}
        </BreathText>
      </div>

      {/* right: tagline + bio + contact */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: `${space.blockGap}px` }}>
        {chapter.tagline && (
          <blockquote style={{
            fontFamily:    fonts.clash,
            fontWeight:    700,
            fontSize:      typo.taglineSize,
            letterSpacing: '-0.03em',
            lineHeight:    1.05,
            color:         'rgba(10,10,10,0.88)',
          }}>
            {chapter.tagline.split('\n').map((l, i, arr) => (
              <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
            ))}
          </blockquote>
        )}
        {chapter.body && (
          <p style={{
            fontFamily:  fonts.satoshi,
            fontSize:    typo.bodySize,
            lineHeight:  typo.bodyLineHeight,
            fontWeight:  typo.bodyWeight,
            color:       'rgba(0,0,0,0.5)',
            maxWidth:    '360px',
          }}>
            {chapter.body}
          </p>
        )}
        {chapter.links && (
          <div>
            <p style={{
              fontFamily:    fonts.mono,
              fontSize:      typo.metaSize,
              letterSpacing: typo.metaLetterSpacing,
              textTransform: 'uppercase',
              color:         'rgba(252,163,17,0.7)',
              marginBottom:  '12px',
            }}>
              {labels.contact}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
              {chapter.links.map(l => (
                <BreathLink
                  key={l.label}
                  href={l.href}
                  bg="light"
                  style={{
                    fontFamily:    fonts.mono,
                    fontSize:      typo.metaSize,
                    letterSpacing: typo.linkLetterSpacing,
                    textTransform: 'uppercase',
                  }}
                >
                  {l.label}
                </BreathLink>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
