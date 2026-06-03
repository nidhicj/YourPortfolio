# Smooth Scroll

## What you notice

Scrolling feels weighted — like the page has physical momentum. If you flick the wheel, it coasts and decelerates rather than stopping immediately. That feeling is Lenis.

---

## Where it lives

**Library:** `@studio-freight/lenis` (installed in `node_modules`)
**Config:** `src/lib/theme.ts` → `anim.lenisDuration` and `anim.lenisWheelMult`
**Initialised in:** `src/lib/animation.ts` → `createLenis()` function
**Used by:** `src/components/Accordion.tsx` — calls `createLenis()` on mount

---

## Recipe — make scrolling faster

Open `src/lib/theme.ts`. Change `anim`:

```ts
export const anim = {
  scrollPerChapter: 600,   // ← lower = less scroll needed per chapter (e.g. 400)
  lenisDuration:    1.4,   // ← lower = snappier deceleration (e.g. 0.8)
  lenisWheelMult:   0.9,   // ← higher = each wheel tick moves more (e.g. 1.4)
  ...
}
```

All three affect the "feel" differently:
- `scrollPerChapter` — how much virtual distance each chapter takes to traverse
- `lenisDuration` — how long the coast-and-decelerate takes after you stop scrolling
- `lenisWheelMult` — how far each physical wheel notch moves

---

## Mental model — the scroll driver trick

Lenis normally smooths vertical page scroll. But this site doesn't scroll vertically — the layout is fixed. So a "fake" scrollable element is used:

```tsx
<div id="scroll-driver" style={{ position: 'absolute', top: 0, left: 0, width: '1px', pointerEvents: 'none' }} />
```

This invisible 1px div has its `height` set to the total virtual scroll distance. Lenis scrolls this div, and the portfolio listens to Lenis's scroll position to drive the panel animations. The actual viewport never moves.

---

## Edge cases

**If you remove Lenis**, the panel accordion still works — `Accordion.tsx` has its own scroll listener. But scrolling will feel instant and jittery rather than smooth.

**`gsap.ticker.lagSmoothing(0)`** — this tells GSAP not to try to "catch up" if the tab was in the background for a while. Without it, returning to the tab after a pause could cause a sudden jump in animation state.
