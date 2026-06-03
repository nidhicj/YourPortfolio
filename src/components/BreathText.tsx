'use client';
import { useBreath } from '@/hooks/useBreath';

type HeadingTag = 'h1' | 'h2' | 'h3';
type BgType = 'light' | 'dark';

interface BreathTextProps {
  as?: HeadingTag;
  bg?: BgType;
  style?: React.CSSProperties;
  className?: string;
  children: React.ReactNode;
}

export function BreathText({ as: Tag = 'h2', bg = 'light', style, className, children }: BreathTextProps) {
  const { ref } = useBreath<HTMLHeadingElement>({ type: 'headline', bg });
  return (
    <Tag ref={ref as React.RefObject<HTMLHeadingElement>} style={style} className={className}>
      {children}
    </Tag>
  );
}
