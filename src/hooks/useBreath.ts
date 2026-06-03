import { useEffect, useRef } from 'react';
import { breath } from '@/lib/theme';

type BreathType = 'headline' | 'link';
type BgType = 'light' | 'dark';
type ColorTuple = readonly [number, number, number, number];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function blendColor(lo: ColorTuple, hi: ColorTuple, t: number): string {
  const r = lerp(lo[0], hi[0], t);
  const g = lerp(lo[1], hi[1], t);
  const b = lerp(lo[2], hi[2], t);
  const a = lerp(lo[3], hi[3], t);
  return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a.toFixed(3)})`;
}

export function useBreath<T extends HTMLElement = HTMLElement>(opts: {
  type: BreathType;
  bg?: BgType;
}) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const bg = opts.bg ?? 'light';
    const range = breath.colors[opts.type][bg];

    let phase = 0;
    let active = false;
    let breathIntensity = 0;
    let rafId: number | null = null;

    function tick() {
      if (active) {
        phase += breath.speed;
        breathIntensity = Math.min(1, breathIntensity + 0.04);
      } else {
        breathIntensity = Math.max(0, breathIntensity - 0.025);
      }

      const sine = (Math.sin(phase) + 1) / 2;
      el!.style.color = blendColor(range.lo, range.hi, sine * breathIntensity);

      if (active || breathIntensity > 0.001) {
        rafId = requestAnimationFrame(tick);
      } else {
        el!.style.color = blendColor(range.lo, range.hi, 0);
        rafId = null;
      }
    }

    function onEnter() {
      active = true;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    function onLeave() {
      active = false;
      if (!rafId) rafId = requestAnimationFrame(tick);
    }

    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);

    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
      el.style.color = '';
    };
  }, [opts.type, opts.bg]);

  return { ref };
}
