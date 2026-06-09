import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { layout, anim, collapsedVw } from '@/lib/theme';

export const ACTIVE_VW    = layout.activeVw;
export const N_CHAPTERS   = layout.nChapters;
export const COLLAPSED_VW = collapsedVw;
export const DWELL        = layout.dwell;

export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

export function panelWidth(i: number, activeIdx: number, t: number): number {
  if (i === activeIdx)     return ACTIVE_VW - (ACTIVE_VW - COLLAPSED_VW) * t;
  if (i === activeIdx + 1) return COLLAPSED_VW + (ACTIVE_VW - COLLAPSED_VW) * t;
  return COLLAPSED_VW;
}

let lenisInstance: Lenis | null = null;

export function createLenis(): Lenis {
  if (lenisInstance) lenisInstance.destroy();

  lenisInstance = new Lenis({
    duration:        anim.lenisDuration,
    easing:          (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:     true,
    wheelMultiplier: anim.lenisWheelMult,
  });

  const tickerCallback = (time: number) => lenisInstance?.raf(time * 1000);
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  (lenisInstance as Lenis & { _tickerCb: typeof tickerCallback })._tickerCb = tickerCallback;

  return lenisInstance;
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}

export function destroyLenis(lenis: Lenis) {
  const cb = (lenis as Lenis & { _tickerCb?: (...args: unknown[]) => void })._tickerCb;
  if (cb) gsap.ticker.remove(cb);
  lenis.destroy();
  lenisInstance = null;
}
