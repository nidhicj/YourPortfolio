import type { Chapter } from '@/data/chapters';
import { fonts, typo, space } from '@/lib/theme';
import { profile, labels } from '@/data/profile';
import { BreathText } from '@/components/BreathText';
import { BreathSpan } from '@/components/BreathSpan';
import { BreathLink } from '@/components/BreathLink';
import { PhotoHover } from '@/components/PhotoHover';
import { HeroTile } from '@/components/HeroTile';

export default function Hero({ chapter }: { chapter: Chapter }) {
  return (
    <div
      className="content absolute inset-0 grid"
      style={{
        padding: `${space.panelTop}px ${space.panelX}px ${space.panelBottom}px`,
        gridTemplateColumns: '1fr 1fr',
        gridTemplateRows: 'auto auto auto',
        columnGap: '48px',
        rowGap: '32px',
        alignItems: 'start',
      }}
    >
      {/* left: meta + headline */}
      <div style={{ gridColumn: '1', gridRow: '1' }}>
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
        <h1 style={{
          fontFamily:    fonts.clash,
          fontWeight:    700,
          fontSize:      typo.heroSize,
          letterSpacing: '-0.04em',
          lineHeight:    0.88,
        }}>
          {chapter.title.split('\n').map((line, i) => (
            <span key={i} style={{
              fontSize:      i === 1 ? typo.heroSize : 'clamp(28px, 3vw, 42px)',
              display:       'block',
              letterSpacing: i === 0 ? '0.001em' : '-0.04em',
              wordSpacing:   i === 0 ? '0.4em' : 'normal',
            }}>
              {i === 1
                ? <BreathSpan bg="light">
                    {line.slice(0, -3)}<span style={{ color: 'var(--color-amber)' }}>{line.slice(-3)}</span>
                  </BreathSpan>
                : line}
            </span>
          ))}
        </h1>
        {chapter.role && (
          <blockquote style={{
            marginTop: '24px',   // ← add this
            fontFamily:    fonts.clash,
            fontWeight:    700,
            fontSize:      typo.roleSize,
            letterSpacing: '-0.01em',
            lineHeight:    1.05,
            color:         'rgba(0, 0, 0, 0.88)',
            maxWidth:    '400px',
          }}>
            {chapter.role.split('\n').map((l, i, arr) => (
              <span key={i}>
      {l.includes('Robotics')
        ? <>{l.split('Robotics')[0]}<span style={{ color: 'var(--color-amber)' 
  }}>Robotics</span>{l.split('Robotics')[1]}</>
        : l}
      {i < arr.length - 1 && <br />}
    </span>

            ))}
          </blockquote>
        )}
        </div>

        <div style={{ gridColumn: '1', gridRow: '2' }}>
        {chapter.tagline && (
          <blockquote style={{
            fontFamily:    fonts.clash,
            fontWeight:    700,
            fontSize:      typo.taglineSize,
            letterSpacing: '0.001em',
            lineHeight:    1.05,
            color:         'rgba(0, 0, 0, 0.88)',
            maxWidth:    '480px',
            textAlign: 'justify',
          }}>
            {chapter.tagline.split('\n').map((l, i, arr) => (
              <span key={i}>{l}{i < arr.length - 1 && <br />}</span>
            ))}
          </blockquote>
        )}

        {chapter.body && (
          <p style={{
            marginTop: '28px',   // ← add this
            fontFamily:  fonts.clash,
            fontSize:    typo.bodySize,
            lineHeight:  typo.bodyLineHeight,
            fontWeight:  typo.bodyWeight,
            color:       'rgba(0,0,0,0.5)',
            maxWidth:    '500px',
            textAlign: 'justify',
          }}>
            {chapter.body}
          </p>
        )}
      </div>


      {/* right: tagline + bio + contact */}

      <div style={{ gridColumn: '2', gridRow: '1' }}>
        <PhotoHover />
      </div>
      <div style={{
          gridColumn: '2',
          gridRow: '2',
          display: 'grid',
          gridTemplateColumns: '200px 200px',
          gap: '16px',
        }}>

          <HeroTile label="Blog" sub="I've got opinions" bg="#14213d" />
          <HeroTile label="My Work →" sub="Scroll to explore" bg="var(--color-amber)" />
      </div>

      <div style={{ gridColumn: '2', gridRow: '3', display: 'flex', flexDirection: 'column', gap: `${space.blockGap}px` }}>
        
        {chapter.links && (
          <div>
            <p style={{
              fontFamily:    fonts.mono,
              fontSize:      typo.metaSize,
              letterSpacing: typo.metaLetterSpacing,
              textTransform: 'uppercase',
              color:         'rgba(252,163,17,0.7)',
              marginBottom:  '0px',
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
