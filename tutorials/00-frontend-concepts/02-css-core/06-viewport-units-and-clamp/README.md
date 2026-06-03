# Viewport Units and clamp()

Viewport units and `clamp()` make sizes responsive — they scale with the browser window automatically, without writing multiple breakpoints. They are why this portfolio looks good on a 13-inch laptop and a 27-inch monitor without any `@media` queries in the composition files.

---

## Viewport units

The viewport is the visible area of the browser window. Viewport units are percentages of that area.

| Unit | Means |
|------|-------|
| `1vw` | 1% of the viewport width |
| `1vh` | 1% of the viewport height |
| `100vw` | Full viewport width (the full screen) |
| `100vh` | Full viewport height (the full screen) |

At a 1440px wide screen: `1vw = 14.4px`, so `9vw = 129.6px`.
At a 1000px wide screen: `1vw = 10px`, so `9vw = 90px`.

The key insight: as the window gets wider, `vw` values get larger. As it gets narrower, they shrink. Automatically.

In `theme.ts`, panel widths are defined in `vw`:

```ts
export const layout = {
  activeVw: 85,   // vw — the expanded panel is 85% of the window width
  ...
}
```

The active panel is always 85% of the browser window, whatever size that is.

In `Accordion.tsx`, the scroll driver height uses `window.innerHeight` (which is the viewport height in pixels):

```ts
driver.style.height = `${totalScroll + window.innerHeight}px`;
```

---

## `clamp()` — scale with a floor and a ceiling

`clamp()` takes three values: `clamp(minimum, preferred, maximum)`.

- The size is always at least `minimum`
- The size is always at most `maximum`
- Between those limits, it uses the `preferred` value

The `preferred` value is usually viewport-relative — that's what makes it scale.

```css
font-size: clamp(72px, 9vw, 128px);
```

- At 800px viewport: `9vw = 72px` → uses minimum (72px), not smaller
- At 1000px viewport: `9vw = 90px` → uses 90px (between min and max)
- At 1500px viewport: `9vw = 135px` → uses maximum (128px), not larger

The type scales smoothly between those two extremes. No jumps, no breakpoints.

---

## Where `clamp()` is used in this codebase

All font sizes in `theme.ts` that need to scale:

```ts
// theme.ts
export const typo = {
  heroSize:    'clamp(72px, 9vw, 128px)',
  taglineSize: 'clamp(28px, 3.2vw, 46px)',
  ...
}
```

The hero headline (`heroSize`) scales from 72px (minimum, on narrow windows) to 128px (maximum, on very wide screens), with `9vw` as the smooth scaling in between.

The tagline (`taglineSize`) is smaller — `clamp(28px, 3.2vw, 46px)` — it scales from 28px to 46px.

Used directly in `Hero.tsx`:

```tsx
<BreathText as="h1" bg="light" style={{
  fontSize: typo.heroSize,   // 'clamp(72px, 9vw, 128px)'
  ...
}}>
```

And inline in `Bilateral.tsx` and `ReadingRoom.tsx`:

```tsx
style={{ fontSize: 'clamp(60px,7.5vw,104px)', ... }}
```

---

## Why this beats media queries

The old way to make text scale across screen sizes:

```css
/* Three separate rules — three places to maintain */
h1 { font-size: 48px; }
@media (min-width: 768px) { h1 { font-size: 80px; } }
@media (min-width: 1200px) { h1 { font-size: 128px; } }
```

Problems: three separate rules, two breakpoints to choose, and the size jumps at each breakpoint — one moment it's 80px, next moment it's 128px. No smoothness.

The `clamp()` way:

```css
/* One rule — scales smoothly between any two screen sizes */
h1 { font-size: clamp(48px, 9vw, 128px); }
```

One rule. Smooth scaling. No breakpoints.

---

## Recipe: make the hero headline larger on big screens

Currently in `theme.ts`:

```ts
heroSize: 'clamp(72px, 9vw, 128px)',
```

To let it scale up to 160px on very wide screens:

```ts
heroSize: 'clamp(72px, 9vw, 160px)',
```

Only the maximum changed. The minimum (72px on narrow screens) and the scaling rate (9vw) stay the same. The headline just goes bigger on wide monitors.

---

## Gotcha: `vw` includes the scrollbar

On Windows (and sometimes other OSes), `100vw` includes the width of the vertical scrollbar. If your page has a scrollbar, `100vw` is slightly wider than the visible content area. This can cause a tiny horizontal overflow.

This codebase avoids it by using `overflow-x: hidden` on `body` in `globals.css`:

```css
body {
  overflow-x: hidden;
}
```

Any horizontal overflow is clipped rather than shown as a scrollbar. Problem solved.

---

## Quick reference

```
vw:     1% of viewport width
vh:     1% of viewport height
100vw:  full screen width
100vh:  full screen height

clamp(min, preferred, max)
  — never smaller than min
  — never larger than max
  — preferred is usually a vw value so it scales with window width

clamp(72px, 9vw, 128px)
  → 72px on small screens
  → 9vw on medium screens (smooth)
  → 128px on large screens
```
