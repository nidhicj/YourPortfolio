import type { Chapter } from '@/data/chapters';

interface DemoZoneProps {
  chapter?: Chapter;
  className?: string;
  style?: React.CSSProperties;
}

export default function DemoZone({ chapter, className = '', style }: DemoZoneProps) {
  const appLink = chapter?.links?.[0];
  const Wrapper = appLink ? 'a' : 'div';

  return (
    <Wrapper
      {...(appLink ? { href: appLink.href, target: '_blank', rel: 'noopener noreferrer' } : {})}
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        border: '1px solid rgba(252,163,17,0.14)',
        cursor: appLink ? 'pointer' : 'default',
        textDecoration: 'none',
        ...style,
      }}
    >
      {/* corner marks */}
      <span className="absolute top-3 left-3 w-3 h-3 z-10"
        style={{ borderTop: '1px solid rgba(252,163,17,0.35)', borderLeft: '1px solid rgba(252,163,17,0.35)' }} />
      <span className="absolute bottom-3 right-3 w-3 h-3 z-10"
        style={{ borderBottom: '1px solid rgba(252,163,17,0.35)', borderRight: '1px solid rgba(252,163,17,0.35)' }} />

      {chapter?.video ? (
        <video
          src={chapter.video}
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <p style={{
          fontFamily: 'var(--font-mono)', fontSize: '9px',
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(252,163,17,0.22)', textAlign: 'center', lineHeight: 2,
        }}>
          Demo Image<br />or Link<br />or Video
        </p>
      )}
    </Wrapper>
  );
}
