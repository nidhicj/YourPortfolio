# The Progress Bar

## What you see

A thin horizontal line fixed at the very bottom of the screen. It starts empty and fills left-to-right as you scroll through chapters.

```
════════════════════════════════════════════════ ───────────
↑ amber-filled                                   ↑ empty
```

---

## Where it lives

**Rendered by:** `src/components/Accordion.tsx` — the last element in the JSX (around line 125)

```tsx
<div style={{ position: 'fixed', bottom: 0, left: 0, height: '2px', background: 'rgba(252,163,17,0.12)', width: '100%', zIndex: 200 }}>
  <div ref={progressRef} style={{ height: '100%', background: 'var(--color-amber)', width: '0%' }} />
</div>
```

**Animated by:** the scroll handler in `Accordion.tsx` — the `onScroll` function sets `width` via GSAP

---

## Recipe — make the progress bar taller

In `Accordion.tsx`, find the progress bar outer div and change `height: '2px'` to `height: '4px'`. The inner div inherits `height: '100%'` so it adjusts automatically.

---

## Recipe — change the progress bar colour

The filled portion uses `var(--color-amber)`. To change it, open `src/lib/theme.ts` and change `colors.amber`. The unfilled track uses `rgba(252,163,17,0.12)` — a transparent version of amber. If you change the amber colour in theme.ts, update the rgba value in Accordion.tsx to match.

---

## Recipe — hide the progress bar

In `Accordion.tsx`, find the outer progress bar div and add `display: 'none'`:

```tsx
<div style={{ ..., display: 'none' }}>
```

---

## Mental model — how it animates

Inside the scroll handler in `Accordion.tsx`:

```ts
if (progressRef.current) {
  gsap.set(progressRef.current, { width: `${Math.min(100, (scroll / totalScroll) * 100)}%` });
}
```

`scroll` = current scroll position in pixels
`totalScroll` = total scrollable distance (`SCROLL_PER_CHAPTER * (N_CHAPTERS - 1)`)
`scroll / totalScroll` = a number from 0 to 1
Multiply by 100 = a percentage from 0% to 100%
`Math.min(100, ...)` = clamps it so it never exceeds 100%

`gsap.set` applies this directly to the element's width style. No transition needed — GSAP updates it on every scroll frame so it always matches the scroll position precisely.

---

## Edge cases

**`zIndex: 200`** ensures the progress bar is on top of everything including the TopBar (z-index 100). If you add something with a higher z-index elsewhere, it could cover the progress bar.

**The progress bar only reflects scroll within the portfolio chapters.** It goes from 0% (on chapter 1) to 100% (at the end of chapter 7). It doesn't track scrolling on other pages if you add them.
