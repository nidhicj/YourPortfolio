# 01 — GSAP Panel Transitions

**Files:**
- `src/components/Accordion.tsx` — scroll listener and GSAP calls
- `src/lib/animation.ts` — `panelWidth()` helper
- `src/lib/theme.ts` — `layout.activeVw`, `layout.dwell`, `anim.scrollPerChapter`

## What you see

As you scroll, the active panel grows from its collapsed width to `85vw` while the next panel expands and the current one contracts. The transition is smooth and continuous — each scroll event directly sets the panel widths, not animates toward them.

## gsap.set vs gsap.to

The Accordion uses two different GSAP calls:

**`gsap.set`** — sets a CSS value immediately, no animation:

```ts
// Accordion.tsx  line 37
gsap.set(el, { width: `${ACTIVE_VW}vw` });

// Accordion.tsx  line 62  (inside the scroll handler)
gsap.set(el, { width: `${w}vw` });
```

**`gsap.to`** — animates toward a value over time:

```ts
// Accordion.tsx  lines 71–72  (content fade)
gsap.to(oldEl, { opacity: 0, pointerEvents: 'none', duration: anim.contentFadeDuration });
gsap.to(newEl, { opacity: 1, pointerEvents: 'auto', duration: anim.contentFadeDuration });
```

The panel widths use `gsap.set` because scroll is continuous — the scroll handler fires many times per second and each call already provides the exact target width calculated from the scroll position. If `gsap.to` were used, each scroll event would start a new animation toward the new width, causing the panel to lag behind or jitter as animations pile up and fight each other.

`gsap.to` is used for the content fade (opacity 0/1) because that transition should play out over time (`anim.contentFadeDuration = 0.18s`) rather than snap instantly.

## The panelWidth() function

```ts
// src/lib/animation.ts  lines 18–22
export function panelWidth(i: number, activeIdx: number, t: number): number {
  if (i === activeIdx)     return ACTIVE_VW - (ACTIVE_VW - COLLAPSED_VW) * t;
  if (i === activeIdx + 1) return COLLAPSED_VW + (ACTIVE_VW - COLLAPSED_VW) * t;
  return COLLAPSED_VW;
}
```

- `i` — the panel index being calculated.
- `activeIdx` — the currently-active panel index (`fromIdx` in the scroll handler).
- `t` — a 0–1 progress value. At `t = 0`, the current panel is fully expanded. At `t = 1`, the next panel is fully expanded.

Three cases:
1. Current active panel (`i === activeIdx`): starts at `ACTIVE_VW` (85vw), shrinks toward `COLLAPSED_VW` as `t` increases.
2. Next panel (`i === activeIdx + 1`): starts at `COLLAPSED_VW`, grows toward `ACTIVE_VW` as `t` increases.
3. All other panels: stay at `COLLAPSED_VW` regardless of `t`.

`COLLAPSED_VW` is derived automatically from `activeVw` and `nChapters` in `theme.ts`:

```ts
// theme.ts  line 67
export const collapsedVw = (100 - layout.activeVw) / (layout.nChapters - 1);
// = (100 - 85) / (7 - 1) = 15 / 6 = 2.5vw
```

## The dwell window

The scroll handler in `Accordion.tsx` lines 54–58:

```ts
if (within > DWELL && chapter < N_CHAPTERS - 1) {
  const snapProgress = (within - DWELL) / (1 - DWELL);
  tNorm = easeOutQuart(snapProgress);
  fromIdx = chapter;
}
```

Each chapter occupies `SCROLL_PER_CHAPTER` pixels (600px by default). Within those 600px, the first `DWELL` fraction (0.50 = 300px) is the "dwell zone" — the panel stays fully expanded. Only after the midpoint does `tNorm` start climbing from 0 toward 1, driving the transition.

`easeOutQuart` applies a deceleration curve so the transition starts fast and slows as it approaches the next panel:

```ts
// animation.ts  line 10
export function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}
```

## Mental model

GSAP is used as a **DOM style setter**, not just an animator. `gsap.set` is equivalent to `element.style.width = value` but with GSAP's cross-browser normalization and unit handling. The scroll handler calls it on every scroll event, so GSAP is just the vehicle — the actual animation is the scroll position itself.

## Recipe: change the easing curve

The easing for panel transitions is the `easeOutQuart` function in `src/lib/animation.ts` line 10 and applied at `Accordion.tsx` line 58:

```ts
tNorm = easeOutQuart(snapProgress);
```

Replace `easeOutQuart` with any function that takes a 0–1 input and returns a 0–1 output:

```ts
// linear (no easing)
tNorm = snapProgress;

// ease in (slow start, fast end)
tNorm = snapProgress * snapProgress;

// ease in-out (cubic)
tNorm = snapProgress < 0.5
  ? 4 * snapProgress * snapProgress * snapProgress
  : 1 - Math.pow(-2 * snapProgress + 2, 3) / 2;
```

Or change the exponent in `easeOutQuart` from `4` to another value — `2` is gentler, `6` is sharper.

## Recipe: change how long the panel stays expanded before transitioning

Change `dwell` in `src/lib/theme.ts` line 43:

```ts
// theme.ts
dwell: 0.50,  // default — transition starts at the halfway point
// change to:
dwell: 0.75,  // panel stays expanded for 75% of the scroll before transitioning
dwell: 0.20,  // panel starts transitioning after just 20% of the scroll
```

`dwell` is a 0–1 fraction of `SCROLL_PER_CHAPTER`.
