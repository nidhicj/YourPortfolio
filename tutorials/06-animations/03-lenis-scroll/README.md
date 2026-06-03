# 03 — Lenis Smooth Scroll

**Files:**
- `src/lib/animation.ts` — `createLenis()`, `destroyLenis()`
- `src/components/Accordion.tsx` — where Lenis is created, used, and cleaned up
- `src/lib/theme.ts` — `anim.lenisDuration`, `anim.lenisWheelMult`

## What you see

Scrolling feels inertial — when you scroll the wheel, the page glides to the new position rather than snapping instantly. Fast scrolls carry more momentum; slow scrolls feel tighter. This is Lenis.

## What Lenis does

Lenis intercepts native browser scroll events before they update `window.scrollY`. It re-emits them through its own loop — smoothed by an easing function — and fires a callback with the interpolated `scroll` value on each frame. The actual browser scroll position is suppressed; only the Lenis-smoothed value reaches the application.

The result: every call to the `onScroll` callback in `Accordion.tsx` receives a `scroll` value that moves gradually between the raw wheel positions rather than jumping.

## createLenis (animation.ts lines 26–43)

```ts
export function createLenis(): Lenis {
  if (lenisInstance) lenisInstance.destroy();

  lenisInstance = new Lenis({
    duration:        anim.lenisDuration,       // 1.4 seconds
    easing:          (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel:     true,
    wheelMultiplier: anim.lenisWheelMult,      // 0.9
  });

  const tickerCallback = (time: number) => lenisInstance?.raf(time * 1000);
  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  (lenisInstance as Lenis & { _tickerCb: typeof tickerCallback })._tickerCb = tickerCallback;

  return lenisInstance;
}
```

Two things happen:

1. A Lenis instance is created with the smoothing config.
2. A callback is added to the **GSAP ticker** (`gsap.ticker.add`). On every GSAP animation frame, it calls `lenis.raf(time * 1000)` — which advances the Lenis internal loop. This ties Lenis's frame updates to GSAP's RAF loop so both systems share the same frame budget.

The ticker callback is stashed on the instance (`_tickerCb`) so it can be removed later without needing a closure reference.

## destroyLenis (animation.ts lines 45–50)

```ts
export function destroyLenis(lenis: Lenis) {
  const cb = (lenis as Lenis & { _tickerCb?: (...args: unknown[]) => void })._tickerCb;
  if (cb) gsap.ticker.remove(cb);
  lenis.destroy();
  lenisInstance = null;
}
```

This removes the GSAP ticker callback first, then destroys the Lenis instance, then nulls the module-level reference. All three steps are necessary:

- `gsap.ticker.remove(cb)` — stops the RAF callback from firing on every frame.
- `lenis.destroy()` — cleans up Lenis's own event listeners on `window`.
- `lenisInstance = null` — allows `createLenis` to create a fresh instance without the `if (lenisInstance) lenisInstance.destroy()` guard triggering incorrectly.

## Where it's used in Accordion.tsx

```ts
// Accordion.tsx  lines 83–90
const lenis = createLenis();
lenisRef.current = lenis;
lenis.on('scroll', onScroll);

return () => {
  lenis.off('scroll', onScroll);
  if (lenisRef.current) destroyLenis(lenisRef.current);
};
```

Created once in the `useEffect`. The `onScroll` function is subscribed. On cleanup (component unmount or HMR re-mount), the listener is unsubscribed and `destroyLenis` is called.

## Mental model

Lenis sits between the mouse wheel and the rest of the app. The browser generates a raw scroll delta; Lenis absorbs it, runs it through an exponential easing function over `duration` seconds, and emits a smoothed `scroll` value each frame. The app never sees the raw jump — only the smooth output.

The GSAP ticker connection is what drives Lenis each frame. Without it, Lenis would use its own `requestAnimationFrame` loop — but then GSAP and Lenis would each have their own RAF, potentially out of phase. By feeding Lenis through `gsap.ticker`, both run on the same RAF tick.

## Recipe: disable smooth scroll (replace Lenis with native scroll)

Remove Lenis entirely and listen to the native `scroll` event instead. In `Accordion.tsx`:

1. Remove the `createLenis`/`destroyLenis` import.
2. Replace the Lenis setup with a native listener:

```ts
// replace lines 83–90 in Accordion.tsx with:
function handleScroll() {
  onScroll({ scroll: window.scrollY });
}
window.addEventListener('scroll', handleScroll, { passive: true });

return () => {
  window.removeEventListener('scroll', handleScroll);
};
```

3. The `onScroll` callback expects `{ scroll: number }` — `window.scrollY` is the equivalent value.

Smooth scrolling is gone. Panel transitions still work; they just follow the raw browser scroll position with no easing.

## Recipe: adjust smoothing feel

Change the values in `src/lib/theme.ts`:

```ts
// theme.ts  lines 47–49
anim: {
  lenisDuration:   1.4,   // seconds — longer = more glide, shorter = snappier
  lenisWheelMult:  0.9,   // scroll distance multiplier — higher = faster scroll
}
```

Examples:
- `lenisDuration: 0.8` — snappier, closer to native scroll.
- `lenisDuration: 2.2` — very floaty, heavy momentum.
- `lenisWheelMult: 1.4` — each wheel tick covers more scroll distance.

## Edge cases

- **Lenis must be destroyed on component unmount.** If `destroyLenis` is not called, the GSAP ticker callback (`_tickerCb`) keeps firing every frame, and Lenis's `window` scroll listener remains active. On React hot-module reload, a second `createLenis()` call creates a new instance — but if the first was not destroyed, both run simultaneously, and `onScroll` fires twice per scroll event. The `if (lenisInstance) lenisInstance.destroy()` guard at the top of `createLenis` handles this for normal re-creation, but the `useEffect` cleanup is still required for proper teardown on unmount.
- **`gsap.ticker.lagSmoothing(0)`** is set inside `createLenis`. This disables GSAP's lag-smoothing behavior (which would skip frames after a pause to "catch up"). Without this, returning to a tab after it was backgrounded could cause a sudden jump in scroll position as GSAP tried to compensate for missed frames.
- Lenis has `smoothWheel: true` and no `smoothTouch` — touch scroll on mobile uses native behavior. The portfolio is desktop-only so this is intentional.
