interface DemoZoneProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function DemoZone({ className = '', style }: DemoZoneProps) {
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${className}`}
      style={{
        border: '1px solid rgba(252,163,17,0.14)',
        ...style,
      }}
    >
      {/* corner marks */}
      <span className="absolute top-3 left-3 w-3 h-3"
        style={{ borderTop: '1px solid rgba(252,163,17,0.35)', borderLeft: '1px solid rgba(252,163,17,0.35)' }} />
      <span className="absolute bottom-3 right-3 w-3 h-3"
        style={{ borderBottom: '1px solid rgba(252,163,17,0.35)', borderRight: '1px solid rgba(252,163,17,0.35)' }} />

      <p style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '9px',
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: 'rgba(252,163,17,0.22)',
        textAlign: 'center',
        lineHeight: 2,
      }}>
        Demo Image<br />or Link<br />or Video
      </p>
    </div>
  );
}
