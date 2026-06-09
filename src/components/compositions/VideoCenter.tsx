import type { Chapter } from '@/data/chapters';
import { fonts, typo, space } from '@/lib/theme';

export default function VideoCenter({ chapter }: { chapter: Chapter }) {
  const link = chapter.links?.[0];

  return (
    <div
      className="content absolute inset-0"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: `50px ${space.panelX}px ${space.panelBottom}px`,
        gap: '40px',
      }}
    >
      {/* title */}
      <h2 style={{
        fontFamily:    fonts.clash,
        fontWeight:    700,
        fontSize:      'clamp(48px, 6vw, 88px)',
        letterSpacing: '-0.04em',
        lineHeight:    0.9,
        textAlign:     'center',
      }}>
        {chapter.title}
      </h2>

      {/* body */}
      {chapter.body && (
        <p style={{
          fontFamily:  fonts.satoshi,
          fontSize:    '17px',
          lineHeight:  1.72,
          fontWeight:  700,
          color:       'rgba(248,246,242,0.45)',
          textAlign:   'justify',
          maxWidth:    '940px',
          width:       '100%',
        }}>
          {chapter.body}
        </p>
      )}

      {/* video wrapped in link */}
      {chapter.video && (
        link ? (
          <a
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', width: '100%', maxWidth: '640px', cursor: 'pointer' }}
          >
            <video
              src={chapter.video}
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
          </a>
        ) : (
          <video
            src={chapter.video}
            autoPlay
            loop
            muted
            playsInline
            style={{ width: '100%', maxWidth: '640px', height: 'auto', display: 'block' }}
          />
        )
      )}
    </div>
  );
}
