import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';

export const ACTIVE_VW   = 62;
export const N_CHAPTERS  = 7;
export const COLLAPSED_VW = (100 - ACTIVE_VW) / (N_CHAPTERS - 1);
// 80% dwell per chapter, 20% transition window
export const DWELL       = 0.80;

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
    duration:      1.4,
    easing:        (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:   true,
    wheelMultiplier: 0.9,
  });

  // Feed Lenis into GSAP ticker so they stay in sync
  const tickerCallback = (time: number) => lenisInstance?.raf(time * 1000);
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  // Return cleanup
  (lenisInstance as Lenis & { _tickerCb: typeof tickerCallback })._tickerCb = tickerCallback;

  return lenisInstance;
}

export function destroyLenis(lenis: Lenis) {
  const cb = (lenis as Lenis & { _tickerCb?: (...args: unknown[]) => void })._tickerCb;
  if (cb) gsap.ticker.remove(cb);
  lenis.destroy();
  lenisInstance = null;
}
