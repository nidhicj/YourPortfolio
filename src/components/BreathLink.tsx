'use client';
import { useBreath } from '@/hooks/useBreath';

type BgType = 'light' | 'dark';

interface BreathLinkProps {
  href: string;
  bg?: BgType;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export function BreathLink({ href, bg = 'light', style, children }: BreathLinkProps) {
  const { ref } = useBreath<HTMLAnchorElement>({ type: 'link', bg });
  return (
    <a ref={ref} href={href} style={{ textDecoration: 'none', ...style }}>
      {children}
    </a>
  );
}
