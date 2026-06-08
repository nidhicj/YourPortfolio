'use client';
import { useBreath } from '@/hooks/useBreath';

type BgType = 'light' | 'dark';

interface BreathSpanProps {
  bg?: BgType;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function BreathSpan({ bg = 'light', style, children }: BreathSpanProps) {
  const { ref } = useBreath<HTMLSpanElement>({ type: 'headline', bg });
  return (
    <span ref={ref} style={style}>
      {children}
    </span>
  );
}
